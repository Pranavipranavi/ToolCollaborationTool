import { motion } from "framer-motion";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CheckCircle2, Clock3, FolderKanban, ListTodo, UsersRound, Workflow } from "lucide-react";
import EmptyState from "../components/ui/EmptyState";
import StatCard from "../components/ui/StatCard";
import { useDashboard } from "../hooks/useTaskflowData";

export default function Dashboard() {
  const dashboard = useDashboard();
  const data = dashboard.data;
  const totals = data?.totals ?? { workspaces: 0, projects: 0, tasks: 0, completedTasks: 0, pendingTasks: 0, teamMembers: 0 };
  const completion = totals.tasks ? Math.round((totals.completedTasks / totals.tasks) * 100) : 0;
  const projectProgress = data?.projectProgress ?? [];
  const workload = data?.workload ?? [];
  const statusData = (data?.statusBreakdown ?? []).map((item) => ({ name: item.status, value: item.count }));
  const activities = data?.activities ?? [];
  const colors = ["#3B82F6", "#EC4899", "#F59E0B", "#10B981"];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-primary-light dark:text-primary-dark">Executive Overview</p>
          <h1 className="mt-1 text-3xl font-bold tracking-normal text-slate-950 dark:text-white">Dashboard</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">High-signal project health, workload, and activity across your workspace.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <StatCard icon={Workflow} label="Workspaces" value={totals.workspaces} tone="blue" />
        <StatCard icon={FolderKanban} label="Projects" value={totals.projects} tone="pink" />
        <StatCard icon={ListTodo} label="Tasks" value={totals.tasks} tone="slate" />
        <StatCard icon={CheckCircle2} label="Completed" value={totals.completedTasks} delta={`${completion}% completion`} tone="green" />
        <StatCard icon={Clock3} label="Pending" value={totals.pendingTasks} tone="blue" />
        <StatCard icon={UsersRound} label="Members" value={totals.teamMembers} tone="pink" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.4fr_0.9fr]">
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-base font-bold text-slate-950 dark:text-white">Project Progress</h2>
          <div className="mt-5 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={projectProgress}>
                <defs>
                  <linearGradient id="progress" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" stroke="#64748B" />
                <YAxis stroke="#64748B" />
                <Tooltip />
                <Area type="monotone" dataKey="progress" stroke="#3B82F6" fill="url(#progress)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-base font-bold text-slate-950 dark:text-white">Task Completion Rate</h2>
          <div className="mt-5 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={92} paddingAngle={4}>
                  {statusData.map((entry, index) => <Cell key={entry.name} fill={colors[index]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.section>
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-base font-bold text-slate-950 dark:text-white">Workload Distribution</h2>
          <div className="mt-5 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workload}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" stroke="#64748B" />
                <YAxis allowDecimals={false} stroke="#64748B" />
                <Tooltip />
                <Bar dataKey="tasks" fill="#EC4899" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-base font-bold text-slate-950 dark:text-white">Recent Activity</h2>
          <div className="mt-5 space-y-3">
            {activities.length === 0 && <EmptyState title="No activity yet" body="Workspace activity will appear after your team creates projects, tasks, and comments." />}
            {activities.slice(0, 6).map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-success-light dark:bg-success-dark" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-slate-700 dark:text-slate-200"><span className="font-bold">{activity.user}</span> {activity.action} <span className="font-semibold">{activity.target}</span></p>
                  <p className="mt-1 text-xs text-slate-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
