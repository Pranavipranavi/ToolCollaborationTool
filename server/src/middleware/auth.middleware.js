import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { Workspace } from "../models/Workspace.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const protect = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization;
  const token = req.cookies.taskflow_token || (header?.startsWith("Bearer ") ? header.split(" ")[1] : null);
  if (!token) throw new ApiError(401, "Authentication required");

  let decoded;
  try {
    decoded = jwt.verify(token, env.jwtSecret);
  } catch (_error) {
    throw new ApiError(401, "Invalid or expired session");
  }

  const user = await User.findById(decoded.id).select("-password");
  if (!user) throw new ApiError(401, "Invalid session");
  req.user = user;
  next();
});

export function requireWorkspaceRole(...allowedRoles) {
  return asyncHandler(async (req, _res, next) => {
    const workspaceId = req.params.workspaceId || req.body.workspaceId;
    if (!workspaceId) throw new ApiError(400, "Workspace id is required");

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) throw new ApiError(404, "Workspace not found");

    const membership = workspace.members.find((member) => member.user.toString() === req.user._id.toString());
    if (!membership) throw new ApiError(403, "You are not a member of this workspace");
    if (!allowedRoles.includes(membership.role)) throw new ApiError(403, "You do not have permission for this action");

    req.workspace = workspace;
    req.membership = membership;
    next();
  });
}
