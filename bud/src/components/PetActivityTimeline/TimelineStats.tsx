import { useMemo } from "react";
import type { LocalPetSighting } from "../../stores/sightingStore";

type TimelineStatsProps = {
  sightings: LocalPetSighting[];
  lastEventIso: string | null;
};

function formatHoursOrDaysAgo(iso: string | null): string {
  if (!iso) return "—";
  const delta = Date.now() - new Date(iso).getTime();
  if (delta < 0) return "Just now";
  const hours = Math.floor(delta / 3_600_000);
  if (hours < 24) {
    const h = Math.max(1, hours);
    return h === 1 ? "1 hr" : `${h} hrs`;
  }
  const days = Math.floor(delta / 86_400_000);
  return days === 1 ? "1 day" : `${days} days`;
}

export function TimelineStats({ sightings, lastEventIso }: TimelineStatsProps) {
  const helpers = useMemo(() => {
    const ids = new Set(sightings.map((s) => s.reporterId));
    return ids.size;
  }, [sightings]);

  const cells = [
    { label: "Sightings", value: String(sightings.length), tone: "text-bud-primary" },
    { label: "Helpers", value: String(helpers), tone: "text-bud-accent" },
    { label: "Since last", value: formatHoursOrDaysAgo(lastEventIso), tone: "text-bud-text" },
  ];

  return (
    <div className="mt-4 grid grid-cols-3 gap-2">
      {cells.map((c) => (
        <div
          key={c.label}
          className="relative overflow-hidden rounded-2xl border border-white/55 bg-white/[0.72] px-2 py-3 text-center shadow-sm backdrop-blur-md"
        >
          <span
            className="pointer-events-none absolute -bottom-4 left-1/2 h-12 w-12 -translate-x-1/2 rounded-full bg-bud-primary/10 blur-2xl motion-safe:animate-[bud-bubble-idle_8.2s_ease-in-out_infinite] motion-reduce:animate-none"
            aria-hidden
          />
          <p className={`font-headline text-2xl font-extrabold tabular-nums leading-none ${c.tone}`}>{c.value}</p>
          <p className="font-body mt-1.5 text-[10px] font-bold uppercase tracking-wide text-bud-text-muted">{c.label}</p>
        </div>
      ))}
    </div>
  );
}
