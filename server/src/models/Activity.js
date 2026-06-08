import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace", required: true, index: true },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true },
    targetType: { type: String, required: true },
    targetName: { type: String, required: true },
    metadata: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

export const Activity = mongoose.model("Activity", activitySchema);
