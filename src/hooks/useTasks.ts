import { create } from "zustand";
import { fetchBoard, newEntityId, persistBoard } from "@/api/tasks";
import type { Column, Task, TaskAssignee } from "@/types/task";

export type { Column, Task, TaskAssignee } from "@/types/task";

type AddTaskInput = {
  title: string;
  description?: string;
  color?: string;
  assignee?: TaskAssignee;
};

type TasksState = {
  columns: Column[];
  hydrated: boolean;
  remoteBoardId: string | null;
  hydrateError: string | null;
  hydrate: (boardId: string | null) => Promise<void>;
  setColumns: (columns: Column[]) => void;
  updateTask: (columnId: string, taskId: string, patch: Partial<Task>) => void;
  addTask: (columnId: string, input: AddTaskInput) => void;
  addColumn: (input: { title: string; color?: string }) => void;
  updateColumn: (
    columnId: string,
    patch: { title?: string; color?: string | undefined },
  ) => void;
  removeTask: (columnId: string, taskId: string) => void;
  /** Returns false if this is the last column or the id was not found. */
  removeColumn: (columnId: string) => boolean;
};

export const useTasksStore = create<TasksState>((set, get) => ({
  columns: [],
  hydrated: false,
  remoteBoardId: null,
  hydrateError: null,
  async hydrate(boardId) {
    set({ hydrated: false, hydrateError: null });
    try {
      const columns = await fetchBoard(boardId);
      set({
        columns,
        hydrated: true,
        remoteBoardId: boardId,
        hydrateError: null,
      });
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Failed to load board";
      set({
        columns: [],
        hydrated: true,
        remoteBoardId: boardId,
        hydrateError: message,
      });
    }
  },
  setColumns(columns) {
    const boardId = get().remoteBoardId;
    set({ columns });
    void persistBoard(boardId, columns).catch((err) => {
      console.error("[persistBoard]", err);
    });
  },
  updateTask(columnId, taskId, patch) {
    const columns = get().columns.map((col) => {
      if (col.id !== columnId) return col;
      return {
        ...col,
        tasks: col.tasks.map((t) => {
          if (t.id !== taskId) return t;
          const next: Task = { ...t, ...patch };
          if ("description" in patch && patch.description === undefined) {
            delete next.description;
          }
          if ("color" in patch && patch.color === undefined) {
            delete next.color;
          }
          if ("assignee" in patch && patch.assignee === undefined) {
            delete next.assignee;
          }
          return next;
        }),
      };
    });
    get().setColumns(columns);
  },
  addTask(columnId, input) {
    const id = newEntityId();
    const title = input.title.trim();
    const desc = input.description?.trim();
    const task: Task = {
      id,
      title,
      subtasks: [],
      ...(desc ? { description: desc } : {}),
      ...(input.color ? { color: input.color } : {}),
      ...(input.assignee ? { assignee: input.assignee } : {}),
    };
    const columns = get().columns.map((col) => {
      if (col.id !== columnId) return col;
      return { ...col, tasks: [...col.tasks, task] };
    });
    get().setColumns(columns);
  },
  addColumn({ title, color }) {
    const id = newEntityId();
    const next: Column[] = [
      ...get().columns,
      { id, title, tasks: [], ...(color ? { color } : {}) },
    ];
    get().setColumns(next);
  },
  updateColumn(columnId, patch) {
    const columns = get().columns.map((col) => {
      if (col.id !== columnId) return col;
      const next = { ...col };
      if (patch.title !== undefined) next.title = patch.title;
      if ("color" in patch) {
        if (patch.color === undefined) delete next.color;
        else next.color = patch.color;
      }
      return next;
    });
    get().setColumns(columns);
  },
  removeTask(columnId, taskId) {
    const columns = get().columns.map((col) => {
      if (col.id !== columnId) return col;
      return { ...col, tasks: col.tasks.filter((t) => t.id !== taskId) };
    });
    get().setColumns(columns);
  },
  removeColumn(columnId) {
    const prev = get().columns;
    if (prev.length <= 1) return false;
    const next = prev.filter((c) => c.id !== columnId);
    if (next.length === prev.length) return false;
    get().setColumns(next);
    return true;
  },
}));

export function useTasks() {
  const hydrated = useTasksStore((s) => s.hydrated);
  const columns = useTasksStore((s) => s.columns);
  const hydrate = useTasksStore((s) => s.hydrate);
  const hydrateError = useTasksStore((s) => s.hydrateError);
  const setColumns = useTasksStore((s) => s.setColumns);
  const updateTask = useTasksStore((s) => s.updateTask);
  const addTask = useTasksStore((s) => s.addTask);
  const addColumn = useTasksStore((s) => s.addColumn);
  const updateColumn = useTasksStore((s) => s.updateColumn);
  const removeTask = useTasksStore((s) => s.removeTask);
  const removeColumn = useTasksStore((s) => s.removeColumn);
  return {
    hydrated,
    columns,
    hydrate,
    hydrateError,
    setColumns,
    updateTask,
    addTask,
    addColumn,
    updateColumn,
    removeTask,
    removeColumn,
  };
}
