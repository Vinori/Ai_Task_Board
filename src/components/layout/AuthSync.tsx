import { useEffect, type ReactNode } from "react";
import { getSupabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";

export function AuthSync({ children }: { children: ReactNode }) {
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      setUser(null);
      return;
    }

    let cancelled = false;

    void supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      setUser(data.session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [setUser]);

  return children;
}
