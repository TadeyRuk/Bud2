import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";

function hasRealValue(value: string, placeholder: string) {
  const normalized = value.trim();
  return Boolean(normalized && normalized !== placeholder && !normalized.includes("your-"));
}

export const supabaseConfigured =
  hasRealValue(supabaseUrl, "https://placeholder.supabase.co") &&
  hasRealValue(supabaseAnonKey, "placeholder");

export const supabase = createClient(supabaseUrl || "https://placeholder.supabase.co", supabaseAnonKey || "placeholder", {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
