import { SightingMiniMap, SIGHTING_MAP_DEFAULT_CENTER } from "../SightingSheet/SightingMiniMap";
import type { SightingMood } from "../../stores/sightingStore";
import type { TimelineEvent } from "./timelineTypes";

const MOOD_LABEL: Record<SightingMood, string> = {
  healthy: "Healthy",
  skittish: "Skittish",
  injured: "Injured",
  "with-someone": "With someone",
  hungry: "Hungry",
};

function formatRelative(iso: string): string {
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  const ms = new Date(iso).getTime() - Date.now();
  let minutes = Math.round(ms / 60_000);
  if (minutes === 0) minutes = ms > 0 ? 1 : -1;
  if (Math.abs(minutes) < 60) return rtf.format(minutes, "minute");
  const hours = Math.round(ms / 3_600_000);
  if (Math.abs(hours) < 24) return rtf.format(hours, "hour");
  const days = Math.round(ms / 86_400_000);
  return rtf.format(days, "day");
}

function dotClass(e: TimelineEvent): string {
  if (e.kind === "sighting") return "bg-yellow-500";
  if (e.kind === "contact") return "bg-bud-accent";
  switch (e.data.to) {
    case "LOST":
      return "bg-red-600";
    case "FOUND":
      return "bg-green-600";
    case "REUNITED":
      return "bg-blue-500";
    default:
      return "bg-bud-text-muted";
  }
}

function typeLabel(e: TimelineEvent): string {
  if (e.kind === "sighting") return "Sighting";
  if (e.kind === "contact") return "Contact";
  if (e.data.from == null) return "Reported";
  return "Status";
}

function collapsedTitle(e: TimelineEvent): string {
  if (e.kind === "sighting") {
    const t = e.data.message.trim();
    if (t) return t.split("\n")[0].slice(0, 72) + (t.length > 72 ? "…" : "");
    if (e.data.locationLabel.trim()) return `Near ${e.data.locationLabel}`;
    return "Sighting shared";
  }
  if (e.kind === "contact") {
    return e.data.contactType === "owner" ? "Reach-out · Owner" : "Reach-out · Barangay";
  }
  if (e.data.from == null) return `Reported as ${e.data.to}`;
  return `Now ${e.data.to}`;
}

function EventGlyph({ event }: { event: TimelineEvent }) {
  if (event.kind === "sighting") {
    return (
      <svg className="h-4 w-4 text-yellow-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path strokeLinecap="round" d="M12 5c-2 3.5-4 6.2-4 9a4 4 0 108 0c0-2.8-2-5.5-4-9z" />
      </svg>
    );
  }
  if (event.kind === "contact") {
    return (
      <svg className="h-4 w-4 text-bud-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25V17a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 17V8.25m18 0A2.25 2.25 0 0018.75 6H5.25A2.25 2.25 0 003 8.25m18 0v.75a48.11 48.11 0 01-7.2 4.843 48.11 48.11 0 01-7.2-4.843v-.75" />
      </svg>
    );
  }
  return (
    <svg className="h-4 w-4 text-bud-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l3 3" />
    </svg>
  );
}

function ReadOnlyPaws({ n }: { n: 1 | 2 | 3 | 4 | 5 }) {
  return (
    <div className="flex gap-0.5" aria-label={`Confidence ${n} of 5`}>
      {([1, 2, 3, 4, 5] as const).map((i) => (
        <span key={i} className={i <= n ? "text-bud-primary" : "text-bud-text-muted/25"}>
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <ellipse cx="12" cy="17.2" rx="4.8" ry="3.4" />
            <circle cx="8.4" cy="11.2" r="2.35" />
            <circle cx="12.1" cy="9" r="2.35" />
            <circle cx="15.7" cy="11.2" r="2.35" />
            <circle cx="11.2" cy="7.4" r="2.05" />
          </svg>
        </span>
      ))}
    </div>
  );
}

export type TimelineNodeProps = {
  event: TimelineEvent;
  index: number;
  isLatest: boolean;
  expanded: boolean;
  onToggle: () => void;
};

