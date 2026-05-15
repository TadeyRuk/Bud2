# Bud — complete page and screen reference

This document describes **every user-facing surface** in the Bud app, in typical flow order: from first load through the main shell, overlays, and nested UI. It reflects the React routes in `src/App.tsx` and the tabbed experience in `src/MainShell.tsx`.

**Global presentation (all routes)**

- The entire app is wrapped in **`PhoneFrame`**: on small viewports it is full viewport height; from `sm` breakpoint up it becomes a centered phone-sized card (max width ~430px, rounded corners ~40px, subtle ring), on a dark `#111` outer background.
- **`AppBubbleBackground`** sits behind route content inside the frame.
- **Invalid URLs** (`*`): redirect to `/` (splash) with replace navigation.

---

## 1. Splash — route `/` — `SplashPage`

**Purpose:** Brand moment; auto-advances to marketing landing.

**Layout wrapper:** `PageCanvas` with **`scroll={false}`** (no vertical scroll on this view).

**Content (top to bottom)**

1. **Screen-reader only:** “Bud is loading”.
2. **Center column** (max width capped, horizontal padding):
   - **`SplashPetFloaters`**: decorative low-contrast glyphs (paw, heart, fish) positioned around the logo with gentle CSS float animations and staggered delays; purely visual (`aria-hidden` on glyphs).
   - **`BudLogoMark`** with variant **`splash`** (reveal animation class `bud-splash-lockup-reveal`), constrained max width.
3. **Tagline block** (`bud-splash-title`, below logo):
   - Body text, small, semibold, wide letter-spacing, muted color: **“Lost pet finder · neighbors helping neighbors”**.

**Behavior**

- After **1400 ms**, `useNavigate` sends the user to **`/landing`** with **`replace: true`** (no extra history entry for splash).

---

## 2. Landing (marketing) — route `/landing` — `LandingPage`

**Purpose:** Explain the product; funnel to onboarding or skip into the app.

**Layout:** `PageCanvas` (scrollable). Injected `<style>` defines keyframes: **`bud-float`**, **`bud-fade-up`**, **`bud-sheen`**.

**Sections**

### A. Hero (fade-up animation)

- Centered **`BudLogoMark`** variant **`marketing`**.
- Subtitle: **“Find lost pets faster, together.”** (`colors.onSurfaceVariant`).

### B. Primary value card (surface card, large radius, float shadow, fade-up with delay)

- Animated **sheen** overlay (diagonal gradient sweep, infinite).
- **H1:** “Report. Match. Reunite.”
- **Body:** “Post a report, scan nearby sightings, and share to your community—all in one warm, simple flow.”
- **Three feature pills** (rounded full):
  - “Lost / Found badges”
  - “Barangay-friendly”
  - “Map sightings”

### C. Two-column feature tiles (grid, gap, fade-up staggered)

1. **Nearby** — map-pin icon in a rounded square (tertiary color). Title “Nearby”, copy “See sightings around you.”
2. **Report** — plus-in-circle icon (primary color). Title “Report”, copy “Create a post in seconds.”

### D. “Ready to set up?” card (surface card, shadow)

- Left: **“Ready to set up?”** and **“A quick 3-step onboarding and you're in.”**
- Right: floating circular icon area (pulse float animation) with arrow-in-circle graphic (`aria-hidden`).
- **Primary CTA link** → **`/onboarding`**: full width, rounded full, primary brown background, headline font, extrabold white text: **“Get Started”**.
- **Secondary link** → **`/app`**: full width, rounded full, muted surface background: **“Skip for now”**.

**Outer padding:** horizontal `px-5`, vertical `pt-10 pb-10`; inner max width **430px** centered.

---

## 3. Onboarding — route `/onboarding` — `OnboardingPage`

**Purpose:** Collect local profile preferences; persists via `saveOnboardingProfile` then enters the app.

**Layout:** `PageCanvas`, scrollable. Max width **430px**.

### Header area

- Pill chip: **“Setup”** (frosted glass style).
- **`BudLogoMark`** `marketing`.
- **H1:** “Let's personalize Bud”
- **Subcopy:** “Three quick steps—so reports and matches feel local.”
- **Step pills:** “1 • You”, “2 • Area”, “3 • Alerts” — active step uses primary filled style; inactive uses bordered frosted pill.

