import { Link } from "react-router-dom";
import { Button } from "@/components/buttons/Button";
import { navCopy } from "@/i18n/nav";
import { useAuthStore } from "@/store/authStore";
import { useUiStore } from "@/store/uiStore";

export function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const locale = useUiStore((s) => s.locale);
  const t = navCopy[locale];

  const email =
    user?.email ??
    user?.user_metadata?.email ??
    user?.phone ??
    null;

  const title = email
    ? t.dashboardWelcomeEmail.replace("{{email}}", email)
    : locale === "ru"
      ? "Дашборд"
      : "Dashboard";

  const subtitle = user
    ? t.dashboardSubtitleLoggedIn
    : locale === "ru"
      ? "Здесь будет рабочая область после входа. Скоро — доски и синхронизация."
      : "Your workspace will appear here after sign-in. Boards and sync coming soon.";

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
        {title}
      </h1>
      <p className="max-w-xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">
        {subtitle}
      </p>
      {user ? (
        <div>
          <Button variant="gradient" to="/#board" className="px-4 py-2.5">
            {t.goToBoard}
          </Button>
        </div>
      ) : null}
      {!user ? (
        <p className="text-xs text-slate-500 dark:text-slate-400">
          <Link
            to="/"
            className="font-semibold text-violet-600 underline-offset-2 hover:underline dark:text-violet-400"
          >
            {locale === "ru" ? "На главную" : "Home"}
          </Link>
        </p>
      ) : null}
    </div>
  );
}
