# OpenStreetMap Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Google Maps dependency with OpenStreetMap tiles via react-leaflet, preserving custom HTML pet-pin markers and all interactivity.

**Architecture:** Swap `@react-google-maps/api` for `leaflet` + `react-leaflet`. The `MapView` component is rewritten to render a `MapContainer` with `TileLayer` (OSM tiles) and `Marker` components using custom `DivIcon` HTML that replicates the existing bubble+card pin design. The `StaticMap` fallback and `VITE_GOOGLE_MAPS_API_KEY` branch are removed — OSM needs no API key.

**Tech Stack:** React 19, TypeScript, Vite, react-leaflet 4.x, leaflet 1.x, Tailwind CSS

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `package.json` | Add `leaflet`, `react-leaflet`; remove `@react-google-maps/api` |
| Modify | `src/screens/MapView.tsx` | Full rewrite — OSM map with custom DivIcon markers |
| Modify | `src/data/pets.ts` | Remove `pin` (topPct/leftPct) — no longer needed |
| Create | `src/leaflet-fix.css` | Fix Leaflet default marker icon path (Vite asset issue) |
| Modify | `src/index.css` | Import `leaflet/dist/leaflet.css` and `leaflet-fix.css` |
| Modify | `index.html` | No change needed |

---

### Task 1: Create branch and install dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Create and switch to the feature branch**

```bash
git checkout -b backend_tadey
```

Expected: `Switched to a new branch 'backend_tadey'`

- [ ] **Step 2: Install react-leaflet and leaflet, remove google maps**

```bash
cd /home/tadey/Documents/cursor_workshop/bud
npm install leaflet react-leaflet
npm uninstall @react-google-maps/api
npm install --save-dev @types/leaflet
```

Expected: package-lock.json updated, no errors.

- [ ] **Step 3: Verify package.json has correct deps**

`package.json` dependencies section should now contain:
```json
"leaflet": "^1.x.x",
"react-leaflet": "^4.x.x"
```
And `@react-google-maps/api` should be gone.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: install react-leaflet + leaflet, remove google maps"
```

---

### Task 2: Import Leaflet CSS and fix default icon paths

Leaflet's default marker icons reference PNG assets via a relative URL that Vite breaks. We fix this by overriding the icon URLs. We also need to import Leaflet's base CSS.

**Files:**
- Create: `src/leaflet-fix.css`
- Modify: `src/index.css`

- [ ] **Step 1: Create `src/leaflet-fix.css`**

```css
/* Leaflet's default icon images break under Vite's asset hashing.
   We use custom DivIcon markers throughout, so we just suppress the
   broken image requests for the default icon. */
.leaflet-default-icon-path {
  background-image: none;
}
```

- [ ] **Step 2: Add Leaflet CSS imports to `src/index.css`**

Open `src/index.css`. At the very top, before the existing `@tailwind` directives, add:

```css
@import "leaflet/dist/leaflet.css";
@import "./leaflet-fix.css";
```

The file should start with:
```css
@import "leaflet/dist/leaflet.css";
@import "./leaflet-fix.css";

@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 3: Commit**

```bash
git add src/leaflet-fix.css src/index.css
git commit -m "feat: import leaflet css, suppress broken default icon paths"
```

---

### Task 3: Rewrite MapView.tsx with react-leaflet and custom DivIcon markers

This is the core change. The entire `MapView.tsx` is replaced. Key points:
- `MapContainer` renders the OSM map (no API key needed).
- `TileLayer` points to `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`.
- Each pet gets a `Marker` with a `divIcon` whose HTML replicates the existing bubble+card design.
- Clicking a marker calls `onSelectPet`.
- The `StaticMap` component and all Google Maps code are removed.

**Files:**
- Modify: `src/screens/MapView.tsx`

- [ ] **Step 1: Replace `src/screens/MapView.tsx` entirely**

