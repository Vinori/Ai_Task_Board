import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { navCopy } from "@/i18n/nav";
import { useUiStore } from "@/store/uiStore";

const navItems = (t: (typeof navCopy)["en"]) =>
  [
    { to: "/features", label: t.features, end: false as const },
    { to: "/how-it-works", label: t.howItWorks, end: false as const },
    { to: "/", label: t.overview, end: true as const },
    { to: "/pricing", label: t.pricing, end: false as const },
  ] as const;

export function MainNav() {
  const locale = useUiStore((s) => s.locale);
  const t = navCopy[locale];
  const items = navItems(t);
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const desktopLink = ({ isActive }: { isActive: boolean }) =>
    [
      "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
      isActive
        ? "bg-slate-200/85 text-slate-900 shadow-sm dark:bg-violet-500/25 dark:text-white dark:shadow-none dark:ring-1 dark:ring-violet-400/35"
        : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white",
    ].join(" ");

  const mobileLink = ({ isActive }: { isActive: boolean }) =>
    [
      "block rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
      isActive
        ? "bg-slate-200/90 text-slate-900 dark:bg-violet-500/20 dark:text-white dark:ring-1 dark:ring-violet-400/30"
        : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-white/5",
    ].join(" ");

  return (
    <>
      <nav
        className="hidden items-center gap-0.5 rounded-full border border-slate-200/70 bg-slate-100/55 p-0.5 backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.05] lg:flex"
        aria-label={t.primaryNavAria}
      >
        {items.map((item) => (
          <NavLink
            key={`${item.to}-${item.end}`}
            to={item.to}
            end={item.end}
            className={desktopLink}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="relative shrink-0 lg:hidden" ref={wrapRef}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-haspopup="true"
          aria-controls="site-nav-menu"
          aria-label={t.navMenuAria}
          className="flex h-9 items-center gap-2 rounded-xl border border-slate-200/80 bg-white/80 px-2.5 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-white dark:border-white/15 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/[0.14]"
        >
          <MenuGlyph open={open} />
          <span className="sr-only sm:not-sr-only sm:max-w-[7rem] sm:truncate">
            {t.navMenu}
          </span>
        </button>
        {open ? (
          <>
            <button
              type="button"
              className="fixed inset-0 z-40 cursor-default bg-slate-900/25 backdrop-blur-[2px] dark:bg-black/45"
              aria-label={t.modalClose}
              onClick={() => setOpen(false)}
            />
            <div
              id="site-nav-menu"
              role="menu"
              className="absolute left-0 top-[calc(100%+0.5rem)] z-50 w-[min(calc(100vw-2rem),16rem)] rounded-2xl border border-slate-200/90 bg-white/95 p-1.5 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/95 dark:shadow-card-dark"
            >
              {items.map((item) => (
                <NavLink
                  key={`${item.to}-${item.end}-m`}
                  role="menuitem"
                  to={item.to}
                  end={item.end}
                  className={mobileLink}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </>
  );
}

function MenuGlyph({ open }: { open: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      className="shrink-0"
      aria-hidden
    >
      {open ? (
        <path
          d="M6 6l12 12M18 6L6 18"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      ) : (
        <path
          d="M5 7h14M5 12h14M5 17h14"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}
