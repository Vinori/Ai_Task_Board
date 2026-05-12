import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useCallback, useRef } from "react";
import type { Column, Task } from "@/types/task";

/** Looks up a task by sortable id across all columns (for drag overlay / lifecycle). */
export function findTaskInColumns(columns: Column[], taskId: string): Task | null {
  for (const col of columns) {
    const t = col.tasks.find((x) => x.id === taskId);
    if (t) return t;
  }
  return null;
}

type MoveTaskArgs = {
  columns: Column[];
  activeId: string;
  overId: string | undefined;
};

function findTaskColumn(columns: Column[], taskId: string): Column | undefined {
  return columns.find((c) => c.tasks.some((t) => t.id === taskId));
}

/** Maps collision `over` id (column id or task id) to the receiving column id for UI highlight. */
export function resolveColumnIdForOver(
  columns: Column[],
  overId: string | null | undefined,
): string | null {
  if (overId == null || overId === "") return null;
  if (columns.some((c) => c.id === overId)) return overId;
  return findTaskColumn(columns, overId)?.id ?? null;
}

function removeTask(columns: Column[], taskId: string): { next: Column[]; task: Task | null } {
  let removed: Task | null = null;
  const next = columns.map((col) => {
    const task = col.tasks.find((t) => t.id === taskId);
    if (!task) return col;
    removed = task;
    return { ...col, tasks: col.tasks.filter((t) => t.id !== taskId) };
  });
  return { next, task: removed };
}

/**
 * Interprets @dnd-kit drag end for tasks: reorder within column or move across columns.
 */
export function applyTaskMove({ columns, activeId, overId }: MoveTaskArgs): Column[] {
  if (!overId || activeId === overId) return columns;

  const activeColumn = findTaskColumn(columns, activeId);
  const overColumn = findTaskColumn(columns, overId);
  const overIsColumn = columns.some((c) => c.id === overId);

  if (!activeColumn) return columns;

  const targetColumn = overIsColumn
    ? columns.find((c) => c.id === overId)!
    : overColumn ?? activeColumn;

  if (activeColumn.id === targetColumn.id && !overIsColumn) {
    const oldIndex = activeColumn.tasks.findIndex((t) => t.id === activeId);
    const newIndex = targetColumn.tasks.findIndex((t) => t.id === overId);
    if (oldIndex === -1 || newIndex === -1) return columns;
    const tasks = arrayMove(targetColumn.tasks, oldIndex, newIndex);
    return columns.map((c) =>
      c.id === targetColumn.id ? { ...c, tasks } : c,
    );
  }

  if (activeColumn.id !== targetColumn.id) {
    const { next: withoutTask, task } = removeTask(columns, activeId);
    if (!task) return columns;

    if (overIsColumn) {
      return withoutTask.map((c) =>
        c.id === targetColumn.id ? { ...c, tasks: [...c.tasks, task] } : c,
      );
    }

    const targetAfterRemove = withoutTask.find((c) => c.id === targetColumn.id);
    if (!targetAfterRemove) return columns;

    const insertIndex = targetAfterRemove.tasks.findIndex((t) => t.id === overId);
    const nextTasks =
      insertIndex === -1
        ? [...targetAfterRemove.tasks, task]
        : [
            ...targetAfterRemove.tasks.slice(0, insertIndex),
            task,
            ...targetAfterRemove.tasks.slice(insertIndex),
          ];

    return withoutTask.map((c) =>
      c.id === targetColumn.id ? { ...c, tasks: nextTasks } : c,
    );
  }

  return columns;
}

type UseDragDropHandlersOptions = {
  onActiveTaskChange?: (task: Task | null) => void;
};

export function useDragDropHandlers(
  columns: Column[],
  setColumns: (c: Column[]) => void,
  options?: UseDragDropHandlersOptions,
) {
  const activeCbRef = useRef(options?.onActiveTaskChange);
  activeCbRef.current = options?.onActiveTaskChange;

  const onDragStart = useCallback(
    (event: DragStartEvent) => {
      const id = String(event.active.id);
      const task = findTaskInColumns(columns, id);
      activeCbRef.current?.(task ?? null);
    },
    [columns],
  );

  const onDragCancel = useCallback(() => {
    activeCbRef.current?.(null);
  }, []);

  const onDragEnd = useCallback(
    (event: DragEndEvent) => {
      activeCbRef.current?.(null);
      const { active, over } = event;
      if (!over) return;
      const next = applyTaskMove({
        columns,
        activeId: String(active.id),
        overId: String(over.id),
      });
      setColumns(next);
    },
    [columns, setColumns],
  );

  return { onDragStart, onDragCancel, onDragEnd };
}
