import { lazy, Suspense, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import { authApi } from "./lib/api";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { useTaskflowStore } from "./store/useTaskflowStore";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const Landing = lazy(() => import("./pages/Landing"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Profile = lazy(() => import("./pages/Profile"));
const ProjectBoard = lazy(() => import("./pages/ProjectBoard"));
const SearchResults = lazy(() => import("./pages/SearchResults"));
const Settings = lazy(() => import("./pages/Settings"));
const Workspace = lazy(() => import("./pages/Workspace"));

function ProtectedRoute({ children }) {
  const setUser = useTaskflowStore((state) => state.setUser);
  const logout = useTaskflowStore((state) => state.logout);
  const session = useQuery({
    queryKey: ["session"],
    queryFn: authApi.me,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (session.data?.user) setUser(session.data.user);
    if (session.isError) logout();
  }, [logout, session.data?.user, session.isError, setUser]);
  if (session.isLoading) return <div className="grid min-h-screen place-items-center bg-slate-50 text-sm font-semibold text-slate-500">Loading TaskFlow</div>;
  return session.data?.user ? children : <Navigate to="/login" replace />;
}

function Page({ children }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
      <Suspense fallback={<div className="h-40 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />}>{children}</Suspense>
    </motion.div>
  );
}

export default function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Page><Landing /></Page>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<Page><ForgotPassword /></Page>} />
        <Route
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Page><Dashboard /></Page>} />
          <Route path="/analytics" element={<Page><Dashboard /></Page>} />
          <Route path="/board" element={<Page><ProjectBoard /></Page>} />
          <Route path="/workspace" element={<Page><Workspace /></Page>} />
          <Route path="/notifications" element={<Page><Notifications /></Page>} />
          <Route path="/profile" element={<Page><Profile /></Page>} />
          <Route path="/search" element={<Page><SearchResults /></Page>} />
          <Route path="/settings" element={<Page><Settings /></Page>} />
          <Route path="*" element={<Page><NotFound /></Page>} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}
