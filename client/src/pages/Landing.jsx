import { motion } from "framer-motion";
import { ArrowRight, BarChart3, Bell, CheckCircle2, KanbanSquare, LockKeyhole, MessageSquare, Network, Sparkles, UsersRound } from "lucide-react";
import { Link } from "react-router-dom";

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.45, ease: "easeOut" },
};

const features = [
  { icon: KanbanSquare, title: "Kanban built for teams", body: "Plan, assign, review, and complete work with fast drag-and-drop boards backed by MongoDB." },
  { icon: UsersRound, title: "Workspace collaboration", body: "Create workspaces for college projects, startup teams, internships, and product squads." },
  { icon: Bell, title: "Live notifications", body: "Task moves, comments, assignments, and member joins update teammates in real time." },
  { icon: LockKeyhole, title: "Role-aware access", body: "Owner, admin, and member permissions keep project operations clean and controlled." },
];

const steps = [
  "Create a workspace",
  "Invite your team",
  "Plan projects",
  "Move tasks to done",
];

const testimonials = [
  { quote: "TaskFlow feels focused enough for engineering work and simple enough for a student team to adopt in one sitting.", name: "Aarav M.", role: "Startup founder" },
  { quote: "The activity timeline and workspace flow make it easy to explain ownership during project reviews.", name: "Nisha R.", role: "Software engineering student" },
  { quote: "It has the exact resume signals recruiters look for: auth, roles, sockets, analytics, and polished UX.", name: "Meera S.", role: "Engineering mentor" },
];

function SectionHeading({ eyebrow, title, body }) {
  return (
    <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
      <p className="text-sm font-bold text-primary-light dark:text-primary-dark">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-bold tracking-normal text-slate-950 dark:text-white sm:text-4xl">{title}</h2>
      <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">{body}</p>
    </motion.div>
  );
}

