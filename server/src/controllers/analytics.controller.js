import { Activity } from "../models/Activity.js";
import { Project } from "../models/Project.js";
import { Task } from "../models/Task.js";
import { Workspace } from "../models/Workspace.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const dashboard = asyncHandler(async (req, res) => {
  const workspaces = await Workspace.find({ "members.user": req.user._id }).select("_id members");
  let scopedWorkspaces = workspaces;
  if (req.query.workspaceId) {
    scopedWorkspaces = workspaces.filter((workspace) => workspace._id.toString() === req.query.workspaceId);
    if (!scopedWorkspaces.length) throw new ApiError(403, "You are not a member of this workspace");
  }

  const workspaceIds = scopedWorkspaces.map((workspace) => workspace._id);
  const [projects, tasks, activities] = await Promise.all([
    Project.find({ workspace: { $in: workspaceIds } }),
    Task.find({ workspace: { $in: workspaceIds } }).populate("assignedUser", "name email avatar"),
    Activity.find({ workspace: { $in: workspaceIds } }).populate("actor", "name avatar").sort("-createdAt").limit(20),
  ]);

  const memberIds = new Set();
  workspaces.forEach((workspace) => workspace.members.forEach((member) => memberIds.add(member.user.toString())));
  const completedTasks = tasks.filter((task) => task.status === "Completed").length;
  const projectProgress = projects.map((project) => {
    const projectTasks = tasks.filter((task) => task.project.toString() === project._id.toString());
    const done = projectTasks.filter((task) => task.status === "Completed").length;
    return {
      projectId: project._id,
      name: project.title,
      progress: projectTasks.length ? Math.round((done / projectTasks.length) * 100) : 0,
    };
  });
  const workloadMap = tasks.reduce((acc, task) => {
    const key = task.assignedUser?._id?.toString() || "Unassigned";
    acc[key] = acc[key] || { user: key, name: task.assignedUser?.name || "Unassigned", tasks: 0 };
    acc[key].tasks += 1;
    return acc;
  }, {});

  res.json({
    totals: {
      workspaces: workspaceIds.length,
      projects: projects.length,
      tasks: tasks.length,
      completedTasks,
      pendingTasks: tasks.length - completedTasks,
      teamMembers: memberIds.size,
    },
    statusBreakdown: ["To Do", "In Progress", "Review", "Completed"].map((status) => ({ status, count: tasks.filter((task) => task.status === status).length })),
    projectProgress,
    workload: Object.values(workloadMap),
    activities,
  });
});
