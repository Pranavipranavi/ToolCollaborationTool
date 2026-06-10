import { body } from "express-validator";
import { Project } from "../models/Project.js";
import { Task } from "../models/Task.js";
import { Comment } from "../models/Comment.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { recordActivity } from "../services/activity.service.js";
import { emitToWorkspace } from "../services/socket.service.js";

export const projectRules = [body("title").trim().notEmpty(), body("description").optional().trim(), body("members").optional().isArray()];
export const projectUpdateRules = [body("title").optional().trim().notEmpty(), body("description").optional().trim(), body("members").optional().isArray()];

function assertWorkspaceMembers(workspace, memberIds = []) {
  const requestedMembers = memberIds.filter(Boolean).map((memberId) => memberId.toString());
  if (!requestedMembers.length) return;

  const workspaceMembers = new Set(workspace.members.map((member) => member.user.toString()));
  const invalidMember = requestedMembers.find((memberId) => !workspaceMembers.has(memberId));
  if (invalidMember) throw new ApiError(400, "Project members must belong to the workspace");
}

export const listProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({ workspace: req.params.workspaceId }).populate("members", "name email avatar").sort("-createdAt");
  res.json({ projects });
});

export const createProject = asyncHandler(async (req, res) => {
  assertWorkspaceMembers(req.workspace, req.body.members ?? []);
  const project = await Project.create({
    ...req.body,
    workspace: req.params.workspaceId,
    members: req.body.members?.length ? req.body.members : [req.user._id],
    createdBy: req.user._id,
  });
  await recordActivity({ workspace: req.params.workspaceId, actor: req.user._id, action: "created", targetType: "Project", targetName: project.title });
  res.status(201).json({ project });
});

export const updateProject = asyncHandler(async (req, res) => {
  assertWorkspaceMembers(req.workspace, req.body.members ?? []);
  const updates = {
    title: req.body.title,
    description: req.body.description,
    members: req.body.members,
  };
  Object.keys(updates).forEach((key) => updates[key] === undefined && delete updates[key]);
  const project = await Project.findOneAndUpdate({ _id: req.params.projectId, workspace: req.params.workspaceId }, updates, { new: true });
  if (!project) throw new ApiError(404, "Project not found");
  await recordActivity({ workspace: req.params.workspaceId, actor: req.user._id, action: "updated", targetType: "Project", targetName: project.title });
  emitToWorkspace(req.params.workspaceId, "project:updated", project);
  res.json({ project });
});

export const archiveProject = asyncHandler(async (req, res) => {
  const project = await Project.findOneAndUpdate({ _id: req.params.projectId, workspace: req.params.workspaceId }, { status: "Archived", archivedAt: new Date() }, { new: true });
  if (!project) throw new ApiError(404, "Project not found");
  await recordActivity({ workspace: req.params.workspaceId, actor: req.user._id, action: "archived", targetType: "Project", targetName: project.title });
  emitToWorkspace(req.params.workspaceId, "project:updated", project);
  res.json({ project });
});

export const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findOne({ _id: req.params.projectId, workspace: req.params.workspaceId });
  if (!project) throw new ApiError(404, "Project not found");

  const tasks = await Task.find({ project: req.params.projectId }).select("_id");
  await Comment.deleteMany({ task: { $in: tasks.map((task) => task._id) } });
  await Task.deleteMany({ project: req.params.projectId });
  await recordActivity({ workspace: req.params.workspaceId, actor: req.user._id, action: "deleted", targetType: "Project", targetName: project.title });
  await project.deleteOne();
  emitToWorkspace(req.params.workspaceId, "project:deleted", { id: req.params.projectId });
  res.json({ message: "Project deleted" });
});
