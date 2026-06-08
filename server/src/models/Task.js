import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace", required: true, index: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    status: { type: String, enum: ["To Do", "In Progress", "Review", "Completed"], default: "To Do", index: true },
    priority: { type: String, enum: ["Low", "Medium", "High", "Critical"], default: "Medium", index: true },
    assignedUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    dueDate: Date,
    tags: [{ type: String, trim: true }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

taskSchema.index({ title: "text", description: "text", tags: "text" });

export const Task = mongoose.model("Task", taskSchema);
