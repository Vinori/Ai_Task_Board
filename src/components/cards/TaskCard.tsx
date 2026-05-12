import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { memo, type PointerEvent } from "react";
import { Button } from "@/components/buttons/Button";
import { useAI } from "@/hooks/useAI";
import { useUiStore } from "@/store/uiStore";
import type { Task } from "@/types/task";

const sortableTransition = {
  duration: 225,
  easing: "cubic-bezier(0.25, 1, 0.5, 1)",
};

type TaskCardProps = {
  columnId: string;
  task: Task;
  onEdit: () => void;
};

function TaskCardInner({ columnId, task, onEdit }: TaskCardProps) {
  const locale = useUiStore((s) => s.locale);
  const editLabel =
    locale === "ru" ? "Редактировать задачу" : "Edit task";

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { columnId },
    transition: sortableTransition,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const { loading, error, splitTaskIntoSubtasks } = useAI();

  const accent = task.color;
  const accentChrome =
    accent != null && accent !== ""
      ? {
          borderLeftWidth: 4,
          borderLeftColor: accent,
          boxShadow: `inset 0 0 0 9999px color-mix(in srgb, ${accent} 10%, transparent)`,
        }
      : {};

  const stopDrag = (e: PointerEvent<Element>) => {
    e.stopPropagation();
  };

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, ...accentChrome }}
      {...attributes}
      {...listeners}
      className={[
        "cursor-grab rounded-xl border p-3 transition-shadow active:cursor-grabbing surface-card",
        isDragging ? "opacity-40" : "",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 text-left text-sm font-medium text-fg dark:text-slate-100">
          {task.title}
        </div>
        <button
          type="button"
          aria-label={editLabel}
          title={editLabel}
          onPointerDown={stopDrag}
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="interactive-icon-btn shrink-0 p-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500"
        >
          <CardPencilIcon />
        </button>
        <Button
          variant="ghost"
          className="shrink-0 rounded-lg px-2 py-1 text-xs"
          disabled={loading}
          onPointerDown={stopDrag}
          onClick={(e) => {
            e.stopPropagation();
            splitTaskIntoSubtasks(columnId, task.id, task.title);
          }}
        >
          {loading ? "…" : "AI split"}
        </Button>
      </div>
      {task.description ?
        <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-fg-muted dark:text-slate-400">
          {task.description}
        </p>
      : null}
      {task.assignee ?
        <div className="mt-1.5">
          <span className="badge-muted">
            {task.assignee.label}
          </span>
        </div>
      : null}
      {task.subtasks.length > 0 && (
        <ul className="mt-2 space-y-1 border-t border-border-muted/70 pt-2 text-xs text-fg-muted dark:border-white/10 dark:text-slate-400">
          {task.subtasks.map((s) => (
            <li key={s.id}>• {s.title}</li>
          ))}
        </ul>
      )}
      {error && (
        <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}

export const TaskCard = memo(TaskCardInner);

function CardPencilIcon() {
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
