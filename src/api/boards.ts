import { getSupabase } from "@/lib/supabase";

export type BoardRow = {
  id: string;
  user_id: string;
  title: string;
  emoji: string;
  created_at: string;
};

export async function fetchBoards(): Promise<{
  data: BoardRow[] | null;
  error: Error | null;
}> {
  const supabase = getSupabase();
  if (!supabase)
    return { data: null, error: new Error("Supabase not configured") };

  const { data, error } = await supabase
    .from("boards")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) return { data: null, error: new Error(error.message) };
  return { data: data as BoardRow[], error: null };
}

export async function createBoard(
  title: string,
): Promise<{ data: BoardRow | null; error: Error | null }> {
  const supabase = getSupabase();
  if (!supabase)
    return { data: null, error: new Error("Supabase not configured") };

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user)
    return { data: null, error: new Error("Not authenticated") };

  const trimmed = title.trim();
  if (!trimmed) return { data: null, error: new Error("Title is empty") };

  const { data, error } = await supabase
    .from("boards")
    .insert({
      title: trimmed,
      user_id: session.user.id,
      emoji: "📋",
    })
    .select()
    .single();

  if (error) return { data: null, error: new Error(error.message) };
  return { data: data as BoardRow, error: null };
}

export async function deleteBoard(
  boardId: string,
): Promise<{ success: boolean; error: Error | null }> {
  const supabase = getSupabase();
  if (!supabase)
    return { success: false, error: new Error("Supabase not configured") };

  const { error } = await supabase.from("boards").delete().eq("id", boardId);

  if (error) return { success: false, error: new Error(error.message) };
  return { success: true, error: null };
}
