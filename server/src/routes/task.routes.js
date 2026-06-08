import express from "express";
import { createTask, deleteTask, listAssignedTasks, listTasks, taskFilterRules, taskRules, taskUpdateRules, updateTask } from "../controllers/task.controller.js";
import { protect, requireWorkspaceRole } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/error.middleware.js";

export const taskRouter = express.Router({ mergeParams: true });

taskRouter.use(protect);
taskRouter.get("/tasks/assigned", listAssignedTasks);
taskRouter.get("/:workspaceId/projects/:projectId/tasks", requireWorkspaceRole("Owner", "Admin", "Member"), taskFilterRules, validate, listTasks);
taskRouter.post("/:workspaceId/projects/:projectId/tasks", requireWorkspaceRole("Owner", "Admin"), taskRules, validate, createTask);
taskRouter.patch("/:workspaceId/projects/:projectId/tasks/:taskId", requireWorkspaceRole("Owner", "Admin", "Member"), taskUpdateRules, validate, updateTask);
taskRouter.delete("/:workspaceId/projects/:projectId/tasks/:taskId", requireWorkspaceRole("Owner", "Admin"), deleteTask);