export function TimelineNode({ event, index, isLatest, expanded, onToggle }: TimelineNodeProps) {
  const iso = event.data.createdAt;
  const staggerMs = index * 60;

  return (
    <li
      className="relative list-none motion-safe:bud-timeline-node-enter motion-reduce:opacity-100"
      style={{ animationDelay: `${staggerMs}ms` }}
    >
      <div className="absolute left-[10px] top-3 z-[1] flex h-7 w-7 -translate-x-1/2 items-center justify-center" aria-hidden>
        {isLatest ? (
          <span className="bud-timeline-breathing-ring absolute inline-flex h-7 w-7 rounded-full bg-bud-primary/25 opacity-50 blur-md" />
        ) : null}
        {isLatest ? (
          <span className="bud-timeline-breathing-ring absolute h-6 w-6 rounded-full border-2 border-white/80 bg-white/30 shadow-sm" />
        ) : null}
        <span className={`relative h-3 w-3 rounded-full ring-2 ring-white/90 ${dotClass(event)}`} />
      </div>

      <button
        type="button"
        data-timeline-node="1"
        aria-expanded={expanded}
        onClick={onToggle}
        className="relative ml-9 w-[calc(100%-2.25rem)] rounded-2xl border border-black/5 bg-white/85 p-3 text-left shadow-sm backdrop-blur-sm transition-[box-shadow] focus:outline-none focus-visible:ring-2 focus-visible:ring-bud-primary/35"
      >
        <div className="flex items-start gap-2">
          <EventGlyph event={event} />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wide text-bud-text">{typeLabel(event)}</span>
              <span className="shrink-0 text-xs text-bud-text-muted">{formatRelative(iso)}</span>
            </div>
            <p className="mt-1 text-sm font-semibold text-bud-text line-clamp-2">{collapsedTitle(event)}</p>
          </div>
        </div>

        <div
          className={`overflow-hidden transition-[max-height,opacity] duration-[280ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-reduce:transition-opacity motion-reduce:duration-150 ${
            expanded ? "max-h-[1200px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className={`space-y-3 pt-3 ${expanded ? "motion-safe:delay-[80ms] motion-reduce:delay-0" : ""}`}>
              {event.kind === "sighting" ? (
                <>
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-bud-surface-well text-[10px] font-bold text-bud-text-muted">
                      {(event.data.reporterName || "?").slice(0, 1).toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-bud-text">{event.data.reporterName}</p>
                      <span className="inline-flex rounded-full bg-bud-accent/12 px-2 py-0.5 font-body text-[10px] font-bold uppercase tracking-wide text-bud-accent">
                        Helper
                      </span>
                    </div>
                  </div>
                  {event.data.moods.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {event.data.moods.map((m) => (
                        <span
                          key={m}
                          className="rounded-full border border-bud-text-muted/15 bg-white/70 px-2.5 py-0.5 font-body text-[10px] font-semibold text-bud-text"
                        >
                          {MOOD_LABEL[m]}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  <ReadOnlyPaws n={event.data.confidence} />
                  {event.data.lat != null && event.data.lng != null ? (
                    <SightingMiniMap
                      center={SIGHTING_MAP_DEFAULT_CENTER}
                      pinLat={event.data.lat}
                      pinLng={event.data.lng}
                      onPick={() => {}}
                      readOnly
                      heightPx={120}
                      showRadar={false}
                    />
                  ) : null}
                  {event.data.photoDataUrl ? (
                    <img
                      src={event.data.photoDataUrl}
                      alt=""
                      className="max-h-48 w-full rounded-xl object-cover"
                    />
                  ) : null}
                  {event.data.message.trim() ? (
                    <p className="font-body text-sm leading-relaxed text-bud-text-muted">{event.data.message}</p>
                  ) : null}
                </>
              ) : null}

              {event.kind === "status" ? (
                <div className="space-y-2 font-body text-sm text-bud-text-muted">
                  <p>
                    <span className="font-semibold text-bud-text">{event.data.byUserName}</span> updated status
                    {event.data.from ? (
                      <>
                        {" "}
                        from <span className="font-semibold text-bud-text">{event.data.from}</span>
                      </>
                    ) : null}{" "}
                    to <span className="font-semibold text-bud-text">{event.data.to}</span>.
                  </p>
                </div>
              ) : null}

              {event.kind === "contact" ? (
                <p className="font-body text-sm text-bud-text-muted">
                  <span className="font-semibold text-bud-text">{event.data.byUserName}</span> requested a{" "}
                  {event.data.contactType === "owner" ? "direct owner" : "barangay desk"} contact.
                </p>
              ) : null}
            </div>
        </div>
      </button>
    </li>
  );
}
