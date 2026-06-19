import { createClient } from "@supabase/supabase-js";
import { assertSupabaseAdminEnv } from "./env";

export function createSupabaseAdminClient() {
  const env = assertSupabaseAdminEnv();

  return createClient(env.url, env.serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
