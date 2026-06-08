import { Archive, Copy, Crown, FolderKanban, ShieldCheck, Trash2, UserMinus, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import { useInvitations, useProjectMutations, useProjects, useWorkspaceMutations, useWorkspaces } from "../hooks/useTaskflowData";
import { useTaskflowStore } from "../store/useTaskflowStore";

export default function Workspace() {
  const [projectTitle, setProjectTitle] = useState("");
  const [invite, setInvite] = useState({ email: "", role: "Member" });
  const [inviteStatus, setInviteStatus] = useState("");
  const [workspaceForm, setWorkspaceForm] = useState({ name: "", description: "" });
  const [workspaceEdit, setWorkspaceEdit] = useState({ name: "", description: "" });
  const { data: workspaces = [] } = useWorkspaces();
  const { activeWorkspaceId, setActiveWorkspace } = useTaskflowStore();
  const { data: projects = [] } = useProjects(activeWorkspaceId);
  const { data: invitations = [] } = useInvitations(activeWorkspaceId);
  const workspaceMutations = useWorkspaceMutations(activeWorkspaceId);
  const projectMutations = useProjectMutations(activeWorkspaceId);
  const workspace = workspaces.find((item) => item.id === activeWorkspaceId);
  const members = workspace?.members ?? [];

  useEffect(() => {
    if (workspaces.length && (!activeWorkspaceId || !workspaces.some((item) => item.id === activeWorkspaceId))) {
      setActiveWorkspace(workspaces[0].id);
    }
  }, [activeWorkspaceId, setActiveWorkspace, workspaces]);

  useEffect(() => {
    setWorkspaceEdit({ name: workspace?.name ?? "", description: workspace?.description ?? "" });
  }, [workspace?.description, workspace?.name]);

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
    if (!workspace || !workspaceEdit.name.trim()) return;
    workspaceMutations.update.mutate({ name: workspaceEdit.name.trim(), description: workspaceEdit.description.trim() });
  }

  function createProject(event) {
    event.preventDefault();
    if (!projectTitle.trim()) return;
    projectMutations.create.mutate({ title: projectTitle.trim(), description: "New project created from TaskFlow workspace." }, { onSuccess: () => setProjectTitle("") });
  }

  function sendInvite(event) {
    event.preventDefault();
    if (!invite.email.trim()) return;
    workspaceMutations.invite.mutate(invite, {
      onSuccess: (data) => {
        setInvite({ email: "", role: "Member" });
        setInviteStatus(data.inviteUrl ? `Invite link: ${data.inviteUrl}` : "Invitation link created.");
      },
      onError: () => setInviteStatus("Invitation link could not be created. Check workspace permissions."),
    });
  }

  function removeMember(member) {
    if (!window.confirm(`Remove ${member.name} from ${workspace.name}?`)) return;
    workspaceMutations.removeMember.mutate(member.id);
  }

  function deleteWorkspace() {
    if (!workspace || !window.confirm(`Delete ${workspace.name}? This cannot be undone.`)) return;
    workspaceMutations.delete.mutate(undefined, {
      onSuccess: () => {
        const nextWorkspace = workspaces.find((item) => item.id !== workspace.id);
        setActiveWorkspace(nextWorkspace?.id ?? null);
      },
    });
  }

  function leaveWorkspace() {
    if (!workspace || !window.confirm(`Leave ${workspace.name}?`)) return;
    workspaceMutations.leave.mutate(undefined, {
      onSuccess: () => {
        const nextWorkspace = workspaces.find((item) => item.id !== workspace.id);
        setActiveWorkspace(nextWorkspace?.id ?? null);
      },
    });
  }

  function copyInviteCode() {
    if (!workspace?.inviteCode) return;
    navigator.clipboard?.writeText(workspace.inviteCode);
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-primary-light dark:text-primary-dark">Workspace</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-950 dark:text-white">{workspace?.name ?? "Workspaces"}</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">{workspace?.description ?? "Create or select a workspace to manage projects, members, invitations, and roles."}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" disabled={!workspace?.inviteCode} onClick={copyInviteCode}><Copy size={17} /> Copy invite code</Button>
          <Button form="invite-form" disabled={!workspace || workspaceMutations.invite.isPending}><UserPlus size={17} /> Invite member</Button>
        </div>
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

          {workspace && (
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-base font-bold text-slate-950 dark:text-white">Workspace details</h2>
              <form className="mt-4 space-y-3" onSubmit={updateWorkspace}>
                <input className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm dark:border-slate-800 dark:bg-slate-950" value={workspaceEdit.name} onChange={(event) => setWorkspaceEdit((value) => ({ ...value, name: event.target.value }))} />
                <textarea className="min-h-20 w-full rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-800 dark:bg-slate-950" value={workspaceEdit.description} onChange={(event) => setWorkspaceEdit((value) => ({ ...value, description: event.target.value }))} />
                <div className="flex flex-wrap gap-2">
                  <Button disabled={workspaceMutations.update.isPending}>Save workspace</Button>
                  <Button variant="ghost" type="button" className="text-rose-600 dark:text-rose-300" onClick={leaveWorkspace}><Archive size={16} /> Leave</Button>
                  <Button variant="ghost" type="button" className="text-rose-600 dark:text-rose-300" onClick={deleteWorkspace}><Trash2 size={16} /> Delete</Button>
                </div>
              </form>
            </div>
          )}

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-950 dark:text-white">Projects</h2>
            </div>
            <form className="mt-4 flex flex-col gap-2 sm:flex-row" onSubmit={createProject}>
              <input className="h-10 flex-1 rounded-lg border border-slate-200 px-3 text-sm dark:border-slate-800 dark:bg-slate-950" placeholder="Project title" value={projectTitle} onChange={(event) => setProjectTitle(event.target.value)} disabled={!workspace} />
              <Button variant="secondary" disabled={!workspace || projectMutations.create.isPending}><FolderKanban size={16} /> Create project</Button>
            </form>
            <div className="mt-5 space-y-3">
              {projects.length === 0 && <EmptyState title="No projects" body="Create a project to start planning tasks with your team." />}
              {projects.map((project) => (
                <article key={project.id} className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-slate-950 dark:text-white">{project.title}</h3>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{project.description}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => projectMutations.archive.mutate(project.id)} aria-label={`Archive ${project.title}`}><Archive size={18} /></button>
                      <button className="rounded-lg p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950" onClick={() => projectMutations.delete.mutate(project.id)} aria-label={`Delete ${project.title}`}><Trash2 size={18} /></button>
                    </div>
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
            <form id="invite-form" className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto]" onSubmit={sendInvite}>
              <input className="h-10 rounded-lg border border-slate-200 px-3 text-sm dark:border-slate-800 dark:bg-slate-950" placeholder="teammate@email.com" value={invite.email} onChange={(event) => setInvite((value) => ({ ...value, email: event.target.value }))} disabled={!workspace} />
              <select className="h-10 rounded-lg border border-slate-200 px-3 text-sm dark:border-slate-800 dark:bg-slate-950" value={invite.role} onChange={(event) => setInvite((value) => ({ ...value, role: event.target.value }))} disabled={!workspace}>
                <option>Member</option>
                <option>Admin</option>
              </select>
            </form>
            {inviteStatus && <p className="mt-3 break-words rounded-lg bg-blue-50 p-3 text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-200">{inviteStatus}</p>}
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
                  ) : (
                    <div className="flex items-center gap-2">
                      <select className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-xs font-bold dark:border-slate-700 dark:bg-slate-950" value={member.role} onChange={(event) => workspaceMutations.updateRole.mutate({ memberId: member.id, role: event.target.value })}>
                        <option>Member</option>
                        <option>Admin</option>
                      </select>
                      <button className="rounded-lg p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950" onClick={() => removeMember(member)} aria-label={`Remove ${member.name}`}><UserMinus size={17} /></button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

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
        </section>
      </div>
    </div>
  );
}
