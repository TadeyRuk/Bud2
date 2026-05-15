import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSightingStore } from "../../stores/sightingStore";
import { useStatusHistoryStore } from "../../stores/statusHistoryStore";
import { useContactTimelineStore } from "../../stores/contactTimelineStore";
import { useUiStore } from "../../stores/uiStore";
import { EmptyTimeline } from "./EmptyTimeline";
import { TimelineStats } from "./TimelineStats";
import { TimelineNode } from "./TimelineNode";
import { type TimelineEvent, timelineEventId, timelineEventTime } from "./timelineTypes";

export type TimelineFilter = "all" | "sightings" | "status" | "contacts";

type PetActivityTimelineProps = {
  petId: string;
  petName: string;
};

function kindRank(k: TimelineEvent["kind"]): number {
  if (k === "status") return 2;
  if (k === "contact") return 1;
  return 0;
}

export function PetActivityTimeline({ petId, petName }: PetActivityTimelineProps) {
  /** Select stable slice refs — `forPet()` allocates a new array each call and breaks Zustand's `Object.is` check. */
  const sightingsAll = useSightingStore((s) => s.sightings);
  const statusAll = useStatusHistoryStore((s) => s.changes);
  const contactsAll = useContactTimelineStore((s) => s.entries);
  const openSightingSheet = useUiStore((s) => s.openSightingSheet);

  const sightings = useMemo(() => sightingsAll.filter((x) => x.petId === petId), [sightingsAll, petId]);
  const statusRows = useMemo(() => statusAll.filter((x) => x.petId === petId), [statusAll, petId]);
  const contacts = useMemo(() => contactsAll.filter((x) => x.petId === petId), [contactsAll, petId]);

  const [filter, setFilter] = useState<TimelineFilter>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(30);
  const [chipPulse, setChipPulse] = useState<string | null>(null);

  const listRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    setVisibleCount(30);
  }, [filter, petId]);

  const merged = useMemo(() => {
    const events: TimelineEvent[] = [
      ...sightings.map((data) => ({ kind: "sighting" as const, data })),
      ...statusRows.map((data) => ({ kind: "status" as const, data })),
      ...contacts.map((data) => ({ kind: "contact" as const, data })),
    ];
    return events.sort((a, b) => {
      const tb = timelineEventTime(b);
      const ta = timelineEventTime(a);
      if (tb !== ta) return tb - ta;
      return kindRank(b.kind) - kindRank(a.kind);
    });
  }, [sightings, statusRows, contacts]);

  const filtered = useMemo(() => {
    if (filter === "all") return merged;
    if (filter === "sightings") return merged.filter((e) => e.kind === "sighting");
    if (filter === "status") return merged.filter((e) => e.kind === "status");
    return merged.filter((e) => e.kind === "contact");
  }, [merged, filter]);

  const visible = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);

  const latestMergedId = merged[0] ? timelineEventId(merged[0]) : null;

  const lastIso = merged[0]?.data.createdAt ?? null;

  const [pillKey, setPillKey] = useState(0);
  useEffect(() => {
    setPillKey((k) => k + 1);
  }, [filtered.length]);

  const onChip = useCallback((key: TimelineFilter) => {
    setFilter(key);
    setChipPulse(key);
    window.setTimeout(() => setChipPulse(null), 360);
  }, []);

  const focusSiblingButton = useCallback((from: HTMLElement, dir: 1 | -1) => {
    const root = listRef.current;
    if (!root) return;
    const buttons = [...root.querySelectorAll<HTMLElement>('[data-timeline-node="1"]')];
    const i = buttons.indexOf(from);
    if (i < 0) return;
    const next = buttons[i + dir];
    next?.focus();
  }, []);

  const onListKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLOListElement>) => {
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
      const t = e.target as HTMLElement | null;
      if (!t?.matches?.('[data-timeline-node="1"]')) return;
      e.preventDefault();
      focusSiblingButton(t, e.key === "ArrowDown" ? 1 : -1);
    },
    [focusSiblingButton]
  );

  return (
    <section className="mt-8 border-t border-black/5 pt-6" aria-label="Pet activity timeline">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-body text-[11px] font-semibold uppercase tracking-[0.2em] text-bud-accent">Activity</p>
          <h2 className="font-headline mt-1 text-2xl font-extrabold text-bud-text">What we know so far</h2>
        </div>
        <span
          key={pillKey}
          className="inline-flex items-center rounded-full bg-black/[0.06] px-3 py-1.5 font-body text-xs font-bold text-bud-text motion-safe:bud-timeline-event-pill motion-reduce:opacity-100"
        >
          {filtered.length} events
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {(
          [
            ["all", "All"],
            ["sightings", "Sightings"],
            ["status", "Status changes"],
            ["contacts", "Contacts"],
          ] as const
        ).map(([key, label]) => {
          const active = filter === key;
          return (
            <button
              key={key}
              type="button"
              aria-pressed={active}
              onClick={() => onChip(key)}
              className={`rounded-full px-3 py-1.5 font-body text-xs font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-bud-primary/35 motion-safe:active:scale-[0.98] ${
                active ? "bg-bud-primary text-white" : "bg-black/[0.06] text-bud-text-muted"
              } ${chipPulse === key ? "motion-safe:bud-timeline-chip-pop motion-reduce:opacity-100" : ""}`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <TimelineStats sightings={sightings} lastEventIso={lastIso} />

      {sightings.length === 0 ? (
        <EmptyTimeline
          petName={petName}
          onReportSighting={(e) => {
            openSightingSheet(petId, e.currentTarget.getBoundingClientRect(), e.currentTarget);
          }}
        />
      ) : null}

      <div className="relative mt-6">
        <div
          className="pointer-events-none absolute bottom-0 left-[11px] top-2 w-0.5 bg-gradient-to-b from-bud-primary/40 via-bud-accent/30 to-transparent motion-safe:bud-timeline-spine-draw motion-reduce:opacity-100"
          aria-hidden
        />
        <ol ref={listRef} className="relative m-0 space-y-4 p-0" onKeyDown={onListKeyDown}>
          {visible.map((ev, i) => {
            const id = timelineEventId(ev);
            return (
              <TimelineNode
                key={id}
                event={ev}
                index={i}
                isLatest={id === latestMergedId}
                expanded={expandedId === id}
                onToggle={() => setExpandedId((cur) => (cur === id ? null : id))}
              />
            );
          })}
        </ol>

        {filtered.length > visibleCount ? (
          <button
            type="button"
            className="mt-4 w-full rounded-xl border border-bud-text/[0.1] bg-white/70 py-2.5 font-body text-sm font-semibold text-bud-accent backdrop-blur-sm transition-transform active:scale-[0.99]"
            onClick={() => setVisibleCount((n) => n + 30)}
          >
            Show older ({filtered.length - visibleCount} more)
          </button>
        ) : null}

        {filtered.length === 0 ? (
          <p className="mt-6 text-center font-body text-sm text-bud-text-muted">Nothing in this filter yet.</p>
        ) : null}
      </div>
    </section>
  );
}
