import express from "express";
import { deleteNotification, listNotifications, markAllRead } from "../controllers/notification.controller.js";
import { protect } from "../middleware/auth.middleware.js";

export const notificationRouter = express.Router();

notificationRouter.use(protect);
notificationRouter.get("/", listNotifications);
notificationRouter.patch("/read", markAllRead);
notificationRouter.delete("/:notificationId", deleteNotification);
