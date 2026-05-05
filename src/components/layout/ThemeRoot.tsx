import { useEffect, type ReactNode } from "react";
import { useUiStore } from "@/store/uiStore";

export function ThemeRoot({ children }: { children: ReactNode }) {
  const theme = useUiStore((s) => s.theme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return children;
}
