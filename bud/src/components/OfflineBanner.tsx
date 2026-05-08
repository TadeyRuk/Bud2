import { useUiStore } from "../stores/uiStore";

export function OfflineBanner() {
  const isOffline = useUiStore((s) => s.isOffline);

  if (!isOffline) return null;

  return (
    <div className="shrink-0 bg-amber-500 text-white text-center py-1.5 px-4 font-body text-xs font-semibold tracking-wide z-50">
      You're offline — changes will sync when you reconnect
    </div>
  );
}
