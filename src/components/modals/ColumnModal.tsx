import {
  type FormEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/buttons/Button";
import { Modal } from "@/components/modals/Modal";
import { useTasks } from "@/hooks/useTasks";
import { useUiStore } from "@/store/uiStore";

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

const copy = {
  ru: {
    createTitle: "Новая колонка",
    editTitle: "Редактировать колонку",
    createSubtitle: "Задайте название и цвет акцента.",
    editSubtitle: "Измените название или цвет колонки.",
    nameLabel: "Название",
    namePlaceholder: "Например, На проверке",
    colorLabel: "Цвет",
    resetColor: "По умолчанию",
    customColor: "Свой цвет",
    saveCreate: "Добавить",
    saveEdit: "Сохранить",
    deleteColumn: "Удалить колонку",
    confirmDeleteColumn:
      "Удалить колонку и все карточки в ней ({count})? Это действие необратимо.",
    cannotDeleteLastColumn:
      "Нельзя удалить последнюю колонку.",
    closeLabel: "Закрыть",
  },
  en: {
    createTitle: "New column",
    editTitle: "Edit column",
    createSubtitle: "Set a name and accent color.",
    editSubtitle: "Change the column name or accent color.",
    nameLabel: "Name",
    namePlaceholder: "e.g. In review",
    colorLabel: "Color",
    resetColor: "Default",
    customColor: "Custom",
    saveCreate: "Add column",
    saveEdit: "Save",
    deleteColumn: "Delete column",
    confirmDeleteColumn:
      "Delete this column and all {count} card(s) in it? This cannot be undone.",
    cannotDeleteLastColumn: "You cannot delete the last column.",
    closeLabel: "Close",
  },
} as const;

export type ColumnModalProps = {
  open: boolean;
  mode: "create" | "edit";
  columnId?: string;
  initialTitle?: string;
  initialColor?: string;
  onClose: () => void;
};

export function ColumnModal({
  open,
  mode,
  columnId,
  initialTitle = "",
  initialColor,
  onClose,
}: ColumnModalProps) {
  const locale = useUiStore((s) => s.locale);
  const { addColumn, updateColumn, columns, removeColumn } = useTasks();
  const t = copy[locale];

  const [title, setTitle] = useState("");
  /** null = no accent stored */
  const [accent, setAccent] = useState<string | null>(null);
  const titleId = useId();
  const colorInputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setTitle(initialTitle);
    setAccent(initialColor ?? null);
    const id = window.requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, [open, initialTitle, initialColor]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;

    if (mode === "create") {
      addColumn({
        title: trimmed,
        ...(accent ? { color: accent } : {}),
      });
      onClose();
      return;
    }

    if (!columnId) return;
    const patch: { title: string; color?: string | undefined } = {
      title: trimmed,
    };
    if (accent === null) patch.color = undefined;
    else patch.color = accent;
    updateColumn(columnId, patch);
    onClose();
  }

  function handleDeleteColumn() {
    if (mode !== "edit" || !columnId) return;
    if (columns.length <= 1) {
      window.alert(t.cannotDeleteLastColumn);
      return;
    }
    const col = columns.find((c) => c.id === columnId);
    const count = col?.tasks.length ?? 0;
    const msg = t.confirmDeleteColumn.replace(/\{count\}/g, String(count));
    if (!window.confirm(msg)) return;
    if (!removeColumn(columnId)) return;
    onClose();
  }

  const canSubmit = title.trim().length > 0;

  return (
    <Modal
      open={open}
      title={mode === "create" ? t.createTitle : t.editTitle}
      subtitle={mode === "create" ? t.createSubtitle : t.editSubtitle}
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
            maxLength={120}
            autoComplete="off"
            className="field-input"
          />
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
            mode === "edit" && columnId ? "justify-between" : "justify-end",
          ].join(" ")}
        >
          {mode === "edit" && columnId ?
            <Button
              type="button"
              variant="outline"
              className="border-red-500/40 text-red-600 hover:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/15"
              onClick={handleDeleteColumn}
            >
              {t.deleteColumn}
            </Button>
          : null}
          <Button
            type="submit"
            variant="gradient"
            disabled={!canSubmit}
            className="min-w-[7rem] px-5 py-2.5"
          >
            {mode === "create" ? t.saveCreate : t.saveEdit}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
