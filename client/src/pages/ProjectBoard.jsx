import { SlidersHorizontal } from "lucide-react";
import { useEffect } from "react";
import KanbanBoard from "../components/kanban/KanbanBoard";
import EmptyState from "../components/ui/EmptyState";
import { useProjects, useTasks, useWorkspaces } from "../hooks/useTaskflowData";
import { useTaskflowStore } from "../store/useTaskflowStore";

export default function ProjectBoard() {
  const { activeProjectId, activeWorkspaceId, filters, search, user, setActiveProject, setFilter } = useTaskflowStore();
  const { data: workspaces = [] } = useWorkspaces();
  const workspace = workspaces.find((item) => item.id === activeWorkspaceId);
  const members = workspace?.members ?? [];
  const currentRole = members.find((member) => member.id === user?.id)?.role;
  const { data: projects = [], isLoading: projectsLoading } = useProjects(activeWorkspaceId);
  const activeProject = projects.find((project) => project.id === activeProjectId) ?? projects[0];
  const taskFilters = { ...filters, search };
  const { data: tasks = [], isLoading: tasksLoading } = useTasks(activeWorkspaceId, activeProject?.id, taskFilters);

  useEffect(() => {
    if (!activeProjectId && activeProject?.id) setActiveProject(activeProject.id);
  }, [activeProject?.id, activeProjectId, setActiveProject]);

  return (
    <div className="space-y-5">
      <section className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2 px-2 text-sm font-bold text-slate-700 dark:text-slate-200">
          <SlidersHorizontal size={17} /> Filters
        </div>
        <select className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950" value={filters.status} onChange={(event) => setFilter("status", event.target.value)}>
          {["All", "To Do", "In Progress", "Review", "Completed"].map((value) => <option key={value}>{value}</option>)}
        </select>
        <select className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950" value={filters.priority} onChange={(event) => setFilter("priority", event.target.value)}>
          {["All", "Low", "Medium", "High", "Critical"].map((value) => <option key={value}>{value}</option>)}
        </select>
        <select className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950" value={filters.assignedUser} onChange={(event) => setFilter("assignedUser", event.target.value)}>
          <option value="All">All members</option>
          {members.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}
        </select>
      </section>
      {projectsLoading ? (
        <div className="h-64 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
      ) : !activeProject ? (
        <EmptyState title="No active project" body="Create a project in the workspace view before adding tasks." />
      ) : (
        <KanbanBoard
          activeProject={activeProject}
          activeWorkspaceId={activeWorkspaceId}
          currentRole={currentRole}
          currentUserId={user?.id}
          members={members}
          tasks={tasks}
          loading={tasksLoading}
        />
      )}
    </div>
  );
}
