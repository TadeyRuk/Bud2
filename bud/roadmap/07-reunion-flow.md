# 07 — Reunion Celebration Flow

> When an owner marks **REUNITED**, Bud should cry happy tears. A full-frame celebration overlay erupts from the pet's photo: bubble shower, paw confetti, the word "Reunited" stamped letter-by-letter, days-lost statistic rolling down to a heart, and an auto-generated share card with the pet, the helpers, and a soft glow that says *thank you, neighbors.*

---

## TL;DR

Replace today's quiet `markReunited` flow (which just changes a status and toasts) with a multi-stage celebration that lives over the entire phone frame for ~5 seconds, then resolves into a **shareable thank-you card**. After dismissal, the pet's card on the community feed becomes a permanent "Reunited" card with a subtle drifting-heart background.

## Roast problem it kills

- "Reunion has no payoff."
- The single biggest emotional beat in a lost-pet app has been silent. This makes it the **loudest** moment in the demo.

## Where it lives

- Triggered from [`OwnerPetActions.tsx`](../src/components/OwnerPetActions.tsx) `markReunited()` and from any path that calls `updatePetStatus(petId, "REUNITED")`.
- Overlay: new `ReunionOverlay` mounted at the root in `MainShell` (so it sits above tabs, sheets, drawers, and pet detail).
- After-state: a new "Reunited" treatment on the pet card in [`CommunityBoard.tsx`](../src/screens/CommunityBoard.tsx) and a permanent banner on `PetDetail`.

## The feeling

> "Time stopped. The photo I'd been staring at for days lifted off the screen, the word **Reunited** stamped itself across the air, the helpers' names floated up around it like paper boats, and the share card came in like a thank-you note from the dog."

## UI anatomy

The overlay has **five timed stages**. Each stage rolls into the next; the user can tap **Skip** at any time and land directly on the share card.

### Stage 0 — Capture (0–300ms)

- Tap "Mark as reunited" → before any animation, the overlay mounts in `pointer-events-none` mode so it doesn't intercept anything for a frame.
- The current pet hero photo's `DOMRect` is captured to use as the visual origin.

### Stage 1 — Hush (300–700ms)

- Whole screen darkens with `bg-black/55 backdrop-blur-sm` from 0 → full over 400ms.
- The pet hero photo clones to the overlay layer at its captured rect, then begins floating to screen center (translate + scale 1.08, easing cubic-bezier(.34,1.56,.64,1)).
- All ambient audio (if added later) ducks.

### Stage 2 — Burst (700–1700ms)

- A `bud-confetti-burst` of 36 particles erupts from the photo center.
- Particle mix: 12 paws (`bg-bud-primary`), 12 bubbles (`bg-bud-accent`), 8 hearts (`bg-blue-500`), 4 stars (`bg-yellow-500`). All locked palette.
- Photo grows a soft outer glow (`shadow-[0_0_80px_24px_rgba(59,130,246,0.45)]` — the REUNITED blue) that pulses once.
- A wide ring (`bud-ripple`, 240px → 640px) sweeps outward behind the photo.

### Stage 3 — Stamp (1500–2900ms)

- The word **REUNITED** assembles letter-by-letter, 80ms apart.
- Each letter:
  - Drops in from above with translateY(-24px) → 0.
  - Bounces with overshoot (scale 0.7 → 1.12 → 1).
  - 1px stroke `text-bud-primary`, fill `text-bud-text`, font `font-headline font-extrabold text-5xl tracking-tight`.
- Once all letters are placed, a subtle `bud-shimmer` sweeps across them once.

### Stage 4 — Statistics (2900–4400ms)

- Three pill cards float up around the photo (staggered 200ms):

  | Pill | Source | Display |
  |---|---|---|
  | **Days lost** | `Date.now() - createdAt(petStatus=LOST first event)` | rolling number, large |
  | **Helpers** | unique reporter count from `sightingStore.forPet(petId)` | small avatar stack (max 4 + `+N`) |
  | **Sightings** | `sightingStore.countForPet(petId)` | rolling number, small |

