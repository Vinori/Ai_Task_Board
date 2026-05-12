import { useEffect, useState } from "react";
import type { BoardRow } from "@/api/boards";
import { BoardSettingsModal } from "@/components/modals/BoardSettingsModal";
import { CreateBoardModal } from "@/components/modals/CreateBoardModal";
import { useAuthStore } from "@/store/authStore";
import { useBoardsStore } from "@/store/boardsStore";
import { useUiStore } from "@/store/uiStore";

const copy = {
  ru: {
    title: "Мои доски",
    close: "Закрыть панель досок",
    tasks: (n: number) =>
      n === 0 ? "нет задач" :
      n === 1 ? "1 задача" :
      n < 5 ? `${n} задачи` :
      `${n} задач`,
    nav: "Список досок",
    selectBoardAria: "Открыть доску",
    createBoard: "Создать доску",
    loading: "Загрузка досок…",
    empty: "Пока нет досок. Создайте первую.",
    loadFailed: "Не удалось загрузить доски",
    boardSettingsAria: "Настройки доски",
    deleteBoardAria: "Удалить доску",
    deleteBoardConfirm: (title: string) =>
      `Удалить доску «${title}»? Это действие нельзя отменить.`,
  },
  en: {
    title: "My boards",
    close: "Close boards panel",
    tasks: (n: number) => `${n} task${n === 1 ? "" : "s"}`,
    nav: "Boards list",
    selectBoardAria: "Open board",
    createBoard: "Create board",
    loading: "Loading boards…",
    empty: "No boards yet. Create your first one.",
    loadFailed: "Could not load boards",
    boardSettingsAria: "Board settings",
    deleteBoardAria: "Delete board",
    deleteBoardConfirm: (title: string) =>
      `Delete board "${title}"? This cannot be undone.`,
  },
} as const;

