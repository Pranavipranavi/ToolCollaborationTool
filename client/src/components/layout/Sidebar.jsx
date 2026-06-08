import { AnimatePresence, motion } from "framer-motion";
import { BarChart3, Bell, BriefcaseBusiness, ChevronsUpDown, KanbanSquare, LayoutDashboard, LogOut, Moon, Plus, Search, Settings, Sun, Users } from "lucide-react";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { NavLink, useNavigate } from "react-router-dom";
import { qk, useProjectMutations, useWorkspaces } from "../../hooks/useTaskflowData";
import { authApi } from "../../lib/api";
import { normalizeProject } from "../../lib/normalizers";
import { useTaskflowStore } from "../../store/useTaskflowStore";
import Button from "../ui/Button";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/board", label: "Kanban", icon: KanbanSquare },
  { to: "/workspace", label: "Workspace", icon: BriefcaseBusiness },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/profile", label: "Profile", icon: Users },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar({ open, setOpen }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: workspaces = [] } = useWorkspaces();
  const { theme, toggleTheme, activeWorkspaceId, setActiveProject, setActiveWorkspace, logout } = useTaskflowStore();
  const projectMutations = useProjectMutations(activeWorkspaceId);
  const activeWorkspace = workspaces.find((workspace) => workspace.id === activeWorkspaceId);

  useEffect(() => {
    if (workspaces.length && (!activeWorkspaceId || !workspaces.some((workspace) => workspace.id === activeWorkspaceId))) {
      setActiveWorkspace(workspaces[0].id);
    }
  }, [activeWorkspaceId, setActiveWorkspace, workspaces]);

  async function handleLogout() {
    try {
      await authApi.logout();
    } catch (_error) {
      // The UI still clears local session state if the API session has already expired.
    } finally {
      logout();
      queryClient.clear();
      navigate("/login", { replace: true });
    }
  }

  function createProject() {
    if (!activeWorkspaceId) return;
    projectMutations.create.mutate(
      { title: "New product project", description: "Plan milestones, ownership, and delivery tasks." },
      {
        onSuccess: (data) => {
          const project = normalizeProject(data.project);
          setActiveProject(project.id);
          queryClient.invalidateQueries({ queryKey: qk.projects(activeWorkspaceId) });
          navigate("/board");
        },
      }
    );
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          initial={{ x: -280, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -280, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
          className="fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200 bg-white px-4 py-5 dark:border-slate-800 dark:bg-slate-950 lg:sticky lg:translate-x-0"
        >
          <div className="flex items-center gap-3 px-2">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary-light text-base font-black text-white dark:bg-primary-dark dark:text-slate-950">
              TF
            </div>
            <div>
              <p className="text-lg font-bold text-slate-950 dark:text-white">TaskFlow</p>
              <p className="text-xs font-medium text-slate-500">Project OS</p>
            </div>
          </div>

          <button className="mt-7 flex w-full items-center justify-between rounded-lg border border-slate-200 p-3 text-left dark:border-slate-800" onClick={() => setOpen(true)}>
            <div>
              <p className="text-sm font-semibold text-slate-950 dark:text-white">{activeWorkspace?.name}</p>
              <p className="text-xs text-slate-500">{activeWorkspace?.members.length ?? 0} members</p>
            </div>
            <ChevronsUpDown size={16} className="text-slate-400" />
          </button>

          <div className="mt-4 space-y-1">
            {workspaces.map((workspace) => (
              <button
                key={workspace.id}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
                onClick={() => setActiveWorkspace(workspace.id)}
              >
                <span className="h-2 w-2 rounded-full bg-success-light dark:bg-success-dark" />
                {workspace.name}
              </button>
            ))}
          </div>

          <nav className="mt-7 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => window.innerWidth < 1024 && setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                    isActive
                      ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
                  }`
                }
              >
                <item.icon size={18} />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto space-y-2">
            <Button variant="secondary" className="w-full justify-start" disabled={!activeWorkspaceId || projectMutations.create.isPending} onClick={createProject}>
              <Plus size={16} /> New project
            </Button>
            <Button variant="ghost" className="w-full justify-start" onClick={() => navigate("/search")}>
              <Search size={16} /> Global search
            </Button>
            <Button variant="ghost" className="w-full justify-start" onClick={toggleTheme}>
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />} {theme === "dark" ? "Light mode" : "Dark mode"}
            </Button>
            <Button variant="ghost" className="w-full justify-start text-rose-600 dark:text-rose-300" onClick={handleLogout}>
              <LogOut size={16} /> Logout
            </Button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
