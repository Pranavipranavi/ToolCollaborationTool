import express from "express";
import { listActivities } from "../controllers/activity.controller.js";
import { protect, requireWorkspaceRole } from "../middleware/auth.middleware.js";

export const activityRouter = express.Router();

activityRouter.use(protect);
activityRouter.get("/:workspaceId/activities", requireWorkspaceRole("Owner", "Admin", "Member"), listActivities);
