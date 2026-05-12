import {
  type FormEvent,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  fetchBoardMembers,
  fetchProfileById,
  type ProfileRow,
} from "@/api/boardMembers";
import { Button } from "@/components/buttons/Button";
import { Modal } from "@/components/modals/Modal";
import { useTasks } from "@/hooks/useTasks";
import { useUiStore } from "@/store/uiStore";
import type { TaskAssignee } from "@/types/task";

const PRESET_HEX = [
  "#7c3aed",
  "#6366f1",
  "#0ea5e9",
  "#10b981",
  "#eab308",
  "#f43f5e",
  "#64748b",
] as const;

const FALLBACK_PICKER = "#6366f1";

const ASSIGN_NONE = "";
/** Assignee stored on task but no longer on board participant list */
const ASSIGN_EXTRA = "__extra__";

function profileLabel(p: ProfileRow): string {
  return (
    p.display_name?.trim() ||
    p.email?.trim() ||
    p.id.slice(0, 8)
  ).trim();
}

type Participant = { userId: string; label: string };

const copy = {
  ru: {
    title: "Новая карточка",
    subtitle: "Задайте название и при необходимости детали.",
    nameLabel: "Название",
    namePlaceholder: "Например, Оформить отчёт",
    descriptionLabel: "Описание",
    descriptionPlaceholder: "Контекст, критерии готовности…",
    colorLabel: "Цвет",
    resetColor: "По умолчанию",
    customColor: "Свой цвет",
    assigneeLabel: "Исполнитель",
    assigneeNone: "Не назначено",
    assigneesLoading: "Загрузка участников…",
    assigneesError: "Не удалось загрузить участников",
    assigneesEmpty:
      "На доске пока нет участников. Добавьте их в настройках доски.",
    assigneeFormer:
      "не в списке участников",
    create: "Создать",
    editTitle: "Редактировать карточку",
    editSubtitle: "Обновите поля задачи.",
    save: "Сохранить",
    deleteCard: "Удалить карточку",
    confirmDeleteCard:
      "Удалить эту карточку безвозвратно?",
    closeLabel: "Закрыть",
    assigneeExpand: "Открыть список исполнителей",
    assigneeCollapse: "Свернуть список исполнителей",
  },
  en: {
    title: "New card",
    subtitle: "Add a title and optional details.",
    nameLabel: "Title",
    namePlaceholder: "e.g. Ship the report",
    descriptionLabel: "Description",
    descriptionPlaceholder: "Context, acceptance criteria…",
    colorLabel: "Color",
    resetColor: "Default",
    customColor: "Custom",
    assigneeLabel: "Assignee",
    assigneeNone: "Unassigned",
    assigneesLoading: "Loading participants…",
    assigneesError: "Could not load board participants",
    assigneesEmpty:
      "No participants on this board yet. Add them in board settings.",
    assigneeFormer: "not on participant list",
    create: "Create",
    editTitle: "Edit card",
    editSubtitle: "Update task fields.",
    save: "Save",
    deleteCard: "Delete card",
    confirmDeleteCard: "Delete this card permanently?",
    closeLabel: "Close",
    assigneeExpand: "Open assignee list",
    assigneeCollapse: "Collapse assignee list",
  },
} as const;

type CreateTaskModalProps = {
  open: boolean;
  columnId: string | null;
  onClose: () => void;
  mode?: "create" | "edit";
  taskId?: string | null;
  initialTitle?: string;
  initialDescription?: string;
  initialColor?: string;
  initialAssignee?: TaskAssignee | null;
  /** When set, assignee options load from board_members (+ owner). Guest/local board: omit or null. */
  participantBoardId?: string | null;
  boardOwnerUserId?: string | null;
};

