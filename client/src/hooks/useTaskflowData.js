import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { activityApi, analyticsApi, commentApi, notificationApi, projectApi, searchApi, taskApi, workspaceApi } from "../lib/api";
import { normalizeActivity, normalizeComment, normalizeMember, normalizeNotification, normalizeProject, normalizeTask, normalizeWorkspace } from "../lib/normalizers";

export const qk = {
  workspaces: ["workspaces"],
  projects: (workspaceId) => ["projects", workspaceId],
  tasks: (workspaceId, projectId, filters = {}) => ["tasks", workspaceId, projectId, filters],
  comments: (workspaceId, taskId) => ["comments", workspaceId, taskId],
  notifications: ["notifications"],
  analytics: (workspaceId = "all") => ["analytics", workspaceId || "all"],
  activities: (workspaceId) => ["activities", workspaceId],
  invitations: (workspaceId) => ["invitations", workspaceId],
  search: (query) => ["search", query],
  assignedTasks: ["tasks", "assigned"],
};

function withoutAll(filters) {
  return Object.fromEntries(Object.entries(filters || {}).filter(([, value]) => value && value !== "All"));
}

export function useWorkspaces() {
  return useQuery({
    queryKey: qk.workspaces,
    queryFn: () => workspaceApi.list().then((data) => data.workspaces.map(normalizeWorkspace)),
  });
}

export function useProjects(workspaceId) {
  return useQuery({
    queryKey: qk.projects(workspaceId),
    enabled: Boolean(workspaceId),
    queryFn: () => projectApi.list(workspaceId).then((data) => data.projects.map(normalizeProject)),
  });
}

export function useTasks(workspaceId, projectId, filters) {
  const params = withoutAll(filters);
  return useQuery({
    queryKey: qk.tasks(workspaceId, projectId, params),
    enabled: Boolean(workspaceId && projectId),
    queryFn: () => taskApi.list(workspaceId, projectId, params).then((data) => data.tasks.map(normalizeTask)),
  });
}

export function useComments(workspaceId, taskId) {
  return useQuery({
    queryKey: qk.comments(workspaceId, taskId),
    enabled: Boolean(workspaceId && taskId),
    queryFn: () => commentApi.list(workspaceId, taskId).then((data) => data.comments.map(normalizeComment)),
  });
}

export function useAssignedTasks() {
  return useQuery({
    queryKey: qk.assignedTasks,
    queryFn: () => taskApi.assigned().then((data) => data.tasks.map(normalizeTask)),
  });
}

export function useNotifications() {
  return useQuery({
    queryKey: qk.notifications,
    queryFn: () => notificationApi.list().then((data) => data.notifications.map(normalizeNotification)),
  });
}

export function useDashboard(workspaceId) {
  return useQuery({
    queryKey: qk.analytics(workspaceId),
    queryFn: () => analyticsApi.dashboard(workspaceId).then((data) => ({
      ...data,
      activities: (data.activities ?? []).map(normalizeActivity),
    })),
  });
}

export function useActivities(workspaceId) {
  return useQuery({
    queryKey: qk.activities(workspaceId),
    enabled: Boolean(workspaceId),
    queryFn: () => activityApi.list(workspaceId).then((data) => data.activities.map(normalizeActivity)),
  });
}

export function useInvitations(workspaceId) {
  return useQuery({
    queryKey: qk.invitations(workspaceId),
    enabled: Boolean(workspaceId),
    queryFn: () => workspaceApi.invitations(workspaceId).then((data) => data.invitations ?? []),
  });
}

export function useGlobalSearch(query) {
  const term = query.trim();
  return useQuery({
    queryKey: qk.search(term),
    enabled: term.length > 0,
    queryFn: () => searchApi.global(term).then((data) => ({
      tasks: (data.tasks ?? []).map(normalizeTask),
      projects: (data.projects ?? []).map(normalizeProject),
      members: (data.members ?? []).map(normalizeMember),
    })),
    initialData: { tasks: [], projects: [], members: [] },
  });
}

