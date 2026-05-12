export function Features() {
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold tracking-tight text-fg dark:text-white">
        Возможности
      </h1>
      <ul className="list-inside list-disc space-y-2.5 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
        <li>Разбиение задач на подзадачи с помощью ИИ (OpenAI или совместимый API)</li>
        <li>Перетаскивание карточек (@dnd-kit)</li>
        <li>Синхронизация с Supabase и импорт из Telegram (слой api)</li>
        <li>Офлайн-кэш (localStorage / IndexedDB)</li>
      </ul>
    </div>
  );
}
