# 04 — Trust & Verified Neighbor

> Trust in Bud should look like an **aura** that grows around you the more you help. Every helpful sighting plants a paw flower in your **Trust Garden** on the profile page. Every community card carries a tiny trust pill so other neighbors can see who is shouting and who is showing up.

---

## TL;DR

Cross-cutting visual layer that adds:

1. **Trust auras** around avatars wherever an author or reporter is shown.
2. **Trust pills** with named levels: `New Neighbor` · `Helper` · `Trusted` · `Steward`.
3. **Trust Garden** on Profile — a 4×3 grid of soft tiles, each tile fills with a paw flower as the user accumulates helpful actions.
4. **Verified shimmer** on avatars whose mocked email is "linked".

All values are **derived** from existing stores; no backend, no new data fields.

## Roast problem it kills

- "Lost-pet apps live or die on 'is this real / is this safe.' Trust is assumed, never earned."
- "Verified neighbors" was on the missing list. This makes the absence of trust the *visible* thing the user feels — and then earns away.

## Where it lives

- Avatars and reporter strips: [`PetDetail.tsx`](../src/screens/PetDetail.tsx), `TimelineNode` from sub-plan 02, `CommunityBoard` card author, `Notifications` row.
- Profile: [`Profile.tsx`](../src/screens/Profile.tsx).
- New components: `TrustAura`, `TrustPill`, `VerifiedShimmer`, `TrustGarden`.
- Derived from: `useSightingStore` (sub-plan 01), `useStatusHistoryStore` (sub-plan 02), `useAuthStore.profile`, onboarding profile in [`src/lib/onboardingProfile.ts`](../src/lib/onboardingProfile.ts).

## The feeling

> "I posted one helpful tip and a tiny green shoot appeared in my profile. I helped reunite a pet and a flower bloomed. My avatar started carrying a warm halo. The app remembered me."

## UI anatomy

### Trust levels

| Level | Threshold | Aura class | Pill label color | Glyph |
|---|---|---|---|---|
| 🌱 New Neighbor | 0 helpful actions | none (transparent) | `text-bud-text-muted` on `bg-black/[0.06]` | sprout |
| 🌾 Helper | 1–3 sightings | `bud-accent/30 blur-md` | `text-bud-accent` on `bg-bud-accent/10` | grass |
| 🌿 Trusted | 4–9 sightings **or** 1 reunion | `bud-primary/30 blur-md` | `text-bud-primary` on `bg-bud-primary/10` | leaf |
| 🌳 Steward | 10+ sightings **and** 3+ reunions | shimmering `bud-primary/40 blur-lg` + `bud-shimmer` overlay | `text-white` on `bg-bud-primary` | tree |

> Glyphs are simple inline SVGs (paw, grass, leaf, tree) — no icon library added.

### TrustAura (wraps any avatar)

- A `<span>` placed behind the avatar with `position: absolute; inset: -4px; rounded-full`.
- Background: the aura class for the user's level.
- `Steward` only: add a sibling overlay with `bud-shimmer` running diagonally on a 2.4s loop.
- `New Neighbor`: render nothing (no DOM cost).

### TrustPill

- Inline pill, 18–20px tall, `rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide`.
- Contains glyph + label.
- Appears in:
  - Reporter row on `TimelineNode` expanded card.
  - Below the user name on `Profile`.
  - On the community card meta line, *only* if not "New Neighbor" (avoid noise for everyone).
- Tap → opens a tiny popover explaining the level + what unlocks the next one (`text-xs`, 8 lines max, glass).

### VerifiedShimmer

- A 14px filled blue check, `bg-blue-500 text-white rounded-full`, positioned bottom-right of the avatar.
- On the check, a constant `bud-shimmer` runs at low alpha.
- Mocked: any user whose `profile.phone` is non-empty **or** whose onboarding profile is filled is "verified" for the demo.

### Trust Garden (on Profile)

A 4×3 grid of round tiles (12 tiles total), `aspect-square`, soft `bg-bud-surface-low rounded-2xl`.

- Each filled tile shows a paw flower SVG, color cycles through primary, accent, and yellow at 33% each.
- Filling order: one tile per "helpful action" (a sighting submission), up to 12. After 12, the garden stays full and a "Steward" ribbon appears across the bottom.
- Each new tile fills with a **bloom** animation:
  - 0%: scale 0, hue at 60deg.
  - 80%: scale 1.1.
  - 100%: scale 1.
  - Total 520ms, `cubic-bezier(.34,1.56,.64,1)`.
- Hover/tap a tile → tooltip with the action it represents ("Sighting for Maple, 3d ago").

### Garden header

- Headline: "Your Trust Garden".
- Subcopy: "Each helpful action plants a flower. Three reunions make you a Steward."
- Counter pill on the right: `5 / 12 actions` (digits roll via `bud-roll-digit`).

### Empty Garden

If the user has 0 helpful actions:

- All 12 tiles are dimmed.
- A large floating bubble sits behind the grid with a paw glyph and the copy "Plant your first flower."
- Pressing the bubble opens the **Sighting Sheet** for any nearby lost pet (jumps to the Map tab in Nearby mode if no obvious target).

## Motion choreography

