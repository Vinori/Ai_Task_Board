import axios from "axios";

export type SubtaskSuggestion = { title: string; description?: string };

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
