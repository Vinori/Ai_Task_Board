import { create } from "zustand";
import { fetchBoard, persistBoard } from "@/api/tasks";
import type { Column, Task } from "@/types/task";

export type { Column, Task } from "@/types/task";

type TasksState = {
  columns: Column[];
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setColumns: (columns: Column[]) => void;
  updateTask: (columnId: string, taskId: string, patch: Partial<Task>) => void;
};

export const useTasksStore = create<TasksState>((set, get) => ({
  columns: [],
  hydrated: false,
  async hydrate() {
    const columns = await fetchBoard();
    set({ columns, hydrated: true });
  },
  setColumns(columns) {
    set({ columns });
    void persistBoard(columns);
  },
  updateTask(columnId, taskId, patch) {
    const columns = get().columns.map((col) => {
      if (col.id !== columnId) return col;
      return {
        ...col,
        tasks: col.tasks.map((t) =>
          t.id === taskId ? { ...t, ...patch } : t,
        ),
      };
    });
    get().setColumns(columns);
  },
}));

export function useTasks() {
  const hydrated = useTasksStore((s) => s.hydrated);
  const columns = useTasksStore((s) => s.columns);
  const hydrate = useTasksStore((s) => s.hydrate);
  const setColumns = useTasksStore((s) => s.setColumns);
  const updateTask = useTasksStore((s) => s.updateTask);
  return { hydrated, columns, hydrate, setColumns, updateTask };
}