### Step panel (large frosted card)

**Step 1 — You**

- Section title: “What should we call you?”
- **Display name** field: label “Display name”, text input, `autoComplete="name"`, placeholder “e.g., Sam”, required for continue (trim length **> 1**).
- **Role** title: “How will you use Bud?”
- Three selectable **buttons** (full width, left-aligned):
  - **Pet parent** — “Report and track your pet.”
  - **Rescuer / Volunteer** — “Help match sightings to reports.”
  - **Barangay staff** — “Coordinate community updates.”  
  Active row shows ring, border, and a **“Selected”** pill with checkmark icon.

**Step 2 — Area**

- Title: “Where should matches be centered?”
- Note: “You can change this later in Profile.”
- **City / Municipality** — required (trim length **> 1**), placeholder “e.g., San Fernando”.
- **Barangay (optional)** — placeholder “e.g., Dolores”.

**Step 3 — Alerts**

- Title: “Alerts & updates”
- Copy: “Get notified when there are new nearby reports.”
- **Toggle row** “Nearby alerts” — tap toggles `notifications`; shows “Enabled”/“Disabled” and pill **“On”** / **“Off”** (tertiary container colors when on).
- **Summary** box: label “Summary”; line with name (or “—”) and role (hyphens replaced with spaces); second line with optional barangay + city.

### Footer actions (two equal buttons)

- **Back:** If step > 1, goes to previous step; if step === 1, **`navigate("/landing")`**.
- **Continue** (steps 1–2): disabled when `canContinue` is false (opacity); advances step.
- **Finish** (step 3): calls **`saveOnboardingProfile(state)`** then **`navigate("/app")`**.

---

## 4. Main app shell — route `/app` — `MainShell`

**Purpose:** Single “app” route hosting **tabs**, **global chrome**, **toasts**, and **full-screen overlays**.

### Always-present structure

- **`ErrorBoundary`** wraps the shell.
- **`OfflineBanner`**: when `uiStore.isOffline` is true, shows an **amber** full-width strip: “You're offline — changes will sync when you reconnect”.
- **Opacity transition** wrapper around tab content.
- **`react-hot-toast` `<Toaster />`**: position **top-center**, rounded toast styling (Work Sans, 14px).

### Effects (not visible UI but drive behavior)

- Auth **`initialize`** on mount.
- Pet store **realtime subscription**; when **signed in**, notification **fetch**, **realtime subscription**, **polling**; cleanup on sign-out/unmount.
- When **network online**, drains **pet** and **notification** offline queues.

### App header (`AppHeader`) — when visible

Hidden when **pet detail**, **auth screen**, or **notifications** is open; on **Community** tab it lives **inside** the scrollable column so it scrolls away with the feed; on **Map / Report / Profile** it sits **above** the tab panel.

- **Left:** **`BudLogoMark`** `header`. On **Community** tab only, acts as **button** “Scroll community to top” (smooth scroll unless `prefers-reduced-motion`).
- **Right:** **Notifications** button (bell icon); shows **red badge** with unread count (capped display **“9+”** over 9).

### Tab content (by `uiStore.activeTab`)

| Tab ID       | Screen component    | Scroll / padding notes |
|-------------|---------------------|-------------------------|
| `community` | `CommunityBoard`  | Vertical scroll; bottom padding for nav |
| `map`       | `MapView`         | Map fills space; bottom padding for nav |
| `report`    | `ReportLostPet`   | Vertical scroll; bottom padding for nav |
| `profile`   | `Profile`         | Vertical scroll; bottom padding for nav |

Switching tabs **clears selected pet** (`setSelectedPetId(null)`).

### Bottom navigation — `BottomNav`

- **`aria-label="Main"`** on nav.
- Frosted **pill bar** fixed near bottom (`absolute bottom-5`), four conceptual slots in a grid:
  1. **Community** — people icon; `aria-label` “Community board”.
  2. **Map** — folded-map icon; “Map view”.
  3. **Report** — **elevated circular FAB** with plus icon (`aria-label` “Report lost pet”); label “Report” under the bar; larger when active.
  4. **Profile** — user icon; “Profile”.
- Active tab: primary-filled pill styling; inactive: muted with hover state.

