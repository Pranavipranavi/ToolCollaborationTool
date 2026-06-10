import { Activity } from "../models/Activity.js";
import { emitToWorkspace } from "./socket.service.js";

export async function recordActivity({ workspace, actor, action, targetType, targetName, metadata = {} }) {
  const activity = await Activity.create({ workspace, actor, action, targetType, targetName, metadata });
  await activity.populate("actor", "name email avatar");
  emitToWorkspace(workspace.toString(), "activity:created", activity);
  return activity;
}
