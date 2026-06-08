import express from "express";
import { commentRules, createComment, deleteComment, listComments, updateComment } from "../controllers/comment.controller.js";
import { protect, requireWorkspaceRole } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/error.middleware.js";

export const commentRouter = express.Router({ mergeParams: true });

commentRouter.use(protect);
commentRouter.get("/:workspaceId/tasks/:taskId/comments", requireWorkspaceRole("Owner", "Admin", "Member"), listComments);
commentRouter.post("/:workspaceId/tasks/:taskId/comments", requireWorkspaceRole("Owner", "Admin", "Member"), commentRules, validate, createComment);
commentRouter.patch("/:workspaceId/tasks/:taskId/comments/:commentId", requireWorkspaceRole("Owner", "Admin", "Member"), commentRules, validate, updateComment);
commentRouter.delete("/:workspaceId/tasks/:taskId/comments/:commentId", requireWorkspaceRole("Owner", "Admin", "Member"), deleteComment);
