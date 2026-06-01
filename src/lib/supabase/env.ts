import { AppError } from "@/lib/errors/AppError";

export type SupabaseEnv = {
  url: string;
  anonKey: string;
  isConfigured: boolean;
  errors: string[];
};

function normalizeSupabaseUrl(url: string) {
  return url.replace(/\/rest\/v1\/?$/i, "").replace(/\/+$/, "");
}

export function getSupabaseEnv(): SupabaseEnv {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const url = normalizeSupabaseUrl(rawUrl);
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  const errors: string[] = [];

  if (!rawUrl) {
    errors.push("NEXT_PUBLIC_SUPABASE_URL is missing.");
  }

  if (!anonKey) {
    errors.push("NEXT_PUBLIC_SUPABASE_ANON_KEY is missing.");
  }

  if (rawUrl && !url.startsWith("https://")) {
    errors.push("NEXT_PUBLIC_SUPABASE_URL must start with https://.");
  }

  return {
    url,
    anonKey,
    isConfigured: errors.length === 0,
    errors,
  };
}

export function assertSupabaseEnv() {
  const env = getSupabaseEnv();

  if (!env.isConfigured) {
    throw new AppError(env.errors.join(" "), "SUPABASE_ENV_ERROR", 500);
  }

  return env;
}
