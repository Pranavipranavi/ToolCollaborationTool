import { LockKeyhole, Mail } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import Button from "../components/ui/Button";
import { authApi, workspaceApi } from "../lib/api";
import { clientEnv } from "../lib/env";
import { useTaskflowStore } from "../store/useTaskflowStore";

export default function Login() {
  const login = useTaskflowStore((state) => state.login);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const inviteToken = new URLSearchParams(window.location.search).get("invite");
  const oauthFailed = new URLSearchParams(window.location.search).get("oauth") === "failed";
  const googleUrl = `${clientEnv.apiUrl}/auth/google${inviteToken ? `?invite=${encodeURIComponent(inviteToken)}` : ""}`;
  const loginMutation = useMutation({
    mutationFn: async (payload) => {
      const data = await authApi.login(payload);
      if (inviteToken) await workspaceApi.acceptInvitation(inviteToken);
      return data;
    },
    onSuccess: (data) => {
      login(data.user);
      navigate(inviteToken ? "/workspace?invite=accepted" : "/dashboard", { replace: true });
    },
    onError: (requestError) => {
      setError(requestError?.response?.data?.message || "Login failed. Check credentials or API configuration.");
    },
  });

  return (
    <main className="grid min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-white lg:grid-cols-[1.1fr_0.9fr]">
      <section className="flex items-center px-6 py-10 sm:px-10 lg:px-16">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-lg bg-primary-light font-black text-white dark:bg-primary-dark dark:text-slate-950">TF</div>
            <div>
              <p className="text-xl font-bold">TaskFlow</p>
              <p className="text-sm text-slate-500">Team collaboration, beautifully organized.</p>
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-normal">Welcome back</h1>
          <p className="mt-3 text-slate-500 dark:text-slate-400">{inviteToken ? "Sign in to accept your workspace invitation and join the team." : "Sign in to plan sprints, move work forward, and keep every teammate aligned."}</p>
          {oauthFailed && <p className="mt-4 rounded-lg bg-rose-50 p-3 text-sm font-semibold text-rose-700 dark:bg-rose-950 dark:text-rose-200">Google login could not be completed. Check the OAuth callback URL and try again.</p>}
          <form
            className="mt-8 space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              setError("");
              loginMutation.mutate({ email, password });
            }}
          >
            <label className="block">
              <span className="text-sm font-semibold">Email</span>
              <span className="mt-2 flex h-12 items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 dark:border-slate-800 dark:bg-slate-900">
                <Mail size={18} className="text-slate-400" />
                <input className="w-full bg-transparent text-sm outline-none" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" type="email" required />
              </span>
            </label>
            <label className="block">
              <span className="text-sm font-semibold">Password</span>
              <span className="mt-2 flex h-12 items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 dark:border-slate-800 dark:bg-slate-900">
                <LockKeyhole size={18} className="text-slate-400" />
                <input className="w-full bg-transparent text-sm outline-none" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required />
              </span>
            </label>
            {error && <p className="rounded-lg bg-rose-50 p-3 text-sm font-semibold text-rose-700 dark:bg-rose-950 dark:text-rose-200">{error}</p>}
            <Button className="w-full" disabled={loginMutation.isPending}>{loginMutation.isPending ? "Signing in" : "Login"}</Button>
          </form>
          <Link to="/forgot-password" className="mt-3 inline-flex text-sm font-semibold text-primary-light dark:text-primary-dark">Forgot password?</Link>
          <div className="mt-4">
            <a className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-sm font-semibold dark:border-slate-800 dark:bg-slate-900" href={googleUrl}>
              <Mail size={16} /> Google
            </a>
          </div>
          <p className="mt-6 text-sm text-slate-500">
            New here? <Link to={inviteToken ? `/register?invite=${encodeURIComponent(inviteToken)}` : "/register"} className="font-semibold text-primary-light dark:text-primary-dark">Create an account</Link>
          </p>
        </motion.div>
      </section>
      <section className="hidden bg-slate-950 p-8 text-white lg:block">
        <div className="flex h-full flex-col justify-end rounded-lg bg-[url('https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center p-10">
          <div className="max-w-lg">
            <p className="text-sm font-semibold uppercase text-blue-200">Built for serious teams</p>
            <p className="mt-3 text-4xl font-bold leading-tight">One calm place for projects, tasks, analytics, and live collaboration.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