### Overlays (stacking above tabs)

1. **`PetDetail`** — when a pet is selected (`selectedPetId`); see section 5.
2. **`AuthScreen`** — when user triggers auth (e.g. “I Have Info” without session); `z-[60]`.
3. **`Notifications`** — header bell; `z-[55]`.

Bottom nav and main header are **hidden** while any of pet detail, auth, or notifications is open.

---

## 5. Community tab — `CommunityBoard` (not its own URL)

**Purpose:** Browse and search lost/found pets; open detail; submit sighting info when signed in.

**On mount:** `fetchPets(true)` (initial load).

### Top copy block

- Eyebrow: **“NEARBY”** (accent, uppercase tracking).
- **H1:** “Community” + line break + “Board”.
- Subtitle: “Recent alerts and sightings near you.”

### Search

- Frosted search row with magnifying glass icon.
- **`type="search"`** input, **`aria-label` “Search pets”**, placeholder **“Search pets, area, breed…”**
- Input is debounced **300ms** to `searchPets`; local `filtered` also filters by name, `location_text`, and `breed` for instant client filter.

### Loading / empty states

- **Initial load, no items:** centered spinner.
- **Empty after load:** “No pets found”; message depends on whether query is empty; if no query, **Retry** link button calls `fetchPets(true)`.

### Pet cards (each is `<article>`)

- **Click / Enter / Space** on card (not on inner buttons) opens **`PetDetail`** via `onSelectPet`.
- **Image:** `pet.image_url` or inline SVG placeholder (“Photo coming soon”); lazy load; object position ~upper third; hover scale on md+; on error swaps to placeholder.
- **Gradient lift** from bottom so text sits on white.
- **Top-left:** **`GlassPetStatusChip`** (lost / found / reunited messaging).
- **Top-right (conditional):** “SYNCING…” pill when `pet.syncing`.
- **Bottom overlay:** name (large headline), meta line (breed · color or “Pet”, plus short id), pin icon + meta line clamped.
- **“Last seen”** row: location text or “Location shared”; right side **date** (`pet.date` ISO slice or formatted `created_at`) and “REPORTED” label.
- **Full-width button:** **“I HAVE INFO”** (primary). Click stops propagation. If **not signed in**, opens auth. If signed in, **`window.prompt`** for message; on Supabase configured, inserts **`sightings`** and may insert **`notifications`** for the pet reporter; then success toast.

### Infinite scroll

- Sentinel `div` at bottom; **IntersectionObserver** calls `fetchPets(false)` when visible if more pages exist.
- **Loading more** with existing items: spinner below list.

---

## 6. Map tab — `MapView`

**Purpose:** Geographic view of pets; filter; tap marker to open detail.

### Top overlay (above map, `z-[1000]`)

- Title pill: **“Search Area Map”**.
- **Search input:** placeholder “Filter by name, area, breed…”, `aria-label` “Filter pets on the map”, rounded full frosted field.

### Map (`react-leaflet`)

- **`MapContainer`**: default center **`[12.8797, 121.774]`**, zoom **5**, **no default zoom control UI** (`zoomControl={false}`), full width/height of panel.
- **`TileLayer`**: **OpenStreetMap** raster tiles with standard OSM attribution in attribution string.
- **Markers:** one per filtered pet. Position from **`pet.lat` / `pet.lng`** if set; else **fallback grid** around Manila-ish center with small spacing offsets by index.
- **Custom `divIcon` marker:** colored pin bubble (**LOST** = brown `#8B3A15`, else teal `#005763`), location pin SVG, stem diamond; below, white card with **thumbnail**, **name** (ellipsis), **status** badge (LOST vs FOUND styling).
- **Marker click** → `onSelectPet(pet)`.

**On mount:** `PetMarkers` runs `fetchPets(true)`.

---

## 7. Report tab — `ReportLostPet`

**Purpose:** Multi-step wizard to file a **LOST** pet report; optional photo; map pin for last seen; submit via `addPet`.

**Note:** `MainShell` passes **`onRequestAuth`** but the screen currently accepts props as **`_props`** and does **not** surface a sign-in gate in this component (auth may still be enforced inside `addPet` / backend).

### Header

