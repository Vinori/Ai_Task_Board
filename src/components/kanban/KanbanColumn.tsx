import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { TaskCard } from "@/components/cards/TaskCard";
import type { Column } from "@/types/task";

type KanbanColumnProps = {
  column: Column;
};

export function KanbanColumn({ column }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  const taskIds = column.tasks.map((t) => t.id);

  return (
    <section
      className={[
        "flex min-h-[280px] w-full min-w-[240px] flex-1 flex-col rounded-2xl border p-3 shadow-sm backdrop-blur-sm",
        "border-slate-200/90 bg-white/90",
        "dark:border-white/[0.08] dark:bg-white/[0.04] dark:shadow-card-dark",
      ].join(" ")}
    >
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {column.title}
      </h2>
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={[
            "flex flex-1 flex-col gap-2 rounded-xl transition-colors",
            isOver
              ? "bg-violet-500/10 outline outline-2 outline-dashed outline-violet-400/35 dark:bg-white/6 dark:outline-violet-400/25"
              : "",
          ].join(" ")}
        >
          {column.tasks.map((task) => (
            <TaskCard key={task.id} columnId={column.id} task={task} />
          ))}
        </div>
      </SortableContext>
    </section>
  );
}
