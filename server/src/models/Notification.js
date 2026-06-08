import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace", index: true },
    type: { type: String, enum: ["Task Assigned", "Task Completed", "Comment Added", "Member Joined"], required: true },
    title: { type: String, required: true },
    body: { type: String, default: "" },
    unread: { type: Boolean, default: true },
    entity: {
      kind: String,
      id: mongoose.Schema.Types.ObjectId,
    },
  },
  { timestamps: true }
);

export const Notification = mongoose.model("Notification", notificationSchema);
