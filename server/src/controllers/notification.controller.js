import { Notification } from "../models/Notification.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id }).sort("-createdAt").limit(50);
  res.json({ notifications });
});

export const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, unread: true }, { unread: false });
  res.json({ message: "Notifications marked as read" });
});

export const deleteNotification = asyncHandler(async (req, res) => {
  await Notification.deleteOne({ _id: req.params.notificationId, user: req.user._id });
  res.json({ message: "Notification deleted" });
});
