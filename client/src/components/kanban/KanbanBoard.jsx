import { DragDropContext } from "react-beautiful-dnd";
import { motion } from "framer-motion";
import { Plus, X } from "lucide-react";
import { useState } from "react";
import { useTaskMutations } from "../../hooks/useTaskflowData";
import Button from "../ui/Button";
import KanbanColumn from "./KanbanColumn";
import TaskDetailModal from "./TaskDetailModal";

const statusOrder = ["To Do", "In Progress", "Review", "Completed"];

export default function KanbanBoard({ activeProject, activeWorkspaceId, currentRole, currentUserId, members, tasks, loading }) {
  const [selectedTask, setSelectedTask] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [draft, setDraft] = useState({ title: "", description: "", priority: "Medium", assignedUser: "", dueDate: "" });
  const taskMutations = useTaskMutations(activeWorkspaceId, activeProject?.id);
  const canManageTasks = ["Owner", "Admin"].includes(currentRole);
  const columns = statusOrder.map((status) => ({
    id: status,
    title: status,
    tasks: tasks.filter((task) => task.status === status),
  }));

  function canMoveTask(task) {
    return canManageTasks || (currentRole === "Member" && task.assignedUser === currentUserId);
  }

  function createTask(event) {
    event.preventDefault();
    if (!draft.title.trim() || !canManageTasks) return;
    taskMutations.create.mutate({
      title: draft.title.trim(),
      description: draft.description.trim() || "No description provided.",
      assignedUser: draft.assignedUser || members[0]?.id,
      dueDate: draft.dueDate || new Date(Date.now() + 86400000 * 7).toISOString(),
      priority: draft.priority,
      tags: ["Planned"],
    }, {
      onSuccess: () => {
        setDraft({ title: "", description: "", priority: "Medium", assignedUser: "", dueDate: "" });
        setShowCreate(false);
      },
    });
  }

  function handleDragEnd(result) {
    if (!result.destination) return;
    const task = tasks.find((item) => item.id === result.draggableId);
    if (!task || !canMoveTask(task)) return;
    const nextStatus = result.destination.droppableId;
    if (task.status === nextStatus) return;
    taskMutations.update.mutate({ taskId: result.draggableId, payload: { status: nextStatus } });
  }

  return (
    <div>
      <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-primary-light dark:text-primary-dark">Kanban Board</p>
          <h1 className="mt-1 text-3xl font-bold tracking-normal text-slate-950 dark:text-white">{activeProject?.title}</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">{activeProject?.description}</p>
        </div>
        {canManageTasks && (
          <Button onClick={() => setShowCreate(true)} disabled={!activeProject}>
            <Plus size={17} /> Add task
          </Button>
        )}
      </div>

      {showCreate && canManageTasks && (
        <section className="mb-5 rounded-lg border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold text-slate-950 dark:text-white">Create task</h2>
            <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => setShowCreate(false)} aria-label="Close create task"><X size={18} /></button>
          </div>
          <form className="grid gap-3 md:grid-cols-2" onSubmit={createTask}>
            <input className="h-11 rounded-lg border border-slate-200 px-3 text-sm dark:border-slate-800 dark:bg-slate-950" placeholder="Task title" value={draft.title} onChange={(event) => setDraft((value) => ({ ...value, title: event.target.value }))} required />
            <select className="h-11 rounded-lg border border-slate-200 px-3 text-sm dark:border-slate-800 dark:bg-slate-950" value={draft.priority} onChange={(event) => setDraft((value) => ({ ...value, priority: event.target.value }))}>
              {["Low", "Medium", "High", "Critical"].map((priority) => <option key={priority}>{priority}</option>)}
            </select>
            <select className="h-11 rounded-lg border border-slate-200 px-3 text-sm dark:border-slate-800 dark:bg-slate-950" value={draft.assignedUser} onChange={(event) => setDraft((value) => ({ ...value, assignedUser: event.target.value }))}>
              <option value="">Assign member</option>
              {members.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}
            </select>
            <input className="h-11 rounded-lg border border-slate-200 px-3 text-sm dark:border-slate-800 dark:bg-slate-950" type="date" value={draft.dueDate} onChange={(event) => setDraft((value) => ({ ...value, dueDate: event.target.value }))} />
            <textarea className="min-h-24 rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-800 dark:bg-slate-950 md:col-span-2" placeholder="Description" value={draft.description} onChange={(event) => setDraft((value) => ({ ...value, description: event.target.value }))} />
            <div className="md:col-span-2"><Button type="submit" disabled={taskMutations.create.isPending}>Create task</Button></div>
          </form>
        </section>
      )}

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        {loading && <div className="mb-4 h-24 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />}
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {columns.map((column) => (
              <KanbanColumn key={column.id} column={column} members={members} canMoveTask={canMoveTask} onOpenTask={setSelectedTask} />
            ))}
          </div>
        </DragDropContext>
      </motion.div>
      <TaskDetailModal
        task={selectedTask}
        activeWorkspaceId={activeWorkspaceId}
        activeProjectId={activeProject?.id}
        currentRole={currentRole}
        currentUserId={currentUserId}
        members={members}
        onClose={() => setSelectedTask(null)}
      />
    </div>
  );
}
