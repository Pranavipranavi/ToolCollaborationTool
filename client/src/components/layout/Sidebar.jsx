import { AnimatePresence, motion } from "framer-motion";
import { BarChart3, Bell, BriefcaseBusiness, Check, ChevronsUpDown, KanbanSquare, LayoutDashboard, Plus, Settings, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { NavLink, useNavigate } from "react-router-dom";
import { qk, useWorkspaces } from "../../hooks/useTaskflowData";
import { useTaskflowStore } from "../../store/useTaskflowStore";
import Button from "../ui/Button";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
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
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);
  const { data: workspaces = [] } = useWorkspaces();
  const { user, activeWorkspaceId, setActiveWorkspace } = useTaskflowStore();
  const activeWorkspace = workspaces.find((workspace) => workspace.id === activeWorkspaceId);
  const currentRole = activeWorkspace?.members.find((member) => member.id === user?.id)?.role;
  const canCreateProjects = ["Owner", "Admin"].includes(currentRole);

  useEffect(() => {
    if (workspaces.length && (!activeWorkspaceId || !workspaces.some((workspace) => workspace.id === activeWorkspaceId))) {
      setActiveWorkspace(workspaces[0].id);
    }
  }, [activeWorkspaceId, setActiveWorkspace, workspaces]);

  function switchWorkspace(workspaceId) {
    setActiveWorkspace(workspaceId);
    setWorkspaceMenuOpen(false);
    queryClient.invalidateQueries({ queryKey: qk.projects(workspaceId) });
    queryClient.invalidateQueries({ queryKey: ["analytics"] });
  }

  function createProject() {
    if (!activeWorkspaceId) return;
    navigate("/workspace?newProject=1");
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

          <div className="relative mt-7">
            <button
              className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3 text-left transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
              onClick={() => setWorkspaceMenuOpen((value) => !value)}
              aria-expanded={workspaceMenuOpen}
              aria-label="Switch workspace"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">{activeWorkspace?.name ?? "Select workspace"}</p>
                <p className="text-xs text-slate-500">{activeWorkspace?.members.length ?? 0} members</p>
              </div>
              <ChevronsUpDown size={16} className="shrink-0 text-slate-400" />
            </button>

            <AnimatePresence>
              {workspaceMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  className="absolute left-0 right-0 top-16 z-50 max-h-72 overflow-y-auto rounded-lg border border-slate-200 bg-white p-2 shadow-soft dark:border-slate-800 dark:bg-slate-900"
                >
                  {workspaces.length === 0 && <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-500 dark:bg-slate-800">Create a workspace to begin.</p>}
                  {workspaces.map((workspace) => {
                    const selected = workspace.id === activeWorkspaceId;
                    return (
                      <button
                        key={workspace.id}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                        onClick={() => switchWorkspace(workspace.id)}
                      >
                        <span className={`h-2.5 w-2.5 rounded-full ${selected ? "bg-primary-light dark:bg-primary-dark" : "bg-slate-300 dark:bg-slate-700"}`} />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-semibold">{workspace.name}</span>
                          <span className="block text-xs text-slate-400">{workspace.members.length} members</span>
                        </span>
                        {selected && <Check size={16} className="text-primary-light dark:text-primary-dark" />}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
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

          {canCreateProjects && (
            <div className="mt-auto border-t border-slate-200 pt-4 dark:border-slate-800">
              <Button variant="secondary" className="w-full justify-start" disabled={!activeWorkspaceId} onClick={createProject}>
                <Plus size={16} /> New project
              </Button>
            </div>
          )}
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
