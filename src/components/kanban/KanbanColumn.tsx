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
    <section className="flex min-h-[280px] w-full min-w-[240px] flex-1 flex-col rounded-xl border border-slate-200/80 bg-slate-50/50 p-3">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {column.title}
      </h2>
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={[
            "flex flex-1 flex-col gap-2 rounded-lg",
            isOver ? "bg-slate-100/80 outline outline-2 outline-dashed outline-slate-300" : "",
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
