export function HowItWorks() {
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
        Как это работает
      </h1>
      <ol className="list-inside list-decimal space-y-2.5 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
        <li>Добавляйте задачи в колонки на доске.</li>
        <li>Перетаскивайте карточки между статусами и внутри колонки.</li>
        <li>Используйте «AI split» на карточке для генерации подзадач.</li>
        <li>Подключите Supabase или Telegram, когда будете готовы к синхронизации.</li>
      </ol>
    </div>
  );
}
