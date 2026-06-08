import { motion } from "framer-motion";
import { CalendarClock, Eye, MessageSquare } from "lucide-react";
import { forwardRef } from "react";

const priorityStyles = {
  Low: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  Medium: "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300",
  High: "bg-pink-50 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300",
  Critical: "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300",
};

const TaskCard = forwardRef(function TaskCard({ task, members, onOpen, draggableProps, dragHandleProps }, ref) {
  const assignee = task.assignee ?? members.find((member) => member.id === task.assignedUser);

  return (
    <motion.article
      ref={ref}
      {...draggableProps}
      {...dragHandleProps}
      layout
      whileHover={{ y: -2 }}
      className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition focus:outline-none focus:ring-4 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-900 dark:focus:ring-blue-950"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-bold leading-5 text-slate-950 dark:text-white">{task.title}</h3>
        <span className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-bold ${priorityStyles[task.priority]}`}>{task.priority}</span>
      </div>
      <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500 dark:text-slate-400">{task.description}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {task.tags.map((tag) => (
          <span key={tag} className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {tag}
          </span>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <img src={assignee?.avatar} alt={assignee?.name} className="h-7 w-7 rounded-lg object-cover" />
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{assignee?.name.split(" ")[0]}</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-1">
            <MessageSquare size={14} /> {task.comments}
          </span>
          <span className="inline-flex items-center gap-1">
            <CalendarClock size={14} /> {new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
        </div>
      </div>
      <button
        type="button"
        className="mt-4 inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-slate-100 text-xs font-bold text-slate-600 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
        onClick={(event) => {
          event.stopPropagation();
          onOpen(task);
        }}
      >
        <Eye size={14} /> Open task
      </button>
    </motion.article>
  );
});

export default TaskCard;
