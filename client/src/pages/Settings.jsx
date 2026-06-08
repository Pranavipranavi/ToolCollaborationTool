import { useMutation } from "@tanstack/react-query";
import { Save, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import Button from "../components/ui/Button";
import { authApi } from "../lib/api";
import { useTaskflowStore } from "../store/useTaskflowStore";

export default function Settings() {
  const { preferences, updatePreference, updateUser, user } = useTaskflowStore();
  const [profile, setProfile] = useState({ name: user?.name ?? "", avatar: user?.avatar ?? "" });
  const [status, setStatus] = useState("");
  const profileMutation = useMutation({
    mutationFn: authApi.updateProfile,
    onSuccess: (data) => {
      updateUser(data.user);
      setStatus("Profile saved.");
    },
    onError: () => setStatus("Profile could not be saved. Check the API, session, and MongoDB connection."),
  });

  useEffect(() => {
    setProfile({ name: user?.name ?? "", avatar: user?.avatar ?? "" });
  }, [user?.avatar, user?.name]);

  async function saveProfile(event) {
    event.preventDefault();
    profileMutation.mutate(profile);
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-primary-light dark:text-primary-dark">Settings</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-950 dark:text-white">Account and workspace preferences</h1>
      </div>
      <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-base font-bold text-slate-950 dark:text-white">Profile</h2>
          <form className="mt-4 space-y-4" onSubmit={saveProfile}>
            <label className="block text-sm font-semibold">Name<input className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 font-normal outline-none dark:border-slate-800 dark:bg-slate-950" value={profile.name} onChange={(event) => setProfile((value) => ({ ...value, name: event.target.value }))} /></label>
            <label className="block text-sm font-semibold">Avatar URL<input className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 font-normal outline-none dark:border-slate-800 dark:bg-slate-950" value={profile.avatar} onChange={(event) => setProfile((value) => ({ ...value, avatar: event.target.value }))} /></label>
            <Button disabled={profileMutation.isPending}><Save size={17} /> {profileMutation.isPending ? "Saving" : "Save profile"}</Button>
          </form>
          {status && <p className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200">{status}</p>}
        </section>
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <h2 className="flex items-center gap-2 text-base font-bold text-slate-950 dark:text-white"><ShieldCheck size={18} /> Preferences</h2>
          <div className="mt-4 space-y-3">
            {Object.entries(preferences).map(([key, value]) => (
              <label key={key} className="flex items-center justify-between gap-4 rounded-lg bg-slate-50 p-3 text-sm font-semibold capitalize dark:bg-slate-800">
                {key.replace(/([A-Z])/g, " $1")}
                <input type="checkbox" className="h-5 w-5 accent-blue-600" checked={value} onChange={(event) => updatePreference(key, event.target.checked)} />
              </label>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
