import axios from "axios";
import { clientEnv } from "./env";

export const api = axios.create({
  baseURL: clientEnv.apiUrl,
  withCredentials: true,
});

export const authApi = {
  me: () => api.get("/auth/me").then((res) => res.data),
  login: (payload) => api.post("/auth/login", payload).then((res) => res.data),
  register: (payload) => api.post("/auth/register", payload).then((res) => res.data),
  logout: () => api.post("/auth/logout").then((res) => res.data),
  getSecurityQuestion: (payload) => api.post("/auth/password-reset/question", payload).then((res) => res.data),
  verifySecurityAnswer: (payload) => api.post("/auth/password-reset/verify", payload).then((res) => res.data),
  completePasswordReset: (payload) => api.post("/auth/password-reset/complete", payload).then((res) => res.data),
  updateProfile: (payload) => api.patch("/auth/me", payload).then((res) => res.data),
  updatePassword: (payload) => api.patch("/auth/password", payload).then((res) => res.data),
};

export const workspaceApi = {
  list: () => api.get("/workspaces").then((res) => res.data),
  create: (payload) => api.post("/workspaces", payload).then((res) => res.data),
  update: (workspaceId, payload) => api.patch(`/workspaces/${workspaceId}`, payload).then((res) => res.data),
  delete: (workspaceId) => api.delete(`/workspaces/${workspaceId}`).then((res) => res.data),
  join: (inviteCode) => api.post("/workspaces/join", { inviteCode }).then((res) => res.data),
  leave: (workspaceId) => api.post(`/workspaces/${workspaceId}/leave`).then((res) => res.data),
  invitations: (workspaceId) => api.get(`/workspaces/${workspaceId}/invitations`).then((res) => res.data),
  invite: (workspaceId, payload) => api.post(`/workspaces/${workspaceId}/invitations`, payload).then((res) => res.data),
  acceptInvitation: (token) => api.post("/workspaces/invitations/accept", { token }).then((res) => res.data),
  updateMemberRole: (workspaceId, memberId, role) => api.patch(`/workspaces/${workspaceId}/members/${memberId}/role`, { role }).then((res) => res.data),
  removeMember: (workspaceId, memberId) => api.delete(`/workspaces/${workspaceId}/members/${memberId}`).then((res) => res.data),
};

export const projectApi = {
  list: (workspaceId) => api.get(`/${workspaceId}/projects`).then((res) => res.data),
  create: (workspaceId, payload) => api.post(`/${workspaceId}/projects`, payload).then((res) => res.data),
  update: (workspaceId, projectId, payload) => api.patch(`/${workspaceId}/projects/${projectId}`, payload).then((res) => res.data),
  archive: (workspaceId, projectId) => api.patch(`/${workspaceId}/projects/${projectId}/archive`).then((res) => res.data),
  delete: (workspaceId, projectId) => api.delete(`/${workspaceId}/projects/${projectId}`).then((res) => res.data),
};

export const taskApi = {
  assigned: () => api.get("/tasks/assigned").then((res) => res.data),
  list: (workspaceId, projectId, params) => api.get(`/${workspaceId}/projects/${projectId}/tasks`, { params }).then((res) => res.data),
  create: (workspaceId, projectId, payload) => api.post(`/${workspaceId}/projects/${projectId}/tasks`, payload).then((res) => res.data),
  update: (workspaceId, projectId, taskId, payload) => api.patch(`/${workspaceId}/projects/${projectId}/tasks/${taskId}`, payload).then((res) => res.data),
  delete: (workspaceId, projectId, taskId) => api.delete(`/${workspaceId}/projects/${projectId}/tasks/${taskId}`).then((res) => res.data),
};

export const commentApi = {
  list: (workspaceId, taskId) => api.get(`/${workspaceId}/tasks/${taskId}/comments`).then((res) => res.data),
  create: (workspaceId, taskId, body) => api.post(`/${workspaceId}/tasks/${taskId}/comments`, { body }).then((res) => res.data),
  update: (workspaceId, taskId, commentId, body) => api.patch(`/${workspaceId}/tasks/${taskId}/comments/${commentId}`, { body }).then((res) => res.data),
  delete: (workspaceId, taskId, commentId) => api.delete(`/${workspaceId}/tasks/${taskId}/comments/${commentId}`).then((res) => res.data),
};

export const notificationApi = {
  list: () => api.get("/notifications").then((res) => res.data),
  markAllRead: () => api.patch("/notifications/read").then((res) => res.data),
  delete: (notificationId) => api.delete(`/notifications/${notificationId}`).then((res) => res.data),
};

export const analyticsApi = {
  dashboard: (workspaceId) => api.get("/analytics/dashboard", { params: workspaceId ? { workspaceId } : undefined }).then((res) => res.data),
};

export const activityApi = {
  list: (workspaceId) => api.get(`/${workspaceId}/activities`).then((res) => res.data),
};

export const searchApi = {
  global: (query) => api.get("/search", { params: { q: query } }).then((res) => res.data),
};
