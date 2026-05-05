import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import { Button } from "@/components/buttons/Button";
import { useAI } from "@/hooks/useAI";
import type { Task } from "@/types/task";

type TaskCardProps = {
  columnId: string;
  task: Task;
};

export function TaskCard({ columnId, task }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id, data: { columnId } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const { loading, error, splitTaskIntoSubtasks } = useAI();

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      className={[
        "rounded-xl border p-3 transition-shadow",
        "border-slate-200/90 bg-white shadow-sm",
        "dark:border-white/[0.08] dark:bg-slate-900/55 dark:shadow-[0_4px_24px_-8px_rgba(0,0,0,0.5)]",
        isDragging
          ? "opacity-90 ring-2 ring-violet-400/50 dark:ring-violet-400/40"
          : "",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-2">
        <button
          type="button"
          className="flex-1 cursor-grab text-left text-sm font-medium text-slate-900 active:cursor-grabbing dark:text-slate-100"
          {...attributes}
          {...listeners}
        >
          {task.title}
        </button>
        <Button
          variant="ghost"
          className="shrink-0 rounded-lg px-2 py-1 text-xs"
          disabled={loading}
          onClick={() => splitTaskIntoSubtasks(columnId, task.id, task.title)}
        >
          {loading ? "…" : "AI split"}
        </Button>
      </div>
      {task.subtasks.length > 0 && (
        <ul className="mt-2 space-y-1 border-t border-slate-100 pt-2 text-xs text-slate-600 dark:border-white/10 dark:text-slate-400">
          {task.subtasks.map((s) => (
            <li key={s.id}>• {s.title}</li>
          ))}
        </ul>
      )}
      {error && (
        <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </motion.div>
  );
}
