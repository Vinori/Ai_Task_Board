import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function readEnv() {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return { url, anonKey };
}

let client: SupabaseClient | null | undefined;

/** Supabase browser client; `null` until env vars are set. */
export function getSupabase(): SupabaseClient | null {
  if (client !== undefined) return client;
  const env = readEnv();
  client = env ? createClient(env.url, env.anonKey) : null;
  return client;
}
