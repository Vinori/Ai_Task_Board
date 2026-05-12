import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useCallback } from "react";
import { TaskCard } from "@/components/cards/TaskCard";
import { useUiStore } from "@/store/uiStore";
import type { Column, Task } from "@/types/task";

type KanbanColumnProps = {
  column: Column;
  /** True while drag cursor targets this column (including hovering another card here). */
  isDropTargetColumn?: boolean;
  onEditColumn: (column: Column) => void;
  onCreateTask: (column: Column) => void;
  onEditTask: (columnId: string, task: Task) => void;
};

export function KanbanColumn({
  column,
  isDropTargetColumn = false,
  onEditColumn,
  onCreateTask,
  onEditTask,
}: KanbanColumnProps) {
  const locale = useUiStore((s) => s.locale);
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  const showDropHighlight = isDropTargetColumn || isOver;

  const taskIds = column.tasks.map((t) => t.id);

  const editTaskInColumn = useCallback(
    (task: Task) => {
      onEditTask(column.id, task);
    },
    [column.id, onEditTask],
  );

  const accent = column.color;
  const editLabel =
    locale === "ru" ? "Редактировать колонку" : "Edit column";
  const addCardLabel =
    locale === "ru" ? "Добавить карточку" : "Add card";

  const accentChrome =
    accent ?
      {
        borderLeftWidth: 4,
        borderLeftColor: accent,
        boxShadow: `inset 0 0 0 9999px color-mix(in srgb, ${accent} 12%, transparent)`,
      }
    : undefined;

  return (
    <section
      ref={setNodeRef}
      style={accentChrome}
      className={[
        "relative flex min-h-[280px] w-full min-w-[240px] flex-1 flex-col overflow-hidden rounded-2xl p-3 transition-[border-color] duration-200 ease-out surface-column",
        showDropHighlight ?
          "border-violet-400/55 dark:border-violet-400/40"
        : "",
      ].join(" ")}
    >
      <div
        aria-hidden
        className={[
          "pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-200 ease-out",
          showDropHighlight ?
            "opacity-100 bg-violet-500/[0.11] ring-2 ring-inset ring-violet-400/40 dark:bg-violet-500/[0.16] dark:ring-violet-400/35"
          : "opacity-0",
        ].join(" ")}
      />
      <div className="relative z-[1] mb-3 flex items-start justify-between gap-2">
        <h2 className="min-w-0 flex-1 text-xs font-semibold uppercase tracking-wide text-fg-subtle dark:text-slate-400">
          {column.title}
        </h2>
        <button
          type="button"
          aria-label={editLabel}
          title={editLabel}
          onClick={() => onEditColumn(column)}
          className="interactive-icon-btn shrink-0 p-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500"
        >
          <PencilIcon />
        </button>
      </div>
      <div className="relative z-[1] mb-2">
        <button
          type="button"
          onClick={() => onCreateTask(column)}
          className="w-full rounded-lg border border-dashed border-border-muted/95 py-2 text-xs font-semibold text-fg-muted transition hover:border-violet-400/55 hover:bg-violet-500/[0.07] hover:text-violet-700 dark:border-white/20 dark:text-slate-400 dark:hover:border-violet-400/45 dark:hover:bg-violet-500/10 dark:hover:text-violet-200"
        >
          + {addCardLabel}
        </button>
      </div>
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div className="relative z-[1] flex flex-1 flex-col gap-2 rounded-xl">
          {column.tasks.map((task) => (
            <TaskCard
              key={task.id}
              columnId={column.id}
              task={task}
              onEdit={() => editTaskInColumn(task)}
            />
          ))}
        </div>
      </SortableContext>
    </section>
  );
}

function PencilIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 20h9M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
