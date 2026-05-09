import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, Session } from "@supabase/supabase-js";
import type { Profile } from "../types/database";
import { supabase, supabaseConfigured } from "../lib/supabase";
import { normalizeError } from "../lib/api";

type AuthState = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: string | null }>;
  setSession: (session: Session | null) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      profile: null,
      loading: false,
      error: null,
      initialized: false,

      initialize: async () => {
        if (!supabaseConfigured) {
          set({ initialized: true });
          return;
        }

        const { data } = await supabase.auth.getSession();
        if (data.session) {
          set({ session: data.session, user: data.session.user });
          await get().fetchProfile();
        }
        set({ initialized: true });

        supabase.auth.onAuthStateChange((_event, session) => {
          set({ session, user: session?.user ?? null });
          if (session?.user) {
            get().fetchProfile();
          } else {
            set({ profile: null });
          }
        });
      },

      signIn: async (email, password) => {
        if (!supabaseConfigured) return { error: "Backend not configured" };
        set({ loading: true, error: null });
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          const msg = normalizeError(error);
          set({ loading: false, error: msg });
          return { error: msg };
        }
        set({ loading: false });
        return { error: null };
      },

      signUp: async (email, password, displayName) => {
        if (!supabaseConfigured) return { error: "Backend not configured" };
        set({ loading: true, error: null });
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: displayName } },
        });
        if (error) {
          const msg = normalizeError(error);
          set({ loading: false, error: msg });
          return { error: msg };
        }
        set({ loading: false });
        return { error: null };
      },

      signOut: async () => {
        if (supabaseConfigured) {
          await supabase.auth.signOut();
        }
        set({ user: null, session: null, profile: null });
      },

      fetchProfile: async () => {
        const user = get().user;
        if (!user || !supabaseConfigured) return;

        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (data) set({ profile: data as Profile });
      },

      updateProfile: async (updates) => {
        const user = get().user;
        if (!user || !supabaseConfigured) return { error: "Not signed in" };

        const { error } = await supabase
          .from("profiles")
          .update(updates)
          .eq("id", user.id);

        if (error) return { error: normalizeError(error) };

        set((s) => ({
          profile: s.profile ? { ...s.profile, ...updates } : s.profile,
        }));
        return { error: null };
      },

      setSession: (session) => {
        set({ session, user: session?.user ?? null });
      },
    }),
    {
      name: "bud-auth",
      partialize: (state) => ({
        profile: state.profile,
      }),
    }
  )
);
