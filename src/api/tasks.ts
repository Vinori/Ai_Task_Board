import { getSupabase } from "@/lib/supabase";
import type { Column, Task, TaskAssignee } from "@/types/task";

const STORAGE_KEY = "ai-task-board:v1";

type BoardSnapshot = { columns: Column[] };

type BoardColumnRow = {
  id: string;
  board_id: string;
  title: string;
  color: string | null;
  position: number;
};

type BoardTaskRow = {
  id: string;
  board_id: string;
  column_id: string;
  title: string;
  position: number;
  subtasks: unknown;
  description?: string | null;
  color?: string | null;
  assignee?: unknown | null;
};

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

function parseSubtasks(raw: unknown): Task["subtasks"] {
  if (!Array.isArray(raw)) return [];
  const out: Task["subtasks"] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const id = typeof o.id === "string" ? o.id : "";
    const title = typeof o.title === "string" ? o.title : "";
    if (!title) continue;
    out.push({ id: id || `sub-${out.length}`, title });
  }
  return out;
}

function parseAssignee(raw: unknown): TaskAssignee | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const o = raw as Record<string, unknown>;
  const id = typeof o.id === "string" ? o.id.trim() : "";
  const label = typeof o.label === "string" ? o.label.trim() : "";
  if (!id || !label) return undefined;
  return { id, label };
}

function taskFromRow(row: BoardTaskRow): Task {
  const rawDesc = row.description;
  const desc =
    typeof rawDesc === "string" && rawDesc.trim()
      ? rawDesc.trim()
      : undefined;
  const rawColor = row.color;
  const color =
    typeof rawColor === "string" && rawColor.trim()
      ? rawColor.trim()
      : undefined;
  const assignee = parseAssignee(row.assignee);
  return {
    id: row.id,
    title: row.title,
    subtasks: parseSubtasks(row.subtasks),
    ...(desc ? { description: desc } : {}),
    ...(color ? { color } : {}),
    ...(assignee ? { assignee } : {}),
  };
}

function rowsToColumns(
  colRows: BoardColumnRow[],
  taskRows: BoardTaskRow[],
): Column[] {
  const sortedCols = [...colRows].sort((a, b) => a.position - b.position);
  const sortedTasks = [...taskRows].sort((a, b) => a.position - b.position);
  const tasksByCol = new Map<string, Task[]>();
  for (const row of sortedTasks) {
    const list = tasksByCol.get(row.column_id) ?? [];
    list.push(taskFromRow(row));
    tasksByCol.set(row.column_id, list);
  }
  return sortedCols.map((c) => ({
    id: c.id,
    title: c.title,
    ...(c.color ? { color: c.color } : {}),
    tasks: tasksByCol.get(c.id) ?? [],
  }));
}

