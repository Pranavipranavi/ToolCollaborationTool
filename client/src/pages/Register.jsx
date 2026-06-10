import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import Button from "../components/ui/Button";
import { authApi, workspaceApi } from "../lib/api";
import { SECURITY_QUESTIONS } from "../lib/securityQuestions";
import { useTaskflowStore } from "../store/useTaskflowStore";

export default function Register() {
  const login = useTaskflowStore((state) => state.login);
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", securityQuestion: SECURITY_QUESTIONS[0], securityAnswer: "" });
  const [error, setError] = useState("");
  const inviteToken = new URLSearchParams(window.location.search).get("invite");
  const loginPath = inviteToken ? `/login?invite=${encodeURIComponent(inviteToken)}` : "/login";
  const isExistingAccountError = error.toLowerCase().includes("already registered");
  const registerMutation = useMutation({
    mutationFn: async (payload) => {
      const data = await authApi.register(payload);
      if (inviteToken) await workspaceApi.acceptInvitation(inviteToken);
      return data;
    },
    onSuccess: (data) => {
      login(data.user);
      navigate(inviteToken ? "/workspace?invite=accepted" : "/dashboard", { replace: true });
    },
    onError: (requestError) => {
      const message = requestError?.response?.data?.message;
      const details = requestError?.response?.data?.details;
      const validationMessage = Array.isArray(details) && details[0]?.msg ? details[0].msg : null;
      setError(message || validationMessage || "Registration failed. Check your details and try again.");
    },
  });

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-7 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-6 grid h-11 w-11 place-items-center rounded-lg bg-primary-light font-black text-white dark:bg-primary-dark dark:text-slate-950">TF</div>
        <h1 className="text-3xl font-bold text-slate-950 dark:text-white">Create your workspace</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Start with a clean operating system for your team project.</p>
        <form
          className="mt-7 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            setError("");
            registerMutation.mutate(form);
          }}
        >
          <input className="h-12 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-primary-light dark:border-slate-800 dark:bg-slate-950 dark:text-white" placeholder="Full name" value={form.name} onChange={(event) => updateField("name", event.target.value)} autoComplete="name" required />
          <input className="h-12 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-primary-light dark:border-slate-800 dark:bg-slate-950 dark:text-white" placeholder="Email" value={form.email} onChange={(event) => updateField("email", event.target.value)} autoComplete="email" type="email" required />
          <input className="h-12 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-primary-light dark:border-slate-800 dark:bg-slate-950 dark:text-white" placeholder="Password" type="password" value={form.password} onChange={(event) => updateField("password", event.target.value)} autoComplete="new-password" minLength={8} required />
          <select className="h-12 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-primary-light dark:border-slate-800 dark:bg-slate-950 dark:text-white" value={form.securityQuestion} onChange={(event) => updateField("securityQuestion", event.target.value)} required>
            {SECURITY_QUESTIONS.map((question) => <option key={question}>{question}</option>)}
          </select>
          <input className="h-12 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-primary-light dark:border-slate-800 dark:bg-slate-950 dark:text-white" placeholder="Security answer" value={form.securityAnswer} onChange={(event) => updateField("securityAnswer", event.target.value)} autoComplete="off" minLength={2} maxLength={120} required />
          {error && (
            <div className="rounded-lg bg-rose-50 p-3 text-sm font-semibold text-rose-700 dark:bg-rose-950 dark:text-rose-200">
              <p>{error}</p>
              {isExistingAccountError && (
                <div className="mt-3 flex flex-wrap gap-3 text-sm">
                  <Link to={loginPath} className="text-primary-light underline underline-offset-4 dark:text-primary-dark">Login instead</Link>
                  <Link to="/forgot-password" className="text-primary-light underline underline-offset-4 dark:text-primary-dark">Reset password</Link>
                </div>
              )}
            </div>
          )}
          <Button className="w-full" disabled={registerMutation.isPending}>{registerMutation.isPending ? "Creating account" : "Register"}</Button>
        </form>
        <p className="mt-6 text-sm text-slate-500">
          Already have an account? <Link to={loginPath} className="font-semibold text-primary-light dark:text-primary-dark">Login</Link>
        </p>
      </section>
    </main>
  );
}