function ProductPreview() {
  const tasks = [
    { title: "Design invite flow", status: "Review", tone: "bg-pink-50 text-pink-700 dark:bg-pink-950 dark:text-pink-200" },
    { title: "Ship OAuth callback", status: "Done", tone: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200" },
    { title: "QA mobile board", status: "In Progress", tone: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-200" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
      className="mx-auto mt-10 w-full max-w-5xl rounded-lg border border-white/30 bg-white/90 p-3 shadow-soft backdrop-blur dark:border-slate-700 dark:bg-slate-950/90"
    >
      <div className="grid gap-3 lg:grid-cols-[0.72fr_1fr]">
        <div className="rounded-lg bg-slate-950 p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-blue-200">Workspace</p>
              <p className="mt-1 text-lg font-bold">CodTech Sprint</p>
            </div>
            <span className="rounded-lg bg-white/10 px-2 py-1 text-xs font-bold">12 members</span>
          </div>
          <div className="mt-6 space-y-3">
            {["API connected", "MongoDB synced", "Socket live"].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-lg bg-white/10 p-3">
                <CheckCircle2 size={17} className="text-success-dark" />
                <span className="text-sm font-semibold">{item}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {["To Do", "In Progress", "Review"].map((column, index) => (
            <div key={column} className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{column}</p>
                <span className="text-xs font-bold text-slate-400">{index + 2}</span>
              </div>
              <div className="space-y-2">
                {tasks.slice(index, index + 2).map((task) => (
                  <div key={task.title} className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{task.title}</p>
                    <span className={`mt-3 inline-flex rounded-full px-2 py-1 text-xs font-bold ${task.tone}`}>{task.status}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function Landing() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-white">
      <section className="relative min-h-[92vh] overflow-hidden">
        <img
          className="absolute inset-0 h-full w-full object-cover"
          src="https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1800&q=85"
          alt="Team collaborating around a workspace"
        />
        <div className="absolute inset-0 bg-slate-950/70" />
        <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary-light text-base font-black text-white">TF</span>
            <span className="text-lg font-bold text-white">TaskFlow</span>
          </Link>
          <nav className="flex items-center gap-2">
            <Link className="hidden rounded-lg px-3 py-2 text-sm font-bold text-white/80 transition hover:bg-white/10 hover:text-white sm:inline-flex" to="/login">Login</Link>
            <Link className="rounded-lg bg-white px-4 py-2 text-sm font-bold text-slate-950 transition hover:-translate-y-0.5 hover:bg-blue-50" to="/register">Start free</Link>
          </nav>
        </header>
        <div className="relative z-10 mx-auto flex max-w-7xl flex-col px-4 pb-14 pt-16 sm:px-6 lg:px-8 lg:pt-24">
          <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: "easeOut" }} className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm font-bold text-blue-100 backdrop-blur">
              <Sparkles size={15} /> Real-time project operations
            </span>
            <h1 className="mt-6 text-5xl font-bold tracking-normal text-white sm:text-6xl lg:text-7xl">TaskFlow</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-200 sm:text-xl">
              A polished collaboration platform for workspaces, projects, Kanban planning, task assignment, comments, notifications, roles, and analytics.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-primary-light px-5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-blue-600" to="/register">
                Create workspace <ArrowRight size={17} />
              </Link>
              <Link className="inline-flex min-h-12 items-center justify-center rounded-lg border border-white/25 bg-white/10 px-5 text-sm font-bold text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/15" to="/login">
                Login
              </Link>
            </div>
          </motion.div>
          <ProductPreview />
        </div>
      </section>

      <section id="features" className="px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Feature System" title="Everything a serious team needs to stay aligned" body="TaskFlow combines the core patterns recruiters expect from a full-stack collaboration product with a calm interface people can actually use." />
        <div className="mx-auto mt-12 grid max-w-7xl gap-4 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature) => (
            <motion.article key={feature.title} {...fadeUp} whileHover={{ y: -4 }} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <span className="inline-flex rounded-lg bg-blue-50 p-3 text-primary-light dark:bg-blue-950 dark:text-primary-dark">
                <feature.icon size={22} />
              </span>
              <h3 className="mt-5 text-lg font-bold text-slate-950 dark:text-white">{feature.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{feature.body}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white px-4 py-20 dark:border-slate-800 dark:bg-slate-900 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Workflow" title="From invite link to shipped work" body="The product flow is designed around the way real teams start, organize, and finish collaborative projects." />
        <div className="mx-auto mt-12 grid max-w-5xl gap-3 md:grid-cols-4">
          {steps.map((step, index) => (
            <motion.div key={step} {...fadeUp} className="rounded-lg border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950">
              <p className="text-sm font-bold text-primary-light dark:text-primary-dark">0{index + 1}</p>
              <h3 className="mt-3 text-lg font-bold">{step}</h3>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-2">
          <motion.article {...fadeUp} className="rounded-lg border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-pink-50 p-3 text-accent-light dark:bg-pink-950 dark:text-accent-dark"><BarChart3 size={22} /></span>
              <div>
                <p className="text-sm font-bold text-accent-light dark:text-accent-dark">Analytics Preview</p>
                <h2 className="text-2xl font-bold">Metrics that explain momentum</h2>
              </div>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {[
                ["64", "Total tasks"],
                ["42", "Completed"],
                ["82%", "Completion"],
              ].map(([value, label]) => (
                <div key={label} className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800">
                  <p className="text-3xl font-bold">{value}</p>
                  <p className="mt-1 text-sm text-slate-500">{label}</p>
                </div>
              ))}
            </div>
          </motion.article>

          <motion.article {...fadeUp} className="rounded-lg border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-emerald-50 p-3 text-success-light dark:bg-emerald-950 dark:text-success-dark"><Network size={22} /></span>
              <div>
                <p className="text-sm font-bold text-success-light dark:text-success-dark">Collaboration Preview</p>
                <h2 className="text-2xl font-bold">Live work without refreshes</h2>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              {[
                ["Sunny moved API Review to Completed", "Just now"],
                ["Rahul commented on Invite Flow", "2 minutes ago"],
                ["Admin invited a new workspace member", "8 minutes ago"],
              ].map(([item, time]) => (
                <div key={item} className="flex items-start gap-3 rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                  <MessageSquare size={17} className="mt-1 text-primary-light dark:text-primary-dark" />
                  <div>
                    <p className="text-sm font-semibold">{item}</p>
                    <p className="mt-1 text-xs text-slate-500">{time}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.article>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white px-4 py-20 dark:border-slate-800 dark:bg-slate-900 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Social Proof" title="Built to feel credible in a portfolio review" body="A complete product story that demonstrates design, architecture, authentication, authorization, real-time systems, and data modeling." />
        <div className="mx-auto mt-12 grid max-w-7xl gap-4 md:grid-cols-3">
          {testimonials.map((item) => (
            <motion.article key={item.name} {...fadeUp} className="rounded-lg border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-950">
              <p className="text-sm leading-6 text-slate-700 dark:text-slate-300">"{item.quote}"</p>
              <p className="mt-5 font-bold">{item.name}</p>
              <p className="text-sm text-slate-500">{item.role}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <motion.div {...fadeUp} className="mx-auto max-w-4xl rounded-lg bg-slate-950 p-8 text-center text-white shadow-soft dark:bg-white dark:text-slate-950">
          <h2 className="text-3xl font-bold tracking-normal sm:text-4xl">Bring your next team project into TaskFlow.</h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-slate-300 dark:text-slate-600">Create a workspace, invite collaborators, and manage work with the kind of polish expected from a modern SaaS product.</p>
          <Link className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-primary-light px-5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-blue-600" to="/register">
            Start building <ArrowRight size={17} />
          </Link>
        </motion.div>
      </section>

      <footer className="border-t border-slate-200 px-4 py-8 dark:border-slate-800 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 text-sm text-slate-500 sm:flex-row sm:items-center">
          <p className="font-bold text-slate-700 dark:text-slate-200">TaskFlow</p>
          <p>Workspaces, projects, Kanban, comments, notifications, analytics, and real-time collaboration.</p>
        </div>
      </footer>
    </main>
  );
}
