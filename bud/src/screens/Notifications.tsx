import { useEffect } from "react";
import { useNotificationStore } from "../stores/notificationStore";

type NotificationsProps = {
  onClose: () => void;
};

export function Notifications({ onClose }: NotificationsProps) {
  const { notifications, loading, fetchNotifications, markRead, markAllRead } =
    useNotificationStore();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return (
    <div className="absolute inset-0 z-[55] bg-bud-bg flex flex-col">
      <header className="shrink-0 flex items-center justify-between px-4 pt-4 pb-3 border-b border-bud-surface-low">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            aria-label="Go back"
            className="w-10 h-10 flex items-center justify-center rounded-full text-bud-text hover:bg-bud-surface-low transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <h1 className="font-headline text-xl font-bold text-bud-text">Notifications</h1>
        </div>
        {notifications.some((n) => !n.read) && (
          <button
            type="button"
            onClick={markAllRead}
            className="font-body text-xs font-semibold text-bud-primary"
          >
            Mark all read
          </button>
        )}
      </header>

      <div className="flex-1 overflow-y-auto">
        {loading && notifications.length === 0 && (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-bud-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
            <svg className="w-12 h-12 text-bud-text-muted/40 mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
            <p className="font-headline text-lg font-bold text-bud-text">All caught up!</p>
            <p className="font-body text-sm text-bud-text-muted mt-1">
              You'll see notifications here when there's activity on your reports.
            </p>
          </div>
        )}

        {notifications.map((notif) => (
          <button
            key={notif.id}
            type="button"
            onClick={() => markRead(notif.id)}
            className={`w-full text-left px-5 py-4 border-b border-bud-surface-low transition-colors ${
              notif.read ? "bg-bud-bg" : "bg-bud-surface-low/50"
            }`}
          >
            <div className="flex items-start gap-3">
              {!notif.read && (
                <div className="w-2 h-2 rounded-full bg-bud-primary shrink-0 mt-2" />
              )}
              <div className={`min-w-0 ${notif.read ? "pl-5" : ""}`}>
                <p className="font-body text-sm font-semibold text-bud-text truncate">
                  {notif.title}
                </p>
                <p className="font-body text-xs text-bud-text-muted mt-1 line-clamp-2">
                  {notif.body}
                </p>
                <p className="font-body text-xs text-bud-text-muted/60 mt-2">
                  {new Date(notif.created_at).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
