# 02 — Pet Activity Timeline

> Turn `PetDetail` from a static card into a **living dossier**: every sighting, status change, and contact request strung along a vertical spine with bubble nodes that breathe, expand, and tell a story.

---

## TL;DR

Below the existing pet hero on [`PetDetail.tsx`](../src/screens/PetDetail.tsx), add a new section: **Activity**. It is a vertical timeline of `Sighting` + `StatusChange` events, rendered as bubble nodes on a connecting spine. The latest event has a breathing aura. Tapping a node expands it inline into a card with details and a mini map. Filter chips at the top toggle the event type.

## Roast problem it kills

- "No threads, no verified neighbors, no escalation path that matches how people actually help."
- "Owner experience: a real **sighting flow** and a **timeline / activity** on a pet."
- Gives the owner a single screen where they can see what is actually happening with their pet.

## Where it lives

- New section inside [`PetDetail.tsx`](../src/screens/PetDetail.tsx), rendered below the existing definition list and "About {name}" block, **above** the contact buttons.
- New component: `PetActivityTimeline` (and child `TimelineNode`).
- Data source: `useSightingStore.forPet(petId)` (built in sub-plan 01) **+** a new lightweight `useStatusHistoryStore`.

## The feeling

> "I am scrolling a heartbeat. Every bump, every ping, every status change is a bubble on a vein. The most recent one is alive and quietly glowing."

## UI anatomy

### Section header

- Eyebrow: `text-[11px] font-semibold uppercase tracking-[0.2em] text-bud-accent` — "ACTIVITY".
- Title row:
  - Left: `font-headline text-2xl font-extrabold text-bud-text` — "What we know so far"
  - Right: a pill with a rolling count: **"12 events"** (`bud-roll-digit` whenever a new event lands).
- Sub-row: 3 chips — `All` · `Sightings` · `Status changes` · `Contacts`. Active chip: `bg-bud-primary text-white`, inactive: `bg-black/[0.06] text-bud-text-muted`. Tap = `bud-pop-in` + `bud-ripple` under the chip.

### Stats strip

A 3-column glass strip just below the header:

| Cell | Source | Display |
|---|---|---|
| Total sightings | `sightings.length` | `font-headline text-2xl font-extrabold text-bud-primary` |
| Helpers | unique reporter count | accent color |
| Hours since last | `Date.now() - max(createdAt)` | rolling digits if under 24h, else "2d ago" |

Each cell has a tiny `bud-bubble-rise` loop in the background (one bubble every 8s).

### Spine

A 2px wide vertical line, `bg-gradient-to-b from-bud-primary/40 via-bud-accent/30 to-transparent`, left margin 24px. Each node:

- 12px filled circle on the spine.
- Color by event type:
  - Sighting → `bg-yellow-500` (SIGHTED status color from the locked system).
  - Status change to LOST → `bg-red-600`.
  - Status change to FOUND → `bg-green-600`.
  - Status change to REUNITED → `bg-blue-500`.
  - Contact request → `bg-bud-accent`.
- The **latest** node only: an outer ring at 24px with `animate-[bud-breathing_2.2s_ease-in-out_infinite]`. Inside the ring, a soft bubble at `blur-xl bg-current/30`.

### Node card (collapsed)

To the right of each spine dot, a card on the canvas:

- `bg-white/85 backdrop-blur-sm border border-black/5 rounded-2xl shadow-sm`.
- Padding `p-3`, horizontal gap from spine `ml-9`.
- Header row: event icon (16px) + event type label (`text-xs font-bold uppercase tracking-wide`) + time-ago (`text-xs text-bud-text-muted`, right-aligned).
- Body: 1-line title (`text-sm font-semibold`).
- Tap to expand.

### Node card (expanded)

- Same card animates `height: auto` over 280ms (`bud-pop-in` easing).
- Adds:
  - Reporter row — avatar 28px + name + **Trust pill** (depends on sub-plan 04; until then show "Helper").
  - Mood chips (read-only, smaller).
  - Confidence row — paws repeated, filled to N.
  - Mini map preview (120px tall) if `lat`/`lng` present.
  - Photo (if attached).
  - Free text — full message.
- Collapse on second tap. Only one node expanded at a time.

### Empty state

When `sightings.length === 0` and only one status change exists:

- Centered floating bubble (180px, `bg-bud-primary/[0.10] blur-3xl`) with a paw glyph inside.
- Headline: "First eyes save lives."
- Subcopy: "Be the first to share where you saw {petName}."
- CTA: a smaller version of "Report a sighting" that opens the **Sighting Sheet** (sub-plan 01).

## Motion choreography

### On mount

- Spine draws in top-to-bottom, 600ms, using `stroke-dashoffset` animation on a hidden SVG sibling (visual line is the div, but we mirror an SVG for the draw effect). Then crossfade into the div.
- Each node fades in with a 60ms stagger from top to bottom.

### When a new sighting is added (from sub-plan 01)

1. Insert at top of list.
2. New node card slides down from `translate-y-[-12px]` + opacity 0 → 0 in 320ms.
3. The breathing aura **transfers** from the previous "latest" node to the new one over 200ms (cross-fade the ring opacity).
4. The "12 events" pill rolls to "13".

### Expand / collapse

