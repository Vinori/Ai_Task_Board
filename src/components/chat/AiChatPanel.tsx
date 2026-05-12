import axios from "axios";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import type { SplitTaskRemoteItem } from "@/api/ai";
import { splitTaskRemote } from "@/api/ai";
import { Button } from "@/components/buttons/Button";
import { useTasksStore } from "@/hooks/useTasks";
import { useUiStore } from "@/store/uiStore";

function newChatId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `chat-${Math.random().toString(36).slice(2)}`;
}

type ChatMessage =
  | { id: string; role: "user"; text: string }
  | { id: string; role: "assistant"; items: SplitTaskRemoteItem[] };

export function AiChatPanel() {
  const locale = useUiStore((s) => s.locale);
  const labelId = useId();
  const columns = useTasksStore((s) => s.columns);
  const addTask = useTasksStore((s) => s.addTask);
  const hydrateError = useTasksStore((s) => s.hydrateError);

  const firstColumnId = columns[0]?.id ?? null;
  const canSend = Boolean(firstColumnId) && !hydrateError;

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const labels = useMemo(
    () =>
      locale === "ru"
        ? {
            title: "Разбить задачу (AI)",
            placeholder: "Опишите задачу…",
            send: "Отправить",
            toggleOpen: "Открыть AI-чат",
            toggleClose: "Закрыть чат",
            emptyHint: "Введите задачу выше и нажмите «Отправить».",
            noColumn:
              "Нет колонок на доске — добавьте колонку, чтобы создавать задачи.",
            loadErrorBoard: "Сначала устраните ошибку загрузки доски.",
            addedNotice: "задач добавлено на доску",
          }
        : {
            title: "Split task (AI)",
            placeholder: "Describe a task…",
            send: "Send",
            toggleOpen: "Open AI chat",
            toggleClose: "Close chat",
            emptyHint: "Type a task above and tap Send.",
            noColumn:
              "No columns on the board — add a column before creating tasks.",
            loadErrorBoard: "Fix the board load error first.",
            addedNotice: "tasks added to the board",
          },
    [locale],
  );

  useEffect(() => {
    if (!open) return;
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [open, messages, loading]);

  const handleSubmit = useCallback(async () => {
    const text = input.trim();
    if (!text || loading || !firstColumnId || hydrateError) return;

    const userMsg: ChatMessage = { id: newChatId(), role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setError(null);
    setLoading(true);

    try {
      const items = await splitTaskRemote(text);
      setMessages((prev) => [
        ...prev,
        { id: newChatId(), role: "assistant", items },
      ]);
      for (const item of items) {
        addTask(firstColumnId, {
          title: item.title,
          ...(item.description ? { description: item.description } : {}),
          ...(item.color ? { color: item.color } : {}),
        });
      }
    } catch (e) {
      let message = e instanceof Error ? e.message : "Request failed";
      if (axios.isAxiosError(e) && e.response?.data) {
        const d = e.response.data;
        if (typeof d === "string") message = d;
        else if (typeof d === "object" && d !== null && "message" in d) {
          const m = (d as { message?: unknown }).message;
          if (typeof m === "string") message = m;
        }
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [input, loading, firstColumnId, hydrateError, addTask]);

  return (
    <>
      {/* Floating launcher */}
      <div className="pointer-events-none fixed bottom-4 right-4 z-50 md:bottom-6 md:right-6">
        <div className="pointer-events-auto">
          {!open ?
            <Button
              type="button"
              variant="gradient"
              className="rounded-2xl px-4 py-3 shadow-lg"
              aria-label={labels.toggleOpen}
              aria-expanded={false}
              aria-haspopup="dialog"
              onClick={() => setOpen(true)}
            >
              AI
            </Button>
          : null}
        </div>
      </div>

      {open ?
        <div className="pointer-events-none fixed inset-0 z-50 flex items-end justify-end p-4 md:p-6">
          <div
            className="pointer-events-auto flex max-h-[min(560px,calc(100vh-8rem))] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-border-muted/70 bg-canvas shadow-2xl dark:border-white/10 dark:bg-slate-900"
            role="dialog"
            aria-modal="false"
            aria-labelledby={labelId}
          >
            <div className="flex items-center justify-between gap-2 border-b border-border-muted/70 px-3 py-2 dark:border-white/10">
              <h2 id={labelId} className="text-sm font-semibold text-fg dark:text-white">
                {labels.title}
              </h2>
              <button
                type="button"
                className="interactive-icon-btn rounded-lg p-2 text-fg-muted hover:text-fg dark:text-slate-400 dark:hover:text-white"
                aria-label={labels.toggleClose}
                onClick={() => setOpen(false)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M18 6L6 18M6 6l12 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            <div
              ref={listRef}
              className="min-h-[200px] flex-1 space-y-3 overflow-y-auto px-3 py-3"
            >
              {messages.length === 0 && !loading ?
                <p className="text-xs text-fg-muted dark:text-slate-400">
                  {labels.emptyHint}
                </p>
              : null}

              {messages.map((m) =>
                m.role === "user" ?
                  <div
                    key={m.id}
                    className="ml-6 rounded-xl border border-border-muted/60 bg-interactive/25 px-3 py-2 text-sm text-fg dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
                  >
                    {m.text}
                  </div>
                : <div key={m.id} className="mr-4 space-y-2">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-fg-muted dark:text-slate-500">
                      AI
                    </p>
                    {m.items.length === 0 ?
                      <p className="text-xs text-fg-muted dark:text-slate-400">
                        {locale === "ru" ? "Нет предложений." : "No suggestions."}
                      </p>
                    : m.items.map((item, idx) => (
                        <div
                          key={`${m.id}-${idx}`}
                            className="surface-card flex gap-2 rounded-xl border border-border-muted/60 p-2 text-left dark:border-white/10"
                        >
                          <span
                            className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{
                              backgroundColor:
                                item.color && item.color !== "" ?
                                  item.color
                                : "var(--fg-muted)",
                            }}
                            aria-hidden
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-fg dark:text-slate-100">
                              {item.title}
                            </p>
                            {item.description ?
                              <p className="mt-1 text-xs leading-relaxed text-fg-muted dark:text-slate-400">
                                {item.description}
                              </p>
                            : null}
                          </div>
                        </div>
                      ))
                    }
                    {m.items.length > 0 ?
                      <p className="text-[10px] text-fg-muted dark:text-slate-500">
                        {m.items.length} {labels.addedNotice}
                      </p>
                    : null}
                  </div>,
              )}

              {loading ?
                <p
                  className="flex items-center gap-2 text-xs text-fg-muted dark:text-slate-400"
                  aria-live="polite"
                  role="status"
                >
                  <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-fg-muted/30 border-t-fg-muted dark:border-white/20 dark:border-t-white" />
                  {locale === "ru" ? "Разбиение задачи…" : "Splitting task…"}
                </p>
              : null}
            </div>

            {hydrateError ?
              <div className="border-t border-border-muted/70 px-3 py-2 dark:border-white/10">
                <p className="text-xs text-red-600 dark:text-red-400" role="alert">
                  {labels.loadErrorBoard}
                </p>
              </div>
            : null}

            {!hydrateError && !firstColumnId ?
              <div className="border-t border-border-muted/70 px-3 py-2 dark:border-white/10">
                <p className="text-xs text-amber-700 dark:text-amber-400" role="status">
                  {labels.noColumn}
                </p>
              </div>
            : null}

            {error ?
              <div className="border-t border-border-muted/70 px-3 py-2 dark:border-white/10">
                <p className="text-xs text-red-600 dark:text-red-400" role="alert">
                  {error}
                </p>
              </div>
            : null}

            <div className="flex gap-2 border-t border-border-muted/70 p-3 dark:border-white/10">
              <label className="sr-only" htmlFor={`${labelId}-input`}>
                {labels.placeholder}
              </label>
              <textarea
                id={`${labelId}-input`}
                rows={2}
                className="flex-1 resize-none rounded-xl border border-border-muted/70 bg-transparent px-3 py-2 text-sm text-fg outline-none placeholder:text-fg-muted/80 focus-visible:ring-2 focus-visible:ring-violet-500 dark:border-white/15 dark:text-slate-100"
                placeholder={labels.placeholder}
                value={input}
                disabled={!canSend || loading}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    !e.shiftKey &&
                    canSend &&
                    !loading &&
                    input.trim()
                  ) {
                    e.preventDefault();
                    void handleSubmit();
                  }
                }}
              />
              <Button
                type="button"
                variant="primary"
                className="self-end shrink-0"
                disabled={!canSend || loading || !input.trim()}
                onClick={() => void handleSubmit()}
              >
                {labels.send}
              </Button>
            </div>
          </div>
        </div>
      : null}
    </>
  );
}
