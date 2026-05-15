import type { PetStatus } from "../types/database";

const badgeBase =
  "inline-flex items-center rounded-full px-3 py-1 font-body text-xs font-bold uppercase tracking-wide text-white shadow-ambient";

export function StatusBadge({ status }: { status: PetStatus }) {
  switch (status) {
    case "LOST":
      return <span className={`${badgeBase} bg-red-600`}>Lost</span>;
    case "FOUND":
      return <span className={`${badgeBase} bg-green-600`}>Found</span>;
    case "REUNITED":
      return <span className={`${badgeBase} bg-blue-500`}>Reunited</span>;
  }
}
