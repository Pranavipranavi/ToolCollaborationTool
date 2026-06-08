import { Bell, CheckCheck, Trash2 } from "lucide-react";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import { useNotificationMutations, useNotifications } from "../hooks/useTaskflowData";

export default function Notifications() {
  const { data: notifications = [], isLoading } = useNotifications();
  const notificationMutations = useNotificationMutations();
  const unread = notifications.filter((notification) => notification.unread).length;

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-primary-light dark:text-primary-dark">Notification Center</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-950 dark:text-white">Notifications</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{unread} unread updates across tasks, comments, and workspace activity.</p>
        </div>
        <Button variant="secondary" onClick={() => notificationMutations.markAllRead.mutate()} disabled={notificationMutations.markAllRead.isPending}><CheckCheck size={17} /> Mark all read</Button>
      </section>
      {isLoading ? (
        <section className="space-y-3">
          {[0, 1, 2].map((item) => <div key={item} className="h-24 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />)}
        </section>
      ) : notifications.length === 0 ? (
        <EmptyState title="No notifications" body="Task assignments, comments, and workspace events will appear here." />
      ) : (
        <section className="space-y-3">
          {notifications.map((notification) => (
            <article key={notification.id} className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <span className={`mt-1 rounded-lg p-2 ${notification.unread ? "bg-pink-50 text-pink-600 dark:bg-pink-950 dark:text-pink-300" : "bg-slate-100 text-slate-500 dark:bg-slate-800"}`}>
                <Bell size={17} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-slate-950 dark:text-white">{notification.title}</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{notification.body}</p>
                <p className="mt-2 text-xs font-semibold text-slate-400">{notification.type}</p>
              </div>
              <button className="rounded-lg p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950" onClick={() => notificationMutations.delete.mutate(notification.id)} aria-label={`Delete ${notification.title}`}>
                <Trash2 size={17} />
              </button>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
