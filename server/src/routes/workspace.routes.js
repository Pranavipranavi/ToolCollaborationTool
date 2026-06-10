import express from "express";
import { acceptInvitation, createInvitation, createWorkspace, deleteWorkspace, invitationRules, joinWorkspace, leaveWorkspace, listInvitations, listWorkspaces, memberRoleRules, removeMember, updateMemberRole, updateWorkspace, workspaceRules } from "../controllers/workspace.controller.js";
import { protect, requireWorkspaceRole } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/error.middleware.js";

export const workspaceRouter = express.Router();

workspaceRouter.use(protect);
workspaceRouter.get("/", listWorkspaces);
workspaceRouter.post("/", workspaceRules, validate, createWorkspace);
workspaceRouter.post("/join", joinWorkspace);
workspaceRouter.post("/invitations/accept", acceptInvitation);
workspaceRouter.patch("/:workspaceId", requireWorkspaceRole("Owner"), workspaceRules, validate, updateWorkspace);
workspaceRouter.delete("/:workspaceId", requireWorkspaceRole("Owner"), deleteWorkspace);
workspaceRouter.post("/:workspaceId/leave", requireWorkspaceRole("Admin", "Member"), leaveWorkspace);
workspaceRouter.get("/:workspaceId/invitations", requireWorkspaceRole("Owner", "Admin"), listInvitations);
workspaceRouter.post("/:workspaceId/invitations", requireWorkspaceRole("Owner", "Admin"), invitationRules, validate, createInvitation);
workspaceRouter.patch("/:workspaceId/members/:memberId/role", requireWorkspaceRole("Owner"), memberRoleRules, validate, updateMemberRole);
workspaceRouter.delete("/:workspaceId/members/:memberId", requireWorkspaceRole("Owner"), removeMember);
