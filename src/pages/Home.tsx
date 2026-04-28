import { Link } from "react-router-dom";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";

export function Home() {
  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Your board
        </h1>
        <p className="max-w-xl text-sm text-slate-600">
          Kanban with AI-assisted subtasks. Data is local for now; wire Supabase
          and Telegram in <code className="rounded bg-slate-100 px-1">api/</code>
          .
        </p>
        <p className="text-sm">
          <Link
            to="/features"
            className="font-medium text-slate-900 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-500"
          >
            Explore features
          </Link>
        </p>
      </section>
      <KanbanBoard />
    </div>
  );
}
