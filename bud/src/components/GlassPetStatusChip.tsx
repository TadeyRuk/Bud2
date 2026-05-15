import type { Pet } from "../stores/petStore";

/** Status pill — colors aligned with `StatusBadge` */
export function GlassPetStatusChip({ pet }: { pet: Pet }) {
  const detail =
    [pet.breed, pet.color].filter(Boolean).join(" · ") || "Community alert · stay vigilant";

  let headline = "Lost pet alert";
  let subline = detail;

  if (pet.status === "REUNITED") {
    headline = "Reunited";
    subline = "Safe with family · thank you";
  } else if (pet.status === "FOUND") {
    headline = "Found · pending";
    subline = detail;
  }

  const tone =
    pet.status === "LOST"
      ? "bg-red-600 text-white"
      : pet.status === "FOUND"
        ? "bg-green-600 text-white"
        : "bg-blue-500 text-white";

  return (
    <div
      className={`flex max-w-[min(100%,220px)] items-center gap-2 rounded-[1.35rem] px-2.5 py-2 shadow-md ${tone}`}
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20 shadow-md ring-1 ring-white/30">
        <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 2c-1.5 0-2.8.4-3.9 1.1A4.5 4.5 0 005 3.5C3.5 3.5 2 5 2 7v1c0 3.5 3 7 4 8s2.5 2 6 2 5-1 6-2 4-4.5 4-8V7c0-2-1.5-3.5-3-3.5-.6 0-1.2.2-1.7.6A6.3 6.3 0 0012 2zm-1 5.5c.8 0 1.5.7 1.5 1.5S11.8 10.5 11 10.5 9.5 9.8 9.5 9s.7-1.5 1.5-1.5zm3 0c.8 0 1.5.7 1.5 1.5S15.8 10.5 15 10.5 13.5 9.8 13.5 9s.7-1.5 1.5-1.5z" />
        </svg>
      </span>
      <div className="min-w-0 flex-1 pr-0.5">
        <p className="font-headline text-xs font-bold uppercase tracking-wide text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.35)]">
          {headline}
        </p>
        <p className="font-body text-[10px] font-normal leading-snug text-white/90 drop-shadow-[0_1px_6px_rgba(0,0,0,0.35)] line-clamp-2">
          {subline}
        </p>
      </div>
    </div>
  );
}
