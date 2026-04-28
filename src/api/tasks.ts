import type { Column, Task } from "@/types/task";

const STORAGE_KEY = "ai-task-board:v1";

type BoardSnapshot = { columns: Column[] };

function loadSnapshot(): BoardSnapshot | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as BoardSnapshot;
  } catch {
    return null;
  }
}

function saveSnapshot(columns: Column[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ columns }));
}

/** Local persistence stub; swap for Supabase CRUD later. */
export async function fetchBoard(): Promise<Column[]> {
  const snap = loadSnapshot();
  if (snap?.columns?.length) return snap.columns;
  return defaultColumns();
}

export async function persistBoard(columns: Column[]): Promise<void> {
  saveSnapshot(columns);
}

export async function syncTaskToRemote(_task: Task): Promise<void> {
  void _task;
  // Supabase / Telegram hooks go here
}

function defaultColumns(): Column[] {
  return [
    {
      id: "col-todo",
      title: "To do",
      tasks: [
        { id: "t1", title: "Draft project README", subtasks: [] },
        { id: "t2", title: "Connect Supabase", subtasks: [] },
      ],
    },
    {
      id: "col-doing",
      title: "Doing",
      tasks: [{ id: "t3", title: "Scaffold React app", subtasks: [] }],
    },
    {
      id: "col-done",
      title: "Done",
      tasks: [],
    },
  ];
}
