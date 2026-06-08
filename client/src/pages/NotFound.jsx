import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="grid min-h-[60vh] place-items-center text-center">
      <div>
        <p className="text-sm font-semibold text-primary-light dark:text-primary-dark">404</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">Page not found</h1>
        <p className="mt-2 text-sm text-slate-500">This view is not part of the current workspace.</p>
        <Link className="mt-5 inline-flex min-h-10 items-center justify-center rounded-lg bg-primary-light px-4 text-sm font-semibold text-white hover:bg-blue-600 dark:bg-primary-dark dark:text-slate-950" to="/">
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
