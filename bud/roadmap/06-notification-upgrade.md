# 06 — Notification Center Upgrade

> The bell currently shows a number. **Notifications should feel like the heartbeat of the community.** A breathing badge, push-style toasts with paw stamps, a "Breaking sightings" strip above the feed, a notification center grouped by day, pull-to-refresh that spawns bubbles, and a mark-all-read confetti burst.

---

## TL;DR

Five linked upgrades:

1. **Breathing bell badge** — animates whenever an unread arrives.
2. **Paw-stamp toasts** — replace flat `react-hot-toast` strings with branded toasts that stamp in with a paw glyph and an accent stripe matched to the notification type.
3. **Breaking sightings strip** — horizontally scrolling glass strip above the community feed showing the last 5 new sightings as live thumbnails.
4. **Notification Center** redesign — grouped by day, sticky day headers, pull-to-refresh with bubble particles, paw-burst confetti on mark-all-read.
5. **Quiet hours toggle** — a cosmetic moon switch on the notification center that dims live alerts visually for the demo's "calm" path.

## Roast problem it kills

- "Notifications: in-app list is minimum; push, digest, and 'mute this thread' are what make people come back."
- "Profile and notifications: the bones are there, but the emotional journey is barely sketched."

## Where it lives

- Bell button in [`MainShell.tsx`](../src/MainShell.tsx) `AppHeader`.
- Toast layer: already mounted in `MainShell` via `react-hot-toast`. We add a thin wrapper `budToast()`.
- Breaking strip: above the existing community feed in [`CommunityBoard.tsx`](../src/screens/CommunityBoard.tsx).
- Notification Center: [`Notifications.tsx`](../src/screens/Notifications.tsx).

## The feeling

> "The bell *is* breathing because the community is. A new sighting lands like a soft stamp from the top of the screen. The community feed has a heartbeat strip across the top, and the notification center feels less like an inbox and more like a diary."

## UI anatomy

### Bell button

- 40px circular, glass background (`bg-white/40 backdrop-blur-md`).
- Bell SVG inside, 24px.
- Badge (only when `unreadCount > 0`):
  - 18px circle, top-right `-translate-y-1/2 translate-x-1/2`.
  - Background colored by **most urgent unread type**:
    - sighting / contact_request → `bg-bud-primary`.
    - status (LOST) → `bg-red-600`.
    - status (FOUND) → `bg-green-600`.
    - status (REUNITED) → `bg-blue-500`.
  - `bud-breathing` always on the badge while unread.
  - On new notif arrival: emit a 24px `bud-ripple` outward + roll the count digit.

### Toast wrapper `budToast`

A thin façade over `react-hot-toast`:

```ts
type ToastKind = "sighting" | "status" | "match" | "reunion" | "system";

budToast({ kind, title, body });
```

Maps kind → icon (paw / pin / heart / etc.) and accent stripe color. Layout:

- 320px max width, glass, `rounded-2xl`, left stripe 4px wide in the kind's color.
- Paw icon top-left in a 32px circle with the kind's color at 10% alpha.
- Title `text-sm font-semibold`, body `text-xs text-bud-text-muted`.
- Slide-in: from top, 220ms, slight overshoot. On enter the paw scales from 0.6 → 1.1 → 1 (260ms) with a 24px `bud-ripple` originating from the paw center.

### Breaking Sightings strip

- Horizontally scrolling strip above the search row on Community.
- Title eyebrow: `BREAKING · LAST 24H` in `text-bud-accent`.
- Each tile: 64px tall, 100px wide, `rounded-2xl`, pet thumbnail + bottom gradient label with "Maple · 12m ago".
- The leftmost tile pulses with a 12px outer ring (`bud-breathing`).
- Auto-scrolls 8px every 4s on a loop unless the user is touching it.
- Tap a tile → open `PetDetail` with the timeline scrolled to the latest sighting.

### Notification Center redesign

#### Header

- Title "Notifications".
- Right: glass moon switch — **Quiet hours**. Toggling dims the page chrome and pauses badge breathing.
- Below: a glass filter row of 4 chips — `All` · `Sightings` · `Status` · `Reunions`. Same morph treatment as the Filter Drawer chips.

#### Pull-to-refresh

- Drag the list down up to 80px.
- During pull, a paw glyph at top tilts based on pull distance.
- On release ≥ 60px, the paw rotates a half turn while **6 bubbles** rise from where it sits. After 700ms, the new notifications (mocked) animate in at the top with `bud-pop-in`.

#### Grouped list

- Each day is a sticky header: **TODAY** / **YESTERDAY** / `Mon, May 12` with a thin underline.
- Rows:
  - 56px tall, 12px padding.
  - Left: 36px circular icon in the kind's accent color.
  - Middle: title + body (2-line clamp).
  - Right: time (`text-xs text-bud-text-muted`).
  - Unread state: left edge has a 3px stripe in the kind's color and `bg-bud-surface-low/60`.
- Tap row → `markRead(id)` and:
  - If row has `petId`, slide into `PetDetail`.
  - Else: just stays read (with a `bud-ripple` confirm).

#### Empty state

- Big floating bubble with a sleeping-paw glyph.
- Copy: "Quiet for now. We'll wake you when neighbors check in on your pets."

#### Mark all read

- Top-right text button (only when unread > 0).
- Tap → triggers `bud-confetti-burst` from the bell badge position, then the badge collapses to 0 with a `bud-pop-in` reverse.

