# 01 — Sighting Submission Sheet

> Replace the `window.prompt` in [`CommunityBoard.tsx`](../src/screens/CommunityBoard.tsx) with a fully designed bottom-sheet flow that turns "I Have Info" from an embarrassment into the most satisfying interaction in the app.

---

## TL;DR

A 3-step bottom sheet that springs up from the card the user tapped. The user picks **what** they saw, **where** they saw it, and (optionally) **a photo**. On submit, a trail of bubbles rises out of the sheet, the sheet collapses into the originating card, and a ripple pulses through the card to confirm the sighting landed.

## Roast problem it kills

- "One of your core actions is still `window.prompt`. That's not an MVP feature — it's a placeholder."
- Replaces that with the **single most polished interaction** in the demo.

## Where it lives

- **Trigger:** the "I Have Info" button on each pet card in [`CommunityBoard.tsx`](../src/screens/CommunityBoard.tsx) and the same button on [`PetDetail.tsx`](../src/screens/PetDetail.tsx) (`Contact Owner` row gets a third sibling: "Report a sighting").
- **Mount point:** new overlay component `SightingSheet` rendered inside `MainShell` so it survives tab switches.
- **No new routes** — purely overlay state in `useUiStore`.

## The feeling

> "I tapped a tiny button on a card and the whole card lifted itself up into a glassy sheet that asked me three small questions, then exhaled bubbles when I was done."

It should feel like **lifting a leaf to look underneath**. Light. Warm. Inviting. The opposite of a form.

## UI anatomy

### Container

- Full-width bottom sheet, max-width matches `PhoneFrame` (430px).
- Rounded top: `rounded-t-3xl`.
- Background: `bg-bud-card/95 backdrop-blur-xl` with a subtle `bud-shimmer` along the top edge.
- Drag handle: 36px × 4px pill, `bg-bud-text-muted/30`, centered, drag-to-dismiss.
- Backdrop: `bg-black/35 backdrop-blur-[2px]`, tap-to-dismiss.

### Top strip (always visible across steps)

- Left: the pet's avatar (40px round) + name + status pill (using the locked status colors).
- Right: a 3-dot step indicator (`bud-pop-in` on the active dot).
- Bottom border: `border-b border-black/5`.

### Step 1 — "Where did you see them?"

Two stacked controls:

1. **Mini map preview** — 100% wide, 140px tall, `rounded-2xl`, OSM tiles from `react-leaflet` (already a dependency).
   - Defaults centered on the **pet's last known location** with a soft `bud-radar` sweep for the first 2.4s after the sheet opens.
   - Tap to drop a pin → pin lands with `bud-pop-in` + a 36px `bud-ripple` underneath.
   - Below the map: a chip showing reverse-geocoded label or `"12.345, 67.890"` fallback (reuse `reverseGeocodeRoughAddress` from [`LocationPickerMap.tsx`](../src/components/LocationPickerMap.tsx)).
2. **When?** — three time chips: `Just now` / `Within an hour` / `Earlier today`. Tap = `bud-pop-in` + chip fills `bg-bud-primary text-white`.

### Step 2 — "What did you see?"

- **Confidence row** — five paw glyphs. Tapping paw N fills paws 1..N with `bg-bud-primary`. Each fill is a 60ms staggered `bud-pop-in`. Caption underneath:
  - 1 paw: "Pretty sure I saw something"
  - 3 paws: "Confident it's the same pet"
  - 5 paws: "Certain — I got close"
- **Mood chips** (multi-select, optional): `Healthy` · `Skittish` · `Injured` · `With someone` · `Hungry`. Selected chip: `bg-bud-accent text-white` with `bud-ripple` on tap.
- **Free text** — auto-growing `<textarea>`, placeholder "Anything that would help the owner?". Cap 240 chars; counter on the right with rolling digits (`bud-roll-digit`) once over 200.

### Step 3 — "Photo (optional)"

- Big drop target, 160px tall, `border-2 border-dashed border-bud-primary/30 rounded-2xl`.
- Idle state: a single `bud-bubble-rise` loop inside the target with a paw glyph drifting up.
- On file pick: preview fills the target with `bud-pop-in`. A tiny "Remove" pill appears bottom-right.
- Helper text: "We never share your photo without the owner's review."

### Footer (sticky)

- Left: `Back` ghost button (hidden on step 1).
- Right: primary button — label changes per step: `Next` / `Next` / **`Submit sighting`**.
- On final tap: button fills, the word swaps to a tiny spinner (`bud-breathing`), then to a check icon, then the sheet collapses (see Motion).

## Motion choreography

### Open

1. Backdrop fades in over 180ms.
2. Sheet translates up from `translate-y-full` to `0` over 360ms with `cubic-bezier(.34,1.56,.64,1)` (overshoots ~8px then settles).
3. 4 ambient bubbles (`bud-bubble-rise`, primary at 0.18 alpha) drift up behind the sheet content for the first 1.2s.

### Step transitions

- Outgoing step: translateX -16px + opacity 0, 200ms.
- Incoming step: translateX +16px → 0 + opacity 1, 220ms, 40ms after outgoing starts.

### Submit

1. Submit button morphs into a 32px primary circle (`width` animates over 240ms).
2. The circle rises out of the sheet, leaving a trail of **6 bubbles** (`bud-bubble-rise`, varying sizes 8–24px, primary + accent + status-yellow).
3. Sheet collapses downward into a 56px pill that homes back toward the originating pet card (`getBoundingClientRect` to compute the path).
4. On arrival, the pet card emits a `bud-ripple` (160px diameter, primary at 0.35 alpha) and a `bud-pop-in` on a new "1 new sighting" badge in the top-right of the card.
5. Toast (reusing `react-hot-toast`) reads: **"Thanks — the owner has been notified."**