- Each pill has a `TrustAura` tint (sub-plan 04) so the visual language stays consistent.

### Stage 5 — Share card (4400ms+)

- Stats fade. Photo shrinks back slightly into a **share card** layout:
  - Aspect ratio `4:5`, `rounded-3xl`, glass-on-photo with the photo at top.
  - Caption: **"{name} is home."** large; **"Thanks to {n} neighbors."** small.
  - Tiny stamp at the bottom right with a paw + "via Bud".
  - Border: 2px in REUNITED blue at 35% alpha.
- Three action buttons stack below:
  - **Share** (primary terracotta) — uses `navigator.share()` if available, else copies a text fallback.
  - **Download card** (outlined accent) — renders the card to PNG via `html-to-image` and triggers a download.
  - **Back to feed** (ghost) — closes overlay.

### Persistent after-state

- The pet card on the community feed switches to a **"Reunited" treatment**:
  - Same locked status pill (`bg-blue-500 text-white`).
  - Card border picks up a soft `bg-blue-500/15` outer glow.
  - Background of the card has 3 drifting hearts running `bud-bubble-rise` very slowly (every 6s), `bg-blue-500/15 blur-md`.
  - Tap → `PetDetail` shows a permanent ribbon "Reunited on May 14, 2026" at the top of the hero.

## Motion choreography summary

| Stage | Duration | Effect |
|---|---|---|
| Hush | 400ms | dim, photo floats to center |
| Burst | 1000ms | 36-particle confetti + ring |
| Stamp | 1400ms | letter-by-letter REUNITED |
| Stats | 1500ms | three stat pills float in |
| Share card | sticky | card with three buttons |

Total uninterrupted: ~5.3 seconds. A **Skip** button is always visible bottom-right after the first 700ms.

### Reduced motion

- No photo float, no confetti, no letter-by-letter.
- Overlay fades in over 200ms; word "Reunited" appears as a single static block; share card cross-fades in. The user still sees the stats and the card.

## State & logic

### Trigger

`OwnerPetActions.markReunited` →

```ts
await updatePetStatus(pet.id, "REUNITED");        // existing
statusHistoryStore.recordChange({                  // from sub-plan 02
  petId: pet.id, from: pet.status, to: "REUNITED",
  byUserId: actorId, byUserName,
});
useReunionStore.start(pet.id);                     // new
```

### New store: `useReunionStore`

```ts
type ReunionState = {
  activePetId: string | null;
  stage: "idle" | "hush" | "burst" | "stamp" | "stats" | "card";
  start: (petId: string) => void;
  skip: () => void;
  close: () => void;
};
```

Stage transitions are driven by `setTimeout`s with the durations above; `skip()` clears all and jumps to `"card"`.

### Derived stats

```ts
function useReunionStats(petId: string) {
  const sightings = useSightingStore(s => s.forPet(petId));
  const statusChanges = useStatusHistoryStore(s => s.forPet(petId));
  const firstLost = statusChanges.find(c => c.to === "LOST")?.createdAt;
  const daysLost = firstLost ? Math.floor((Date.now() - +new Date(firstLost)) / 86400_000) : 0;
  const helpers = new Set(sightings.map(s => s.reporterId)).size;
  return { daysLost, helpers, sightings: sightings.length };
}
```

### Share card render

- Build the card as a normal React tree in `ReunionShareCard.tsx`.
- For **Download**, use `html-to-image` (lightweight, ~10KB) → PNG blob → `URL.createObjectURL` → temporary `<a download>`.
- For **Share**, build `shareData = { title: "{name} is home", text: "Reunited with the help of {n} neighbors.", url: window.location.href }` and call `navigator.share` with a fallback to clipboard (mirroring existing `sharePet` in [`PetDetail.tsx`](../src/screens/PetDetail.tsx)).

### Persistent "Reunited" treatment

- No new flag; the existing `pet.status === "REUNITED"` drives the card treatment in `CommunityBoard`.
- New: render `<DriftingHearts />` inside the card when `status === "REUNITED"`.
- New: ribbon in `PetDetail` when status is REUNITED, with a date pulled from `statusHistoryStore`.

