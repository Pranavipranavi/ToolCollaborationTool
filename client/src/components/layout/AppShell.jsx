import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { qk } from "../../hooks/useTaskflowData";
import { getSocket } from "../../lib/socket";
import { useTaskflowStore } from "../../store/useTaskflowStore";

export default function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 1024);
  const queryClient = useQueryClient();
  const { activeWorkspaceId, theme } = useTaskflowStore();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    if (!activeWorkspaceId) return undefined;

    const socket = getSocket();
    socket.connect();
    socket.emit("workspace:join", activeWorkspaceId);

    const invalidateTasks = () => queryClient.invalidateQueries({ queryKey: ["tasks", activeWorkspaceId] });
    const invalidateProjects = () => queryClient.invalidateQueries({ queryKey: qk.projects(activeWorkspaceId) });
    const invalidateComments = () => queryClient.invalidateQueries({ queryKey: ["comments", activeWorkspaceId] });
    const invalidateActivity = () => queryClient.invalidateQueries({ queryKey: qk.activities(activeWorkspaceId) });
    const invalidateAnalytics = () => queryClient.invalidateQueries({ queryKey: ["analytics"] });
    const invalidateAssignedTasks = () => queryClient.invalidateQueries({ queryKey: qk.assignedTasks });
    const invalidateNotifications = () => queryClient.invalidateQueries({ queryKey: qk.notifications });
    const invalidateTaskRelated = () => {
      invalidateTasks();
      invalidateActivity();
      invalidateAnalytics();
      invalidateAssignedTasks();
    };
    const invalidateCommentRelated = () => {
      invalidateComments();
      invalidateTaskRelated();
    };

    socket.on("task:created", invalidateTaskRelated);
    socket.on("task:updated", invalidateTaskRelated);
    socket.on("task:deleted", invalidateTaskRelated);
    socket.on("project:updated", invalidateProjects);
    socket.on("project:deleted", invalidateProjects);
    socket.on("comment:created", invalidateCommentRelated);
    socket.on("comment:updated", invalidateCommentRelated);
    socket.on("comment:deleted", invalidateCommentRelated);
    socket.on("activity:created", invalidateTaskRelated);
    socket.on("notification:created", invalidateNotifications);

    return () => {
      socket.emit("workspace:leave", activeWorkspaceId);
      socket.off("task:created", invalidateTaskRelated);
      socket.off("task:updated", invalidateTaskRelated);
      socket.off("task:deleted", invalidateTaskRelated);
      socket.off("project:updated", invalidateProjects);
      socket.off("project:deleted", invalidateProjects);
      socket.off("comment:created", invalidateCommentRelated);
      socket.off("comment:updated", invalidateCommentRelated);
      socket.off("comment:deleted", invalidateCommentRelated);
      socket.off("activity:created", invalidateTaskRelated);
      socket.off("notification:created", invalidateNotifications);
    };
  }, [activeWorkspaceId, queryClient]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-white">
      <div className="flex min-h-screen">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <div className="min-w-0 flex-1">
          <Topbar setSidebarOpen={setSidebarOpen} />
          <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
