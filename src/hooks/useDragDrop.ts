import type { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import type { Column, Task } from "@/types/task";

type MoveTaskArgs = {
  columns: Column[];
  activeId: string;
  overId: string | undefined;
};

function findTaskColumn(columns: Column[], taskId: string): Column | undefined {
  return columns.find((c) => c.tasks.some((t) => t.id === taskId));
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

export function useDragDropHandlers(
  columns: Column[],
  setColumns: (c: Column[]) => void,
) {
  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const next = applyTaskMove({
      columns,
      activeId: String(active.id),
      overId: String(over.id),
    });
    setColumns(next);
  };

  return { onDragEnd };
}
