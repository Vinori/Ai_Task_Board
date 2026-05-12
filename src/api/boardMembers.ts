import { getSupabase } from "@/lib/supabase";

/** Columns returned by profile selects (keep in sync with nested `profiles (...)`). */
export const PROFILE_SELECT =
  "id,email,display_name,created_at,role,skills_description,about";

export type ProfileRow = {
  id: string;
  email: string | null;
  display_name: string | null;
  created_at: string;
  /** User-declared role (job/title), optional — not board_members.role */
  role: string | null;
  skills_description: string | null;
  /** Bio / about me (optional) */
  about: string | null;
};

export type BoardMemberRow = {
  board_id: string;
  user_id: string;
  role: string;
  added_at: string;
  profile: ProfileRow;
};

/** Avoid breaking PostgREST .or() parsing and wildcards in ilike. */
function sanitizeIlikeQuery(q: string): string {
  return q
    .trim()
    .replace(/\\/g, "\\\\")
    .replace(/%/g, "\\%")
    .replace(/_/g, "\\_")
    .replace(/,/g, " ");
}

export async function searchUsers(
  query: string,
): Promise<{ data: ProfileRow[] | null; error: Error | null }> {
  const supabase = getSupabase();
  if (!supabase)
    return { data: null, error: new Error("Supabase not configured") };

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user)
    return { data: null, error: new Error("Not authenticated") };

  const raw = query.trim();
  if (!raw) return { data: [], error: null };

  const safe = sanitizeIlikeQuery(raw);
  const pattern = `%${safe}%`;

  const base = () =>
    supabase
      .from("profiles")
      .select(PROFILE_SELECT)
      .neq("id", session.user.id)
      .limit(20);

  const [emailRes, nameRes] = await Promise.all([
    base().ilike("email", pattern),
    base().ilike("display_name", pattern),
  ]);

  if (emailRes.error)
    return { data: null, error: new Error(emailRes.error.message) };
  if (nameRes.error)
    return { data: null, error: new Error(nameRes.error.message) };

  const merged = new Map<string, ProfileRow>();
  for (const row of [...(emailRes.data ?? []), ...(nameRes.data ?? [])]) {
    merged.set(row.id, row as ProfileRow);
  }
  const data = Array.from(merged.values()).slice(0, 20);

  return { data, error: null };
}

/** Single profile row; uses same RLS as nested selects on board_members. */
export async function fetchProfileById(
  userId: string,
): Promise<{ data: ProfileRow | null; error: Error | null }> {
  const supabase = getSupabase();
  if (!supabase)
    return { data: null, error: new Error("Supabase not configured") };

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user)
    return { data: null, error: new Error("Not authenticated") };

  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_SELECT)
    .eq("id", userId)
    .maybeSingle();

  if (error) return { data: null, error: new Error(error.message) };
  return { data: data as ProfileRow | null, error: null };
}

type BoardMemberQueryRow = {
  board_id: string;
  user_id: string;
  role: string;
  added_at: string;
  profiles: ProfileRow | ProfileRow[] | null;
};

export async function fetchBoardMembers(
  boardId: string,
): Promise<{ data: BoardMemberRow[] | null; error: Error | null }> {
  const supabase = getSupabase();
  if (!supabase)
    return { data: null, error: new Error("Supabase not configured") };

  const { data, error } = await supabase
    .from("board_members")
    .select(
      `
      board_id,
      user_id,
      role,
      added_at,
      profiles (
        id,
        email,
        display_name,
        created_at,
        role,
        skills_description,
        about
      )
    `,
    )
    .eq("board_id", boardId)
    .order("added_at", { ascending: true });

  if (error) return { data: null, error: new Error(error.message) };

  const members = (data as BoardMemberQueryRow[] | null | undefined)?.map(
    (row) => {
      const nested = row.profiles;
      const prof = Array.isArray(nested) ? nested[0] : nested;
      const profile: ProfileRow =
        prof ?? {
          id: row.user_id,
          email: null,
          display_name: null,
          created_at: "",
          role: null,
          skills_description: null,
          about: null,
        };
      return {
        board_id: row.board_id,
        user_id: row.user_id,
        role: row.role,
        added_at: row.added_at,
        profile,
      };
    },
  );

  return { data: members ?? [], error: null };
}

/** Stable code for localized UI messaging */
export const BOARD_MEMBER_ERROR_DUPLICATE = "duplicate_member";

function mapMemberError(msg: string, code?: string): string {
  if (code === "23505" || msg.includes("duplicate key"))
    return BOARD_MEMBER_ERROR_DUPLICATE;
  return msg;
}

export async function addBoardMember(
  boardId: string,
  userId: string,
): Promise<{ success: boolean; error: Error | null }> {
  const supabase = getSupabase();
  if (!supabase)
    return { success: false, error: new Error("Supabase not configured") };

  const { error } = await supabase.from("board_members").insert({
    board_id: boardId,
    user_id: userId,
    role: "member",
  });

  if (error)
    return {
      success: false,
      error: new Error(
        mapMemberError(error.message, (error as { code?: string }).code),
      ),
    };
  return { success: true, error: null };
}

export async function removeBoardMember(
  boardId: string,
  userId: string,
): Promise<{ success: boolean; error: Error | null }> {
  const supabase = getSupabase();
  if (!supabase)
    return { success: false, error: new Error("Supabase not configured") };

  const { error } = await supabase
    .from("board_members")
    .delete()
    .eq("board_id", boardId)
    .eq("user_id", userId);

  if (error) return { success: false, error: new Error(error.message) };
  return { success: true, error: null };
}