export function CreateTaskModal({
  open,
  columnId,
  onClose,
  mode = "create",
  taskId = null,
  initialTitle = "",
  initialDescription = "",
  initialColor,
  initialAssignee,
  participantBoardId = null,
  boardOwnerUserId = null,
}: CreateTaskModalProps) {
  const locale = useUiStore((s) => s.locale);
  const { addTask, updateTask, removeTask } = useTasks();
  const t = copy[locale];

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [accent, setAccent] = useState<string | null>(null);
  const [assigneeValue, setAssigneeValue] = useState<string>(ASSIGN_NONE);
  const [extraAssignee, setExtraAssignee] = useState<TaskAssignee | null>(null);

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [participantsLoading, setParticipantsLoading] = useState(false);
  const [participantsError, setParticipantsError] = useState<string | null>(
    null,
  );

  const [assigneePickerOpen, setAssigneePickerOpen] = useState(false);
  const assigneeSectionRef = useRef<HTMLDivElement>(null);

  const titleId = useId();
  const descId = useId();
  const colorInputId = useId();
  const assigneeLabelId = useId();
  const assigneeTriggerId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open || !participantBoardId) {
      setParticipants([]);
      setParticipantsLoading(false);
      setParticipantsError(null);
      return;
    }

    let cancelled = false;
    setParticipantsLoading(true);
    setParticipantsError(null);

    void (async () => {
      const labelsByUserId = new Map<string, string>();

      if (boardOwnerUserId) {
        const { data: ownerProf } = await fetchProfileById(boardOwnerUserId);
        if (!cancelled && ownerProf) {
          labelsByUserId.set(ownerProf.id, profileLabel(ownerProf));
        }
      }

      const { data: members, error } = await fetchBoardMembers(
        participantBoardId,
      );
      if (cancelled) return;
      if (error) {
        setParticipantsError(error.message);
        setParticipants([]);
        setParticipantsLoading(false);
        return;
      }

      for (const m of members ?? []) {
        labelsByUserId.set(m.user_id, profileLabel(m.profile));
      }

      const collator =
        locale === "ru" ? new Intl.Collator("ru") : new Intl.Collator("en");
      const next = Array.from(labelsByUserId.entries())
        .map(([userId, label]) => ({ userId, label }))
        .sort((a, b) => collator.compare(a.label, b.label));

      setParticipants(next);
      setParticipantsLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [open, participantBoardId, boardOwnerUserId, locale]);

  useEffect(() => {
    if (!open) return;

    if (mode === "create") {
      setExtraAssignee(null);
      setTitle("");
      setDescription("");
      setAccent(null);
      setAssigneeValue(ASSIGN_NONE);
      const id = window.requestAnimationFrame(() => inputRef.current?.focus());
      return () => cancelAnimationFrame(id);
    }

    setTitle(initialTitle);
    setDescription(initialDescription ?? "");
    setAccent(initialColor ?? null);
    setAssigneeValue(ASSIGN_NONE);
    setExtraAssignee(null);

    const id = window.requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, [
    open,
    mode,
    initialTitle,
    initialDescription,
    initialColor,
    taskId,
  ]);

  useEffect(() => {
    if (!open || mode !== "edit") return;

    const a = initialAssignee ?? null;
    if (!a) {
      setAssigneeValue(ASSIGN_NONE);
      setExtraAssignee(null);
      return;
    }

    if (!participantBoardId) {
      setExtraAssignee(a);
      setAssigneeValue(ASSIGN_EXTRA);
      return;
    }

    if (participantsLoading) return;

    const hit = participants.some((p) => p.userId === a.id);
    if (hit) {
      setAssigneeValue(a.id);
      setExtraAssignee(null);
    } else {
      setExtraAssignee(a);
      setAssigneeValue(ASSIGN_EXTRA);
    }
  }, [
    open,
    mode,
    initialAssignee,
    participantBoardId,
    participantsLoading,
    participants,
    taskId,
  ]);

  const assigneeOptions = useMemo(() => {
    const opts: { value: string; label: string }[] = [
      { value: ASSIGN_NONE, label: t.assigneeNone },
    ];
    if (extraAssignee) {
      opts.push({
        value: ASSIGN_EXTRA,
        label: `${extraAssignee.label} (${t.assigneeFormer})`,
      });
    }
    for (const p of participants) {
      opts.push({ value: p.userId, label: p.label });
    }
    return opts;
  }, [participants, extraAssignee, t.assigneeNone, t.assigneeFormer]);

  const assigneeDisabled =
    Boolean(participantBoardId) && participantsLoading;

  const selectedAssigneeLabel = useMemo(() => {
    const hit = assigneeOptions.find((o) => o.value === assigneeValue);
    return hit?.label ?? t.assigneeNone;
  }, [assigneeOptions, assigneeValue, t.assigneeNone]);

  useEffect(() => {
    if (!open) setAssigneePickerOpen(false);
  }, [open]);

  useEffect(() => {
    if (assigneeDisabled) setAssigneePickerOpen(false);
  }, [assigneeDisabled]);

  useEffect(() => {
    if (!assigneePickerOpen) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setAssigneePickerOpen(false);
    }

    function onPointerDown(e: PointerEvent) {
      const el = assigneeSectionRef.current;
      if (el && !el.contains(e.target as Node)) {
        setAssigneePickerOpen(false);
      }
    }

    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown, true);
    };
  }, [assigneePickerOpen]);

  function resolveAssignee(): TaskAssignee | undefined {
    if (assigneeValue === ASSIGN_NONE) return undefined;
    if (assigneeValue === ASSIGN_EXTRA && extraAssignee) {
      return extraAssignee;
    }
    const p = participants.find((x) => x.userId === assigneeValue);
    if (p) return { id: p.userId, label: p.label };
    return undefined;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed || !columnId) return;

    const assignee = resolveAssignee();
    const descTrim = description.trim();

    if (mode === "edit") {
      if (!taskId) return;
      updateTask(columnId, taskId, {
        title: trimmed,
        description: descTrim ? descTrim : undefined,
        color: accent ?? undefined,
        assignee: assignee ?? undefined,
      });
      onClose();
      return;
    }

    addTask(columnId, {
      title: trimmed,
      ...(descTrim ? { description: descTrim } : {}),
      ...(accent ? { color: accent } : {}),
      ...(assignee ? { assignee } : {}),
    });
    onClose();
  }

  function handleDeleteCard() {
    if (!columnId || !taskId) return;
    if (!window.confirm(t.confirmDeleteCard)) return;
    removeTask(columnId, taskId);
    onClose();
  }

  const canSubmit =
    title.trim().length > 0 &&
    Boolean(columnId) &&
    (mode !== "edit" || Boolean(taskId));

  const modalTitle = mode === "edit" ? t.editTitle : t.title;
  const modalSubtitle = mode === "edit" ? t.editSubtitle : t.subtitle;
  const submitLabel = mode === "edit" ? t.save : t.create;

  return (
    <Modal
      open={open}
      title={modalTitle}
      subtitle={modalSubtitle}
      onClose={onClose}
      closeLabel={t.closeLabel}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor={titleId}
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-fg-subtle dark:text-slate-400"
          >
            {t.nameLabel}
          </label>
          <input
            ref={inputRef}
            id={titleId}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t.namePlaceholder}
            maxLength={200}
            autoComplete="off"
            className="field-input"
          />
        </div>

        <div>
          <label
            htmlFor={descId}
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-fg-subtle dark:text-slate-400"
          >
            {t.descriptionLabel}
          </label>
          <textarea
            id={descId}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t.descriptionPlaceholder}
            rows={3}
            maxLength={2000}
            className="field-input resize-y"
          />
        </div>

        <div ref={assigneeSectionRef}>
          <label
            id={assigneeLabelId}
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-fg-subtle dark:text-slate-400"
          >
            {t.assigneeLabel}
          </label>
          {participantBoardId && participantsLoading ? (
            <p className="text-sm text-fg-subtle dark:text-slate-400">
              {t.assigneesLoading}
            </p>
          ) : null}
          {participantBoardId && participantsError ? (
            <p className="mb-2 text-sm text-red-600 dark:text-red-400">
              {t.assigneesError}: {participantsError}
            </p>
          ) : null}
          {participantBoardId &&
          !participantsLoading &&
          !participantsError &&
          participants.length === 0 ? (
            <p className="mb-2 text-xs leading-relaxed text-fg-subtle dark:text-slate-400">
              {t.assigneesEmpty}
            </p>
          ) : null}

          <div
            className={[
              "field-combo-shell overflow-hidden shadow-inner shadow-slate-900/[0.02] transition-opacity dark:shadow-none",
              assigneeDisabled ? "pointer-events-none opacity-55" : "",
            ].join(" ")}
          >
            <button
              id={assigneeTriggerId}
              type="button"
              disabled={assigneeDisabled}
              aria-expanded={assigneePickerOpen}
              aria-haspopup="listbox"
              aria-controls={`${assigneeTriggerId}-listbox`}
              aria-labelledby={assigneeLabelId}
              title={
                assigneePickerOpen ? t.assigneeCollapse : t.assigneeExpand
              }
              onClick={() =>
                setAssigneePickerOpen((prev) =>
                  assigneeDisabled ? prev : !prev,
                )
              }
              className={[
                "flex w-full items-center gap-3 px-3 py-2.5 text-left outline-none transition",
                "hover:bg-interactive/45 dark:hover:bg-white/[0.06]",
                "focus-visible:ring-2 focus-visible:ring-violet-500/35 focus-visible:ring-offset-2 focus-visible:ring-offset-ringoffset dark:focus-visible:ring-offset-slate-900",
              ].join(" ")}
            >
              <AssigneeAvatarChip label={selectedAssigneeLabel} muted={assigneeValue === ASSIGN_NONE} />
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-fg dark:text-slate-100">
                {selectedAssigneeLabel}
              </span>
              <ChevronDownIcon
                className={[
                  "h-5 w-5 shrink-0 text-fg-subtle transition dark:text-slate-500",
                  assigneePickerOpen ? "rotate-180" : "",
                ].join(" ")}
              />
            </button>

            {assigneePickerOpen && !assigneeDisabled ? (
              <div
                id={`${assigneeTriggerId}-listbox`}
                role="listbox"
                aria-labelledby={assigneeLabelId}
                className="max-h-[min(14rem,40vh)] overflow-y-auto overscroll-contain border-t border-border-muted/85 py-1 dark:border-white/10"
              >
                {assigneeOptions.map((opt) => {
                  const selected = opt.value === assigneeValue;
                  const mutedChip = opt.value === ASSIGN_NONE;
                  return (
                    <button
                      key={opt.value || "none"}
                      type="button"
                      role="option"
                      aria-selected={selected}
                      title={opt.label}
                      onClick={() => {
                        setAssigneeValue(opt.value);
                        setAssigneePickerOpen(false);
                      }}
                      className={[
                        "flex w-full items-center gap-3 px-3 py-2 text-left text-sm outline-none transition",
                        selected ?
                          "bg-violet-500/[0.12] text-violet-950 ring-inset ring-1 ring-violet-500/25 dark:bg-violet-500/15 dark:text-violet-100 dark:ring-violet-400/20"
                        : "text-fg hover:bg-interactive/50 dark:text-slate-100 dark:hover:bg-white/[0.07]",
                      ].join(" ")}
                    >
                      <AssigneeAvatarChip
                        label={opt.label}
                        muted={mutedChip}
                      />
                      <span className="min-w-0 flex-1 truncate">{opt.label}</span>
                      {selected ? (
                        <CheckIcon className="h-4 w-4 shrink-0 text-violet-600 dark:text-violet-300" />
                      ) : (
                        <span className="h-4 w-4 shrink-0" aria-hidden />
                      )}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>

        <div>
          <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-fg-subtle dark:text-slate-400">
            {t.colorLabel}
          </span>
          <div className="flex flex-wrap gap-2">
            {PRESET_HEX.map((hex) => (
              <button
                key={hex}
                type="button"
                aria-label={hex}
                title={hex}
                onClick={() => setAccent(hex)}
                className={[
                  "h-9 w-9 rounded-full border-2 shadow-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500",
                  accent === hex
                    ? "border-fg ring-2 ring-fg/20 dark:border-white dark:ring-white/25"
                    : "border-border-muted/90 hover:scale-105 dark:border-white/20",
                ].join(" ")}
                style={{ backgroundColor: hex }}
              />
            ))}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <label
              htmlFor={colorInputId}
              className="text-xs font-medium text-fg-muted dark:text-slate-400"
            >
              {t.customColor}
            </label>
            <input
              id={colorInputId}
              type="color"
              value={accent ?? FALLBACK_PICKER}
              onChange={(e) => setAccent(e.target.value)}
              className="h-9 w-14 cursor-pointer rounded-lg border border-border-muted/90 bg-surface-muted/80 p-0.5 dark:border-white/15 dark:bg-white/[0.06]"
            />
            <Button
              type="button"
              variant="ghost"
              className="text-xs"
              onClick={() => setAccent(null)}
            >
              {t.resetColor}
            </Button>
          </div>
        </div>

        <div
          className={[
            "flex items-center gap-2 pt-1",
            mode === "edit" && taskId && columnId ?
              "justify-between"
            : "justify-end",
          ].join(" ")}
        >
          {mode === "edit" && taskId && columnId ?
            <Button
              type="button"
              variant="outline"
              className="border-red-500/40 text-red-600 hover:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/15"
              onClick={handleDeleteCard}
            >
              {t.deleteCard}
            </Button>
          : null}
          <Button
            type="submit"
            variant="gradient"
            disabled={!canSubmit}
            className="min-w-[7rem] px-5 py-2.5"
          >
            {submitLabel}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function AssigneeAvatarChip({
  label,
  muted,
}: {
  label: string;
  muted?: boolean;
}) {
  const letter = muted ?
      "—"
    : (label.trim().slice(0, 1).toUpperCase() || "?");
  return (
    <span
      className={[
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-semibold",
        muted ?
          "border border-dashed border-border-muted/95 bg-surface-muted/80 text-fg-subtle dark:border-white/22 dark:bg-white/[0.06] dark:text-slate-400"
        : "bg-gradient-to-br from-violet-500/30 via-indigo-500/18 to-sky-500/22 text-violet-900 shadow-inner dark:from-violet-500/40 dark:via-indigo-500/28 dark:to-sky-500/18 dark:text-violet-100",
      ].join(" ")}
      aria-hidden
    >
      {letter}
    </span>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d="M20 6L9 17l-5-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