function createRemoteSeedColumns(): Column[] {
  const nid = () =>
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`.replace(/[xy]/g, (ch) => {
          const r = (Math.random() * 16) | 0;
          const v = ch === "x" ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        });

  return [
    {
      id: nid(),
      title: "To do",
      tasks: [
        { id: nid(), title: "Draft project README", subtasks: [] },
        { id: nid(), title: "Connect Supabase", subtasks: [] },
      ],
    },
    {
      id: nid(),
      title: "Doing",
      tasks: [{ id: nid(), title: "Scaffold React app", subtasks: [] }],
    },
    {
      id: nid(),
      title: "Done",
      tasks: [],
    },
  ];
}

async function fetchBoardLocal(): Promise<Column[]> {
  const snap = loadSnapshot();
  if (snap?.columns?.length) return snap.columns;
  return defaultColumns();
}

async function fetchBoardRemote(boardId: string): Promise<Column[]> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase not configured");

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) throw new Error("Not authenticated");

  const { data: colRows, error: colErr } = await supabase
    .from("board_columns")
    .select("id, board_id, title, color, position")
    .eq("board_id", boardId)
    .order("position", { ascending: true });

  if (colErr) throw new Error(colErr.message);

  const { data: taskRows, error: taskErr } = await supabase
    .from("board_tasks")
    .select(
      "id, board_id, column_id, title, position, subtasks, description, color, assignee",
    )
    .eq("board_id", boardId)
    .order("position", { ascending: true });

  if (taskErr) throw new Error(taskErr.message);

  const cols = (colRows ?? []) as BoardColumnRow[];
  const tasks = (taskRows ?? []) as BoardTaskRow[];

  if (cols.length === 0) {
    const seeded = createRemoteSeedColumns();
    await persistBoardRemote(boardId, seeded);
    return seeded;
  }

  return rowsToColumns(cols, tasks);
}

async function persistBoardRemote(
  boardId: string,
  columns: Column[],
): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase not configured");

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) throw new Error("Not authenticated");

  const keepColIds = columns.map((c) => c.id);
  const keepTaskIds = columns.flatMap((c) => c.tasks.map((t) => t.id));

  const columnPayload = columns.map((c, position) => ({
    id: c.id,
    board_id: boardId,
    title: c.title,
    color: c.color ?? null,
    position,
  }));

  if (columnPayload.length > 0) {
    const { error: upColErr } = await supabase
      .from("board_columns")
      .upsert(columnPayload, { onConflict: "id" });

    if (upColErr) throw new Error(upColErr.message);
  }

  const taskPayload = columns.flatMap((c) =>
    c.tasks.map((t, position) => ({
      id: t.id,
      board_id: boardId,
      column_id: c.id,
      title: t.title,
      position,
      subtasks: t.subtasks as unknown[],
      description: t.description?.trim() ? t.description.trim() : null,
      color: t.color?.trim() ? t.color.trim() : null,
      assignee: t.assignee
        ? { id: t.assignee.id, label: t.assignee.label }
        : null,
    })),
  );

  if (taskPayload.length > 0) {
    const { error: upTaskErr } = await supabase
      .from("board_tasks")
      .upsert(taskPayload, { onConflict: "id" });

    if (upTaskErr) throw new Error(upTaskErr.message);
  }

  const { data: existingTasks, error: exTaskErr } = await supabase
    .from("board_tasks")
    .select("id")
    .eq("board_id", boardId);

  if (exTaskErr) throw new Error(exTaskErr.message);

  const taskIdsToDelete =
    existingTasks
      ?.map((r) => r.id as string)
      .filter((id) => !keepTaskIds.includes(id)) ?? [];

  if (taskIdsToDelete.length > 0) {
    const { error: delTaskErr } = await supabase
      .from("board_tasks")
      .delete()
      .in("id", taskIdsToDelete);

    if (delTaskErr) throw new Error(delTaskErr.message);
  }

  const { data: existingCols, error: exColErr } = await supabase
    .from("board_columns")
    .select("id")
    .eq("board_id", boardId);

  if (exColErr) throw new Error(exColErr.message);

  const colIdsToDelete =
    existingCols
      ?.map((r) => r.id as string)
      .filter((id) => !keepColIds.includes(id)) ?? [];

  if (colIdsToDelete.length > 0) {
    const { error: delColErr } = await supabase
      .from("board_columns")
      .delete()
      .in("id", colIdsToDelete);

    if (delColErr) throw new Error(delColErr.message);
  }
}

export async function fetchBoard(boardId: string | null): Promise<Column[]> {
  if (boardId) return fetchBoardRemote(boardId);
  return fetchBoardLocal();
}

export async function persistBoard(
  boardId: string | null,
  columns: Column[],
): Promise<void> {
  if (boardId) {
    await persistBoardRemote(boardId, columns);
    return;
  }
  saveSnapshot(columns);
}

export async function syncTaskToRemote(_task: Task): Promise<void> {
  void _task;
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

/** Stable UUID for new columns/tasks when `crypto.randomUUID` is missing. */
export function newEntityId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`.replace(/[xy]/g, (ch) => {
    const r = (Math.random() * 16) | 0;
    const v = ch === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