- Card height tweens 280ms `cubic-bezier(.34,1.56,.64,1)` with overshoot.
- Inner content fade-in delayed by 80ms.
- A 24px `bud-ripple` originates from the spine dot when expanding.

### Reduced motion

- No spine draw, no stagger, no ripples. Cards fade in over 160ms. Aura is a static dimmer outer ring.

## State & logic

### New store: `useStatusHistoryStore` (zustand + `persist`)

```ts
type StatusChange = {
  id: string;
  petId: string;
  from: PetStatus | null; // null for initial creation
  to: PetStatus;
  byUserId: string;
  byUserName: string;
  createdAt: string;
};

type StatusHistoryStore = {
  changes: StatusChange[];
  forPet: (petId: string) => StatusChange[];
  recordChange: (c: Omit<StatusChange, "id" | "createdAt">) => void;
};
```

- Persist key: `bud:statushistory:v1`.
- Seeded on first load with the initial status of every demo pet from [`src/data/pets.ts`](../src/data/pets.ts) (a "reported" event with `from: null`).

### Hook the existing flows

- [`src/components/OwnerPetActions.tsx`](../src/components/OwnerPetActions.tsx) — when `markFound` / `markReunited` / `removePet` runs, call `statusHistoryStore.recordChange(...)`.
- [`src/screens/ReportLostPet.tsx`](../src/screens/ReportLostPet.tsx) — on successful submit, record a `from: null, to: "LOST"` change.

### Derived events list inside `PetActivityTimeline`

```ts
type TimelineEvent =
  | { kind: "sighting"; data: Sighting }
  | { kind: "status"; data: StatusChange }
  | { kind: "contact"; data: ContactRequest };

const events = useMemo(() => {
  const s = sightingStore.forPet(petId).map(d => ({ kind: "sighting" as const, data: d }));
  const c = statusHistoryStore.forPet(petId).map(d => ({ kind: "status" as const, data: d }));
  return [...s, ...c].sort((a, b) => +new Date(b.data.createdAt) - +new Date(a.data.createdAt));
}, [petId, sightingStore, statusHistoryStore]);
```

- Filter chips just narrow this list before render.

## Demo script (15 seconds)

1. On the community feed, tap the top "Lost" pet card to open `PetDetail`.
2. Scroll past the hero — the timeline section is already populated with 3–4 seeded events.
3. The latest event (a sighting from sub-plan 01's seed) is breathing softly.
4. Tap that node — it expands inline with mini map + photo + "Skittish" mood chip.
5. Optional: tap "Report a sighting" → run sub-plan 01's flow → return to find a new top node breathing.

## Files touched

### New

- [`src/components/PetActivityTimeline/PetActivityTimeline.tsx`](../src/components/PetActivityTimeline/PetActivityTimeline.tsx)
- [`src/components/PetActivityTimeline/TimelineNode.tsx`](../src/components/PetActivityTimeline/TimelineNode.tsx)
- [`src/components/PetActivityTimeline/TimelineStats.tsx`](../src/components/PetActivityTimeline/TimelineStats.tsx)
- [`src/components/PetActivityTimeline/EmptyTimeline.tsx`](../src/components/PetActivityTimeline/EmptyTimeline.tsx)
- [`src/stores/statusHistoryStore.ts`](../src/stores/statusHistoryStore.ts)

### Edits (className + small JSX inserts)

- [`src/screens/PetDetail.tsx`](../src/screens/PetDetail.tsx) — mount `<PetActivityTimeline petId={pet.id} />` between description and contact buttons.
- [`src/components/OwnerPetActions.tsx`](../src/components/OwnerPetActions.tsx) — call `recordChange` after each successful status update.
- [`src/screens/ReportLostPet.tsx`](../src/screens/ReportLostPet.tsx) — call `recordChange` once `addPet` succeeds.

## Edge cases & accessibility

- **Hundreds of events:** virtualize after 30 nodes (`react-window` is not in deps; for the demo, just slice to the latest 30 and add a "Show older" link that loads 30 more).
- **Ordering:** ties on `createdAt` (same ISO second) sort by `kind` — status > contact > sighting — to keep narrative sensible.
- **Time labels:** use `Intl.RelativeTimeFormat` for "2h ago"; never show seconds.
- **Reduced motion:** documented in motion section.
- **Keyboard:** nodes are `<button>` elements with `aria-expanded`. Up/Down arrow keys move focus between nodes (custom handler on the timeline container).
- **Screen readers:** the spine itself has `aria-hidden="true"`. The timeline is a `<ol>` with each node an `<li>`.

## Build sequence (commits in order)

1. Create `useStatusHistoryStore` with seeded entries from `DEMO_PETS`.
2. Build `PetActivityTimeline` shell (header + filter chips + empty state).
3. Build `TimelineNode` with collapsed + expanded variants, including the breathing aura on the latest.
4. Wire seeded sightings + status changes into a derived `events` array; render.
5. Hook `OwnerPetActions` and `ReportLostPet` to record changes.
6. Animations pass: spine draw, stagger, expand/collapse, aura transfer on new sighting.
7. Accessibility pass: keyboard nav, `aria-expanded`, reduced-motion fallbacks.
8. `npm run build` green; eyeball on 430px.
