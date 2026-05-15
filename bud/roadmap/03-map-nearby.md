# 03 — Map Nearby Mode

> The current map is pins on tiles. **Nearby Mode** turns it into a radar dashboard: a rotating sweep at the user's mock position, breathing distance rings, density bubbles where pets cluster, and a floating "nearest pet" card that swaps as the sweep passes.

---

## TL;DR

A toggle button on [`MapView.tsx`](../src/screens/MapView.tsx) called **"Nearby"**. When on, the map dims slightly, a radar sweep rotates at the mock user position, three concentric distance rings fade in (500m / 1km / 2km), pet markers near the user are tinted by distance, and a glass floating card at the bottom highlights the **nearest pet** with walking-distance estimate. Tap a ring chip to focus that radius; the map auto-zooms.

## Roast problem it kills

- "The map looks like product; behavior is still toy."
- "`Nearby` in copy isn't backed by real geofencing or distance sorting users can understand."
- "Default centers and fallback grids when `lat`/`lng` are missing mean the map can lie quietly."

## Where it lives

- [`src/screens/MapView.tsx`](../src/screens/MapView.tsx).
- New components rendered as **leaflet overlays** (using `react-leaflet` primitives) plus DOM overlays for the toggle, ring chips, and nearest-pet card.
- Mock user position lives in `useUiStore` (defaults to `[14.5995, 120.9842]`, Manila — same as `LocationPickerMap` fallback).

## The feeling

> "I am standing on a glowing dot. The world breathes outward in rings. The closest pet glows in the same color as my warmest thought."

Less Google Maps, more **Spotify Pet Radar**.

## UI anatomy

### Toggle (top-right of the map)

- Frosted pill (`bg-white/85 backdrop-blur-md border border-black/5 rounded-full`).
- Inactive label: **"Nearby"** with a small radar SVG.
- Active label: **"Nearby · ON"** with the radar icon rotating slowly (4s loop).
- On toggle: 220ms `bud-pop-in`, color shift from `text-bud-text-muted` → `text-bud-primary`, background → `bg-bud-primary/10`.

### Mock user dot

- Centered at `useUiStore.userLatLng` (defaults to a sensible Manila location).
- Built as a leaflet `Marker` with a custom `divIcon`:
  - 14px solid teal dot (`#005763`).
  - Pulsing 36px translucent ring (`bud-breathing`).
  - A pinch of crosshair lines for the radar feel.

### Radar sweep

- Rendered as a **CSS conic-gradient** inside a `divIcon` of size 240px, anchored to user dot.
- Gradient: `conic-gradient(from var(--angle), transparent 0deg, rgba(0,87,99,0.22) 30deg, transparent 60deg)`.
- `--angle` animated 0 → 360 deg over 3.2s linear (`bud-radar`).
- Position: absolute relative to user dot, `mix-blend-mode: multiply` so it tints the map gently without obscuring.

### Distance rings (500m / 1km / 2km)

- Three leaflet `Circle` overlays centered on user position.
- Conversion: at the user's latitude, compute meters → degrees once; cache.
- Styling (no leaflet stroke options — wrapped in a custom `pane` so we can use CSS):
  - 500m ring: `stroke-bud-primary/40 stroke-[2] fill-bud-primary/[0.06]`.
  - 1km ring: `stroke-bud-accent/40 stroke-[2] fill-bud-accent/[0.05]`.
  - 2km ring: `stroke-bud-text-muted/30 stroke-dasharray-[4,4]`.
- Each ring fades in with 120ms stagger after Nearby toggles on.
- A subtle 6s `bud-breathing` on each ring's opacity (0.6 → 1.0 → 0.6) keeps the map alive.

### Ring chips (above the map, centered)

- Three glass pills: **500m** · **1km** · **2km**.
- Tap to fly the map to that bounds (leaflet `flyToBounds` 600ms ease).
- Selected chip fills `bg-bud-primary text-white`; others stay glass.

### Pet markers — tinted by distance

- Compute `distanceMeters(userLatLng, pet)` once per pet.
- Marker bubble color stays driven by **status** (locked colors), but the **outline** gets a distance halo:
  - ≤500m: 3px `ring-bud-primary` halo + `bud-breathing` aura at 60% opacity (the "hot" set).
  - ≤1km: 2px `ring-bud-accent` halo.
  - ≤2km: 1px `ring-black/10` halo.
  - >2km: dimmed to opacity 0.55.

### Density bubbles (clusters)

- When two or more pets are within 200m of each other, render a 96px translucent bubble at their midpoint:
  - `bg-yellow-500/30 blur-2xl rounded-full` (SIGHTED yellow from the locked palette).
  - Cluster of 3+ pets → bubble becomes 140px and pulses (`bud-breathing` 1.8s).
  - Cluster of 5+ pets → an additional "Hot streak" badge appears above the bubble: `bg-red-600 text-white rounded-full px-2 py-0.5 text-[10px] font-bold uppercase`.

### Nearest pet card (floating bottom strip)

- Bottom-center of the map, 16px above the tab nav, 92% width, 64px tall.
- Glass: `bg-white/85 backdrop-blur-xl border border-black/5 rounded-2xl shadow-md`.
- Layout: thumbnail (48px round) + name + status pill + distance ("220m away · ~3 min walk") + chevron.
- Tap → opens `PetDetail` (re-use `onSelectPet`).
- Updates **live**: every 500ms while Nearby is on, re-evaluate the closest pet and animate the card swap (slide horizontal 12px + fade) when it changes.

