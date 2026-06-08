import { AnimatePresence, motion } from "framer-motion";
import { CalendarClock, MessageSquare, Pencil, Save, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useCommentMutations, useComments, useTaskMutations } from "../../hooks/useTaskflowData";
import Button from "../ui/Button";

export default function TaskDetailModal({ task, activeWorkspaceId, activeProjectId, members = [], onClose }) {
  const [body, setBody] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingBody, setEditingBody] = useState("");
  const [draft, setDraft] = useState(null);
  const { data: taskComments = [], isLoading: commentsLoading } = useComments(activeWorkspaceId, task?.id);
  const taskMutations = useTaskMutations(activeWorkspaceId, activeProjectId);
  const commentMutations = useCommentMutations(activeWorkspaceId, task?.id, activeProjectId);
  const assignee = task?.assignee ?? members.find((member) => member.id === task?.assignedUser);

  useEffect(() => {
    if (task) {
      setDraft({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        assignedUser: task.assignedUser,
        dueDate: task.dueDate?.slice(0, 10) ?? "",
        tags: task.tags.join(", "),
      });
      setBody("");
      setEditingId(null);
      setEditingBody("");
    }
  }, [task]);

  function submitComment(event) {
    event.preventDefault();
    if (!body.trim()) return;
    commentMutations.create.mutate(body.trim(), { onSuccess: () => setBody("") });
  }

  function saveTask(event) {
    event.preventDefault();
    taskMutations.update.mutate({
      taskId: task.id,
      payload: {
        ...draft,
        tags: draft.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
        dueDate: draft.dueDate,
      },
    }, { onSuccess: onClose });
  }

  function removeTask() {
    taskMutations.delete.mutate(task.id, { onSuccess: onClose });
  }

  function saveComment(commentId) {
    if (!editingBody.trim()) return;
    commentMutations.update.mutate({ commentId, body: editingBody.trim() }, { onSuccess: () => setEditingId(null) });
  }

  return (
    <AnimatePresence>
      {task && (
        <motion.div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.section
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-lg border border-slate-200 bg-white shadow-soft dark:border-slate-800 dark:bg-slate-900"
            role="dialog"
            aria-modal="true"
            aria-labelledby="task-detail-title"
          >
            <header className="flex items-start justify-between gap-4 border-b border-slate-200 p-5 dark:border-slate-800">
              <div>
                <div className="mb-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">{task.status}</span>
                  <span className="rounded-full bg-pink-50 px-2 py-1 text-xs font-bold text-pink-700 dark:bg-pink-950 dark:text-pink-300">{task.priority}</span>
                </div>
                <h2 id="task-detail-title" className="text-2xl font-bold text-slate-950 dark:text-white">{task.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{task.description}</p>
              </div>
              <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={onClose} aria-label="Close task details">
                <X size={20} />
              </button>
            </header>

            <div className="grid max-h-[calc(90vh-9rem)] gap-5 overflow-y-auto p-5 lg:grid-cols-[0.7fr_1fr]">
              <aside className="space-y-4">
                {draft && (
                  <form className="space-y-3 rounded-lg bg-slate-50 p-4 dark:bg-slate-800" onSubmit={saveTask}>
                    <label className="block text-xs font-bold uppercase text-slate-500">Title<input className="mt-2 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm normal-case dark:border-slate-700 dark:bg-slate-950" value={draft.title} onChange={(event) => setDraft((value) => ({ ...value, title: event.target.value }))} required /></label>
                    <label className="block text-xs font-bold uppercase text-slate-500">Description<textarea className="mt-2 min-h-20 w-full rounded-lg border border-slate-200 p-3 text-sm normal-case dark:border-slate-700 dark:bg-slate-950" value={draft.description} onChange={(event) => setDraft((value) => ({ ...value, description: event.target.value }))} /></label>
                    <div className="grid grid-cols-2 gap-2">
                      <select className="h-10 rounded-lg border border-slate-200 px-2 text-sm dark:border-slate-700 dark:bg-slate-950" value={draft.status} onChange={(event) => setDraft((value) => ({ ...value, status: event.target.value }))}>{["To Do", "In Progress", "Review", "Completed"].map((status) => <option key={status}>{status}</option>)}</select>
                      <select className="h-10 rounded-lg border border-slate-200 px-2 text-sm dark:border-slate-700 dark:bg-slate-950" value={draft.priority} onChange={(event) => setDraft((value) => ({ ...value, priority: event.target.value }))}>{["Low", "Medium", "High", "Critical"].map((priority) => <option key={priority}>{priority}</option>)}</select>
                    </div>
                    <select className="h-10 w-full rounded-lg border border-slate-200 px-2 text-sm dark:border-slate-700 dark:bg-slate-950" value={draft.assignedUser ?? ""} onChange={(event) => setDraft((value) => ({ ...value, assignedUser: event.target.value }))}>
                      {members.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}
                    </select>
                    <input className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm dark:border-slate-700 dark:bg-slate-950" type="date" value={draft.dueDate} onChange={(event) => setDraft((value) => ({ ...value, dueDate: event.target.value }))} />
                    <input className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm dark:border-slate-700 dark:bg-slate-950" value={draft.tags} onChange={(event) => setDraft((value) => ({ ...value, tags: event.target.value }))} placeholder="Tags, comma separated" />
                    <div className="flex gap-2">
                      <Button className="flex-1" type="submit" disabled={taskMutations.update.isPending}><Save size={16} /> Save</Button>
                      <Button className="flex-1 text-rose-600 dark:text-rose-300" variant="ghost" type="button" onClick={removeTask} disabled={taskMutations.delete.isPending}><Trash2 size={16} /> Delete</Button>
                    </div>
                  </form>
                )}
                <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800">
                  <p className="text-xs font-bold uppercase text-slate-500">Assignee</p>
                  <div className="mt-3 flex items-center gap-3">
                    <img src={assignee?.avatar} alt={assignee?.name ?? "Assignee"} className="h-10 w-10 rounded-lg object-cover" />
                    <div>
                      <p className="text-sm font-bold text-slate-950 dark:text-white">{assignee?.name ?? "Unassigned"}</p>
                      <p className="text-xs text-slate-500">{assignee?.role ?? "Member"}</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  <p className="inline-flex items-center gap-2 font-semibold"><CalendarClock size={16} /> Due {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No date"}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {task.tags.map((tag) => (
                      <span key={tag} className="rounded-md bg-white px-2 py-1 text-xs font-bold dark:bg-slate-900">{tag}</span>
                    ))}
                  </div>
                </div>
              </aside>

              <section>
                <h3 className="inline-flex items-center gap-2 text-base font-bold text-slate-950 dark:text-white"><MessageSquare size={18} /> Comments</h3>
                <form className="mt-4" onSubmit={submitComment}>
                  <textarea
                    value={body}
                    onChange={(event) => setBody(event.target.value)}
                    className="min-h-24 w-full resize-none rounded-lg border border-slate-200 bg-white p-3 text-sm outline-none focus:border-primary-light dark:border-slate-800 dark:bg-slate-950"
                    placeholder="Add a thoughtful update"
                    aria-label="Add comment"
                  />
                  <div className="mt-2 flex justify-end">
                    <Button type="submit" disabled={commentMutations.create.isPending}>{commentMutations.create.isPending ? "Adding" : "Add comment"}</Button>
                  </div>
                </form>
                <div className="mt-5 space-y-3">
                  {commentsLoading && <p className="text-sm text-slate-500">Loading comments...</p>}
                  {!commentsLoading && taskComments.length === 0 && <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-500 dark:bg-slate-800">No comments yet.</p>}
                  {taskComments.map((comment) => {
                    const author = comment.author ?? members.find((member) => member.id === comment.userId);
                    const isEditing = editingId === comment.id;
                    return (
                      <article key={comment.id} className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
                        <div className="flex items-start gap-3">
                          <img src={author?.avatar} alt={author?.name ?? "Comment author"} className="h-9 w-9 rounded-lg object-cover" />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-sm font-bold text-slate-950 dark:text-white">{author?.name ?? "Team member"}</p>
                              <p className="text-xs text-slate-500">{new Date(comment.createdAt).toLocaleString()}</p>
                            </div>
                            {isEditing ? (
                              <div className="mt-2">
                                <textarea className="min-h-20 w-full resize-none rounded-lg border border-slate-200 p-2 text-sm dark:border-slate-800 dark:bg-slate-950" value={editingBody} onChange={(event) => setEditingBody(event.target.value)} />
                                <div className="mt-2 flex justify-end gap-2">
                                  <Button variant="ghost" onClick={() => setEditingId(null)} type="button">Cancel</Button>
                                  <Button type="button" onClick={() => saveComment(comment.id)} disabled={commentMutations.update.isPending}>Save</Button>
                                </div>
                              </div>
                            ) : (
                              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{comment.body}</p>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <button className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => { setEditingId(comment.id); setEditingBody(comment.body); }} aria-label="Edit comment"><Pencil size={15} /></button>
                            <button className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950" onClick={() => commentMutations.delete.mutate(comment.id)} aria-label="Delete comment"><Trash2 size={15} /></button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            </div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
