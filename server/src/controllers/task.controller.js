import { body, query } from "express-validator";
import { Comment } from "../models/Comment.js";
import { Project } from "../models/Project.js";
import { Task } from "../models/Task.js";
import { Workspace } from "../models/Workspace.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { emitToWorkspace } from "../services/socket.service.js";
import { recordActivity } from "../services/activity.service.js";
import { notify } from "../services/notification.service.js";

export const taskRules = [
  body("title").trim().notEmpty(),
  body("status").optional().isIn(["To Do", "In Progress", "Review", "Completed"]),
  body("priority").optional().isIn(["Low", "Medium", "High", "Critical"]),
  body("assignedUser").optional().isMongoId(),
];

export const taskUpdateRules = [
  body("title").optional().trim().notEmpty(),
  body("description").optional().trim(),
  body("status").optional().isIn(["To Do", "In Progress", "Review", "Completed"]),
  body("priority").optional().isIn(["Low", "Medium", "High", "Critical"]),
  body("assignedUser").optional().isMongoId(),
  body("tags").optional().isArray(),
];

export const taskFilterRules = [
  query("status").optional().isString(),
  query("priority").optional().isString(),
  query("assignedUser").optional().isString(),
  query("search").optional().isString(),
];

function buildTaskQuery(req) {
  const filter = { workspace: req.params.workspaceId, project: req.params.projectId };
  if (req.query.status) filter.status = req.query.status;
  if (req.query.priority) filter.priority = req.query.priority;
  if (req.query.assignedUser) filter.assignedUser = req.query.assignedUser;
  if (req.query.search) filter.$text = { $search: req.query.search };
  return filter;
}

export const listTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find(buildTaskQuery(req)).populate("assignedUser", "name email avatar").sort({ createdAt: -1 });
  const counts = await Comment.aggregate([
    { $match: { task: { $in: tasks.map((task) => task._id) } } },
    { $group: { _id: "$task", count: { $sum: 1 } } },
  ]);
  const countMap = new Map(counts.map((item) => [item._id.toString(), item.count]));
  res.json({ tasks: tasks.map((task) => ({ ...task.toObject(), commentCount: countMap.get(task._id.toString()) || 0 })) });
});

export const listAssignedTasks = asyncHandler(async (req, res) => {
  const workspaces = await Workspace.find({ "members.user": req.user._id }).select("_id");
  const tasks = await Task.find({
    workspace: { $in: workspaces.map((workspace) => workspace._id) },
    assignedUser: req.user._id,
  }).populate("assignedUser", "name email avatar").sort({ dueDate: 1, createdAt: -1 }).limit(100);
  const counts = await Comment.aggregate([
    { $match: { task: { $in: tasks.map((task) => task._id) } } },
    { $group: { _id: "$task", count: { $sum: 1 } } },
  ]);
  const countMap = new Map(counts.map((item) => [item._id.toString(), item.count]));
  res.json({ tasks: tasks.map((task) => ({ ...task.toObject(), commentCount: countMap.get(task._id.toString()) || 0 })) });
});

export const createTask = asyncHandler(async (req, res) => {
  const project = await Project.findOne({ _id: req.params.projectId, workspace: req.params.workspaceId });
  if (!project) throw new ApiError(404, "Project not found");

  const task = await Task.create({
    ...req.body,
    workspace: req.params.workspaceId,
    project: req.params.projectId,
    createdBy: req.user._id,
  });
  await recordActivity({ workspace: req.params.workspaceId, actor: req.user._id, action: "created", targetType: "Task", targetName: task.title });
  if (task.assignedUser) {
    await notify({ user: task.assignedUser, workspace: req.params.workspaceId, type: "Task Assigned", title: "Task assigned", body: `${req.user.name} assigned ${task.title}`, entity: { kind: "Task", id: task._id } });
  }
  emitToWorkspace(req.params.workspaceId, "task:created", task);
  res.status(201).json({ task });
});

export const updateTask = asyncHandler(async (req, res) => {
  const before = await Task.findOne({ _id: req.params.taskId, workspace: req.params.workspaceId, project: req.params.projectId });
  if (!before) throw new ApiError(404, "Task not found");

  if (req.membership.role === "Member" && before.assignedUser?.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Members can only update assigned tasks");
  }

  if (req.membership.role === "Member") {
    const allowedFields = ["status"];
    const blockedField = Object.keys(req.body).find((field) => !allowedFields.includes(field));
    if (blockedField) throw new ApiError(403, "Members can only update task status");
  }

  const task = await Task.findOneAndUpdate({ _id: req.params.taskId, workspace: req.params.workspaceId, project: req.params.projectId }, req.body, { new: true }).populate("assignedUser", "name email avatar");
  if (req.body.assignedUser && before.assignedUser?.toString() !== req.body.assignedUser) {
    await notify({ user: req.body.assignedUser, workspace: req.params.workspaceId, type: "Task Assigned", title: "Task assigned", body: `${req.user.name} assigned ${task.title}`, entity: { kind: "Task", id: task._id } });
    await recordActivity({ workspace: req.params.workspaceId, actor: req.user._id, action: "assigned", targetType: "Task", targetName: task.title, metadata: { assignedUser: req.body.assignedUser } });
  }
  if (before?.status !== task.status) {
    await recordActivity({ workspace: req.params.workspaceId, actor: req.user._id, action: "moved", targetType: "Task", targetName: `${task.title} to ${task.status}` });
    if (task.status === "Completed" && task.assignedUser) {
      await notify({ user: task.assignedUser._id, workspace: req.params.workspaceId, type: "Task Completed", title: "Task completed", body: `${task.title} was completed`, entity: { kind: "Task", id: task._id } });
    }
  }
  emitToWorkspace(req.params.workspaceId, "task:updated", task);
  res.json({ task });
});

export const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findOne({ _id: req.params.taskId, workspace: req.params.workspaceId, project: req.params.projectId });
  if (!task) throw new ApiError(404, "Task not found");

  await Comment.deleteMany({ task: req.params.taskId });
  await task.deleteOne();
  emitToWorkspace(req.params.workspaceId, "task:deleted", { id: req.params.taskId });
  res.json({ message: "Task deleted" });
});
