# 05 — Smart Filter Drawer

> Search is currently one text input doing eight people's jobs. The **Smart Filter Drawer** slides in from the right edge, lets the user mix and match species / status / distance / date / quality filters with chip-morph animations, shows a rolling result count, and produces a swipe-dismissable "Active filters" pill bar that stays visible on the feed.

---

## TL;DR

Add a filter button next to the search input on [`CommunityBoard.tsx`](../src/screens/CommunityBoard.tsx) and on [`MapView.tsx`](../src/screens/MapView.tsx). Tapping it slides in a right-edge drawer with multi-category filters. The drawer keeps the search query visible, animates chip selections with a morph + ripple, and rolls the result count in real time. When the user closes the drawer, the active filters live on as a horizontally scrollable pill bar above the feed; swiping a pill left dismisses that filter.

## Roast problem it kills

- "Search & discovery: distance, filters (species, date range, status), saved searches."
- Turns a single text input into a real search experience without leaving the phone frame.

## Where it lives

- Trigger button on the existing search rows in [`CommunityBoard.tsx`](../src/screens/CommunityBoard.tsx) and [`MapView.tsx`](../src/screens/MapView.tsx).
- New overlay: `FilterDrawer`. Mounted once at the root in `MainShell` so it can drive both screens.
- Shared filter state in a new `useFilterStore`.

## The feeling

> "I tapped a knob and a glass panel slid in from the right with chips that **morphed** into selection. The number of pets at the top counted down in real time as I narrowed. When I closed the drawer, my filters lived as pills above the feed, swipeable like notifications."

## UI anatomy

### Trigger pill (replaces the magnifier-only search field on Community + Map)

- Add a **funnel icon button** to the right of the search input on Community; on Map, sit next to the existing filter input.
- Inactive: glass, `text-bud-text-muted`.
- When **at least one filter is active**: pill fills with `bg-bud-primary text-white` and shows a small count badge (e.g. `2`).

### Drawer container

- Full height of `PhoneFrame`, 86% width, anchored right.
- Background: `bg-bud-card/95 backdrop-blur-xl`.
- Slide-in: `translateX(100%) → 0`, 360ms, `cubic-bezier(.34,1.56,.64,1)`.
- Backdrop: `bg-black/35 backdrop-blur-[2px]`, tap to dismiss.
- Top bar:
  - Left: back chevron (closes drawer).
  - Center: title **"Filter"**.
  - Right: text button **"Reset"** (only visible when any filter is active).

### Result count strip (sticky at the top, inside the drawer)

- A glass row showing **"Showing 12 of 38 pets"**.
- The two numbers use `bud-roll-digit` for any change (260ms per digit).
- Subtitle: lists the active filter labels separated by ` · `.

### Filter sections (vertical, scrollable)

Each section is a card with rounded corners (`rounded-2xl`), padding `p-4`, separated by 12px.

1. **Species** — three chips: `Dog` · `Cat` · `Other`. Each has a 16px paw / cat / paw-with-question SVG. Multi-select.
2. **Status** — chips colored to the locked status palette:
   - `Lost` → `bg-red-600 text-white`.
   - `Found` → `bg-green-600 text-white`.
   - `Reunited` → `bg-blue-500 text-white`.
   - Default unselected: muted neutral; selected fills with its status color and `bud-pop-in`.
3. **Distance from me** — a single slider 0–5km with a bubble thumb (the bubble grows from 24px to 36px as you drag, primary color, with a tiny km label inside it). Snap stops at 0.5 / 1 / 2 / 3 / 5 km. When set to 0, copy reads "Any distance".
4. **Reported within** — segmented control: `24h` · `7 days` · `30 days` · `Any time`. Active segment: `bg-bud-primary text-white` slides under the active label.
5. **Quality filters** — two toggles:
   - "Has photo" — toggle with a paw photo glyph that fades in when on.
   - "Verified reporter" — toggle with the same `VerifiedShimmer` style as sub-plan 04 to teach the feature.
6. **Saved searches (mock)** — three preset cards: "Dogs within 1km", "Just reported (24h)", "Reunited this month". Tap to apply.

### Footer (sticky)

- Big primary button **"Show results"** with the rolling count next to it: **"Show 12 results"**.
- Tap → drawer slides out, focus returns to the trigger.

### Active filters pill bar (on the parent screen, after drawer closes)

- Renders just under the search row.
- Horizontal scroll, no scrollbar, snap on each pill.
- Each pill: `rounded-full px-3 h-7 text-xs font-semibold`, with a small × icon at the right.
- Swiping a pill left ≥ 40px dismisses it (`bud-bubble-rise` × 3 small bubbles + `bud-pop-in` reverse). Tapping the × does the same.
- The leftmost item is the **"Clear all"** chip when ≥ 2 filters are active.

## Motion choreography

### Chip morph (selecting any chip)

- Background fills from left to right in 220ms (clip-path inset). Label crossfades white over the existing color.
- On the same frame, a 28px `bud-ripple` originates from the tap point.
- Selected chip then breathes once (`bud-pop-in` overshoot).

### Slider thumb bubble

- While dragging, the bubble grows + `blur-sm` halo (`bg-bud-primary/20`) expands.
- On release, the halo collapses with `bud-pop-in` reverse and the chosen value snaps in.

### Result count rolling

- Each digit cell is `overflow-hidden` and holds a vertical strip of `0..9`. Active digit translates Y to the right index in 420ms.
- Total count updates throttled to 140ms while sliders move.

### Drawer open / close

- Backdrop fades 180ms; drawer slides 360ms with overshoot.
- Filter section cards stagger in at 40ms intervals (`bud-pop-in` opacity + translateY 8px).

### Pill bar swipe-dismiss

