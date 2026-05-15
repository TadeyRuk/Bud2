import type { SightingMood } from "../../stores/sightingStore";

const MOODS: { id: SightingMood; label: string }[] = [
  { id: "healthy", label: "Healthy" },
  { id: "skittish", label: "Skittish" },
  { id: "injured", label: "Injured" },
  { id: "with-someone", label: "With someone" },
  { id: "hungry", label: "Hungry" },
];

type MoodChipsProps = {
  value: SightingMood[];
  onToggle: (m: SightingMood) => void;
};

export function MoodChips({ value, onToggle }: MoodChipsProps) {
  return (
    <div>
      <p className="font-body text-xs font-semibold uppercase tracking-wide text-bud-text">Mood (optional)</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {MOODS.map(({ id, label }) => {
          const on = value.includes(id);
          return (
            <button
              key={id}
              type="button"
              aria-pressed={on}
              onClick={() => onToggle(id)}
              className={`rounded-full px-3 py-1.5 font-body text-xs font-semibold transition-transform motion-safe:active:scale-[0.97] ${
                on
                  ? "bg-bud-accent text-white shadow-md"
                  : "border border-bud-text-muted/20 bg-white/50 text-bud-text"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
