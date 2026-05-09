import type { PetStatus } from "../data/pets";

export function StatusBadge({ status }: { status: PetStatus }) {
  if (status === "LOST") {
    return (
      <span className="inline-flex items-center rounded-full bg-bud-lost-bg text-bud-lost-text font-body text-[10px] font-bold uppercase tracking-widest px-3 py-1 shadow-ambient">
        Lost
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-bud-found-bg text-bud-found-text font-body text-[10px] font-bold uppercase tracking-widest px-3 py-1 shadow-ambient">
      Found
    </span>
  );
}