- Pointer down → record X.
- During drag → translateX with rubber-band beyond -80px.
- Release at ≤ -40px → fade + scale to 0 in 220ms + 3 small bubbles rise from the gap.

### Reduced motion

- No morphs, no ripples, no overshoot. Drawer fades in; chip toggles instantly; pills fade out on dismiss.

## State & logic

### New store: `useFilterStore` (zustand + `persist`)

```ts
type FilterState = {
  species: Array<"dog" | "cat" | "other">;
  statuses: Array<"LOST" | "FOUND" | "REUNITED">;
  maxDistanceKm: 0 | 0.5 | 1 | 2 | 3 | 5;  // 0 = any
  reportedWithin: "24h" | "7d" | "30d" | "any";
  hasPhoto: boolean;
  verifiedOnly: boolean;
};

type FilterStore = FilterState & {
  set: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  toggleArray: <K extends "species" | "statuses">(key: K, value: FilterState[K][number]) => void;
  reset: () => void;
  isActive: () => boolean;
  activeCount: () => number;
  activeChips: () => Array<{ key: string; label: string; remove: () => void }>;
};
```

- Persist key: `bud:filters:v1`.

### Pure derivation helper `src/lib/applyFilters.ts`

```ts
export function applyFilters(
  pets: Pet[],
  filters: FilterState,
  ctx: { userLatLng: [number, number]; sightingMap: Map<string, Sighting[]> }
): Pet[];
```

Used by both `CommunityBoard` and `MapView` so the screens stay consistent.

### Result count

- `CommunityBoard` already filters in `useMemo`; replace its filter with `applyFilters(pets, filterStore, { userLatLng, sightingMap })`.
- Drawer subscribes to the same derived count so the rolling number is always truthful.

### Saved searches

- Three hard-coded presets in `src/data/filterPresets.ts`. Tapping a preset shallow-merges into the store.

## Demo script (15 seconds)

1. Open Community. Tap the funnel button.
2. Drawer slides in; count strip reads **"Showing 38 of 38 pets"**.
3. Tap **Dog** → count rolls to 22. Tap **Lost** → 17. Drag distance slider to 1km → 6.
4. Tap **"Show 6 results"** → drawer slides out.
5. Pill bar above the feed shows three pills. Swipe **Distance: ≤1km** left → it bubbles away, count rolls back to 17, feed expands.

## Files touched

### New

- [`src/components/FilterDrawer/FilterDrawer.tsx`](../src/components/FilterDrawer/FilterDrawer.tsx)
- [`src/components/FilterDrawer/SpeciesSection.tsx`](../src/components/FilterDrawer/SpeciesSection.tsx)
- [`src/components/FilterDrawer/StatusSection.tsx`](../src/components/FilterDrawer/StatusSection.tsx)
- [`src/components/FilterDrawer/DistanceSlider.tsx`](../src/components/FilterDrawer/DistanceSlider.tsx)
- [`src/components/FilterDrawer/TimeSegment.tsx`](../src/components/FilterDrawer/TimeSegment.tsx)
- [`src/components/FilterDrawer/QualityToggles.tsx`](../src/components/FilterDrawer/QualityToggles.tsx)
- [`src/components/FilterDrawer/SavedSearches.tsx`](../src/components/FilterDrawer/SavedSearches.tsx)
- [`src/components/FilterDrawer/RollingCount.tsx`](../src/components/FilterDrawer/RollingCount.tsx)
- [`src/components/FilterDrawer/ActiveFilterPills.tsx`](../src/components/FilterDrawer/ActiveFilterPills.tsx)
- [`src/stores/filterStore.ts`](../src/stores/filterStore.ts)
- [`src/lib/applyFilters.ts`](../src/lib/applyFilters.ts)
- [`src/data/filterPresets.ts`](../src/data/filterPresets.ts)

### Edits

- [`src/MainShell.tsx`](../src/MainShell.tsx) — mount `<FilterDrawer />` once.
- [`src/screens/CommunityBoard.tsx`](../src/screens/CommunityBoard.tsx) — add funnel button, mount `<ActiveFilterPills />` under search row, swap local filtering to `applyFilters`.
- [`src/screens/MapView.tsx`](../src/screens/MapView.tsx) — same, but the pill bar sits inside the top overlay.

## Edge cases & accessibility

- **Conflicting filters** (e.g. status=Reunited + reportedWithin=24h with no matches): show a calm empty state in the drawer count strip — "0 results · try widening the radius".
- **Slider on touch:** support pointer events + arrow keys when focused (`Left`/`Right` step through snap stops).
- **Pill bar overflow:** never wraps, never resizes the feed; uses `overflow-x-auto` with `scroll-snap-x mandatory`.
- **Persist reset:** "Reset" clears the persisted filter but keeps the search query; the search bar is separate.
- **Reduced motion:** drawer fade-only; counts swap without rolling; chips toggle instantly.
- **Accessibility:** drawer has `aria-modal="true"`, focus trap, return focus to trigger. Each chip is `role="checkbox"` with `aria-checked`. The slider uses the native `<input type="range">` wrapped with a custom visual thumb (real `<input>` stays in DOM for keyboard + screen reader; the bubble is overlaid).

## Build sequence (commits in order)

1. `useFilterStore` + `applyFilters` + `filterPresets`. Unit-eyeball with the seeded pets.
2. `RollingCount` component (works standalone).
3. `FilterDrawer` shell with backdrop, slide-in, top bar, count strip.
4. Build sections one at a time: Species → Status → Distance → Time → Quality → Saved.
5. Wire to `CommunityBoard` and `MapView`. Confirm both screens narrow in sync.
6. `ActiveFilterPills` + swipe-dismiss.
7. Reduced-motion and a11y polish; `npm run build` green.
