import { motion } from "framer-motion";
import { Activity, CheckCircle2, Clock3, FolderKanban, ListTodo, TrendingUp, UsersRound } from "lucide-react";
import EmptyState from "../components/ui/EmptyState";
import StatCard from "../components/ui/StatCard";
import { useDashboard, useWorkspaces } from "../hooks/useTaskflowData";
import { useTaskflowStore } from "../store/useTaskflowStore";

const statusOrder = ["To Do", "In Progress", "Review", "Completed"];

export default function Dashboard() {
  const { activeWorkspaceId } = useTaskflowStore();
  const { data: workspaces = [] } = useWorkspaces();
  const workspace = workspaces.find((item) => item.id === activeWorkspaceId);
  const dashboard = useDashboard(activeWorkspaceId);
  const data = dashboard.data;
  const totals = data?.totals ?? { projects: 0, tasks: 0, completedTasks: 0, pendingTasks: 0, teamMembers: 0 };
  const completion = totals.tasks ? Math.round((totals.completedTasks / totals.tasks) * 100) : 0;
  const statusBreakdown = data?.statusBreakdown ?? [];
  const projectProgress = data?.projectProgress ?? [];
  const activities = data?.activities ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-primary-light dark:text-primary-dark">Workspace Intelligence</p>
          <h1 className="mt-1 text-3xl font-bold tracking-normal text-slate-950 dark:text-white">{workspace?.name ?? "Dashboard"}</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Real-time project health, team workload, and activity from MongoDB-backed workspace data.</p>
        </div>
      </div>

      {dashboard.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {[0, 1, 2, 3, 4].map((item) => <div key={item} className="h-36 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />)}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard icon={ListTodo} label="Total Tasks" value={totals.tasks} tone="blue" />
          <StatCard icon={CheckCircle2} label="Completed" value={totals.completedTasks} tone="green" />
          <StatCard icon={Clock3} label="Pending" value={totals.pendingTasks} tone="slate" />
          <StatCard icon={UsersRound} label="Members" value={totals.teamMembers} tone="pink" />
          <StatCard icon={TrendingUp} label="Completion Rate" value={`${completion}%`} delta={`${totals.projects} active projects`} tone="green" />
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-950 dark:text-white">Completion Rate</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Tasks completed in the selected workspace.</p>
            </div>
            <span className="rounded-lg bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">{completion}%</span>
          </div>
          <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <motion.div initial={{ width: 0 }} animate={{ width: `${completion}%` }} transition={{ duration: 0.5, ease: "easeOut" }} className="h-full rounded-full bg-success-light dark:bg-success-dark" />
          </div>
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            {statusOrder.map((status) => {
              const count = statusBreakdown.find((item) => item.status === status)?.count ?? 0;
              return (
                <div key={status} className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                  <p className="text-xs font-bold uppercase text-slate-400">{status}</p>
                  <p className="mt-1 text-2xl font-bold text-slate-950 dark:text-white">{count}</p>
                </div>
              );
            })}
          </div>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <h2 className="inline-flex items-center gap-2 text-base font-bold text-slate-950 dark:text-white"><FolderKanban size={18} /> Project Progress</h2>
          <div className="mt-5 space-y-4">
            {projectProgress.length === 0 && <EmptyState title="No project data" body="Create tasks in a project to see progress here." />}
            {projectProgress.slice(0, 6).map((project) => (
              <div key={project.projectId} className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate text-sm font-bold text-slate-800 dark:text-slate-100">{project.name}</p>
                  <p className="text-sm font-bold text-slate-500">{project.progress}%</p>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${project.progress}%` }} transition={{ duration: 0.45, ease: "easeOut" }} className="h-full rounded-full bg-primary-light dark:bg-primary-dark" />
                </div>
              </div>
            ))}
          </div>
        </motion.section>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <h2 className="inline-flex items-center gap-2 text-base font-bold text-slate-950 dark:text-white"><Activity size={18} /> Activity Timeline</h2>
        <div className="mt-5 space-y-3">
          {activities.length === 0 && <EmptyState title="No activity yet" body="Task moves, comments, invites, and project updates will appear here as your team works." />}
          {activities.slice(0, 10).map((activity) => (
            <motion.div key={activity.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-3 rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
              <span className="mt-1 h-2.5 w-2.5 rounded-full bg-success-light dark:bg-success-dark" />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-slate-700 dark:text-slate-200"><span className="font-bold">{activity.user}</span> {activity.action} <span className="font-semibold">{activity.target}</span></p>
                <p className="mt-1 text-xs text-slate-500">{activity.time}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
