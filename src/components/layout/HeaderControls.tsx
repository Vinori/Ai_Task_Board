import type { User } from "@supabase/supabase-js";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/buttons/Button";
import { AuthModal, type AuthMode } from "@/components/modals/AuthModal";
import { navCopy, type NavCopy } from "@/i18n/nav";
import { getSupabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
import type { Locale } from "@/store/uiStore";
import { useUiStore } from "@/store/uiStore";

function LocaleSwitch({
  locale,
  onChange,
}: {
  locale: Locale;
  onChange: (l: Locale) => void;
}) {
  return (
    <div
      className="flex items-center rounded-full border border-slate-200/80 bg-slate-100/80 p-0.5 dark:border-white/15 dark:bg-black/25"
      role="group"
      aria-label="Language"
    >
      {(["en", "ru"] as const).map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => onChange(code)}
          className={[
            "rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide transition",
            locale === code
              ? "bg-white text-slate-900 shadow-sm dark:bg-white/15 dark:text-white"
              : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100",
          ].join(" ")}
        >
          {code}
        </button>
      ))}
    </div>
  );
}

function hueFromString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i += 1)
    h = Math.imul(31, h) + s.charCodeAt(i);
  return Math.abs(h) % 360;
}

function UserMenu({ user, t }: { user: User; t: NavCopy }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const email =
    user.email ?? user.user_metadata?.email ?? user.phone ?? "Account";
  const initial = email.trim().slice(0, 1).toUpperCase() || "?";
  const hue = hueFromString(email);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(e: MouseEvent) {
      const el = wrapRef.current;
      if (el && !el.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  async function handleSignOut() {
    const supabase = getSupabase();
    if (!supabase) return;
    setBusy(true);
    try {
      await supabase.auth.signOut();
      setOpen(false);
      navigate("/");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={t.userMenuAria}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/30 text-sm font-bold text-white shadow-md transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500"
        style={{ background: `linear-gradient(145deg, hsl(${hue},65%,48%), hsl(${(hue + 40) % 360},70%,38%))` }}
      >
        {initial}
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-[60] mt-2 w-64 overflow-hidden rounded-xl border border-slate-200/90 bg-white py-2 shadow-lg dark:border-white/12 dark:bg-slate-900"
        >
          <p className="border-b border-slate-100 px-3 pb-2 text-xs font-medium uppercase tracking-wider text-slate-400 dark:border-white/10 dark:text-slate-500">
            {t.email}
          </p>
          <p className="max-w-full break-all px-3 py-2 text-sm text-slate-800 dark:text-slate-100">
            {email}
          </p>
          <div className="px-2 pb-1 pt-1">
            <button
              type="button"
              role="menuitem"
              disabled={busy}
              onClick={() => void handleSignOut()}
              className="w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950/40"
            >
              {busy ? t.loading : t.signOut}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function HeaderControls() {
  const locale = useUiStore((s) => s.locale);
  const setLocale = useUiStore((s) => s.setLocale);
  const theme = useUiStore((s) => s.theme);
  const toggleTheme = useUiStore((s) => s.toggleTheme);
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const user = useAuthStore((s) => s.user);
  const t = navCopy[locale];
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("signin");

  function openAuth(mode: AuthMode) {
    setAuthMode(mode);
    setAuthOpen(true);
  }

  return (
    <>
      <div className="flex max-w-[100vw] flex-shrink-0 flex-wrap items-center justify-end gap-2 sm:gap-3">
        {user ? (
          <button
            type="button"
            onClick={toggleSidebar}
            aria-expanded={sidebarOpen}
            aria-pressed={sidebarOpen}
            aria-label={
              locale === "ru"
                ? sidebarOpen
                  ? "Скрыть доски слева"
                  : "Показать доски слева"
                : sidebarOpen
                  ? "Hide left boards panel"
                  : "Show left boards panel"
            }
            className={`flex h-9 w-9 items-center justify-center rounded-full border transition sm:h-9 sm:w-9 ${sidebarOpen ? "border-violet-300/70 bg-gradient-brand-soft text-violet-700 dark:border-violet-500/40 dark:text-violet-200" : "border-slate-200/80 bg-white/70 text-slate-700 hover:bg-white dark:border-white/15 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/15"}`}
          >
            <BoardsPanelIcon />
          </button>
        ) : null}
        <div className="hidden sm:block">
          <LocaleSwitch locale={locale} onChange={setLocale} />
        </div>
        <button
          type="button"
          onClick={toggleTheme}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/80 bg-white/70 text-slate-700 transition hover:bg-white dark:border-white/15 dark:bg-white/10 dark:text-amber-200 dark:hover:bg-white/15"
          aria-label={theme === "dark" ? "Light mode" : "Dark mode"}
        >
          {theme === "dark" ? <SunIcon /> : <MoonIcon />}
        </button>
        {user ? (
          <UserMenu user={user} t={t} />
        ) : (
          <>
            <Button
              variant="outline"
              className="whitespace-nowrap px-3 py-2 text-xs sm:px-4 sm:text-sm"
              onClick={() => openAuth("signin")}
            >
              {t.signIn}
            </Button>
            <Button
              variant="primary"
              className="whitespace-nowrap px-3 py-2 text-xs sm:px-4 sm:text-sm"
              onClick={() => openAuth("signup")}
            >
              {t.signUp}
            </Button>
            <Button
              variant="gradient"
              to="/#board"
              className="whitespace-nowrap px-3 py-2 text-xs sm:px-4 sm:text-sm"
            >
              <span className="max-w-[9rem] truncate sm:max-w-none">
                {t.tryFree}
              </span>
            </Button>
          </>
        )}
      </div>
      <AuthModal
        open={authOpen}
        mode={authMode}
        locale={locale}
        onClose={() => setAuthOpen(false)}
        onSwitchMode={setAuthMode}
      />
    </>
  );
}

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.75" />
      <path
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M21 14.5A8.5 8.5 0 0 1 9.5 3a8.5 8.5 0 1 0 11.5 11.5Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BoardsPanelIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="3"
        y="5"
        width="14"
        height="11"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <path
        d="M10 16V8"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M7 14h10"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}
