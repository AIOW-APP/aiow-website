type SupabaseConfig = {
  url: string;
  key: string;
};

export function getAiowSupabaseConfig(): SupabaseConfig | null {
  const url = process.env.AIOW_SUPABASE_URL || process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.AIOW_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return { url: url.replace(/\/$/, ""), key };
}

export function aiowDurableStoreMode(): "supabase" | "jsonl" {
  return getAiowSupabaseConfig() ? "supabase" : "jsonl";
}

export async function supabaseInsert<T extends Record<string, unknown>>(table: string, row: T): Promise<T | null> {
  const config = getAiowSupabaseConfig();
  if (!config) return null;
  const response = await fetch(`${config.url}/rest/v1/${encodeURIComponent(table)}`, {
    method: "POST",
    headers: {
      apikey: config.key,
      authorization: `Bearer ${config.key}`,
      "content-type": "application/json",
      prefer: "return=representation",
    },
    body: JSON.stringify(row),
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Supabase insert failed for ${table}: ${response.status} ${body}`);
  }
  const rows = (await response.json()) as T[];
  return rows[0] || null;
}

export async function supabaseSelect<T>(table: string, query: string): Promise<T[] | null> {
  const config = getAiowSupabaseConfig();
  if (!config) return null;
  const separator = query.startsWith("?") ? "" : "?";
  const response = await fetch(`${config.url}/rest/v1/${encodeURIComponent(table)}${separator}${query}`, {
    headers: {
      apikey: config.key,
      authorization: `Bearer ${config.key}`,
      accept: "application/json",
    },
    cache: "no-store",
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Supabase select failed for ${table}: ${response.status} ${body}`);
  }
  return (await response.json()) as T[];
}

export async function supabaseUpdate<T extends Record<string, unknown>>(table: string, query: string, patch: T): Promise<T[] | null> {
  const config = getAiowSupabaseConfig();
  if (!config) return null;
  const separator = query.startsWith("?") ? "" : "?";
  const response = await fetch(`${config.url}/rest/v1/${encodeURIComponent(table)}${separator}${query}`, {
    method: "PATCH",
    headers: {
      apikey: config.key,
      authorization: `Bearer ${config.key}`,
      "content-type": "application/json",
      prefer: "return=representation",
    },
    body: JSON.stringify(patch),
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Supabase update failed for ${table}: ${response.status} ${body}`);
  }
  return (await response.json()) as T[];
}

export async function supabaseRpc<T>(functionName: string, parameters: Record<string, unknown>): Promise<T | null> {
  const config = getAiowSupabaseConfig();
  if (!config) return null;
  const response = await fetch(`${config.url}/rest/v1/rpc/${encodeURIComponent(functionName)}`, {
    method: "POST",
    headers: {
      apikey: config.key,
      authorization: `Bearer ${config.key}`,
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify(parameters),
    cache: "no-store",
  });
  if (!response.ok) {
    await response.text();
    throw new Error(`Supabase RPC failed for ${functionName}: ${response.status}`);
  }
  return (await response.json()) as T;
}