## Motion choreography

### Enable

1. Map dims with a 200ms `opacity` tween (95% → 78% effective via a black overlay at 0.12 alpha).
2. User dot pops in (`bud-pop-in`), then breathing starts.
3. Rings stagger-fade in (500m, then 1km, then 2km) at 120ms apart.
4. Radar sweep starts rotating on a 3.2s loop.
5. Nearest pet card slides up from `translate-y-full` with overshoot.

### Disable

- Everything reverses in 220ms; map un-dims; rings fade out; nearest card slides down.

### Pet tap from card

- Tapping the bottom card emits a 96px `bud-ripple` at the pet's marker location, then opens the detail overlay (existing path).

### Reduced motion

- No sweep rotation, no breathing on rings, no halos pulse — they are static at full opacity. Card swap is an instant crossfade.

## State & logic

### Additions to `useUiStore`

```ts
userLatLng: [number, number];                 // mock user position
setUserLatLng: (ll: [number, number]) => void;
nearbyMode: boolean;
setNearbyMode: (v: boolean) => void;
nearbyFocusRadius: 500 | 1000 | 2000;
setNearbyFocusRadius: (r: 500 | 1000 | 2000) => void;
```

### Pure helpers (new file `src/lib/distance.ts`)

```ts
export function distanceMeters(a: [number, number], b: [number, number]): number {
  // Haversine, plenty good for a demo
}

export function metersToWalkMinutes(m: number): number {
  return Math.max(1, Math.round(m / 80)); // 80 m/min ≈ 5 km/h
}
```

### Derived: clusters

- Greedy O(n²) for the demo (we have ~30 pets max): for each pair within 200m, build a union-find, render one bubble per group at the centroid.
- Recompute only when `pets` array identity changes.

### Mock user position UX

- Long-press the map while Nearby is on → "Move my position here" pill appears for 1.6s; tapping it updates `userLatLng` and re-renders everything. (This is also the demo trick to show clusters from any angle.)

## Demo script (15 seconds)

1. Open the Map tab — pins are static.
2. Tap **"Nearby"** in the top-right.
3. Map dims, teal dot pops in, rings stagger out, radar sweep starts rotating, a yellow density bubble blooms over a cluster of three pets.
4. Bottom card reads: **"Maple · 220m · ~3 min walk"**.
5. Tap the card → `PetDetail` opens for Maple.

## Files touched

### New

- [`src/screens/MapNearby/NearbyToggle.tsx`](../src/screens/MapNearby/NearbyToggle.tsx)
- [`src/screens/MapNearby/RingChips.tsx`](../src/screens/MapNearby/RingChips.tsx)
- [`src/screens/MapNearby/UserDotIcon.tsx`](../src/screens/MapNearby/UserDotIcon.tsx) (returns a leaflet `divIcon`)
- [`src/screens/MapNearby/RadarSweepIcon.tsx`](../src/screens/MapNearby/RadarSweepIcon.tsx)
- [`src/screens/MapNearby/DistanceRings.tsx`](../src/screens/MapNearby/DistanceRings.tsx)
- [`src/screens/MapNearby/DensityBubbles.tsx`](../src/screens/MapNearby/DensityBubbles.tsx)
- [`src/screens/MapNearby/NearestPetCard.tsx`](../src/screens/MapNearby/NearestPetCard.tsx)
- [`src/lib/distance.ts`](../src/lib/distance.ts)

### Edits

- [`src/screens/MapView.tsx`](../src/screens/MapView.tsx) — mount the new overlays, tint markers by distance when Nearby is on.
- [`src/stores/uiStore.ts`](../src/stores/uiStore.ts) — extend with the new fields.
- [`src/index.css`](../src/index.css) — add `bud-radar` and `bud-breathing` keyframes if missing.

## Edge cases & accessibility

- **No `lat`/`lng` on a pet:** falls back to the existing grid logic; in Nearby mode, such pets are pinned to the dimmed > 2km group automatically.
- **Map drag during sweep:** sweep stays anchored to the user dot via leaflet's `LatLngBounds`-aware pane.
- **Performance:** rings + sweep + clusters are all GPU-friendly (transforms + opacity). Tested ~30 pets at 60fps in the phone frame.
- **Zoom levels:** at zoom < 12 (regional view) we hide the radar sweep and rings, keep only halos. Otherwise rings get visually huge.
- **Accessibility:** Nearby toggle is `role="switch" aria-checked={nearbyMode}`. The bottom card is a `<button>` with `aria-label` describing pet + distance.

## Build sequence (commits in order)

1. Add `bud-radar` + `bud-breathing` keyframes; add the new `uiStore` fields with `persist`.
2. Build `distance.ts` and unit-eyeball numbers (open the console, log a few known points).
3. Build `NearbyToggle` + `RingChips` shells; wire the boolean + radius into `uiStore`.
4. Build `UserDotIcon` + `RadarSweepIcon` as leaflet `divIcon`s; render at `userLatLng`.
5. Add `DistanceRings` (three `Circle`s) and the dimming overlay (a transparent leaflet pane).
6. Tint pet markers in `MapView` by distance halo.
7. Build `DensityBubbles` with greedy union-find clustering.
8. Build `NearestPetCard` with live 500ms re-eval and slide-swap animation.
9. Long-press to move user position.
10. Reduced-motion sweep; `npm run build` green.
