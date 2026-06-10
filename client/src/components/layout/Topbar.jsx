import { AnimatePresence, motion } from "framer-motion";
import { Bell, CheckCircle2, ChevronRight, FolderKanban, ListTodo, LogOut, Menu, Moon, Search, Settings, Sun, UserCircle, UsersRound } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useGlobalSearch, useNotificationMutations, useNotifications } from "../../hooks/useTaskflowData";
import { authApi } from "../../lib/api";
import { useTaskflowStore } from "../../store/useTaskflowStore";

function SearchSection({ icon: Icon, label, count, children }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase text-slate-400">
        <span className="inline-flex items-center gap-2"><Icon size={14} /> {label}</span>
        <span>{count}</span>
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function SearchResultButton({ title, meta, onClick }) {
  return (
    <button
      type="button"
      className="group flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left transition hover:bg-slate-100 dark:hover:bg-slate-800"
      onClick={onClick}
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{title}</p>
        <p className="truncate text-xs text-slate-500">{meta}</p>
      </div>
      <ChevronRight size={15} className="shrink-0 text-slate-300 transition group-hover:text-slate-500" />
    </button>
  );
}

export default function Topbar({ setSidebarOpen }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const searchRef = useRef(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const { data: notifications = [] } = useNotifications();
  const notificationMutations = useNotificationMutations();
  const { user, theme, search, setSearch, toggleTheme, logout, setActiveWorkspace, setActiveProject } = useTaskflowStore();
  const searchResults = useGlobalSearch(search);
  const results = searchResults.data ?? { tasks: [], projects: [], members: [] };
  const unread = notifications.filter((notification) => notification.unread).length;
  const term = search.trim();
  const hasResults = results.tasks.length || results.projects.length || results.members.length;
  const avatar = user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || user?.email || "TaskFlow")}`;
  const visibleNotifications = useMemo(() => notifications.slice(0, 5), [notifications]);

  useEffect(() => {
    function handleShortcut(event) {
      const isSearchShortcut = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k";
      if (isSearchShortcut) {
        event.preventDefault();
        setShowSearch(true);
        searchRef.current?.focus();
      }
      if (event.key === "Escape") {
        setShowSearch(false);
        setShowNotifications(false);
        setShowProfileMenu(false);
      }
    }

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  function submitSearch(event) {
    event.preventDefault();
    if (term) {
      setShowSearch(false);
      navigate("/search");
    }
  }

  function openTask(task) {
    if (task.workspaceId) setActiveWorkspace(task.workspaceId);
    if (task.projectId) setActiveProject(task.projectId);
    setShowSearch(false);
    navigate("/board");
  }

  function openProject(project) {
    if (project.workspaceId) setActiveWorkspace(project.workspaceId);
    setActiveProject(project.id);
    setShowSearch(false);
    navigate("/board");
  }

  function openMember() {
    setShowSearch(false);
    navigate("/workspace");
  }

  async function handleLogout() {
    try {
      await authApi.logout();
    } catch (_error) {
      // Local state still needs to be cleared when the server session has already expired.
    } finally {
      logout();
      queryClient.clear();
      navigate("/login", { replace: true });
    }
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-slate-50/90 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90 sm:px-6">
      <div className="flex items-center gap-3">
        <button className="rounded-lg p-2 text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden" onClick={() => setSidebarOpen(true)} aria-label="Open sidebar">
          <Menu size={21} />
        </button>

        <form className="relative min-w-0 flex-1" onSubmit={submitSearch}>
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            ref={searchRef}
            value={search}
            onFocus={() => setShowSearch(true)}
            onChange={(event) => {
              setSearch(event.target.value);
              setShowSearch(true);
            }}
            className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-24 text-sm outline-none transition placeholder:text-slate-400 focus:border-primary-light focus:ring-4 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:focus:ring-blue-950"
            placeholder="Search tasks, projects, members"
          />
          <span className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-slate-200 px-2 py-1 text-[11px] font-bold text-slate-400 dark:border-slate-700 sm:inline-flex">
            Ctrl K
          </span>

          <AnimatePresence>
            {showSearch && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                className="absolute left-0 right-0 top-14 z-40 max-h-[70vh] overflow-y-auto rounded-lg border border-slate-200 bg-white p-3 shadow-soft dark:border-slate-800 dark:bg-slate-900"
              >
                {!term ? (
                  <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                    Search across MongoDB-backed tasks, projects, and workspace members.
                  </div>
                ) : searchResults.isFetching ? (
                  <div className="space-y-2">
                    {[0, 1, 2].map((item) => <div key={item} className="h-12 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />)}
                  </div>
                ) : !hasResults ? (
                  <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500 dark:bg-slate-800 dark:text-slate-300">No matches found for "{term}".</div>
                ) : (
                  <div className="space-y-4">
                    <SearchSection icon={ListTodo} label="Tasks" count={results.tasks.length}>
                      {results.tasks.slice(0, 4).map((task) => (
                        <SearchResultButton key={task.id} title={task.title} meta={`${task.status} - ${task.priority}`} onClick={() => openTask(task)} />
                      ))}
                    </SearchSection>
                    <SearchSection icon={FolderKanban} label="Projects" count={results.projects.length}>
                      {results.projects.slice(0, 4).map((project) => (
                        <SearchResultButton key={project.id} title={project.title} meta={project.status} onClick={() => openProject(project)} />
                      ))}
                    </SearchSection>
                    <SearchSection icon={UsersRound} label="Members" count={results.members.length}>
                      {results.members.slice(0, 4).map((member) => (
                        <SearchResultButton key={member.id} title={member.name} meta={member.email || member.role} onClick={openMember} />
                      ))}
                    </SearchSection>
                    <button type="submit" className="flex w-full items-center justify-center rounded-lg bg-slate-950 px-3 py-2 text-sm font-bold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200">
                      View all results
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </form>

        <div className="relative">
          <button
            className="relative rounded-lg border border-slate-200 bg-white p-2.5 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
            onClick={() => {
              setShowNotifications((value) => !value);
              setShowProfileMenu(false);
              notificationMutations.markAllRead.mutate();
            }}
            aria-label="Notifications"
          >
            <Bell size={19} />
            {unread > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-accent-light px-1 text-xs font-bold text-white">{unread}</span>}
          </button>
          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                className="absolute right-0 mt-3 w-80 rounded-lg border border-slate-200 bg-white p-3 shadow-soft dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-950 dark:text-white">Notifications</p>
                  <CheckCircle2 size={15} className="text-emerald-500" />
                </div>
                <div className="space-y-2">
                  {visibleNotifications.length === 0 && <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-500 dark:bg-slate-800">No notifications yet.</p>}
                  {visibleNotifications.map((notification) => (
                    <div key={notification.id} className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{notification.title}</p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{notification.body}</p>
                    </div>
                  ))}
                </div>
                <button className="mt-3 h-9 w-full rounded-lg bg-slate-950 text-sm font-bold text-white dark:bg-white dark:text-slate-950" onClick={() => { setShowNotifications(false); navigate("/notifications"); }}>
                  View notification center
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative">
          <button
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-1.5 pr-2 text-left hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
            onClick={() => {
              setShowProfileMenu((value) => !value);
              setShowNotifications(false);
            }}
            aria-label="Open profile menu"
          >
            <img className="h-8 w-8 rounded-lg object-cover" src={avatar} alt={user?.name || "Profile"} />
            <span className="hidden max-w-28 truncate text-sm font-bold text-slate-700 dark:text-slate-200 sm:inline">{user?.name}</span>
          </button>
          <AnimatePresence>
            {showProfileMenu && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                className="absolute right-0 mt-3 w-64 rounded-lg border border-slate-200 bg-white p-2 shadow-soft dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="mb-2 rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                  <p className="truncate text-sm font-bold text-slate-950 dark:text-white">{user?.name}</p>
                  <p className="truncate text-xs text-slate-500">{user?.email}</p>
                </div>
                <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800" onClick={() => { setShowProfileMenu(false); navigate("/profile"); }}>
                  <UserCircle size={17} /> Profile
                </button>
                <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800" onClick={() => { setShowProfileMenu(false); navigate("/settings"); }}>
                  <Settings size={17} /> Settings
                </button>
                <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800" onClick={toggleTheme}>
                  {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />} {theme === "dark" ? "Light mode" : "Dark mode"}
                </button>
                <button className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950" onClick={handleLogout}>
                  <LogOut size={17} /> Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