export function useWorkspaceMutations(workspaceId) {
  const queryClient = useQueryClient();
  const invalidateWorkspaces = () => queryClient.invalidateQueries({ queryKey: qk.workspaces });
  return {
    create: useMutation({
      mutationFn: workspaceApi.create,
      onSuccess: invalidateWorkspaces,
    }),
    update: useMutation({
      mutationFn: (payload) => workspaceApi.update(workspaceId, payload),
      onSuccess: invalidateWorkspaces,
    }),
    delete: useMutation({
      mutationFn: () => workspaceApi.delete(workspaceId),
      onSuccess: invalidateWorkspaces,
    }),
    leave: useMutation({
      mutationFn: () => workspaceApi.leave(workspaceId),
      onSuccess: invalidateWorkspaces,
    }),
    join: useMutation({
      mutationFn: workspaceApi.join,
      onSuccess: invalidateWorkspaces,
    }),
    invite: useMutation({
      mutationFn: (payload) => workspaceApi.invite(workspaceId, payload),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: qk.invitations(workspaceId) }),
    }),
    updateRole: useMutation({
      mutationFn: ({ memberId, role }) => workspaceApi.updateMemberRole(workspaceId, memberId, role),
      onSuccess: invalidateWorkspaces,
    }),
    removeMember: useMutation({
      mutationFn: (memberId) => workspaceApi.removeMember(workspaceId, memberId),
      onSuccess: invalidateWorkspaces,
    }),
  };
}

export function useProjectMutations(workspaceId) {
  const queryClient = useQueryClient();
  return {
    create: useMutation({
      mutationFn: (payload) => projectApi.create(workspaceId, payload),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: qk.projects(workspaceId) }),
    }),
    update: useMutation({
      mutationFn: ({ projectId, payload }) => projectApi.update(workspaceId, projectId, payload),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: qk.projects(workspaceId) }),
    }),
    archive: useMutation({
      mutationFn: (projectId) => projectApi.archive(workspaceId, projectId),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: qk.projects(workspaceId) }),
    }),
    delete: useMutation({
      mutationFn: (projectId) => projectApi.delete(workspaceId, projectId),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: qk.projects(workspaceId) }),
    }),
  };
}

export function useTaskMutations(workspaceId, projectId) {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["tasks", workspaceId, projectId] });
    queryClient.invalidateQueries({ queryKey: ["analytics"] });
    queryClient.invalidateQueries({ queryKey: qk.activities(workspaceId) });
  };
  return {
    create: useMutation({ mutationFn: (payload) => taskApi.create(workspaceId, projectId, payload), onSuccess: invalidate }),
    update: useMutation({ mutationFn: ({ taskId, payload }) => taskApi.update(workspaceId, projectId, taskId, payload), onSuccess: invalidate }),
    delete: useMutation({ mutationFn: (taskId) => taskApi.delete(workspaceId, projectId, taskId), onSuccess: invalidate }),
  };
}

export function useCommentMutations(workspaceId, taskId, projectId) {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: qk.comments(workspaceId, taskId) });
    if (projectId) queryClient.invalidateQueries({ queryKey: ["tasks", workspaceId, projectId] });
    queryClient.invalidateQueries({ queryKey: qk.activities(workspaceId) });
  };
  return {
    create: useMutation({ mutationFn: (body) => commentApi.create(workspaceId, taskId, body), onSuccess: invalidate }),
    update: useMutation({ mutationFn: ({ commentId, body }) => commentApi.update(workspaceId, taskId, commentId, body), onSuccess: invalidate }),
    delete: useMutation({ mutationFn: (commentId) => commentApi.delete(workspaceId, taskId, commentId), onSuccess: invalidate }),
  };
}

export function useNotificationMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: qk.notifications });
  return {
    markAllRead: useMutation({ mutationFn: notificationApi.markAllRead, onSuccess: invalidate }),
    delete: useMutation({ mutationFn: notificationApi.delete, onSuccess: invalidate }),
  };
}
