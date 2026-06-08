import { Inbox } from "lucide-react";

export default function EmptyState({ title, body }) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
      <Inbox className="text-slate-400" size={32} />
      <h3 className="mt-3 text-base font-semibold text-slate-900 dark:text-white">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">{body}</p>
    </div>
  );
}
