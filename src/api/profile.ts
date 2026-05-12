import { PROFILE_SELECT, type ProfileRow } from "@/api/boardMembers";
import { getSupabase } from "@/lib/supabase";

export type UpdateMyProfilePayload = {
  display_name: string | null;
  role: string | null;
  about: string | null;
};

/** Load the signed-in user's row from `profiles`. */
export async function fetchMyProfile(): Promise<{
  data: ProfileRow | null;
  error: Error | null;
}> {
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
    .eq("id", session.user.id)
    .maybeSingle();

  if (error) return { data: null, error: new Error(error.message) };
  return { data: data as ProfileRow | null, error: null };
}

/** Update editable profile fields for the signed-in user. */
export async function updateMyProfile(
  patch: UpdateMyProfilePayload,
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
    .update({
      display_name: patch.display_name,
      role: patch.role,
      about: patch.about,
    })
    .eq("id", session.user.id)
    .select(PROFILE_SELECT)
    .maybeSingle();

  if (error) return { data: null, error: new Error(error.message) };
  return { data: data as ProfileRow | null, error: null };
}
