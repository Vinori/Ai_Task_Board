import type { ReactNode } from "react";
import { useEffect } from "react";

type ModalProps = {
  open: boolean;
  title: string;
  subtitle?: string;
  children: ReactNode;
  onClose: () => void;
  /** Accessible label for the icon close control. */
  closeLabel?: string;
};

/** Minimal modal shell; extend with focus trap / portal when needed. */
export function Modal({
  open,
  title,
  subtitle,
  children,
  onClose,
  closeLabel = "Закрыть",
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex min-h-[100dvh] w-full items-center justify-center bg-overlay/50 p-4 backdrop-blur-md dark:bg-overlay/60 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={onClose}
    >
      <div
        className="glass-panel-light max-h-[min(90dvh,640px)] w-full max-w-[420px] overflow-y-auto rounded-2xl p-5 ring-1 ring-violet-500/[0.06] dark:ring-white/[0.08] sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="mb-2 h-0.5 w-10 rounded-full bg-gradient-brand shadow-glow opacity-90" />
            <h2
              id="modal-title"
              className="text-lg font-semibold tracking-tight text-fg dark:text-white"
            >
              {title}
            </h2>
            {subtitle ? (
              <p className="mt-1.5 text-sm leading-relaxed text-fg-muted dark:text-slate-400">
                {subtitle}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border-muted/75 bg-surface-muted/50 text-fg-subtle transition hover:border-border-muted hover:bg-interactive/50 hover:text-fg dark:border-white/10 dark:bg-white/5 dark:text-slate-400 dark:hover:border-white/20 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <CloseIcon />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
