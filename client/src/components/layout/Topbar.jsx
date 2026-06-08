import { Bell, Menu, Search, Settings } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNotificationMutations, useNotifications } from "../../hooks/useTaskflowData";
import { useTaskflowStore } from "../../store/useTaskflowStore";

export default function Topbar({ setSidebarOpen }) {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const { data: notifications = [] } = useNotifications();
  const notificationMutations = useNotificationMutations();
  const { user, search, setSearch } = useTaskflowStore();
  const unread = notifications.filter((notification) => notification.unread).length;

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-slate-50/90 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90 sm:px-6">
      <div className="flex items-center gap-3">
        <button className="rounded-lg p-2 text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden" onClick={() => setSidebarOpen(true)} aria-label="Open sidebar">
          <Menu size={21} />
        </button>
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              if (event.target.value.trim()) navigate("/search");
            }}
            className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-primary-light focus:ring-4 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:focus:ring-blue-950"
            placeholder="Search tasks, projects, members"
          />
        </div>
        <div className="relative">
          <button
            className="relative rounded-lg border border-slate-200 bg-white p-2.5 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
            onClick={() => {
              setShowNotifications((value) => !value);
              notificationMutations.markAllRead.mutate();
              navigate("/notifications");
            }}
            aria-label="Notifications"
          >
            <Bell size={19} />
            {unread > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-accent-light px-1 text-xs font-bold text-white">{unread}</span>}
          </button>
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 rounded-lg border border-slate-200 bg-white p-3 shadow-soft dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-bold text-slate-950 dark:text-white">Notifications</p>
                <Settings size={15} className="text-slate-400" />
              </div>
              <div className="space-y-2">
                {notifications.map((notification) => (
                  <div key={notification.id} className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{notification.title}</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{notification.body}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <img className="h-10 w-10 rounded-lg object-cover" src={user?.avatar} alt={user?.name} />
      </div>
    </header>
  );
}
