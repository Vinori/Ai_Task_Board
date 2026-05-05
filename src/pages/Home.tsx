import { KanbanBoard } from "@/components/kanban/KanbanBoard";

export function Home() {
  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
          Обзор доски
        </h1>
        <p className="max-w-xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          Перетаскивайте карточки между колонками. Кнопка «AI split» разбивает задачу на
          подзадачи.
        </p>
      </section>
      <section id="board" className="scroll-mt-28">
        <KanbanBoard />
      </section>
    </div>
  );
}
