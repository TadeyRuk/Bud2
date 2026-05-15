import { useNotificationStore } from "../stores/notificationStore";
import { useUiStore } from "../stores/uiStore";

type BellBadgeProps = {
  onClick: () => void;
};

export function BellBadge({ onClick }: BellBadgeProps) {
  const unread = useNotificationStore((s) => s.unreadCount);
  const quiet = useUiStore((s) => s.quietHours);

  return (
    <button
      type="button"
      aria-label="Notifications"
      onClick={onClick}
      className="relative rounded-full border border-white/45 bg-white/40 p-2 text-bud-primary shadow-sm backdrop-blur-md transition-colors hover:bg-white/55"
    >
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
        />
      </svg>
      {unread > 0 ? (
        <span
          className={`absolute right-1.5 top-1.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-bud-primary px-0.5 text-[10px] font-bold leading-none text-white ${
            quiet ? "" : "motion-safe:bud-sighting-breathing motion-reduce:animate-none"
          }`}
        >
          {unread > 9 ? "9+" : unread}
        </span>
      ) : null}
    </button>
  );
}