- Left border accent (6px primary).
- **H1:** “Bring Them” / **“Home.”** (second word primary color).
- Intro: “Provide details about the pet you've lost…”
- If **onboarding profile** exists in local storage: accent line “From your Bud setup:” + **name** and optional **barangay / city** + “You can edit anything below.”

### Step indicator

- Four **dots** (expanded width on active step); text **“Step X of 4”** (uppercase tracking).

### Step 1 — Basics (frosted card)

- **Pet type** chips: Dog, Cat, Other (`PetType`).
- If **Other**: “Describe” text field, placeholder for species.
- **Pet name** (required to advance).
- **Color / collar** optional text.
- **Gender** chips: Unknown, Male, Female.

**Advance rule step 1:** name non-empty; if type Other, other species non-empty.

### Step 2 — Photo (frosted card)

- Title “Photo”, helper about clear face shot.
- Large **dashed** upload target; shows preview image or “Tap to upload a photo”.
- Hidden **`input type="file"`** `accept="image/*"` for image pick.

### Step 3 — Location (frosted card)

- **“Last seen location”** + instructions (tap map, drag pin).
- **`LocationPickerMap`**: Leaflet OSM map centered ~**14.5995, 120.9842**, zoom **15**; click sets pin; map invalidates size after mount; reverse geocode fills area label after delay unless user edits label.
- When pin set: small text shows **coordinates** and explains area label / recenter behavior.
- **Area label (for this pin)** — text field; auto-filled from geocode unless user types (then edits are preserved).
- **Landmark (optional)**.
- **Description / traits** — textarea.

**Advance rule step 3:** both `pinLat` and `pinLng` must be set.

### Step 4 — Review (solid card)

- “Review” title; read-only lines: Name, Type (including Other label), Color, Gender, Last seen composite, Photo Attached/None, optional Notes.

### Footer nav

- **Back** (hidden placeholder on step 1 for layout balance).
- **Next** / **Submit Report**: primary buttons; Next disabled when step validation fails; Submit shows **“Submitting…”** while async.
- On **success:** toast, reset wizard to step 1 and clear fields/file.

**Vertical padding:** extra bottom **`pb-28`** to clear the floating bottom nav.

---

## 8. Profile tab — `Profile`

**Purpose:** Guest summary from onboarding, or full account profile, “My reports”, guidelines, help, sign-out.

### When **not signed in** (`!user`)

- Glass panel with **initials avatar** (from onboarding name or **“Neighbor”**).
- **Display name** as heading.
- Area line from onboarding barangay/city, or prompt to add location.
- Line with **`roleLabel(role)`** and alerts on/off from onboarding, or prompt to finish setup.
- **Link** to **`/onboarding`**: “Update my details” or “Complete setup”.
- **My reports** (if any pets match local/guest reporter id after migration helpers): list of **`MyReportRow`** — thumb, name, location, **`StatusBadge`**; expands **`OwnerPetActions`** `variant="profile"`.
- **Safety & community guidelines** accordion (chevron): four numbered bullets (public meetups, no home addresses in public, report suspicious activity to barangay, be kind).
- **Help & support** accordion: copy + **`support@getbud.app`**.

### When **signed in**

- Same accordions + **Sign out** (red styled full-width button).
- **Avatar:** circular image (profile URL or Unsplash default); tap opens file picker; upload resized image via **`uploadAvatar`** then **`updateProfile`**.
- **View mode:** display name (or email fallback), optional phone/area lines, bio or default neighbor blurb, **“Edit profile”** text button.
- **Edit mode:** fields for display name, bio, phone (`type="tel"`), barangay; **Cancel** / **Save**.
- **“Your Bud setup”** section if local onboarding exists: role chip + area text or “Local area not set”.
- **My reports** as above for pets owned by current user in UI logic.

**Padding:** `pb-28` for bottom nav.

---

## 9. Pet detail — overlay — `PetDetail`

**Purpose:** Full-screen overlay for one pet; contact flows; share; owner tools.

**Container:** `absolute inset-0 z-50`, translucent **`bg-bud-bg/55`** + light backdrop blur.

### Top bar

- **Back** (left): circular frosted button, chevron left, `aria-label` “Go back” → `onBack`.
- **Share** (right): uses **Web Share API** when available with title “Lost/Found: {name}”, text snippet from description, URL = **`window.location.href`**; else copies composed text + URL to clipboard; toasts success/failure.

