import express from "express";
import { archiveProject, createProject, deleteProject, listProjects, projectRules, projectUpdateRules, updateProject } from "../controllers/project.controller.js";
import { protect, requireWorkspaceRole } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/error.middleware.js";

export const projectRouter = express.Router({ mergeParams: true });

projectRouter.use(protect);
projectRouter.get("/:workspaceId/projects", requireWorkspaceRole("Owner", "Admin", "Member"), listProjects);
projectRouter.post("/:workspaceId/projects", requireWorkspaceRole("Owner", "Admin"), projectRules, validate, createProject);
projectRouter.patch("/:workspaceId/projects/:projectId", requireWorkspaceRole("Owner", "Admin"), projectUpdateRules, validate, updateProject);
projectRouter.patch("/:workspaceId/projects/:projectId/archive", requireWorkspaceRole("Owner", "Admin"), archiveProject);
projectRouter.delete("/:workspaceId/projects/:projectId", requireWorkspaceRole("Owner"), deleteProject);
