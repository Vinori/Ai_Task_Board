import { useCallback, useState } from "react";
import { breakdownTaskToSubtasks } from "@/api/ai";
import { useTasksStore } from "@/hooks/useTasks";

export function useAI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const updateTask = useTasksStore((s) => s.updateTask);

  const splitTaskIntoSubtasks = useCallback(
    async (columnId: string, taskId: string, title: string) => {
      setLoading(true);
      setError(null);
      try {
        const suggestions = await breakdownTaskToSubtasks(title);
        const subtasks = suggestions.map((s, i) => ({
          id: `${taskId}-sub-${i}`,
          title: s.title,
        }));
        updateTask(columnId, taskId, { subtasks });
      } catch (e) {
        setError(e instanceof Error ? e.message : "AI request failed");
      } finally {
        setLoading(false);
      }
    },
    [updateTask],
  );

  return { loading, error, splitTaskIntoSubtasks };
}
