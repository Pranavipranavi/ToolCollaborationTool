import { Project } from "../models/Project.js";
import { Task } from "../models/Task.js";
import { User } from "../models/User.js";
import { Workspace } from "../models/Workspace.js";
import { asyncHandler } from "../utils/asyncHandler.js";

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export const globalSearch = asyncHandler(async (req, res) => {
  const query = String(req.query.q || "").trim();
  if (!query) return res.json({ tasks: [], projects: [], members: [] });

  const workspaces = await Workspace.find({ "members.user": req.user._id }).select("_id members");
  const workspaceIds = workspaces.map((workspace) => workspace._id);
  const memberIds = [...new Set(workspaces.flatMap((workspace) => workspace.members.map((member) => member.user.toString())))];
  const matcher = new RegExp(escapeRegex(query), "i");

  const [tasks, projects, members] = await Promise.all([
    Task.find({
      workspace: { $in: workspaceIds },
      $or: [
        { title: matcher },
        { description: matcher },
        { status: matcher },
        { priority: matcher },
        { tags: matcher },
      ],
    }).populate("assignedUser", "name email avatar").sort("-updatedAt").limit(20),
    Project.find({
      workspace: { $in: workspaceIds },
      $or: [
        { title: matcher },
        { description: matcher },
        { status: matcher },
      ],
    }).populate("members", "name email avatar").sort("-updatedAt").limit(20),
    User.find({
      _id: { $in: memberIds },
      $or: [
        { name: matcher },
        { email: matcher },
      ],
    }).select("name email avatar").limit(20),
  ]);

  res.json({ tasks, projects, members });
});