### Scrollable body

- **Hero image** (aspect ~3/4, max height): same placeholder SVG as community on missing/broken image; multiple gradient overlays; inset ring.
- **Status chip** top-left: **`GlassPetStatusChip`**.
- **Bottom of hero:** name + optional **“Reunited”** pill when status is reunited; meta line with pin icon (breed/color/id).
- **Lower glass section:**
  - **Last seen** row (icon in circle, location, date + “REPORTED”).
  - **Definition list** 2×2: Breed, Color / collar, Gender, Fur (`fur_color`).
  - **“About {name}”** + description paragraph (muted).

### Actions (non-owner, not reunited)

- **Contact Owner** — primary full-width. Requires auth; else `onRequestAuth`. Inserts **`contacts`** row and may notify reporter; toast “Contact request sent to the owner!”.
- **Contact Barangay** — outlined accent. Same auth gate; inserts contact with type barangay; toast “Connecting to barangay desk…”.

### Actions (owner)

- **`OwnerPetActions`** `variant="detail"`: caption “Your report — you can update or remove it”; **Mark as found** (if LOST), **Mark as reunited** (if LOST or FOUND), **Remove this report** (confirm dialog, then `removePet`, optional `onAfterRemove` = close overlay).

---

## 10. Auth — overlay — `AuthScreen`

**Purpose:** Email/password sign-in or sign-up (Supabase-backed via store).

**Container:** `absolute inset-0 z-[60]`, solid **`bg-bud-bg`**, column layout.

### Header

- **Close** (X) top-left → `onClose`.

### Content

- Left-accent block:
  - **Sign in:** H1 “Welcome” + line break + “Back.” (single string with `\n` in source); subcopy about reporting and reuniting.
  - **Sign up:** “Join” / “Community.”; subcopy about creating an account.
- **Form:**
  - Sign-up only: **Your Name** (required on submit).
  - **Email**, **Password** (always).
  - Submit button: **“Sign In”** or **“Create Account”** or **“Please wait…”** when `loading`.
- **Footer toggle:** “Don't have an account? **Sign Up**” / “Already have an account? **Sign In**”.

**Validation toasts:** empty fields; sign-up without name. Success toasts and **`onClose`** on success.

---

## 11. Notifications — overlay — `Notifications`

**Purpose:** List in-app notifications; mark read.

**Container:** `absolute inset-0 z-[55]`, **`bg-bud-bg`**, column.

### Header

- **Back** + title **“Notifications”**.
- If any unread: **“Mark all read”** text button (primary color, small).

### Body

- **Loading, empty list:** centered spinner.
- **Empty, loaded:** bell icon (muted), **“All caught up!”**, explanatory copy about activity on your reports.
- **List:** each row is a **button**; tap calls **`markRead(id)`**. Unread rows: tinted background + primary **dot**; read rows: base background. Shows **title**, **body** (2-line clamp), **timestamp** (short date + time).

---

## 12. Shared / supporting UI (referenced above)

| Piece | Role |
|--------|------|
| **`PageCanvas`** | Page background gradient + subtle motif; optional scroll. |
| **`GlassPetStatusChip`** | Frosted pill: LOST / FOUND / REUNITED headlines with breed/color subline. |
| **`OwnerPetActions`** | Owner-only status updates and delete; compact row under profile list vs stacked on detail. |
| **`StatusBadge`** | Small status label on profile rows (maps REUNITED → FOUND for display). |
| **`LocationPickerMap`** | Draggable pin, OSM tiles, reverse geocode for report step 3. |
| **`ErrorBoundary`** | Catches render errors inside main shell subtree. |

---

## Route summary table

| Path | Component | Notes |
|------|-----------|--------|
| `/` | `SplashPage` | Auto → `/landing` |
| `/landing` | `LandingPage` | Links to `/onboarding`, `/app` |
| `/onboarding` | `OnboardingPage` | Back to `/landing` from step 1; Finish → `/app` |
| `/app` | `MainShell` | Tabs: Community, Map, Report, Profile |
| `*` | Redirect | → `/` |

**There is no separate URL for pet detail, auth, or notifications** — they are overlays inside `/app` driven by local UI state and stores.