```tsx
import { divIcon } from "leaflet";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import type { Pet } from "../data/pets";
import { pets } from "../data/pets";
import { StatusBadge } from "../components/StatusBadge";

type MapViewProps = {
  onSelectPet: (pet: Pet) => void;
};

const DEFAULT_CENTER: [number, number] = [14.5995, 120.9845];
const DEFAULT_ZOOM = 14;

function PinMarkerHtml({ pet }: { pet: Pet }) {
  const bubbleColor =
    pet.status === "LOST" ? "#C1440E" : "#005763";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      {/* Bubble */}
      <div
        style={{
          background: bubbleColor,
          borderRadius: "50%",
          width: 44,
          height: 44,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
          position: "relative",
          color: "white",
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
        </svg>
        <div
          style={{
            position: "absolute",
            bottom: -4,
            left: "50%",
            transform: "translateX(-50%) rotate(45deg)",
            width: 12,
            height: 12,
            background: bubbleColor,
            borderRadius: 2,
          }}
          aria-hidden
        />
      </div>
      {/* Card */}
      <div
        style={{
          marginTop: 8,
          background: "#fff",
          borderRadius: 12,
          padding: "8px 10px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
          display: "flex",
          alignItems: "center",
          gap: 8,
          maxWidth: 200,
          minWidth: 120,
        }}
      >
        <img
          src={pet.image}
          alt=""
          style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            objectFit: "cover",
            flexShrink: 0,
          }}
        />
        <div style={{ minWidth: 0, textAlign: "left" }}>
          <p
            style={{
              fontFamily: "Manrope, sans-serif",
              fontWeight: 700,
              fontSize: 12,
              color: "#2C1A0E",
              margin: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {pet.name}
          </p>
          <span
            style={{
              display: "inline-block",
              fontSize: 10,
              fontWeight: 700,
              borderRadius: 4,
              padding: "1px 6px",
              marginTop: 2,
              background: pet.status === "LOST" ? "#fee2e2" : "#ccfbf1",
              color: pet.status === "LOST" ? "#b91c1c" : "#0f766e",
            }}
          >
            {pet.status}
          </span>
        </div>
      </div>
    </div>
  );
}

function makePinIcon(pet: Pet) {
  const html = renderToStaticMarkup(<PinMarkerHtml pet={pet} />);
  return divIcon({
    html,
    className: "",
    iconAnchor: [22, 44],
    popupAnchor: [0, -50],
  });
}

function PetMarkers({ onSelectPet }: MapViewProps) {
  return (
    <>
      {pets
        .filter((p) => p.lat != null && p.lng != null)
        .map((pet) => (
          <Marker
            key={pet.id}
            position={[pet.lat!, pet.lng!]}
            icon={makePinIcon(pet)}
            eventHandlers={{ click: () => onSelectPet(pet) }}
            title={pet.name}
          />
        ))}
    </>
  );
}

export function MapView({ onSelectPet }: MapViewProps) {
  return (
    <div className="relative flex-1 min-h-0 w-full">
      {/* Header label */}
      <div className="absolute top-4 left-3 right-3 z-[1000] pointer-events-none">
        <p className="text-center font-headline text-sm font-bold text-bud-text drop-shadow-sm bg-bud-card/90 rounded-full py-1.5 mx-auto max-w-[220px] shadow-ambient pointer-events-auto">
          Search Area Map
        </p>
      </div>

      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        style={{ width: "100%", height: "100%" }}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <PetMarkers onSelectPet={onSelectPet} />
      </MapContainer>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /home/tadey/Documents/cursor_workshop/bud
npx tsc --noEmit
```

Expected: no errors. If you see errors about `renderToStaticMarkup`, ensure `react-dom` is in deps (it already is in this project).

- [ ] **Step 3: Commit**

```bash
git add src/screens/MapView.tsx
git commit -m "feat: replace google maps with react-leaflet + OSM tiles"
```

---

### Task 4: Clean up pets.ts — remove unused `pin` field

The `pin: { topPct, leftPct }` field was only used by the old `StaticMap` component. Now that it's gone, remove it to keep the data model clean.

**Files:**
- Modify: `src/data/pets.ts`

- [ ] **Step 1: Remove the `pin` type field from the `Pet` type**

In `src/data/pets.ts`, remove the `pin` line from the type definition:

```typescript
// Remove this line:
/** Pin position on static map (percent of container) */
pin: { topPct: number; leftPct: number };
```

- [ ] **Step 2: Remove `pin` values from each pet object**

For `barnaby`, remove:
```typescript
pin: { topPct: 38, leftPct: 34 },
```

For `orange-tabby`, remove:
```typescript
pin: { topPct: 24, leftPct: 64 },
```

For `luna`, remove:
```typescript
pin: { topPct: 58, leftPct: 49 },
```

- [ ] **Step 3: Remove the `STATIC_MAP_IMAGE_URL` export and the `MAP_IMG` constant**

Remove these lines entirely:
```typescript
const MAP_IMG =
  "https://lh3.googleusercontent.com/aida-public/...";

export const STATIC_MAP_IMAGE_URL = MAP_IMG;
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
cd /home/tadey/Documents/cursor_workshop/bud
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/data/pets.ts
git commit -m "chore: remove static map pin fields and unused STATIC_MAP_IMAGE_URL"
```

---

### Task 5: Smoke test in browser

- [ ] **Step 1: Start the dev server**

```bash
cd /home/tadey/Documents/cursor_workshop/bud
npm run dev
```

Expected: Vite dev server starts, URL printed (e.g. `http://localhost:5173`).

- [ ] **Step 2: Open the app and navigate to the Map tab**

Open the printed URL in a browser. Click the Map tab (second icon in the bottom nav).

Expected:
- Real OpenStreetMap tiles load (streets, buildings visible in the Manila area).
- Three pet markers appear at their correct lat/lng positions.
- Each marker shows the colored bubble (red for LOST, teal for FOUND) with the arrow tip, plus the pet photo + name card below.

- [ ] **Step 3: Verify marker click opens pet detail**

Click any pet marker.

Expected: The `PetDetail` modal opens for that pet.

- [ ] **Step 4: Verify map panning and zoom work**

Drag the map and use pinch/scroll to zoom.

Expected: Map pans and zooms smoothly, markers stay anchored to their correct positions.

- [ ] **Step 5: Final commit if any last tweaks were needed, then push branch**

```bash
git push -u origin backend_tadey
```

---

## Verification Checklist

- [ ] `npm run dev` starts without errors
- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] Map tab shows real OSM street tiles
- [ ] All 3 pet markers render with correct custom bubble+card design
- [ ] Clicking a marker opens the correct pet detail modal
- [ ] Map panning/zoom works
- [ ] `@react-google-maps/api` is no longer in `package.json`
- [ ] No `VITE_GOOGLE_MAPS_API_KEY` reference remains in code
- [ ] Branch `backend_tadey` pushed to remote
