import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Notification } from "../types/database";
import { supabase, supabaseConfigured } from "../lib/supabase";
import { enqueue, dequeue, peekAll } from "../lib/offlineQueue";

type NotificationState = {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  subscribeRealtime: (userId: string) => () => void;
  pollInterval: ReturnType<typeof setInterval> | null;
  startPolling: (userId: string) => void;
  stopPolling: () => void;
  drainOfflineQueue: () => Promise<void>;
  /** Prototype / offline: prepend a notification and bump unread (for demo bell). */
  addLocalNotification: (n: Omit<Notification, "id" | "created_at">) => void;
};

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,
      loading: false,
      pollInterval: null,

      fetchNotifications: async () => {
        if (!supabaseConfigured) return;

        set({ loading: true });
        const { data, error } = await supabase
          .from("notifications")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50);

        if (!error && data) {
          const notifs = data as Notification[];
          set({
            notifications: notifs,
            unreadCount: notifs.filter((n) => !n.read).length,
            loading: false,
          });
        } else {
          set({ loading: false });
        }
      },

      markRead: async (id) => {
        set((s) => ({
          notifications: s.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
          unreadCount: Math.max(0, s.unreadCount - (s.notifications.find((n) => n.id === id && !n.read) ? 1 : 0)),
        }));

        if (!supabaseConfigured) return;

        const { error } = await supabase
          .from("notifications")
          .update({ read: true })
          .eq("id", id);

        if (error) {
          await enqueue({
            table: "notifications",
            operation: "update",
            payload: { id, read: true },
          });
        }
      },

      markAllRead: async () => {
        const unreadIds = get().notifications.filter((n) => !n.read).map((n) => n.id);

        set((s) => ({
          notifications: s.notifications.map((n) => ({ ...n, read: true })),
          unreadCount: 0,
        }));

        if (!supabaseConfigured || unreadIds.length === 0) return;

        await supabase
          .from("notifications")
          .update({ read: true })
          .in("id", unreadIds);
      },

      subscribeRealtime: (userId) => {
        if (!supabaseConfigured) return () => {};

        const channel = supabase
          .channel("notifications-changes")
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "notifications",
              filter: `user_id=eq.${userId}`,
            },
            (payload) => {
              const notif = payload.new as Notification;
              set((s) => ({
                notifications: [notif, ...s.notifications],
                unreadCount: s.unreadCount + 1,
              }));
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      },

      startPolling: (userId) => {
        get().stopPolling();
        if (!supabaseConfigured || !userId) return;

        const interval = setInterval(() => {
          get().fetchNotifications();
        }, 30_000);

        set({ pollInterval: interval });
      },

      stopPolling: () => {
        const interval = get().pollInterval;
        if (interval) {
          clearInterval(interval);
          set({ pollInterval: null });
        }
      },

      drainOfflineQueue: async () => {
        if (!supabaseConfigured) return;

        const pending = await peekAll();
        for (const item of pending) {
          if (item.table !== "notifications") continue;

          try {
            if (item.operation === "update") {
              const { id, ...rest } = item.payload;
              await supabase
                .from("notifications")
                .update(rest)
                .eq("id", id as string);
            }
            await dequeue(item.id);
          } catch {
            break;
          }
        }
      },

      addLocalNotification: (partial) => {
        const id =
          globalThis.crypto?.randomUUID?.() ?? `notif_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
        const row: Notification = {
          id,
          user_id: partial.user_id,
          type: partial.type,
          title: partial.title,
          body: partial.body,
          pet_id: partial.pet_id,
          read: partial.read ?? false,
          created_at: new Date().toISOString(),
        };
        set((s) => ({
          notifications: [row, ...s.notifications],
          unreadCount: s.unreadCount + (row.read ? 0 : 1),
        }));
      },
    }),
    {
      name: "bud-notifications",
      partialize: (state) => ({
        notifications: state.notifications,
        unreadCount: state.unreadCount,
      }),
    }
  )
);
