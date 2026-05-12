import type { ButtonHTMLAttributes } from "react";
import { Link } from "react-router-dom";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "gradient" | "primary" | "ghost" | "outline";
  /** If set, renders React Router `Link` with the same styles. */
  to?: string;
};

const base =
  "inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-45";

const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
  gradient: [
    base,
    "btn-glow-hover text-white shadow-glow",
    "bg-gradient-brand focus-visible:outline-violet-400",
  ].join(" "),
  primary: [
    base,
    "bg-fg text-white hover:bg-fg/90",
    "focus-visible:outline-fg focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
    "dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 dark:focus-visible:outline-white dark:focus-visible:ring-offset-slate-900",
  ].join(" "),
  ghost: [
    base,
    "text-fg-muted hover:bg-interactive/45 hover:text-fg",
    "dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white",
  ].join(" "),
  outline: [
    base,
    "border border-border-muted/95 bg-transparent text-fg hover:bg-interactive/35",
    "dark:border-white/25 dark:text-white dark:hover:bg-white/10",
  ].join(" "),
};

export function Button({
  variant = "primary",
  className = "",
  to,
  children,
  ...props
}: ButtonProps) {
  const styles = `${variants[variant]} ${className}`;

  if (to) {
    return (
      <Link to={to} className={styles}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" className={styles} {...props}>
      {children}
    </button>
  );
}
