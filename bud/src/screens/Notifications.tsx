import { useEffect, useMemo, useState } from "react";
import { useNotificationStore } from "../stores/notificationStore";
import { useUiStore } from "../stores/uiStore";
import type { Notification } from "../types/database";

type NotificationsProps = {
  onClose: () => void;
};

function dayBucket(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const yday = new Date(today);
  yday.setDate(yday.getDate() - 1);
  const isToday = d.toDateString() === today.toDateString();
  const isYest = d.toDateString() === yday.toDateString();
  if (isToday) return "Today";
  if (isYest) return "Yesterday";
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

export function Notifications({ onClose }: NotificationsProps) {
  const { notifications, loading, fetchNotifications, markRead, markAllRead } = useNotificationStore();
  const quietHours = useUiStore((s) => s.quietHours);
  const setQuietHours = useUiStore((s) => s.setQuietHours);
  const [filter, setFilter] = useState<"all" | "sighting" | "status_change" | "message" | "contact_request">("all");

  useEffect(() => {
    void fetchNotifications();
  }, [fetchNotifications]);

  const filtered = useMemo(() => {
    if (filter === "all") return notifications;
    return notifications.filter((n) => n.type === filter);
  }, [notifications, filter]);

  const grouped = useMemo(() => {
    const m = new Map<string, Notification[]>();
    for (const n of filtered) {
      const k = dayBucket(n.created_at);
      const list = m.get(k) ?? [];
      list.push(n);
      m.set(k, list);
    }
    return [...m.entries()];
  }, [filtered]);

  return (
    <div
      className={`absolute inset-0 z-[7200] flex flex-col bg-bud-bg ${quietHours ? "brightness-[0.97]" : ""}`}
    >
      <header className="flex shrink-0 items-center justify-between border-b border-bud-surface-low px-4 pb-3 pt-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            aria-label="Go back"
            className="flex h-10 w-10 items-center justify-center rounded-full text-bud-text transition-colors hover:bg-bud-surface-low"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <h1 className="font-headline text-xl font-bold text-bud-text">Notifications</h1>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 font-body text-[10px] font-semibold uppercase tracking-wide text-bud-text-muted">
            <input type="checkbox" checked={quietHours} onChange={(e) => setQuietHours(e.target.checked)} />
            Quiet
          </label>
          {notifications.some((n) => !n.read) ? (
            <button
              type="button"
              onClick={() => void markAllRead()}
              className="font-body text-xs font-semibold text-bud-primary"
            >
              Mark all read
            </button>
          ) : null}
        </div>
      </header>

      <div className="flex gap-1 overflow-x-auto border-b border-bud-surface-low px-3 py-2">
        {(
          [
            ["all", "All"],
            ["sighting", "Sightings"],
            ["status_change", "Status"],
            ["contact_request", "Contacts"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setFilter(id)}
            className={`shrink-0 rounded-full px-3 py-1 font-body text-xs font-semibold ${
              filter === id ? "bg-bud-primary text-white" : "bg-bud-surface-low text-bud-text-muted"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {loading && notifications.length === 0 && (
          <div className="flex items-center justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-bud-primary border-t-transparent" />
          </div>
        )}

        {!loading && notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center px-8 py-16 text-center">
            <svg className="mb-4 h-12 w-12 text-bud-text-muted/40" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
              />
            </svg>
            <p className="font-headline text-lg font-bold text-bud-text">Quiet for now</p>
            <p className="mt-1 font-body text-sm text-bud-text-muted">We&apos;ll wake you when neighbors check in.</p>
          </div>
        )}

        {grouped.map(([day, rows]) => (
          <section key={day}>
            <h2 className="sticky top-0 z-[1] bg-bud-bg/95 px-5 py-2 font-body text-[11px] font-bold uppercase tracking-wide text-bud-accent backdrop-blur-sm">
              {day}
            </h2>
            {rows.map((notif) => (
              <button
                key={notif.id}
                type="button"
                onClick={() => void markRead(notif.id)}
                className={`w-full border-b border-bud-surface-low px-5 py-4 text-left transition-colors ${
                  notif.read ? "bg-bud-bg" : "bg-bud-surface-low/55"
                }`}
              >
                <div className="flex items-start gap-3">
                  {!notif.read ? (
                    <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-bud-primary" aria-hidden />
                  ) : (
                    <span className="w-2 shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-body text-sm font-semibold text-bud-text">{notif.title}</p>
                    <p className="mt-1 line-clamp-2 font-body text-xs text-bud-text-muted">{notif.body}</p>
                    <p className="mt-2 font-body text-xs text-bud-text-muted/60">
                      {new Date(notif.created_at).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
