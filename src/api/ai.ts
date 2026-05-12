import axios from "axios";

export type SubtaskSuggestion = { title: string; description?: string };

const SPLIT_TASK_URL =
  "https://aitaskboardback.belous-vladislaw.workers.dev/split-task";

/** One task returned from the split-task worker (maps to DB `board_tasks`). */
export type SplitTaskRemoteItem = {
  title: string;
  description?: string;
  color?: string;
};

function isSplitTaskItem(v: unknown): v is SplitTaskRemoteItem {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return typeof o.title === "string" && o.title.trim().length > 0;
}

/**
 * POST { task: string } to the Cloudflare worker; returns an array of tasks to create.
 */
export async function splitTaskRemote(
  task: string,
): Promise<SplitTaskRemoteItem[]> {
  const trimmed = task.trim();
  if (!trimmed) return [];

  const { data } = await axios.post<unknown>(SPLIT_TASK_URL, {
    task: trimmed,
  });

  if (!Array.isArray(data)) {
    throw new Error("Invalid response: expected an array");
  }

  const items = data.filter(isSplitTaskItem);
  return items.map((item) => ({
    title: item.title.trim(),
    ...(typeof item.description === "string" && item.description.trim()
      ? { description: item.description.trim() }
      : {}),
    ...(typeof item.color === "string" && item.color.trim()
      ? { color: item.color.trim() }
      : {}),
  }));
}

/**
 * Calls your backend or OpenAI-compatible API to break a task into subtasks.
 * Set VITE_AI_ENDPOINT and optional VITE_AI_API_KEY for real requests.
 */
export async function breakdownTaskToSubtasks(
  taskTitle: string,
): Promise<SubtaskSuggestion[]> {
  const endpoint = import.meta.env.VITE_AI_ENDPOINT as string | undefined;
  if (!endpoint) {
    return [
      { title: `Clarify scope for: ${taskTitle}` },
      { title: "Identify dependencies" },
      { title: "Ship first slice" },
    ];
  }

  const { data } = await axios.post<{ subtasks: SubtaskSuggestion[] }>(
    endpoint,
    { taskTitle },
    {
      headers: import.meta.env.VITE_AI_API_KEY
        ? { Authorization: `Bearer ${import.meta.env.VITE_AI_API_KEY}` }
        : undefined,
    },
  );
  return data.subtasks ?? [];
}
