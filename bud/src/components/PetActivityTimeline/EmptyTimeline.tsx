type EmptyTimelineProps = {
  petName: string;
  onReportSighting: (e: React.MouseEvent<HTMLButtonElement>) => void;
};

export function EmptyTimeline({ petName, onReportSighting }: EmptyTimelineProps) {
  return (
    <div className="relative mt-6 flex flex-col items-center rounded-2xl border border-bud-text/[0.06] bg-white/80 px-5 py-10 text-center shadow-sm backdrop-blur-sm">
      <div
        className="relative flex h-44 w-44 items-center justify-center rounded-full bg-bud-primary/[0.12] blur-3xl motion-safe:bud-bubble-idle motion-reduce:animate-none"
        aria-hidden
      >
        <svg className="relative z-[1] h-16 w-16 text-bud-primary/70" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <ellipse cx="12" cy="17.2" rx="4.8" ry="3.4" opacity="0.35" />
          <circle cx="8.4" cy="11.2" r="2.35" />
          <circle cx="12.1" cy="9" r="2.35" />
          <circle cx="15.7" cy="11.2" r="2.35" />
          <circle cx="11.2" cy="7.4" r="2.05" />
        </svg>
      </div>
      <h3 className="font-headline mt-2 text-lg font-extrabold text-bud-text">First eyes save lives.</h3>
      <p className="font-body mt-2 max-w-[280px] text-sm leading-relaxed text-bud-text-muted">
        Be the first to share where you saw {petName}.
      </p>
      <button
        type="button"
        onClick={onReportSighting}
        className="mt-5 rounded-full bg-bud-primary px-5 py-2.5 font-body text-xs font-bold uppercase tracking-widest text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] transition-transform active:scale-[0.98] motion-safe:hover:brightness-[1.04]"
      >
        Report a sighting
      </button>
    </div>
  );
}
