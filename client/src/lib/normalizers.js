export function normalizeUser(user) {
  if (!user) return null;
  return {
    id: user.id ?? user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name || user.email || "TF")}`,
    role: user.role,
    joinedAt: user.joinedAt ?? user.createdAt,
  };
}

export function normalizeMember(member) {
  const user = normalizeUser(member.user ?? member);
  return {
    ...user,
    role: member.role ?? user?.role ?? "Member",
    joinedAt: member.joinedAt ?? user?.joinedAt,
  };
}

export function normalizeWorkspace(workspace) {
  if (!workspace) return null;
  return {
    id: workspace.id ?? workspace._id,
    name: workspace.name,
    description: workspace.description,
    ownerId: workspace.owner?.id ?? workspace.owner?._id ?? workspace.owner,
    inviteCode: workspace.inviteCode,
    createdAt: workspace.createdAt,
    members: (workspace.members ?? []).map(normalizeMember),
  };
}

export function normalizeProject(project) {
  if (!project) return null;
  return {
    id: project.id ?? project._id,
    workspaceId: project.workspace?.id ?? project.workspace?._id ?? project.workspace,
    title: project.title,
    description: project.description,
    status: project.status,
    createdBy: project.createdBy?.id ?? project.createdBy?._id ?? project.createdBy,
    createdAt: project.createdAt,
    archivedAt: project.archivedAt,
    members: (project.members ?? []).map((member) => member.id ?? member._id ?? member),
  };
}

export function normalizeTask(task) {
  if (!task) return null;
  return {
    id: task.id ?? task._id,
    workspaceId: task.workspace?.id ?? task.workspace?._id ?? task.workspace,
    projectId: task.project?.id ?? task.project?._id ?? task.project,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    assignedUser: task.assignedUser?.id ?? task.assignedUser?._id ?? task.assignedUser,
    assignee: normalizeUser(task.assignedUser),
    dueDate: task.dueDate,
    tags: task.tags ?? [],
    comments: task.comments ?? task.commentCount ?? 0,
    createdAt: task.createdAt,
  };
}

export function normalizeComment(comment) {
  if (!comment) return null;
  return {
    id: comment.id ?? comment._id,
    taskId: comment.task?.id ?? comment.task?._id ?? comment.task,
    userId: comment.user?.id ?? comment.user?._id ?? comment.user,
    author: normalizeUser(comment.user),
    body: comment.body,
    createdAt: comment.createdAt,
    editedAt: comment.editedAt,
  };
}

export function normalizeNotification(notification) {
  if (!notification) return null;
  return {
    id: notification.id ?? notification._id,
    title: notification.title,
    body: notification.body,
    type: notification.type,
    unread: notification.unread,
    createdAt: notification.createdAt,
  };
}

export function normalizeActivity(activity) {
  if (!activity) return null;
  return {
    id: activity.id ?? activity._id,
    user: activity.actor?.name ?? "System",
    action: activity.action,
    target: activity.targetName,
    targetType: activity.targetType,
    time: activity.createdAt ? new Date(activity.createdAt).toLocaleString() : "",
  };
}