Total time from tap to toast: **~1.4s**.

### Reduced motion

- No bubble trail, no overshoot, no homing pill. Sheet fades out in 160ms; pet card gets the badge with a simple opacity fade.

## State & logic

### New store: `useSightingStore` (zustand + `persist`)

```ts
type Sighting = {
  id: string;
  petId: string;
  reporterId: string;        // current user id, or "guest-<uuid>"
  reporterName: string;      // from auth or onboarding profile
  message: string;
  moods: Array<"healthy" | "skittish" | "injured" | "with-someone" | "hungry">;
  confidence: 1 | 2 | 3 | 4 | 5;
  when: "just-now" | "within-hour" | "earlier-today";
  lat: number | null;
  lng: number | null;
  locationLabel: string;
  photoDataUrl: string | null; // base64; we are frontend-only
  createdAt: string;           // ISO
};

type SightingStore = {
  sightings: Sighting[];
  addSighting: (s: Omit<Sighting, "id" | "createdAt">) => Sighting;
  forPet: (petId: string) => Sighting[];
  countForPet: (petId: string) => number;
};
```

- Persist key: `bud:sightings:v1`.
- Photos: stored as `dataURL` from a `FileReader`. We do not upload anywhere.

### UI state in `useUiStore`

Add:

```ts
sightingSheetOpen: boolean;
sightingSheetPetId: string | null;
sightingSheetOriginRect: DOMRect | null; // for the collapse-home animation
openSightingSheet: (petId: string, originRect: DOMRect) => void;
closeSightingSheet: () => void;
```

### Side effect on submit

Push a notification into `useNotificationStore` so the bell badge updates in real time (this is what makes the demo feel alive):

```ts
notificationStore.add({
  type: "sighting",
  title: `New sighting for ${pet.name}`,
  body: sighting.message || "A neighbor reported seeing them.",
  petId: pet.id,
  unread: true,
});
```

## Demo script (15 seconds)

1. Tap **"I Have Info"** on the top card of the community feed.
2. Sheet springs up — confidence row, three quick taps to set 4 paws, one mood chip ("Skittish"), one short message.
3. Hit `Next` twice, skip the photo, hit `Submit sighting`.
4. Bubbles rise, sheet homes back into the card, "1 new sighting" badge pops, toast confirms.
5. Bell badge pulses with `+1` — close out by tapping the bell to show the new notification.

## Files touched

### New

- [`src/components/SightingSheet/SightingSheet.tsx`](../src/components/SightingSheet/SightingSheet.tsx) — overlay shell.
- [`src/components/SightingSheet/StepLocation.tsx`](../src/components/SightingSheet/StepLocation.tsx)
- [`src/components/SightingSheet/StepDetails.tsx`](../src/components/SightingSheet/StepDetails.tsx)
- [`src/components/SightingSheet/StepPhoto.tsx`](../src/components/SightingSheet/StepPhoto.tsx)
- [`src/components/SightingSheet/PawConfidence.tsx`](../src/components/SightingSheet/PawConfidence.tsx)
- [`src/components/SightingSheet/MoodChips.tsx`](../src/components/SightingSheet/MoodChips.tsx)
- [`src/components/SightingSheet/BubbleTrail.tsx`](../src/components/SightingSheet/BubbleTrail.tsx) — the submit animation.
- [`src/stores/sightingStore.ts`](../src/stores/sightingStore.ts)

### Edits (className + props only)

- [`src/MainShell.tsx`](../src/MainShell.tsx) — mount `<SightingSheet />` once at the root.
- [`src/screens/CommunityBoard.tsx`](../src/screens/CommunityBoard.tsx) — replace the `window.prompt` block in `handleHaveInfo` with `openSightingSheet(pet.id, e.currentTarget.getBoundingClientRect())`.
- [`src/screens/PetDetail.tsx`](../src/screens/PetDetail.tsx) — add a third button "Report a sighting" alongside "Contact Owner / Contact Barangay".
- [`src/index.css`](../src/index.css) — add `bud-bubble-rise`, `bud-ripple`, `bud-pop-in` keyframes if not already present.

## Edge cases & accessibility

- **Drag-to-dismiss** must not fire if the user is dragging the map inside step 1 (`stopPropagation` on the leaflet container).
- **iOS keyboard** pushes the sheet up — sheet uses `100dvh` math, footer is `position: sticky; bottom: 0` so the submit button never gets covered.
- **Validation:** confidence is required to advance past step 2. Everything else is optional.
- **Empty submit guard:** if the user somehow makes it to submit with zero message **and** zero photo, we still accept it but the sighting card later says "Reported, no details shared."
- **`aria-modal="true"`** on the sheet, focus trap, focus returns to the originating button on close.
- **Reduced motion**: no homing pill, no bubble trail, no shimmer; we fade.

## Build sequence (commits in order)

1. Add the three new keyframes to [`src/index.css`](../src/index.css) and a tiny demo Story file so we can eyeball them.
2. Create `useSightingStore` with `persist`; seed 3 mock sightings for the top-of-feed pet so the badge looks alive on first load.
3. Build `SightingSheet` shell with open/close + backdrop + drag handle + 3 empty steps; wire from `CommunityBoard`.
4. Build `StepLocation` (mini map + when chips), `StepDetails` (paws + moods + textarea), `StepPhoto` (drop target).
5. Implement the `BubbleTrail` + homing pill submit animation.
6. Hook the submit into `notificationStore` so the bell badge updates.
7. Polish: focus trap, reduced motion fallbacks, `npm run build` green.
