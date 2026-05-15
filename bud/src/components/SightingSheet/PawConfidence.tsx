type PawConfidenceProps = {
  value: 0 | 1 | 2 | 3 | 4 | 5;
  onChange: (n: 1 | 2 | 3 | 4 | 5) => void;
};

const CAPTIONS: Record<number, string> = {
  0: "Tap a paw to rate how sure you are.",
  1: "Pretty sure I saw something",
  2: "I think it was them",
  3: "Confident it's the same pet",
  4: "Very confident",
  5: "Certain — I got close",
};

export function PawConfidence({ value, onChange }: PawConfidenceProps) {
  const caption =
    value >= 1 && value <= 5 ? CAPTIONS[value] : CAPTIONS[0];

  return (
    <div>
      <p className="font-body text-xs font-semibold uppercase tracking-wide text-bud-text">How sure are you?</p>
      <div className="mt-2 flex justify-between gap-1">
        {([1, 2, 3, 4, 5] as const).map((n) => {
          const filled = value >= n;
          return (
            <button
              key={n}
              type="button"
              aria-label={`Confidence ${n} of 5`}
              aria-pressed={filled}
              onClick={() => onChange(n)}
              className="relative flex flex-1 items-center justify-center rounded-xl border border-white/40 bg-white/45 py-2.5 backdrop-blur-sm transition-transform motion-safe:active:scale-[0.97]"
              style={{
                animationDelay: filled ? `${(n - 1) * 60}ms` : undefined,
              }}
            >
              <span
                className={
                  filled
                    ? "text-bud-primary motion-safe:bud-sighting-pop-in motion-reduce:animate-none"
                    : "text-bud-text-muted/40"
                }
              >
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <ellipse cx="12" cy="17.2" rx="4.8" ry="3.4" />
                  <circle cx="8.4" cy="11.2" r="2.35" />
                  <circle cx="12.1" cy="9" r="2.35" />
                  <circle cx="15.7" cy="11.2" r="2.35" />
                  <circle cx="11.2" cy="7.4" r="2.05" />
                </svg>
              </span>
            </button>
          );
        })}
      </div>
      <p className="mt-2 font-body text-xs text-bud-text-muted">{caption}</p>
    </div>
  );
}
