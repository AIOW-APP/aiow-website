"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/* Browser-client voor Supabase Auth (magic link). Alleen actief als de publieke envs gezet zijn. */

let client: SupabaseClient | null | undefined;

export function supabaseBrowser(): SupabaseClient | null {
  if (client !== undefined) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  client = url && anonKey ? createClient(url, anonKey) : null;
  return client;
}
