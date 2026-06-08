import { Notification } from "../models/Notification.js";
import { emitToWorkspace } from "./socket.service.js";

export async function notify({ user, workspace, type, title, body, entity }) {
  const notification = await Notification.create({ user, workspace, type, title, body, entity });
  if (workspace) emitToWorkspace(workspace, "notification:created", notification);
  return notification;
}

export async function notifyMany(items) {
  if (!items.length) return [];
  const notifications = await Notification.insertMany(items);
  notifications.forEach((notification) => {
    if (notification.workspace) emitToWorkspace(notification.workspace, "notification:created", notification);
  });
  return notifications;
}
