export function Features() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900">Features</h1>
      <ul className="list-inside list-disc space-y-2 text-sm text-slate-600">
        <li>AI split of tasks into subtasks (OpenAI or compatible API)</li>
        <li>Drag and drop for cards and columns (@dnd-kit)</li>
        <li>Supabase sync and Telegram import (planned in api layer)</li>
        <li>Offline-friendly cache (localStorage / IndexedDB)</li>
      </ul>
    </div>
  );
}
