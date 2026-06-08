import mongoose from "mongoose";

const invitationSchema = new mongoose.Schema(
  {
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace", required: true, index: true },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    role: { type: String, enum: ["Admin", "Member"], default: "Member" },
    tokenHash: { type: String, required: true, unique: true },
    invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    acceptedAt: Date,
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
  },
  { timestamps: true }
);

invitationSchema.index({ workspace: 1, email: 1, acceptedAt: 1 });

export const Invitation = mongoose.model("Invitation", invitationSchema);