export function BoardsSidebar() {
  const locale = useUiStore((s) => s.locale);
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);
  const setSidebarOpen = useUiStore((s) => s.setSidebarOpen);

  const user = useAuthStore((s) => s.user);

  const boards = useBoardsStore((s) => s.boards);
  const loading = useBoardsStore((s) => s.loading);
  const error = useBoardsStore((s) => s.error);
  const fetchBoards = useBoardsStore((s) => s.fetchBoards);
  const resetBoards = useBoardsStore((s) => s.reset);
  const deleteBoard = useBoardsStore((s) => s.deleteBoard);

  const activeBoardId = useBoardsStore((s) => s.activeBoardId);
  const setActiveBoardId = useBoardsStore((s) => s.setActiveBoardId);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [settingsBoard, setSettingsBoard] = useState<BoardRow | null>(null);
  const [deletingBoardId, setDeletingBoardId] = useState<string | null>(null);

  const t = copy[locale];

  useEffect(() => {
    void fetchBoards();
    return () => {
      resetBoards();
    };
  }, [fetchBoards, resetBoards]);

  return (
    <>
      <button
        type="button"
        aria-hidden={!sidebarOpen}
        tabIndex={sidebarOpen ? 0 : -1}
        aria-label={t.close}
        className={[
          "fixed inset-0 z-[45] bg-slate-950/45 backdrop-blur-[2px] transition-opacity duration-300 md:pointer-events-none md:hidden",
          sidebarOpen ? "opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
        onClick={() => setSidebarOpen(false)}
      />

      <aside
        role="navigation"
        aria-label={t.nav}
        aria-hidden={!sidebarOpen}
        className={[
          "flex min-h-0 flex-col overflow-hidden border-border-muted/80 bg-surface-elevated/92 backdrop-blur-xl transition-[transform,width,opacity,min-width,padding] duration-300 ease-out dark:border-white/10 dark:bg-slate-950/75",
          "fixed top-14 left-0 z-[46] h-[calc(100dvh-3.5rem)] w-[min(100%,280px)] border-r shadow-surface-lg dark:shadow-card-dark",
          "md:relative md:top-auto md:left-auto md:z-0 md:h-auto md:min-h-[calc(100vh-3.5rem)] md:max-h-none md:shadow-none",
          sidebarOpen
            ? "translate-x-0 md:w-[280px] md:min-w-[280px] md:opacity-100"
            : "-translate-x-full md:pointer-events-none md:w-0 md:min-w-0 md:translate-x-0 md:border-0 md:opacity-0 md:px-0",
        ].join(" ")}
      >
        <div className="flex min-h-0 flex-1 flex-col gap-3 p-4">
          <div className="flex shrink-0 items-start justify-between gap-2 border-b border-border-muted/70 pb-3 dark:border-white/10">
            <h2 className="text-sm font-semibold tracking-tight text-fg dark:text-white">
              {t.title}
            </h2>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              aria-label={t.close}
              className="rounded-lg p-1.5 text-fg-subtle transition hover:bg-interactive/60 hover:text-fg md:hidden dark:hover:bg-white/10 dark:hover:text-white"
            >
              <CloseIcon />
            </button>
          </div>

          {loading ? (
            <div
              className="flex flex-1 flex-col gap-2 py-2"
              role="status"
              aria-label={t.loading}
            >
              <div className="h-14 animate-pulse rounded-2xl bg-surface-muted/70 dark:bg-white/10" />
              <div className="h-14 animate-pulse rounded-2xl bg-surface-muted/55 dark:bg-white/[0.07]" />
              <div className="h-14 animate-pulse rounded-2xl bg-surface-muted/40 dark:bg-white/[0.05]" />
            </div>
          ) : error ? (
            <p className="text-xs leading-relaxed text-red-600 dark:text-red-400">
              {t.loadFailed}: {error}
            </p>
          ) : (
            <ul className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overscroll-contain pb-2">
              {boards.length === 0 ? (
                <li className="text-xs leading-relaxed text-fg-subtle dark:text-slate-400">
                  {t.empty}
                </li>
              ) : null}
              {boards.map((board) => {
                const active = board.id === activeBoardId;
                const isOwner = user && board.user_id === user.id;
                const deleting = deletingBoardId === board.id;

                async function handleDelete() {
                  if (!window.confirm(t.deleteBoardConfirm(board.title))) return;
                  setDeletingBoardId(board.id);
                  const ok = await deleteBoard(board.id);
                  if (ok && settingsBoard?.id === board.id) {
                    setSettingsBoard(null);
                  }
                  setDeletingBoardId(null);
                }

                return (
                  <li key={board.id}>
                    <div
                      className={[
                        "group/card relative rounded-2xl border transition",
                        active
                          ? "border-transparent bg-gradient-to-br from-violet-500/[0.12] via-indigo-500/[0.1] to-sky-500/[0.12] shadow-[0_0_0_2px_rgba(124,58,237,0.45)] dark:shadow-[0_0_0_2px_rgba(167,139,250,0.45)]"
                          : "border-border-muted/80 bg-surface-muted/45 hover:border-violet-300/55 hover:bg-surface-elevated/95 dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-violet-400/35 dark:hover:bg-white/[0.07]",
                      ].join(" ")}
                    >
                      <button
                        type="button"
                        onClick={() => setActiveBoardId(board.id)}
                        aria-current={active ? "page" : undefined}
                        aria-label={`${t.selectBoardAria}: ${board.title}`}
                        className={[
                          "flex w-full items-start gap-3 rounded-2xl px-3 py-3 pb-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent dark:focus-visible:ring-offset-transparent",
                          isOwner ? "pr-[4.5rem]" : "pr-11",
                        ].join(" ")}
                      >
                        <span
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-brand-soft text-lg shadow-inner dark:shadow-none"
                          aria-hidden
                        >
                          {board.emoji}
                        </span>
                        <span className="min-w-0 flex-1 space-y-0.5">
                          <span className="block truncate text-sm font-semibold text-fg dark:text-white">
                            {board.title}
                          </span>
                          <span className="block text-xs text-fg-subtle dark:text-slate-400">
                            {t.tasks(0)}
                          </span>
                        </span>
                      </button>
                      <div className="absolute right-2 top-2 z-[1] flex items-center gap-1">
                        {isOwner ? (
                          <button
                            type="button"
                            disabled={deleting}
                            onClick={(e) => {
                              e.stopPropagation();
                              void handleDelete();
                            }}
                            aria-label={`${t.deleteBoardAria}: ${board.title}`}
                            className={[
                              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-red-500 transition hover:bg-red-50 hover:text-red-700 focus-visible:z-[2] focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-500 disabled:pointer-events-none disabled:opacity-50 dark:border-white/15 dark:text-red-400 dark:hover:bg-red-950/40 dark:hover:text-red-300",
                              active
                                ? "border-transparent bg-surface-elevated/70 opacity-100 dark:bg-white/[0.08]"
                                : "border-transparent opacity-0 group-hover/card:opacity-100",
                            ].join(" ")}
                          >
                            <TrashIcon />
                          </button>
                        ) : null}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSettingsBoard(board);
                          }}
                          aria-label={`${t.boardSettingsAria}: ${board.title}`}
                          className={[
                            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-fg-subtle transition hover:bg-interactive/55 hover:text-fg focus-visible:z-[2] focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-500 dark:border-white/15 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white",
                            active
                              ? "border-transparent bg-surface-elevated/70 opacity-100 dark:bg-white/[0.08]"
                              : "border-transparent opacity-0 group-hover/card:opacity-100",
                          ].join(" ")}
                        >
                          <GearIcon />
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="shrink-0 border-t border-border-muted/70 pt-3 dark:border-white/10">
            <button
              type="button"
              onClick={() => setCreateModalOpen(true)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-violet-400/50 bg-gradient-to-r from-violet-500/[0.06] to-sky-500/[0.06] px-3 py-2.5 text-sm font-semibold text-violet-700 transition hover:border-violet-500/70 hover:from-violet-500/10 hover:to-sky-500/10 disabled:pointer-events-none disabled:opacity-50 dark:border-violet-500/35 dark:text-violet-200 dark:hover:border-violet-400/55"
              disabled={loading}
            >
              <span
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-brand text-sm text-white shadow-sm"
                aria-hidden
              >
                +
              </span>
              {t.createBoard}
            </button>
          </div>
        </div>
      </aside>

      <CreateBoardModal open={createModalOpen} onClose={() => setCreateModalOpen(false)} />
      <BoardSettingsModal
        open={settingsBoard !== null}
        board={settingsBoard}
        onClose={() => setSettingsBoard(null)}
      />
    </>
  );
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 15.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M18 6L6 18M6 6l12 12"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}
