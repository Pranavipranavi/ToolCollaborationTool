import { Archive, Copy, Crown, FolderKanban, Mail, MessageCircle, Pencil, Save, Send, Share2, ShieldCheck, Trash2, UserMinus, UserPlus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import { useInvitations, useProjectMutations, useProjects, useWorkspaceMutations, useWorkspaces } from "../hooks/useTaskflowData";
import { useTaskflowStore } from "../store/useTaskflowStore";

export default function Workspace() {
  const location = useLocation();
  const projectFormRef = useRef(null);
  const [projectDraft, setProjectDraft] = useState({ title: "", description: "" });
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [projectEdit, setProjectEdit] = useState({ title: "", description: "" });
  const [invite, setInvite] = useState({ email: "", role: "Member" });
  const [inviteStatus, setInviteStatus] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [workspaceForm, setWorkspaceForm] = useState({ name: "", description: "" });
  const [workspaceEdit, setWorkspaceEdit] = useState({ name: "", description: "" });
  const { data: workspaces = [] } = useWorkspaces();
  const { user, activeWorkspaceId, setActiveWorkspace } = useTaskflowStore();
  const { data: projects = [] } = useProjects(activeWorkspaceId);
  const { data: invitations = [] } = useInvitations(activeWorkspaceId);
  const workspaceMutations = useWorkspaceMutations(activeWorkspaceId);
  const projectMutations = useProjectMutations(activeWorkspaceId);
  const workspace = workspaces.find((item) => item.id === activeWorkspaceId);
  const members = workspace?.members ?? [];
  const currentRole = members.find((member) => member.id === user?.id)?.role;
  const canEditWorkspace = currentRole === "Owner";
  const canDeleteWorkspace = currentRole === "Owner";
  const canInviteMembers = ["Owner", "Admin"].includes(currentRole);
  const canManageMembers = currentRole === "Owner";
  const canCreateProjects = ["Owner", "Admin"].includes(currentRole);
  const canEditProjects = ["Owner", "Admin"].includes(currentRole);
  const canDeleteProjects = currentRole === "Owner";
  const canLeaveWorkspace = ["Admin", "Member"].includes(currentRole);
  const canNativeShare = typeof navigator !== "undefined" && Boolean(navigator.share);

  useEffect(() => {
    if (workspaces.length && (!activeWorkspaceId || !workspaces.some((item) => item.id === activeWorkspaceId))) {
      setActiveWorkspace(workspaces[0].id);
    }
  }, [activeWorkspaceId, setActiveWorkspace, workspaces]);

  useEffect(() => {
    setWorkspaceEdit({ name: workspace?.name ?? "", description: workspace?.description ?? "" });
  }, [workspace?.description, workspace?.name]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("newProject") === "1" && projectFormRef.current) {
      projectFormRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      projectFormRef.current.querySelector("input")?.focus();
    }
  }, [location.search]);

  function createWorkspace(event) {
    event.preventDefault();
    if (!workspaceForm.name.trim()) return;
    workspaceMutations.create.mutate(
      { name: workspaceForm.name.trim(), description: workspaceForm.description.trim() },
      {
        onSuccess: (data) => {
          const created = data.workspace;
          setWorkspaceForm({ name: "", description: "" });
          setActiveWorkspace(created.id ?? created._id);
        },
      }
    );
  }

  function updateWorkspace(event) {
    event.preventDefault();
    if (!workspace || !workspaceEdit.name.trim() || !canEditWorkspace) return;
    workspaceMutations.update.mutate({ name: workspaceEdit.name.trim(), description: workspaceEdit.description.trim() });
  }

  function createProject(event) {
    event.preventDefault();
    if (!projectDraft.title.trim() || !canCreateProjects) return;
    projectMutations.create.mutate(
      { title: projectDraft.title.trim(), description: projectDraft.description.trim() },
      { onSuccess: () => setProjectDraft({ title: "", description: "" }) }
    );
  }

  function startEditProject(project) {
    setEditingProjectId(project.id);
    setProjectEdit({ title: project.title, description: project.description ?? "" });
  }

  function saveProject(projectId) {
    if (!projectEdit.title.trim() || !canEditProjects) return;
    projectMutations.update.mutate(
      { projectId, payload: { title: projectEdit.title.trim(), description: projectEdit.description.trim() } },
      { onSuccess: () => setEditingProjectId(null) }
    );
  }

  function sendInvite(event) {
    event.preventDefault();
    if (!invite.email.trim() || !canInviteMembers) return;
    workspaceMutations.invite.mutate(invite, {
      onSuccess: (data) => {
        setInvite({ email: "", role: "Member" });
        setInviteLink(data.inviteUrl ?? "");
        setInviteStatus(data.inviteUrl ? "Invite link generated. Copy or share it with your teammate." : "Invitation link created.");
      },
      onError: () => setInviteStatus("Invitation link could not be created. Check workspace permissions."),
    });
  }

  function removeMember(member) {
    if (!canManageMembers || !window.confirm(`Remove ${member.name} from ${workspace.name}?`)) return;
    workspaceMutations.removeMember.mutate(member.id);
  }

  function deleteWorkspace() {
    if (!canDeleteWorkspace || !workspace || !window.confirm(`Delete ${workspace.name}? This cannot be undone.`)) return;
    workspaceMutations.delete.mutate(undefined, {
      onSuccess: () => {
        const nextWorkspace = workspaces.find((item) => item.id !== workspace.id);
        setActiveWorkspace(nextWorkspace?.id ?? null);
      },
    });
  }

  function leaveWorkspace() {
    if (!canLeaveWorkspace || !workspace || !window.confirm(`Leave ${workspace.name}?`)) return;
    workspaceMutations.leave.mutate(undefined, {
      onSuccess: () => {
        const nextWorkspace = workspaces.find((item) => item.id !== workspace.id);
        setActiveWorkspace(nextWorkspace?.id ?? null);
      },
    });
  }

  async function copyInviteLink() {
    if (!inviteLink) return;
    await navigator.clipboard?.writeText(inviteLink);
    setInviteStatus("Invite link copied.");
  }

  async function shareInviteLink() {
    if (!inviteLink || !navigator.share) return;
    await navigator.share({
      title: `Join ${workspace?.name ?? "TaskFlow"}`,
      text: `Join ${workspace?.name ?? "my workspace"} on TaskFlow.`,
      url: inviteLink,
    });
  }

  function shareUrl(platform) {
    const message = `Join ${workspace?.name ?? "my workspace"} on TaskFlow: ${inviteLink}`;
    if (platform === "whatsapp") return `https://wa.me/?text=${encodeURIComponent(message)}`;
    if (platform === "telegram") return `https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${encodeURIComponent(`Join ${workspace?.name ?? "my workspace"} on TaskFlow`)}`;
    return `mailto:?subject=${encodeURIComponent(`TaskFlow invite: ${workspace?.name ?? "Workspace"}`)}&body=${encodeURIComponent(message)}`;
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-primary-light dark:text-primary-dark">Workspace</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-950 dark:text-white">{workspace?.name ?? "Workspaces"}</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">{workspace?.description ?? "Create or select a workspace to manage projects, members, invitations, and roles."}</p>
          {currentRole && <p className="mt-2 text-xs font-bold uppercase text-slate-400">Your role: {currentRole}</p>}
        </div>
        {canInviteMembers && (
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" disabled={!inviteLink} onClick={copyInviteLink}><Copy size={17} /> Copy link</Button>
            <Button disabled={!inviteLink || !canNativeShare} onClick={shareInviteLink}><Share2 size={17} /> Share</Button>
          </div>
        )}
      </section>

      <div className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
        <section className="space-y-5">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-base font-bold text-slate-950 dark:text-white">Create workspace</h2>
            <form className="mt-4 grid gap-3 md:grid-cols-[0.8fr_1fr_auto]" onSubmit={createWorkspace}>
              <input className="h-10 rounded-lg border border-slate-200 px-3 text-sm dark:border-slate-800 dark:bg-slate-950" placeholder="Workspace name" value={workspaceForm.name} onChange={(event) => setWorkspaceForm((value) => ({ ...value, name: event.target.value }))} />
              <input className="h-10 rounded-lg border border-slate-200 px-3 text-sm dark:border-slate-800 dark:bg-slate-950" placeholder="Description" value={workspaceForm.description} onChange={(event) => setWorkspaceForm((value) => ({ ...value, description: event.target.value }))} />
              <Button variant="secondary" disabled={workspaceMutations.create.isPending}>Create</Button>
            </form>
          </div>

          {workspace && canEditWorkspace && (
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-base font-bold text-slate-950 dark:text-white">Workspace details</h2>
              <form className="mt-4 space-y-3" onSubmit={updateWorkspace}>
                <input className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm dark:border-slate-800 dark:bg-slate-950" value={workspaceEdit.name} onChange={(event) => setWorkspaceEdit((value) => ({ ...value, name: event.target.value }))} />
                <textarea className="min-h-20 w-full rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-800 dark:bg-slate-950" value={workspaceEdit.description} onChange={(event) => setWorkspaceEdit((value) => ({ ...value, description: event.target.value }))} />
                <div className="flex flex-wrap gap-2">
                  <Button disabled={workspaceMutations.update.isPending}>Save workspace</Button>
                  {canLeaveWorkspace && <Button variant="ghost" type="button" className="text-rose-600 dark:text-rose-300" onClick={leaveWorkspace}><Archive size={16} /> Leave</Button>}
                  {canDeleteWorkspace && <Button variant="ghost" type="button" className="text-rose-600 dark:text-rose-300" onClick={deleteWorkspace}><Trash2 size={16} /> Delete</Button>}
                </div>
              </form>
            </div>
          )}

          {workspace && !canEditWorkspace && canLeaveWorkspace && (
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-base font-bold text-slate-950 dark:text-white">Workspace membership</h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Members can view projects and tasks, comment, and update assigned task status.</p>
              <Button variant="ghost" type="button" className="mt-4 text-rose-600 dark:text-rose-300" onClick={leaveWorkspace}><Archive size={16} /> Leave workspace</Button>
            </div>
          )}

          <div ref={projectFormRef} className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-base font-bold text-slate-950 dark:text-white">Projects</h2>
            {canCreateProjects && (
              <form className="mt-4 grid gap-2 lg:grid-cols-[0.8fr_1fr_auto]" onSubmit={createProject}>
                <input className="h-10 rounded-lg border border-slate-200 px-3 text-sm dark:border-slate-800 dark:bg-slate-950" placeholder="Project name" value={projectDraft.title} onChange={(event) => setProjectDraft((value) => ({ ...value, title: event.target.value }))} disabled={!workspace} />
                <input className="h-10 rounded-lg border border-slate-200 px-3 text-sm dark:border-slate-800 dark:bg-slate-950" placeholder="Project description" value={projectDraft.description} onChange={(event) => setProjectDraft((value) => ({ ...value, description: event.target.value }))} disabled={!workspace} />
                <Button variant="secondary" disabled={!workspace || projectMutations.create.isPending}><FolderKanban size={16} /> Create project</Button>
              </form>
            )}
            <div className="mt-5 space-y-3">
              {projects.length === 0 && <EmptyState title="No projects" body={canCreateProjects ? "Create a project to start planning tasks with your team." : "No projects have been created in this workspace yet."} />}
              {projects.map((project) => (
                <article key={project.id} className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
                  <div className="flex items-start justify-between gap-4">
                    {editingProjectId === project.id ? (
                      <div className="min-w-0 flex-1 space-y-2">
                        <input className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm dark:border-slate-800 dark:bg-slate-950" value={projectEdit.title} onChange={(event) => setProjectEdit((value) => ({ ...value, title: event.target.value }))} />
                        <textarea className="min-h-20 w-full rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-800 dark:bg-slate-950" value={projectEdit.description} onChange={(event) => setProjectEdit((value) => ({ ...value, description: event.target.value }))} />
                        <div className="flex gap-2">
                          <Button type="button" onClick={() => saveProject(project.id)} disabled={projectMutations.update.isPending}><Save size={15} /> Save</Button>
                          <Button type="button" variant="ghost" onClick={() => setEditingProjectId(null)}><X size={15} /> Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h3 className="font-bold text-slate-950 dark:text-white">{project.title}</h3>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{project.description || "No description yet."}</p>
                      </div>
                    )}
                    {editingProjectId !== project.id && (canEditProjects || canDeleteProjects) && (
                      <div className="flex items-center gap-1">
                        {canEditProjects && <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => startEditProject(project)} aria-label={`Edit ${project.title}`}><Pencil size={18} /></button>}
                        {canEditProjects && <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => projectMutations.archive.mutate(project.id)} aria-label={`Archive ${project.title}`}><Archive size={18} /></button>}
                        {canDeleteProjects && <button className="rounded-lg p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950" onClick={() => projectMutations.delete.mutate(project.id)} aria-label={`Delete ${project.title}`}><Trash2 size={18} /></button>}
                      </div>
                    )}
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
                    <span className="rounded-full bg-blue-50 px-2 py-1 text-blue-700 dark:bg-blue-950 dark:text-blue-300">{project.status}</span>
                    <span>{project.members.length} members</span>
                    <span>Created {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : "recently"}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-5">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-base font-bold text-slate-950 dark:text-white">Members and roles</h2>
            {canInviteMembers && (
              <>
                <form id="invite-form" className="mt-4 grid gap-2 sm:grid-cols-[1fr_8rem_auto]" onSubmit={sendInvite}>
                  <input className="h-10 rounded-lg border border-slate-200 px-3 text-sm dark:border-slate-800 dark:bg-slate-950" placeholder="teammate@email.com" value={invite.email} onChange={(event) => setInvite((value) => ({ ...value, email: event.target.value }))} disabled={!workspace} />
                  <select className="h-10 rounded-lg border border-slate-200 px-3 text-sm dark:border-slate-800 dark:bg-slate-950" value={invite.role} onChange={(event) => setInvite((value) => ({ ...value, role: event.target.value }))} disabled={!workspace}>
                    <option>Member</option>
                    <option>Admin</option>
                  </select>
                  <Button disabled={!workspace || workspaceMutations.invite.isPending}><UserPlus size={16} /> Generate</Button>
                </form>
                {inviteStatus && <p className="mt-3 break-words rounded-lg bg-blue-50 p-3 text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-200">{inviteStatus}</p>}
                {inviteLink && (
                  <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800">
                    <p className="text-xs font-bold uppercase text-slate-400">Invite link</p>
                    <input className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300" value={inviteLink} readOnly onFocus={(event) => event.target.select()} />
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      <Button type="button" variant="secondary" onClick={copyInviteLink}><Copy size={15} /> Copy</Button>
                      <Button type="button" variant="secondary" disabled={!canNativeShare} onClick={shareInviteLink}><Share2 size={15} /> Native share</Button>
                      <a className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900" href={shareUrl("whatsapp")} target="_blank" rel="noreferrer"><MessageCircle size={15} /> WhatsApp</a>
                      <a className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900" href={shareUrl("telegram")} target="_blank" rel="noreferrer"><Send size={15} /> Telegram</a>
                      <a className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900 sm:col-span-2" href={shareUrl("email")}><Mail size={15} /> Email</a>
                    </div>
                  </div>
                )}
              </>
            )}
            <div className="mt-5 space-y-3">
              {members.map((member) => (
                <div key={member.id} className="flex flex-wrap items-center gap-3 rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                  <img src={member.avatar} alt={member.name} className="h-10 w-10 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-950 dark:text-white">{member.name}</p>
                    <p className="truncate text-xs text-slate-500">{member.email}</p>
                  </div>
                  {member.role === "Owner" ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-xs font-bold text-slate-600 dark:bg-slate-900 dark:text-slate-300"><Crown size={13} /> Owner</span>
                  ) : canManageMembers ? (
                    <div className="flex items-center gap-2">
                      <select className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-xs font-bold dark:border-slate-700 dark:bg-slate-950" value={member.role} onChange={(event) => workspaceMutations.updateRole.mutate({ memberId: member.id, role: event.target.value })}>
                        <option>Member</option>
                        <option>Admin</option>
                      </select>
                      <button className="rounded-lg p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950" onClick={() => removeMember(member)} aria-label={`Remove ${member.name}`}><UserMinus size={17} /></button>
                    </div>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-white px-2 py-1 text-xs font-bold text-slate-600 dark:bg-slate-900 dark:text-slate-300">{member.role}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {canInviteMembers && (
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
              <h2 className="flex items-center gap-2 text-base font-bold text-slate-950 dark:text-white"><ShieldCheck size={18} /> Pending invitations</h2>
              <div className="mt-4 space-y-3">
                {invitations.length === 0 && <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-500 dark:bg-slate-800">No pending invitations.</p>}
                {invitations.map((invitation) => (
                  <div key={invitation._id ?? invitation.id} className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                    <p className="text-sm font-bold text-slate-950 dark:text-white">{invitation.email}</p>
                    <p className="mt-1 text-xs text-slate-500">{invitation.role} - invited by {invitation.invitedBy?.name ?? "team admin"}</p>
                    <p className="mt-1 text-xs text-slate-400">Expires {invitation.expiresAt ? new Date(invitation.expiresAt).toLocaleDateString() : "soon"}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
