import crypto from "crypto";
import { Invitation } from "../models/Invitation.js";
import { Workspace } from "../models/Workspace.js";
import { ApiError } from "../utils/ApiError.js";
import { notify } from "./notification.service.js";
import { recordActivity } from "./activity.service.js";

export async function acceptWorkspaceInvitation({ token, user }) {
  if (!token) throw new ApiError(400, "Invitation token is required");

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const invitation = await Invitation.findOne({ tokenHash, acceptedAt: { $exists: false }, expiresAt: { $gt: new Date() } });
  if (!invitation) throw new ApiError(404, "Invitation is invalid or expired");
  if (invitation.email !== user.email) throw new ApiError(403, "Invitation email does not match your account");

  const workspace = await Workspace.findById(invitation.workspace);
  if (!workspace) throw new ApiError(404, "Workspace not found");

  const existing = workspace.members.find((member) => member.user.toString() === user._id.toString());
  if (existing) {
    existing.role = existing.role === "Owner" ? "Owner" : invitation.role;
  } else {
    workspace.members.push({ user: user._id, role: invitation.role });
  }
  invitation.acceptedAt = new Date();

  await Promise.all([workspace.save(), invitation.save()]);
  await recordActivity({ workspace: workspace._id, actor: user._id, action: "accepted invite", targetType: "Workspace", targetName: workspace.name });
  await notify({ user: workspace.owner, workspace: workspace._id, type: "Member Joined", title: "Member joined", body: `${user.name} joined ${workspace.name}`, entity: { kind: "Workspace", id: workspace._id } });

  return workspace;
}
