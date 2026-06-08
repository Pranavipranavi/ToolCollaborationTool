import { Activity } from "../models/Activity.js";

export async function recordActivity({ workspace, actor, action, targetType, targetName, metadata = {} }) {
  return Activity.create({ workspace, actor, action, targetType, targetName, metadata });
}
