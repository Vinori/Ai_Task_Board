import { useCallback, useEffect, useId, useState } from "react";
import type { BoardRow } from "@/api/boards";
import {
  addBoardMember,
  BOARD_MEMBER_ERROR_DUPLICATE,
  fetchBoardMembers,
  removeBoardMember,
  searchUsers,
  type BoardMemberRow,
  type ProfileRow,
} from "@/api/boardMembers";
import { Modal } from "@/components/modals/Modal";
import { useAuthStore } from "@/store/authStore";
import { useBoardsStore } from "@/store/boardsStore";
import { useUiStore } from "@/store/uiStore";

const copy = {
  ru: {
    titlePrefix: "Настройки доски",
    subtitle: "Добавьте участников, чтобы они видели эту доску.",
    searchLabel: "Поиск пользователей",
    searchPlaceholder: "Введите email или имя…",
    noResults: "Никого не найдено",
    closeLabel: "Закрыть",
    membersTitle: "Участники",
    noMembers: "Пока нет участников",
    add: "Добавить",
    remove: "Удалить",
    adding: "…",
    removing: "…",
    you: "(вы)",
    owner: "владелец",
    member: "участник",
    loadingMembers: "Загрузка…",
    hintRefresh:
      "Участник увидит доску после обновления страницы в своём аккаунте.",
    actionError: "Ошибка",
    duplicateMember: "Этот пользователь уже участник доски.",
  },
  en: {
    titlePrefix: "Board settings",
    subtitle: "Add members so they can see this board.",
    searchLabel: "Search users",
    searchPlaceholder: "Type email or name…",
    noResults: "No users found",
    closeLabel: "Close",
    membersTitle: "Members",
    noMembers: "No members yet",
    add: "Add",
    remove: "Remove",
    adding: "…",
    removing: "…",
    you: "(you)",
    owner: "owner",
    member: "member",
    loadingMembers: "Loading…",
    hintRefresh: "Invitees see the board after they refresh the page.",
    actionError: "Error",
    duplicateMember: "This user is already a member.",
  },
} as const;

type BoardSettingsModalProps = {
  open: boolean;
  board: BoardRow | null;
  onClose: () => void;
};

