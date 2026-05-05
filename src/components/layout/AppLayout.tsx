import { Outlet } from "react-router-dom";
import { BoardsSidebar } from "@/components/layout/BoardsSidebar";
import { HeaderControls } from "@/components/layout/HeaderControls";
import { MainNav } from "@/components/layout/MainNav";
import { useAuthStore } from "@/store/authStore";

export function AppLayout() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/75 shadow-sm backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/45 dark:shadow-[0_8px_32px_-12px_rgba(0,0,0,0.5)]">
        <div className="mx-auto flex w-full max-w-[88rem] items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-4 md:gap-6 lg:gap-8">
            <a href="/" className="flex shrink-0 items-center gap-2.5 no-underline">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-brand text-xs font-bold tracking-tight text-white shadow-glow">
                AI
              </span>
              <span className="truncate text-sm font-semibold tracking-tight text-slate-900 dark:text-white">
                Доска задач
              </span>
            </a>
            <MainNav />
          </div>
          <HeaderControls />
        </div>
      </header>
      <div className="mx-auto flex w-full max-w-[88rem] min-h-0 flex-1 gap-0">
        {user ? <BoardsSidebar /> : null}
        <main className="min-w-0 flex-1 px-4 py-8 sm:px-6 sm:py-10">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
