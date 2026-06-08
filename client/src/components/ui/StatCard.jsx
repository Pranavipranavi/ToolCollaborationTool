import { motion } from "framer-motion";

export default function StatCard({ icon: Icon, label, value, delta, tone = "blue" }) {
  const tones = {
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-300",
    pink: "bg-pink-50 text-pink-600 dark:bg-pink-950/50 dark:text-pink-300",
    green: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-300",
    slate: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">{value}</p>
        </div>
        <span className={`rounded-lg p-2.5 ${tones[tone]}`}>
          <Icon size={20} />
        </span>
      </div>
      {delta && <p className="mt-4 text-sm font-medium text-emerald-600 dark:text-emerald-300">{delta}</p>}
    </motion.section>
  );
}
