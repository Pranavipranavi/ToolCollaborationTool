import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import { authApi } from "../lib/api";
import { useTaskflowStore } from "../store/useTaskflowStore";

export default function ForgotPassword() {
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const login = useTaskflowStore((state) => state.login);

  const questionMutation = useMutation({
    mutationFn: authApi.getSecurityQuestion,
    onSuccess: (data) => {
      setSecurityQuestion(data.securityQuestion);
      setMessage("");
      setStep("answer");
    },
    onError: (error) => setMessage(error.response?.data?.message ?? "No account was found for that email address."),
  });

  const answerMutation = useMutation({
    mutationFn: authApi.verifySecurityAnswer,
    onSuccess: (data) => {
      setResetToken(data.resetToken);
      setSecurityAnswer("");
      setMessage("");
      setStep("password");
    },
    onError: (error) => setMessage(error.response?.data?.message ?? "Security answer could not be verified."),
  });

  const resetMutation = useMutation({
    mutationFn: authApi.completePasswordReset,
    onSuccess: (data) => {
      login(data.user);
      navigate("/", { replace: true });
    },
    onError: (error) => setMessage(error.response?.data?.message ?? "Password reset session is invalid or expired."),
  });

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-4 dark:bg-slate-950">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-7 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <Link to="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white">
          <ArrowLeft size={16} /> Back to login
        </Link>
        <h1 className="mt-6 text-3xl font-bold text-slate-950 dark:text-white">Reset password</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Verify your security question to choose a new password.</p>

        {step === "email" && (
          <form className="mt-6 space-y-4" onSubmit={(event) => { event.preventDefault(); questionMutation.mutate({ email }); }}>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Email</span>
              <span className="mt-2 flex h-12 items-center gap-3 rounded-lg border border-slate-200 px-3 dark:border-slate-800 dark:bg-slate-950">
                <Mail size={18} className="text-slate-400" />
                <input className="w-full bg-transparent text-sm outline-none dark:text-white" value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" required />
              </span>
            </label>
            <Button className="w-full" disabled={questionMutation.isPending}>{questionMutation.isPending ? "Checking" : "Continue"}</Button>
          </form>
        )}

        {step === "answer" && (
          <form className="mt-6 space-y-4" onSubmit={(event) => { event.preventDefault(); answerMutation.mutate({ email, securityAnswer }); }}>
            <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800">
              <p className="flex items-center gap-2 text-sm font-bold text-slate-950 dark:text-white"><ShieldCheck size={17} /> Security question</p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{securityQuestion}</p>
            </div>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Answer</span>
              <input className="mt-2 h-12 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-primary-light dark:border-slate-800 dark:bg-slate-950 dark:text-white" value={securityAnswer} onChange={(event) => setSecurityAnswer(event.target.value)} autoComplete="off" minLength={2} maxLength={120} required />
            </label>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="secondary" type="button" onClick={() => { setStep("email"); setMessage(""); }}>Back</Button>
              <Button disabled={answerMutation.isPending}>{answerMutation.isPending ? "Verifying" : "Verify"}</Button>
            </div>
          </form>
        )}

        {step === "password" && (
          <form className="mt-6 space-y-4" onSubmit={(event) => { event.preventDefault(); resetMutation.mutate({ resetToken, password }); }}>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">New password</span>
              <span className="mt-2 flex h-12 items-center gap-3 rounded-lg border border-slate-200 px-3 dark:border-slate-800 dark:bg-slate-950">
                <LockKeyhole size={18} className="text-slate-400" />
                <input className="w-full bg-transparent text-sm outline-none dark:text-white" value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete="new-password" minLength={8} required />
              </span>
            </label>
            <Button className="w-full" disabled={resetMutation.isPending}>{resetMutation.isPending ? "Saving" : "Save new password"}</Button>
          </form>
        )}

        {message && <p className="mt-4 rounded-lg bg-rose-50 p-3 text-sm font-semibold text-rose-700 dark:bg-rose-950 dark:text-rose-200">{message}</p>}
      </section>
    </main>
  );
}
