import type { SightingMood } from "../../stores/sightingStore";
import { MoodChips } from "./MoodChips";
import { PawConfidence } from "./PawConfidence";

type StepDetailsProps = {
  confidence: 0 | 1 | 2 | 3 | 4 | 5;
  onConfidence: (n: 1 | 2 | 3 | 4 | 5) => void;
  moods: SightingMood[];
  onToggleMood: (m: SightingMood) => void;
  message: string;
  onMessage: (v: string) => void;
};

const MAX = 240;

export function StepDetails({
  confidence,
  onConfidence,
  moods,
  onToggleMood,
  message,
  onMessage,
}: StepDetailsProps) {
  return (
    <div className="space-y-5 px-1">
      <div>
        <p className="font-body text-sm font-semibold text-bud-text">What did you see?</p>
        <p className="mt-1 font-body text-xs text-bud-text-muted">Help the owner recognize what you saw.</p>
      </div>

      <PawConfidence value={confidence} onChange={onConfidence} />

      <MoodChips
        value={moods}
        onToggle={(m) => onToggleMood(m)}
      />

      <div>
        <div className="flex items-center justify-between gap-2">
          <label htmlFor="sighting-message" className="font-body text-xs font-semibold uppercase tracking-wide text-bud-text">
            Notes
          </label>
          <span
            className={`font-body text-[10px] font-bold tabular-nums ${
              message.length > MAX ? "text-red-600" : message.length > 200 ? "text-bud-primary" : "text-bud-text-muted"
            }`}
          >
            {message.length}/{MAX}
          </span>
        </div>
        <textarea
          id="sighting-message"
          value={message}
          maxLength={MAX}
          onChange={(e) => onMessage(e.target.value)}
          rows={4}
          placeholder="Anything that would help the owner?"
          className="mt-2 w-full resize-none rounded-xl border border-white/50 bg-white/85 px-3 py-2.5 font-body text-sm text-bud-text outline-none ring-bud-primary/20 placeholder:text-bud-text-muted/70 focus:ring-2"
        />
      </div>
    </div>
  );
}