## Demo script (15 seconds)

1. Open a pet you own. Tap **"Mark as reunited"**.
2. Screen dims, the photo floats to center, **36 particles erupt** in primary, accent, blue, and yellow.
3. Letters of **REUNITED** drop in one by one with a shimmer.
4. **"Days lost: 6"** rolls down to **0** beside a heart; **"Helpers: 4"** appears with a tiny avatar stack.
5. Share card glides into place with three buttons. Tap **Share** → share sheet pops, tap cancel, tap **Back to feed**.
6. Pet card on the feed now has the REUNITED blue pill, a soft blue glow, and three hearts drift across the card every 6s.

## Files touched

### New

- [`src/components/Reunion/ReunionOverlay.tsx`](../src/components/Reunion/ReunionOverlay.tsx) — orchestrates the 5 stages.
- [`src/components/Reunion/ReunionConfetti.tsx`](../src/components/Reunion/ReunionConfetti.tsx) — particle system.
- [`src/components/Reunion/ReunionLetters.tsx`](../src/components/Reunion/ReunionLetters.tsx) — letter-by-letter stamp.
- [`src/components/Reunion/ReunionStats.tsx`](../src/components/Reunion/ReunionStats.tsx) — three stat pills.
- [`src/components/Reunion/ReunionShareCard.tsx`](../src/components/Reunion/ReunionShareCard.tsx) — DOM card + Share / Download / Back buttons.
- [`src/components/Reunion/DriftingHearts.tsx`](../src/components/Reunion/DriftingHearts.tsx) — ambient hearts on reunited feed cards.
- [`src/stores/reunionStore.ts`](../src/stores/reunionStore.ts)

### Edits

- [`src/MainShell.tsx`](../src/MainShell.tsx) — mount `<ReunionOverlay />` at root z-index above sheets and overlays.
- [`src/components/OwnerPetActions.tsx`](../src/components/OwnerPetActions.tsx) — after `updatePetStatus(pet.id, "REUNITED")` succeeds, call `useReunionStore.start(pet.id)`.
- [`src/screens/CommunityBoard.tsx`](../src/screens/CommunityBoard.tsx) — when `pet.status === "REUNITED"`, apply blue glow + mount `<DriftingHearts />`.
- [`src/screens/PetDetail.tsx`](../src/screens/PetDetail.tsx) — when status is REUNITED, show "Reunited on {date}" ribbon and replace the contact CTAs with a single **"Share the good news"** that opens `ReunionShareCard` directly.
- [`package.json`](../package.json) — add `html-to-image` (~10KB) for the Download.

## Edge cases & accessibility

- **Photo missing:** if `pet.image_url` is null, the floating element is the existing placeholder SVG with the REUNITED blue ring. The card still works, captioned with the pet's name in large type.
- **Days lost is 0:** copy adjusts to "Same-day reunion · {n} helpers."
- **`navigator.share` unsupported:** Share button falls back to clipboard copy with a toast (`budToast({ kind: "reunion", title: "Copied to clipboard" })`).
- **Skip from any stage** lands on the card cleanly (clears timeouts).
- **Accessibility:**
  - Overlay traps focus, returns focus to the trigger button on close.
  - All animated content is wrapped in `aria-hidden="true"` while a polite live region announces "{pet.name} has been marked as reunited. {n} helpers thanked."
  - Letters use `aria-label="Reunited"` on the wrapper while each letter is `aria-hidden`.
- **Reduced motion** as described.

## Build sequence (commits in order)

1. `useReunionStore` with stages + timing constants.
2. `ReunionOverlay` shell wired into `OwnerPetActions`.
3. `ReunionConfetti` particle system (canvas-free, just absolutely-positioned divs).
4. `ReunionLetters` letter stamp.
5. `ReunionStats` driven by the derived hook.
6. `ReunionShareCard` with Share + Back. Download last.
7. Persistent treatment: `DriftingHearts` on community card; "Reunited on {date}" ribbon in `PetDetail`.
8. `html-to-image` for download, optional polish.
9. Reduced motion + a11y pass; `npm run build` green.
