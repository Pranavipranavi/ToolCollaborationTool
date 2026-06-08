import { Activity } from "../models/Activity.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listActivities = asyncHandler(async (req, res) => {
  const activities = await Activity.find({ workspace: req.params.workspaceId })
    .populate("actor", "name email avatar")
    .sort("-createdAt")
    .limit(Math.min(Number(req.query.limit || 50), 100));
  res.json({ activities });
});
