import { useMemo } from "react";
import { usePetStore } from "../stores/petStore";
import type { Pet } from "../stores/petStore";

type BreakingStripProps = {
  onSelectPet: (pet: Pet) => void;
};

const STRIP_LIMIT = 8;
const WINDOW_MS = 24 * 3600_000;

export function BreakingStrip({ onSelectPet }: BreakingStripProps) {
  const pets = usePetStore((s) => s.pets);

  const tiles = useMemo(() => {
    const cutoff = Date.now() - WINDOW_MS;
    return [...pets]
      .filter((p) => p.status === "LOST" && new Date(p.created_at).getTime() >= cutoff)
      .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))
      .slice(0, STRIP_LIMIT);
  }, [pets]);

  if (tiles.length === 0) return null;

  return (
    <div className="pl-1">
      <p className="font-body text-[10px] font-bold uppercase tracking-[0.18em] text-bud-accent">Breaking · lost in last 24h</p>
      <div className="mt-2 flex gap-2 overflow-x-auto pb-1 pt-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {tiles.map((pet, i) => {
          const ago = formatShortAgo(pet.created_at);
          return (
            <button
              key={pet.id}
              type="button"
              onClick={() => onSelectPet(pet)}
              className={`relative h-16 w-[100px] shrink-0 overflow-hidden rounded-2xl border border-white/60 bg-white/80 shadow-sm ${
                i === 0 ? "ring-2 ring-bud-primary/40 motion-safe:bud-timeline-breathing-ring motion-reduce:ring-0" : ""
              }`}
            >
              <img src={pet.image_url || ""} alt="" className="absolute inset-0 h-full w-full object-cover" />
              <div
                className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"
                aria-hidden
              />
              <p className="absolute bottom-1 left-1 right-1 truncate text-left font-body text-[10px] font-bold text-white">
                {pet.name} · {ago}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function formatShortAgo(iso: string): string {
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  if (m < 60) return `${Math.max(1, m)}m`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.round(h / 24)}d`;
}
