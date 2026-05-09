import { useEffect, useSyncExternalStore } from "react";
import { useUiStore } from "../stores/uiStore";

let online = typeof navigator !== "undefined" ? navigator.onLine : true;
const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function notify() {
  listeners.forEach((cb) => cb());
}

if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    online = true;
    notify();
  });
  window.addEventListener("offline", () => {
    online = false;
    notify();
  });
}

function getSnapshot() {
  return online;
}

export function useNetworkStatus() {
  const isOnline = useSyncExternalStore(subscribe, getSnapshot);
  const setOffline = useUiStore((s) => s.setOffline);

  useEffect(() => {
    setOffline(!isOnline);
  }, [isOnline, setOffline]);

  return isOnline;
}