function hueFromString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) h = Math.imul(31, h) + s.charCodeAt(i);
  return Math.abs(h) % 360;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export function BoardSettingsModal({
  open,
  board,
  onClose,
}: BoardSettingsModalProps) {
  const locale = useUiStore((s) => s.locale);
  const currentUser = useAuthStore((s) => s.user);
  const fetchBoards = useBoardsStore((s) => s.fetchBoards);
  const t = copy[locale];
  const searchId = useId();

  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);

  const [searchResults, setSearchResults] = useState<ProfileRow[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const [members, setMembers] = useState<BoardMemberRow[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);

  const [busyUserId, setBusyUserId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const isOwner = board && currentUser && board.user_id === currentUser.id;

  const loadMembers = useCallback(async () => {
    if (!board) return;
    setMembersLoading(true);
    setActionError(null);
    const { data, error } = await fetchBoardMembers(board.id);
    if (error) setActionError(error.message);
    setMembers(data ?? []);
    setMembersLoading(false);
  }, [board]);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setSearchResults([]);
    setActionError(null);
    void loadMembers();
  }, [open, board?.id, loadMembers]);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setSearchResults([]);
      return;
    }
    let cancelled = false;
    setSearchLoading(true);
    void searchUsers(debouncedQuery).then(({ data }) => {
      if (cancelled) return;
      const memberIds = new Set(members.map((m) => m.user_id));
      const filtered = (data ?? []).filter((p) => !memberIds.has(p.id));
      setSearchResults(filtered);
      setSearchLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, members]);

  async function handleAdd(userId: string) {
    if (!board) return;
    setBusyUserId(userId);
    setActionError(null);
    const { success, error } = await addBoardMember(board.id, userId);
    if (success) {
      await loadMembers();
      setSearchResults((prev) => prev.filter((p) => p.id !== userId));
      void fetchBoards();
    } else if (error) {
      setActionError(error.message);
    }
    setBusyUserId(null);
  }

  async function handleRemove(userId: string) {
    if (!board) return;
    setBusyUserId(userId);
    setActionError(null);
    const { success, error } = await removeBoardMember(board.id, userId);
    if (success) {
      setMembers((prev) => prev.filter((m) => m.user_id !== userId));
    } else if (error) {
      setActionError(error.message);
    }
    setBusyUserId(null);
  }

  if (!board) return null;

  const title = `${t.titlePrefix}: «${board.title}»`;

  return (
    <Modal
      open={open}
      title={title}
      subtitle={t.subtitle}
      onClose={onClose}
      closeLabel={t.closeLabel}
    >
      <div className="space-y-5">
        {actionError ? (
          <p className="alert-error">
            {t.actionError}:{" "}
            {actionError === BOARD_MEMBER_ERROR_DUPLICATE
              ? t.duplicateMember
              : actionError}
          </p>
        ) : null}
        <p className="text-xs text-fg-subtle dark:text-slate-400">{t.hintRefresh}</p>
        {/* Members list */}
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-fg-subtle dark:text-slate-400">
            {t.membersTitle}
          </h3>
          {membersLoading ? (
            <p className="text-sm text-fg-subtle dark:text-slate-400">
              {t.loadingMembers}
            </p>
          ) : members.length === 0 ? (
            <p className="text-sm text-fg-subtle dark:text-slate-400">
              {t.noMembers}
            </p>
          ) : (
            <ul className="max-h-40 space-y-2 overflow-y-auto overscroll-contain">
              {members.map((m) => {
                const profile = m.profile;
                const initial =
                  (profile.display_name ?? profile.email ?? "?")
                    .trim()
                    .slice(0, 1)
                    .toUpperCase() || "?";
                const hue = hueFromString(profile.email ?? profile.id);
                const isSelf = currentUser && m.user_id === currentUser.id;
                const busy = busyUserId === m.user_id;
                return (
                  <li
                    key={m.user_id}
                    className="field-inset-row flex items-center gap-3 px-3 py-2"
                  >
                    <Avatar hue={hue} initial={initial} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-fg dark:text-white">
                        {profile.display_name ?? profile.email}{" "}
                        {isSelf ? (
                          <span className="font-normal text-fg-subtle dark:text-slate-500">
                            {t.you}
                          </span>
                        ) : null}
                      </p>
                      <p className="truncate text-xs text-fg-subtle dark:text-slate-400">
                        {profile.email} · {t.member}
                      </p>
                    </div>
                    {isOwner && !isSelf ? (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void handleRemove(m.user_id)}
                        className="shrink-0 rounded-lg px-2 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950/40"
                      >
                        {busy ? t.removing : t.remove}
                      </button>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Search section - only owner can add */}
        {isOwner ? (
          <div>
            <label
              htmlFor={searchId}
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-fg-subtle dark:text-slate-400"
            >
              {t.searchLabel}
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-subtle dark:text-slate-500">
                <SearchIcon />
              </span>
              <input
                id={searchId}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                autoComplete="off"
                className="field-input py-2.5 pl-9 pr-3"
              />
            </div>

            {query.trim() && (
              <ul className="mt-3 max-h-[min(40vh,200px)] space-y-2 overflow-y-auto overscroll-contain">
                {searchLoading ? (
                  <li className="text-center text-sm text-fg-subtle dark:text-slate-400">
                    …
                  </li>
                ) : searchResults.length === 0 ? (
                  <li className="field-inset-row px-3 py-3 text-center text-sm text-fg-subtle dark:text-slate-400">
                    {t.noResults}
                  </li>
                ) : (
                  searchResults.map((user) => {
                    const initial =
                      (user.display_name ?? user.email ?? "?")
                        .trim()
                        .slice(0, 1)
                        .toUpperCase() || "?";
                    const hue = hueFromString(user.email ?? user.id);
                    const busy = busyUserId === user.id;
                    return (
                      <li
                        key={user.id}
                        className="field-inset-row flex items-center gap-3 px-3 py-2"
                      >
                        <Avatar hue={hue} initial={initial} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-fg dark:text-white">
                            {user.display_name ?? user.email}
                          </p>
                          <p className="truncate text-xs text-fg-subtle dark:text-slate-400">
                            {user.email}
                          </p>
                        </div>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => void handleAdd(user.id)}
                          className="shrink-0 rounded-lg bg-violet-600 px-3 py-1 text-xs font-semibold text-white shadow-sm transition hover:bg-violet-700 disabled:opacity-50 dark:bg-violet-500 dark:hover:bg-violet-600"
                        >
                          {busy ? t.adding : t.add}
                        </button>
                      </li>
                    );
                  })
                )}
              </ul>
            )}
          </div>
        ) : null}
      </div>
    </Modal>
  );
}

function Avatar({ hue, initial }: { hue: number; initial: string }) {
  return (
    <span
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm"
      style={{
        background: `linear-gradient(145deg, hsl(${hue},65%,46%), hsl(${(hue + 35) % 360},72%,38%))`,
      }}
      aria-hidden
    >
      {initial}
    </span>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M10.5 18a7.5 7.5 0 110-15 7.5 7.5 0 010 15zM21 21l-4.35-4.35"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
