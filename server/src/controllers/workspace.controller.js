import crypto from "crypto";
import { body } from "express-validator";
import { Invitation } from "../models/Invitation.js";
import { Workspace } from "../models/Workspace.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { recordActivity } from "../services/activity.service.js";
import { notify } from "../services/notification.service.js";
import { env } from "../config/env.js";

export const workspaceRules = [body("name").trim().notEmpty().isLength({ max: 80 }), body("description").optional().trim().isLength({ max: 300 })];
export const memberRoleRules = [body("role").isIn(["Admin", "Member"])];
export const invitationRules = [body("email").isEmail().normalizeEmail(), body("role").optional().isIn(["Admin", "Member"])];

export const listWorkspaces = asyncHandler(async (req, res) => {
  const workspaces = await Workspace.find({ "members.user": req.user._id }).populate("members.user", "name email avatar");
  res.json({ workspaces });
});

export const createWorkspace = asyncHandler(async (req, res) => {
  const workspace = await Workspace.create({
    ...req.body,
    owner: req.user._id,
    inviteCode: crypto.randomBytes(8).toString("hex"),
    members: [{ user: req.user._id, role: "Owner" }],
  });
  await recordActivity({ workspace: workspace._id, actor: req.user._id, action: "created", targetType: "Workspace", targetName: workspace.name });
  res.status(201).json({ workspace });
});

export const updateWorkspace = asyncHandler(async (req, res) => {
  Object.assign(req.workspace, req.body);
  await req.workspace.save();
  res.json({ workspace: req.workspace });
});

export const listInvitations = asyncHandler(async (req, res) => {
  const invitations = await Invitation.find({ workspace: req.params.workspaceId, acceptedAt: { $exists: false } })
    .populate("invitedBy", "name email avatar")
    .sort("-createdAt");
  res.json({ invitations });
});

export const createInvitation = asyncHandler(async (req, res) => {
  const email = req.body.email.toLowerCase();
  const role = req.body.role || "Member";
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);

  const invitation = await Invitation.findOneAndUpdate(
    { workspace: req.params.workspaceId, email, acceptedAt: { $exists: false } },
    {
      workspace: req.params.workspaceId,
      email,
      role,
      tokenHash,
      invitedBy: req.user._id,
      expiresAt,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const inviteUrl = `${env.clientUrl}/register?invite=${rawToken}`;

  await recordActivity({ workspace: req.params.workspaceId, actor: req.user._id, action: "invited", targetType: "Member", targetName: email, metadata: { role } });
  res.status(201).json({ invitation, inviteUrl });
});

export const acceptInvitation = asyncHandler(async (req, res) => {
  if (!req.body.token) throw new ApiError(400, "Invitation token is required");

  const tokenHash = crypto.createHash("sha256").update(req.body.token).digest("hex");
  const invitation = await Invitation.findOne({ tokenHash, acceptedAt: { $exists: false }, expiresAt: { $gt: new Date() } });
  if (!invitation) throw new ApiError(404, "Invitation is invalid or expired");
  if (invitation.email !== req.user.email) throw new ApiError(403, "Invitation email does not match your account");

  const workspace = await Workspace.findById(invitation.workspace);
  if (!workspace) throw new ApiError(404, "Workspace not found");

  const existing = workspace.members.find((member) => member.user.toString() === req.user._id.toString());
  if (existing) {
    existing.role = existing.role === "Owner" ? "Owner" : invitation.role;
  } else {
    workspace.members.push({ user: req.user._id, role: invitation.role });
  }
  invitation.acceptedAt = new Date();

  await Promise.all([workspace.save(), invitation.save()]);
  await recordActivity({ workspace: workspace._id, actor: req.user._id, action: "accepted invite", targetType: "Workspace", targetName: workspace.name });
  await notify({ user: workspace.owner, workspace: workspace._id, type: "Member Joined", title: "Member joined", body: `${req.user.name} joined ${workspace.name}`, entity: { kind: "Workspace", id: workspace._id } });
  res.json({ workspace });
});

export const updateMemberRole = asyncHandler(async (req, res) => {
  if (req.membership.role !== "Owner") throw new ApiError(403, "Only owners can manage member roles");

  const member = req.workspace.members.find((item) => item.user.toString() === req.params.memberId);
  if (!member) throw new ApiError(404, "Workspace member not found");
  if (member.role === "Owner") throw new ApiError(400, "Owner role cannot be changed from this endpoint");

  member.role = req.body.role;
  await req.workspace.save();
  await recordActivity({ workspace: req.workspace._id, actor: req.user._id, action: "updated role", targetType: "Member", targetName: req.params.memberId, metadata: { role: req.body.role } });
  res.json({ workspace: req.workspace });
});

export const removeMember = asyncHandler(async (req, res) => {
  if (req.membership.role !== "Owner") throw new ApiError(403, "Only owners can remove members");

  const member = req.workspace.members.find((item) => item.user.toString() === req.params.memberId);
  if (!member) throw new ApiError(404, "Workspace member not found");
  if (member.role === "Owner") throw new ApiError(400, "Owner cannot be removed from this endpoint");

  req.workspace.members = req.workspace.members.filter((item) => item.user.toString() !== req.params.memberId);
  await req.workspace.save();
  await recordActivity({ workspace: req.workspace._id, actor: req.user._id, action: "removed", targetType: "Member", targetName: req.params.memberId });
  res.json({ workspace: req.workspace });
});

export const deleteWorkspace = asyncHandler(async (req, res) => {
  if (req.membership.role !== "Owner") throw new ApiError(403, "Only owners can delete workspaces");
  await req.workspace.deleteOne();
  res.json({ message: "Workspace deleted" });
});

export const joinWorkspace = asyncHandler(async (req, res) => {
  if (!req.body.inviteCode) throw new ApiError(400, "Invite code is required");

  const workspace = await Workspace.findOne({ inviteCode: req.body.inviteCode });
  if (!workspace) throw new ApiError(404, "Invalid invite code");
  if (workspace.members.some((member) => member.user.toString() === req.user._id.toString())) {
    return res.json({ workspace });
  }
  workspace.members.push({ user: req.user._id, role: "Member" });
  await workspace.save();
  await recordActivity({ workspace: workspace._id, actor: req.user._id, action: "joined", targetType: "Workspace", targetName: workspace.name });
  res.json({ workspace });
});

export const leaveWorkspace = asyncHandler(async (req, res) => {
  if (req.membership.role === "Owner") throw new ApiError(400, "Transfer ownership before leaving");
  req.workspace.members = req.workspace.members.filter((member) => member.user.toString() !== req.user._id.toString());
  await req.workspace.save();
  res.json({ message: "Workspace left" });
});
