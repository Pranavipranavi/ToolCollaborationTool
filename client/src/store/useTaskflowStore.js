import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useTaskflowStore = create(
  persist(
    (set) => ({
      user: null,
      theme: "light",
      activeWorkspaceId: null,
      activeProjectId: null,
      search: "",
      filters: {
        status: "All",
        priority: "All",
        assignedUser: "All",
      },
      preferences: {
        emailNotifications: true,
        desktopNotifications: false,
        weeklyDigest: true,
        compactCards: false,
      },
      setUser: (user) => set({ user }),
      login: (user) => set({ user }),
      logout: () => set({ user: null, activeWorkspaceId: null, activeProjectId: null }),
      updateUser: (payload) => set((state) => ({ user: { ...state.user, ...payload } })),
      updatePreference: (key, value) => set((state) => ({ preferences: { ...state.preferences, [key]: value } })),
      toggleTheme: () => set((state) => ({ theme: state.theme === "dark" ? "light" : "dark" })),
      setActiveWorkspace: (workspaceId) => set({ activeWorkspaceId: workspaceId, activeProjectId: null }),
      setActiveProject: (projectId) => set({ activeProjectId: projectId }),
      setSearch: (search) => set({ search }),
      setFilter: (key, value) => set((state) => ({ filters: { ...state.filters, [key]: value } })),
    }),
    {
      name: "taskflow-ui-state",
      version: 2,
      migrate: (state) => {
        if (!state) return state;
        return { ...state, user: null };
      },
      partialize: (state) => ({
        theme: state.theme,
        activeWorkspaceId: state.activeWorkspaceId,
        activeProjectId: state.activeProjectId,
        preferences: state.preferences,
      }),
    }
  )
);
