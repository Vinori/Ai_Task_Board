import {
  type FormEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/buttons/Button";
import { Modal } from "@/components/modals/Modal";
import { useBoardsStore } from "@/store/boardsStore";
import { useUiStore } from "@/store/uiStore";

const copy = {
  ru: {
    title: "Новая доска",
    subtitle: "Введите название — доска появится в списке слева.",
    nameLabel: "Название",
    namePlaceholder: "Например, Маркетинг Q2",
    create: "Создать",
    closeLabel: "Закрыть",
    submitting: "Создание…",
  },
  en: {
    title: "Create new board",
    subtitle: "Enter a name — the board appears in your list.",
    nameLabel: "Name",
    namePlaceholder: "e.g. Marketing Q2",
    create: "Create",
    closeLabel: "Close",
    submitting: "Creating…",
  },
} as const;

type CreateBoardModalProps = {
  open: boolean;
  onClose: () => void;
};

export function CreateBoardModal({ open, onClose }: CreateBoardModalProps) {
  const locale = useUiStore((s) => s.locale);
  const addBoard = useBoardsStore((s) => s.addBoard);
  const storeError = useBoardsStore((s) => s.error);
  const clearBoardsError = useBoardsStore((s) => s.clearError);

  const t = copy[locale];
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    setName("");
    clearBoardsError();
    const id = window.requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, [open, clearBoardsError]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setSubmitting(true);
    clearBoardsError();
    try {
      const ok = await addBoard(trimmed);
      if (ok) onClose();
    } finally {
      setSubmitting(false);
    }
  }

  const canSubmit = name.trim().length > 0 && !submitting;

  return (
    <Modal
      open={open}
      title={t.title}
      subtitle={t.subtitle}
      onClose={onClose}
      closeLabel={t.closeLabel}
    >
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
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
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t.namePlaceholder}
            maxLength={120}
            autoComplete="off"
            disabled={submitting}
            className="field-input"
          />
        </div>
        {storeError ? (
          <p className="text-sm text-red-600 dark:text-red-400">{storeError}</p>
        ) : null}
        <div className="flex justify-end pt-1">
          <Button
            type="submit"
            variant="gradient"
            disabled={!canSubmit}
            className="min-w-[7rem] px-5 py-2.5"
          >
            {submitting ? t.submitting : t.create}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
