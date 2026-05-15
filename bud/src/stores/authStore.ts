import { create } from "zustand";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "../types/database";
import { supabase, supabaseConfigured } from "../lib/supabase";

type AuthState = {
  user: User | null;
  profile: Profile | null;
  initialized: boolean;
  fetchProfile: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  initialized: false,

  fetchProfile: async () => {
    const uid = get().user?.id;
    if (!uid || !supabaseConfigured) return;

    const { data, error } = await supabase.from("profiles").select("*").eq("id", uid).maybeSingle();
    if (!error && data) set({ profile: data });
    else set({ profile: null });
  },

  signIn: async (email, password) => {
    if (!supabaseConfigured) return { error: "Database is not configured." };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  },

  signUp: async (email, password) => {
    if (!supabaseConfigured) return { error: "Database is not configured." };
    const { error } = await supabase.auth.signUp({ email, password });
    return { error: error?.message ?? null };
  },

  signOut: async () => {
    if (supabaseConfigured) await supabase.auth.signOut();
    set({ user: null, profile: null });
  },
}));

function onSessionUser(user: User | null) {
  useAuthStore.setState({ user });
  if (user) void useAuthStore.getState().fetchProfile();
  else useAuthStore.setState({ profile: null });
}

if (typeof window !== "undefined") {
  if (supabaseConfigured) {
    void supabase.auth.getSession().then(({ data: { session } }) => {
      onSessionUser(session?.user ?? null);
      useAuthStore.setState({ initialized: true });
    });
    supabase.auth.onAuthStateChange((_event, session) => {
      onSessionUser(session?.user ?? null);
    });
  } else {
    useAuthStore.setState({ initialized: true });
  }
}
