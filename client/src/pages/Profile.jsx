import { CheckCircle2, ListTodo, Mail, UserRound } from "lucide-react";
import StatCard from "../components/ui/StatCard";
import { useAssignedTasks } from "../hooks/useTaskflowData";
import { useTaskflowStore } from "../store/useTaskflowStore";

export default function Profile() {
  const { user } = useTaskflowStore();
  const { data: assigned = [], isLoading } = useAssignedTasks();
  const completed = assigned.filter((task) => task.status === "Completed");

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <img src={user?.avatar} alt={user?.name ?? "Profile"} className="h-24 w-24 rounded-lg object-cover" />
          <div>
            <p className="text-sm font-semibold text-primary-light dark:text-primary-dark">Profile</p>
            <h1 className="mt-1 text-3xl font-bold text-slate-950 dark:text-white">{user?.name}</h1>
            <p className="mt-2 inline-flex items-center gap-2 text-sm text-slate-500"><Mail size={16} /> {user?.email}</p>
            <p className="mt-1 text-sm text-slate-500">Joined {user?.joinedAt ? new Date(user.joinedAt).toLocaleDateString() : "Recently"}</p>
          </div>
        </div>
      </section>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={UserRound} label="Role" value={user?.role ?? "Member"} tone="blue" />
        <StatCard icon={ListTodo} label="Assigned Tasks" value={assigned.length} tone="pink" />
        <StatCard icon={CheckCircle2} label="Completed Tasks" value={completed.length} tone="green" />
      </div>
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-base font-bold text-slate-950 dark:text-white">Assigned work</h2>
        <div className="mt-4 space-y-3">
          {isLoading && [0, 1, 2].map((item) => <div key={item} className="h-20 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />)}
          {!isLoading && assigned.length === 0 && <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500 dark:bg-slate-800">No tasks are assigned to you yet.</p>}
          {!isLoading && assigned.map((task) => (
            <div key={task.id} className="flex flex-col justify-between gap-2 rounded-lg bg-slate-50 p-4 dark:bg-slate-800 sm:flex-row sm:items-center">
              <div>
                <p className="font-semibold text-slate-950 dark:text-white">{task.title}</p>
                <p className="mt-1 text-xs text-slate-500">{task.status} - {task.priority}</p>
              </div>
              <span className="text-xs font-semibold text-slate-500">Due {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No date"}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