## Motion choreography

### New notification arrival

1. Toast slides from top with overshoot.
2. Paw stamps, `bud-ripple` from paw center.
3. Bell badge: digit rolls, ring `bud-ripple` outward.
4. If the user is on Community, the Breaking Strip prepends a new tile with `bud-pop-in` and a 6-bubble trail.

### Pull-to-refresh

- Paw rotates with the drag (linear), reset on cancel.
- On commit: spin completes, 6 bubbles, list re-renders with new items popping in 60ms stagger.

### Mark-all-read confetti

- 24 particles (mix of paw + bubble + heart shapes), spawn at bell badge, scatter outward over 1.4s with parabolic gravity, fade out at 1.6s.
- Particle colors from primary / accent / yellow / status-blue (the locked palette).

### Reduced motion

- No paw stamps (icon static), no pull bubbles, no confetti. Toasts fade in; badge is a static dot; bell still updates the count.

## State & logic

### Extend existing `useNotificationStore`

Today the store talks to Supabase. For demo, add:

- `mockMode`: when `supabaseConfigured === false` or for any user without auth, drive everything from local state.
- `pushLocal(notification)`: prepend a mock notification (used by sub-plan 01 submissions and sub-plan 07 reunions).
- `groupedByDay`: derived selector returning `Record<"today" | "yesterday" | "older", Notification[]>`.

### Breaking strip data

Derived selector on `useSightingStore`:

```ts
const recentSightings = useSightingStore(s =>
  s.sightings
    .filter(x => Date.now() - +new Date(x.createdAt) < 24 * 3600_000)
    .slice(0, 5)
);
```

### Quiet hours (cosmetic)

Toggle stored in `useUiStore.quietHours`. When on:

- Bell badge stops `bud-breathing`.
- Toasts are intercepted and queued (set a max 1 banner at a time, no auto-stack).
- Notification Center applies a subtle grey wash (`bg-black/[0.03]`).

This is a visual demo flourish, not a real DND implementation.

## Demo script (15 seconds)

1. From Community, the Breaking Sightings strip is already showing 3 tiles, leftmost pulsing.
2. Tap a tile → land on `PetDetail` with the timeline scrolled to today.
3. Back to Community. Open Sighting Sheet (sub-plan 01), submit a sighting.
4. As the sheet collapses, a paw-stamp toast lands top-center, bell badge breathes, Breaking strip prepends a new tile with bubble trail.
5. Tap the bell → notification center, swipe down to pull-to-refresh (just for show), tap **Mark all read** → confetti bursts from the bell.

## Files touched

### New

- [`src/components/Notifications/BellBadge.tsx`](../src/components/Notifications/BellBadge.tsx)
- [`src/components/Notifications/BreakingStrip.tsx`](../src/components/Notifications/BreakingStrip.tsx)
- [`src/components/Notifications/budToast.tsx`](../src/components/Notifications/budToast.tsx)
- [`src/components/Notifications/PullToRefresh.tsx`](../src/components/Notifications/PullToRefresh.tsx)
- [`src/components/Notifications/MarkAllConfetti.tsx`](../src/components/Notifications/MarkAllConfetti.tsx)
- [`src/components/Notifications/QuietHoursSwitch.tsx`](../src/components/Notifications/QuietHoursSwitch.tsx)

### Edits

- [`src/MainShell.tsx`](../src/MainShell.tsx) — swap the inline bell SVG with `<BellBadge />` and rename existing `<Toaster />` config to render `budToast` shapes.
- [`src/screens/Notifications.tsx`](../src/screens/Notifications.tsx) — replace flat list with grouped list + pull-to-refresh + filter chips + mark-all confetti.
- [`src/screens/CommunityBoard.tsx`](../src/screens/CommunityBoard.tsx) — mount `<BreakingStrip />` above the search row.
- [`src/stores/notificationStore.ts`](../src/stores/notificationStore.ts) — add `mockMode`, `pushLocal`, `groupedByDay`.
- [`src/stores/uiStore.ts`](../src/stores/uiStore.ts) — add `quietHours`.
- [`src/lib/api.ts`](../src/lib/api.ts) — `showSuccess` / `showError` should funnel through `budToast` instead of plain `react-hot-toast`.

## Edge cases & accessibility

- **Stacking toasts:** max 3 visible; new ones push the oldest out with a slide-up exit.
- **Long titles / bodies:** `line-clamp-2`, never wrap to 3.
- **Pull-to-refresh** does not trigger on horizontal scroll inside `BreakingStrip`.
- **Day grouping** uses the device locale via `Intl.DateTimeFormat`.
- **`aria-live="polite"`** wrapper around the badge count.
- **Reduced motion** as noted; the confetti respects it (no burst, only a fade of the badge to 0).

## Build sequence (commits in order)

1. `budToast` wrapper + 5 kinds + slide-in animation; route `showSuccess`/`showError` through it.
2. `BellBadge` with breathing + ripple on increment.
3. `BreakingStrip` driven by recent sightings derived selector.
4. Notification Center: grouped list, sticky day headers, filter chips.
5. `PullToRefresh` paw rotation + bubbles.
6. `MarkAllConfetti` particle system + integration with `markAllRead`.
7. Quiet hours toggle + visual dimming + toast throttle.
8. Reduced-motion fallbacks; `npm run build` green.
