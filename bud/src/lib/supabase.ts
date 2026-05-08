import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const placeholderValues = new Set([
  "",
  "your_supabase_url",
  "your_supabase_anon_key",
]);

export const isSupabaseConfigured =
  !placeholderValues.has(supabaseUrl || "") &&
  !placeholderValues.has(supabaseAnonKey || "");

if (!isSupabaseConfigured) {
  console.warn(
    "Supabase credentials missing or still set to placeholders. Using local demo data."
  );
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
