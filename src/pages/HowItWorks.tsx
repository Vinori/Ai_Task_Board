export function HowItWorks() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900">How it works</h1>
      <ol className="list-inside list-decimal space-y-2 text-sm text-slate-600">
        <li>Add tasks to columns on the board.</li>
        <li>Drag cards to change status; reorder within a column.</li>
        <li>Use “Split with AI” on a card to generate subtasks via useAI.</li>
        <li>Connect Supabase / Telegram when you are ready to persist or import.</li>
      </ol>
    </div>
  );
}
