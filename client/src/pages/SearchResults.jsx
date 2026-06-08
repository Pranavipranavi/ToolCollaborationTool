import { FolderKanban, ListTodo, UsersRound } from "lucide-react";
import EmptyState from "../components/ui/EmptyState";
import { useGlobalSearch } from "../hooks/useTaskflowData";
import { useTaskflowStore } from "../store/useTaskflowStore";

function ResultSection({ icon: Icon, title, children, count }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
      <h2 className="flex items-center gap-2 text-base font-bold text-slate-950 dark:text-white"><Icon size={18} /> {title} <span className="text-sm text-slate-400">({count})</span></h2>
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}

export default function SearchResults() {
  const { search } = useTaskflowStore();
  const { data: results = { tasks: [], projects: [], members: [] }, isFetching } = useGlobalSearch(search);
  const hasResults = results.tasks.length || results.projects.length || results.members.length;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-primary-light dark:text-primary-dark">Global Search</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-950 dark:text-white">Search results</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{search ? `Showing matches for "${search}".` : "Type in the top search bar to find tasks, projects, and members."}</p>
      </div>
      {isFetching ? (
        <div className="grid gap-5 xl:grid-cols-3">
          {[0, 1, 2].map((item) => <div key={item} className="h-56 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />)}
        </div>
      ) : !hasResults ? (
        <EmptyState title="No matching results" body="Try searching for a task title, project status, member name, or priority." />
      ) : (
        <div className="grid gap-5 xl:grid-cols-3">
          <ResultSection icon={ListTodo} title="Tasks" count={results.tasks.length}>
            {results.tasks.map((task) => <div key={task.id} className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800"><p className="font-semibold">{task.title}</p><p className="mt-1 text-xs text-slate-500">{task.status} - {task.priority}</p></div>)}
          </ResultSection>
          <ResultSection icon={FolderKanban} title="Projects" count={results.projects.length}>
            {results.projects.map((project) => <div key={project.id} className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800"><p className="font-semibold">{project.title}</p><p className="mt-1 text-xs text-slate-500">{project.status}</p></div>)}
          </ResultSection>
          <ResultSection icon={UsersRound} title="Members" count={results.members.length}>
            {results.members.map((member) => <div key={member.id} className="flex items-center gap-3 rounded-lg bg-slate-50 p-3 dark:bg-slate-800"><img className="h-9 w-9 rounded-lg object-cover" src={member.avatar} alt={member.name} /><div><p className="font-semibold">{member.name}</p><p className="text-xs text-slate-500">{member.role}</p></div></div>)}
          </ResultSection>
        </div>
      )}
    </div>
  );
}
