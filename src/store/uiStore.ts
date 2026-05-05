import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeMode = "dark" | "light";
export type Locale = "ru" | "en";

type UiState = {
  theme: ThemeMode;
  locale: Locale;
  sidebarOpen: boolean;
  setTheme: (t: ThemeMode) => void;
  toggleTheme: () => void;
  setLocale: (l: Locale) => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
};

export const useUiStore = create<UiState>()(
  persist(
    (set, get) => ({
      theme: "dark",
      locale: "ru",
      sidebarOpen: true,
      setTheme: (theme) => set({ theme }),
      toggleTheme: () =>
        set({ theme: get().theme === "dark" ? "light" : "dark" }),
      setLocale: (locale) => set({ locale }),
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      toggleSidebar: () => set({ sidebarOpen: !get().sidebarOpen }),
    }),
    {
      name: "ai-task-board-ui",
      partialize: (s) => ({
        theme: s.theme,
        locale: s.locale,
        sidebarOpen: s.sidebarOpen,
      }),
    },
  ),
);
