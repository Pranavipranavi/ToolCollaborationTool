import { body } from "express-validator";
import { Comment } from "../models/Comment.js";
import { Task } from "../models/Task.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { emitToWorkspace } from "../services/socket.service.js";
import { notify } from "../services/notification.service.js";
import { recordActivity } from "../services/activity.service.js";

export const commentRules = [body("body").trim().notEmpty().isLength({ max: 2000 })];

export const listComments = asyncHandler(async (req, res) => {
  const task = await Task.findOne({ _id: req.params.taskId, workspace: req.params.workspaceId });
  if (!task) throw new ApiError(404, "Task not found");

  const comments = await Comment.find({ task: req.params.taskId }).populate("user", "name email avatar").sort("-createdAt");
  res.json({ comments });
});

export const createComment = asyncHandler(async (req, res) => {
  const task = await Task.findOne({ _id: req.params.taskId, workspace: req.params.workspaceId });
  if (!task) throw new ApiError(404, "Task not found");

  const comment = await Comment.create({ task: req.params.taskId, user: req.user._id, body: req.body.body });
  await comment.populate("user", "name email avatar");
  await recordActivity({ workspace: req.params.workspaceId, actor: req.user._id, action: "commented", targetType: "Task", targetName: task.title });
  if (task.assignedUser && task.assignedUser.toString() !== req.user._id.toString()) {
    await notify({ user: task.assignedUser, workspace: req.params.workspaceId, type: "Comment Added", title: "New comment", body: `${req.user.name} commented on ${task.title}`, entity: { kind: "Task", id: task._id } });
  }
  emitToWorkspace(req.params.workspaceId, "comment:created", comment);
  res.status(201).json({ comment });
});

export const updateComment = asyncHandler(async (req, res) => {
  const task = await Task.findOne({ _id: req.params.taskId, workspace: req.params.workspaceId });
  if (!task) throw new ApiError(404, "Task not found");

  const comment = await Comment.findOneAndUpdate({ _id: req.params.commentId, task: task._id, user: req.user._id }, { body: req.body.body, editedAt: new Date() }, { new: true }).populate("user", "name email avatar");
  if (!comment) throw new ApiError(404, "Comment not found");
  emitToWorkspace(req.params.workspaceId, "comment:updated", comment);
  res.json({ comment });
});

export const deleteComment = asyncHandler(async (req, res) => {
  const task = await Task.findOne({ _id: req.params.taskId, workspace: req.params.workspaceId });
  if (!task) throw new ApiError(404, "Task not found");

  const result = await Comment.deleteOne({ _id: req.params.commentId, task: task._id, user: req.user._id });
  if (!result.deletedCount) throw new ApiError(404, "Comment not found");
  emitToWorkspace(req.params.workspaceId, "comment:deleted", { id: req.params.commentId, taskId: req.params.taskId });
  res.json({ message: "Comment deleted" });
});