- **Aura appears** when the user crosses a threshold: a 360ms scale-up of the aura, plus one `bud-bubble-rise` from below the avatar.
- **Garden tile bloom** when a new helpful action is recorded: see above.
- **Pill upgrade** when a user crosses a threshold: pill morphs (background fills with new color over 320ms, label text crossfades, then a 24px `bud-ripple` originates from the pill).
- **Steward shimmer** is always on for Stewards; reduced motion sets opacity 0.5 and stops the sweep.

## State & logic

### Pure derivation (no new store)

Add `src/lib/trust.ts`:

```ts
export type TrustLevel = "new" | "helper" | "trusted" | "steward";

export function computeTrust(input: {
  sightingsCount: number;
  reunionsAssistedCount: number;
}): TrustLevel {
  const { sightingsCount, reunionsAssistedCount } = input;
  if (sightingsCount >= 10 && reunionsAssistedCount >= 3) return "steward";
  if (sightingsCount >= 4 || reunionsAssistedCount >= 1) return "trusted";
  if (sightingsCount >= 1) return "helper";
  return "new";
}

export function trustMeta(level: TrustLevel): { label: string; aura: string; pill: string; glyph: "sprout" | "grass" | "leaf" | "tree" };
```

### Counts per user

```ts
function useTrustForUser(userId: string) {
  const sightingsCount = useSightingStore(s => s.sightings.filter(x => x.reporterId === userId).length);
  const reunions = useStatusHistoryStore(s => s.changes.filter(c => c.byUserId === userId && c.to === "REUNITED").length);
  return computeTrust({ sightingsCount, reunionsAssistedCount: reunions });
}
```

### Verified flag

```ts
function useIsVerified(userId: string) {
  const profile = useAuthStore(s => s.profile);
  const onboarding = getOnboardingProfile();
  return Boolean(profile?.phone) || Boolean(onboarding?.city);
}
```

(Mocked but consistent: as soon as the user finishes onboarding or fills profile phone, they are "verified" — the rest of the app already drives users toward both.)

## Demo script (15 seconds)

1. From profile (guest), the Trust Garden is empty with a glowing bubble.
2. Tap the bubble → jump to Map, Nearby mode on → tap nearest pet card → Sighting Sheet (sub-plan 01).
3. Submit a sighting.
4. Bell rings, return to Profile.
5. Garden has bloomed one tile. The pill at the top reads **"Helper"** with the accent aura behind the avatar.
6. Show the popover by tapping the pill — explains what "Trusted" needs next.

## Files touched

### New

- [`src/lib/trust.ts`](../src/lib/trust.ts)
- [`src/components/Trust/TrustAura.tsx`](../src/components/Trust/TrustAura.tsx)
- [`src/components/Trust/TrustPill.tsx`](../src/components/Trust/TrustPill.tsx)
- [`src/components/Trust/VerifiedShimmer.tsx`](../src/components/Trust/VerifiedShimmer.tsx)
- [`src/components/Trust/TrustGarden.tsx`](../src/components/Trust/TrustGarden.tsx)

### Edits (className + small JSX wraps)

- [`src/screens/Profile.tsx`](../src/screens/Profile.tsx) — wrap avatar with `<TrustAura>`, add `<TrustPill>` under name, mount `<TrustGarden />` between profile card and "My reports".
- [`src/components/PetActivityTimeline/TimelineNode.tsx`](../src/components/PetActivityTimeline/TimelineNode.tsx) — wrap reporter avatar with `TrustAura`, add `TrustPill`.
- [`src/screens/CommunityBoard.tsx`](../src/screens/CommunityBoard.tsx) — optional tiny `TrustPill` under reporter info on the meta line (only if level ≥ Helper).
- [`src/screens/Notifications.tsx`](../src/screens/Notifications.tsx) — `TrustPill` next to the title for sighting-type notifications.
- [`src/index.css`](../src/index.css) — `bud-shimmer` keyframe (if missing).

## Edge cases & accessibility

- **Guest users** (no auth): use `getActorReporterIdForUi` so counts still work in single-device demo.
- **Threshold flicker:** debounce upgrades so a user submitting 3 sightings in quick succession doesn't see two pill flashes — single upgrade animation on settle (300ms `setTimeout`).
- **Color contrast:** pills always meet 4.5:1 against the canvas. The Trusted pill on white passes; the Helper pill is the visually lightest — confirmed against beige canvas.
- **Reduced motion:** auras static, garden tiles fade in without bloom, shimmer disabled.
- **Screen reader:** Trust Pill exposes `aria-label="Trust level: Helper. Five helpful actions so far."`. Garden tiles are `aria-hidden` collectively under one container with an `aria-label`.

## Build sequence (commits in order)

1. `src/lib/trust.ts` + `useTrustForUser` hook + `useIsVerified`.
2. `TrustAura` + `TrustPill` + `VerifiedShimmer` components with three level variants.
3. Wrap avatars in the three places (Profile, Timeline, Community optional).
4. `TrustGarden` on Profile with 12 tiles, bloom animation on insert.
5. Wire the bloom into `useSightingStore` updates (subscribe to length changes).
6. Threshold debouncing + upgrade animation.
7. Reduced-motion fallbacks; `npm run build` green.
