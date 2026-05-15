import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import { divIcon, point } from "leaflet";
import type { LatLngTuple, Map as LeafletMap, Marker as LeafletMarker } from "leaflet";
import { Circle, MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import type { Pet as StorePet } from "../stores/petStore";
import { usePetStore } from "../stores/petStore";
import { useUiStore } from "../stores/uiStore";
import { useFilterStore } from "../stores/filterStore";
import { applyFilters } from "../lib/applyFilters";
import { distanceMeters, metersToWalkMinutes } from "../lib/distance";
import { useUserLocation } from "../context/LocationContext";

type MapViewProps = {
  onSelectPet: (pet: StorePet) => void;
};

const DEFAULT_CENTER: [number, number] = [12.8797, 121.774];
const DEFAULT_ZOOM = 5;
const USER_LOC_ZOOM = 12;
/** Zoom at or above this shows nearby-only markers (within focus radius); zoom out to see all reports. */
const NEARBY_ZOOM_THRESHOLD = 12;
const FALLBACK_MARKER_CENTER: [number, number] = [14.5995, 120.9842];
const FALLBACK_MARKER_SPACING = 0.006;

/** Extra space below the marker anchor so the white info card stays above bottom UI (nav + nearest bar). */
const CARD_EXTENT_BELOW_ANCHOR_PX = 80;
const TOP_MAP_CHROME_RESERVE_PX = 132;
const BOTTOM_NAV_RESERVE_PX = 96;
const NEAREST_PET_BAR_RESERVE_PX = 108;

/** Fly to the pet anchor, then pan so the pin + info card are in the visible “safe” area (map scroll/pan). */
function flyMapToShowPinCard(map: LeafletMap, position: LatLngTuple, nearbyMode: boolean) {
  const zoom = Math.max(map.getZoom(), 15);
  map.flyTo(position, zoom, { duration: 0.45 });

  const bottomReserve =
    BOTTOM_NAV_RESERVE_PX + CARD_EXTENT_BELOW_ANCHOR_PX + (nearbyMode ? NEAREST_PET_BAR_RESERVE_PX : 0);

  const nudgeIntoView = () => {
    if (!map.getContainer().isConnected) return;
    const size = map.getSize();
    const anchor = map.latLngToContainerPoint(position);
    const cardBottomY = anchor.y + CARD_EXTENT_BELOW_ANCHOR_PX;
    let dy = 0;
    if (cardBottomY > size.y - bottomReserve) {
      dy -= cardBottomY - (size.y - bottomReserve);
    }
    if (anchor.y < TOP_MAP_CHROME_RESERVE_PX) {
      dy -= anchor.y - TOP_MAP_CHROME_RESERVE_PX;
    }
    if (dy !== 0) {
      map.panBy(point(0, dy), { animate: true, duration: 0.28 });
    }
  };

  map.once("moveend", nudgeIntoView);
}

function PinMarkerHtml({
  pet,
  ring,
  dim,
}: {
  pet: StorePet;
  ring: "hot" | "mid" | "far" | "none";
  dim: boolean;
}) {
  const bubbleColor = pet.status === "LOST" ? "#8B3A15" : "#005763";
  const imageUrl =
    pet.image_url ||
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' fill='%23e8e5dc'%3E%3Crect width='80' height='80'/%3E%3C/svg%3E";

  const ringStyle =
    ring === "hot"
      ? "0 0 0 3px rgba(139,58,21,0.9)"
      : ring === "mid"
        ? "0 0 0 2px rgba(0,87,99,0.85)"
        : ring === "far"
          ? "0 0 0 1px rgba(0,0,0,0.15)"
          : "none";
  const opacity = dim ? 0.55 : 1;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: 204,
        pointerEvents: "auto",
        cursor: "pointer",
        opacity,
      }}
    >
      <div
        style={{
          background: bubbleColor,
          borderRadius: "50%",
          width: 44,
          height: 44,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `${ringStyle}, 0 2px 8px rgba(0,0,0,0.18)`,
          position: "relative",
          color: "white",
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
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
          aria-hidden="true"
        />
      </div>
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
          src={imageUrl}
          alt=""
          style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            objectFit: "cover",
            flexShrink: 0,
            pointerEvents: "none",
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

function makePinIcon(pet: StorePet, ring: "hot" | "mid" | "far" | "none", dim: boolean) {
  const html = renderToStaticMarkup(<PinMarkerHtml pet={pet} ring={ring} dim={dim} />);
  return divIcon({
    html,
    className: "bud-map-custom-pin",
    // Tall box so the photo/info card below the pin stays inside the hit area (Leaflet clips to iconSize).
    iconSize: [204, 156],
    iconAnchor: [102, 52],
    popupAnchor: [0, -40],
  });
}

function getMarkerPosition(pet: StorePet, index: number): [number, number] {
  if (pet.lat != null && pet.lng != null) {
    return [pet.lat, pet.lng];
  }
  const row = Math.floor(index / 3) - 1;
  const col = (index % 3) - 1;
  return [
    FALLBACK_MARKER_CENTER[0] + row * FALLBACK_MARKER_SPACING,
    FALLBACK_MARKER_CENTER[1] + col * FALLBACK_MARKER_SPACING,
  ];
}

function distanceRing(
  userLl: [number, number],
  petPos: [number, number],
  nearby: boolean,
  focusRadiusM: number
): "hot" | "mid" | "far" | "none" {
  if (!nearby) return "none";
  const d = distanceMeters(userLl, petPos);
  const r1 = focusRadiusM / 3;
  const r2 = (2 * focusRadiusM) / 3;
  if (d <= r1) return "hot";
  if (d <= r2) return "mid";
  if (d <= focusRadiusM) return "far";
  return "none";
}

function petsWithinMeters(pets: StorePet[], userLl: [number, number], maxM: number): StorePet[] {
  return pets.filter((p) => {
    if (p.lat == null || p.lng == null) return false;
    return distanceMeters(userLl, [p.lat, p.lng]) <= maxM;
  });
}

function PetMarkerInteractive({
  pet,
  position,
  ring,
  dim,
  onOpen,
}: {
  pet: StorePet;
  position: [number, number];
  ring: "hot" | "mid" | "far" | "none";
  dim: boolean;
  onOpen: (pet: StorePet, position: [number, number]) => void;
}) {
  const markerRef = useRef<LeafletMarker | null>(null);
  const icon = useMemo(
    () => makePinIcon(pet, ring, dim),
    [dim, pet.image_url, pet.name, pet.id, pet.status, ring]
  );

  useLayoutEffect(() => {
    const el = markerRef.current?.getElement() ?? null;
    if (!el) return;

    let downX = 0;
    let downY = 0;
    let activePointerId: number | null = null;

    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      activePointerId = e.pointerId;
      downX = e.clientX;
      downY = e.clientY;
    };

    const onUp = (e: PointerEvent) => {
      if (activePointerId !== null && e.pointerId !== activePointerId) return;
      activePointerId = null;
      if (e.pointerType === "mouse" && e.button !== 0) return;
      const moved = Math.hypot(e.clientX - downX, e.clientY - downY);
      if (moved > 14) return;
      e.stopPropagation();
      if (e.cancelable) e.preventDefault();
      onOpen(pet, position);
    };

    const onCancel = () => {
      activePointerId = null;
    };

    el.addEventListener("pointerdown", onDown, { capture: true });
    el.addEventListener("pointerup", onUp, { capture: true });
    el.addEventListener("pointercancel", onCancel, { capture: true });
    return () => {
      el.removeEventListener("pointerdown", onDown, { capture: true });
      el.removeEventListener("pointerup", onUp, { capture: true });
      el.removeEventListener("pointercancel", onCancel, { capture: true });
    };
  }, [dim, icon, onOpen, pet.id, position, ring]);

  return <Marker ref={markerRef} position={position} icon={icon} />;
}

function PetMarkers({
  pets,
  nearby,
  userLl,
  focusRadiusM,
  onSelectPet,
}: {
  pets: StorePet[];
  nearby: boolean;
  userLl: [number, number];
  focusRadiusM: number;
  onSelectPet: (pet: StorePet) => void;
}) {
  const map = useMap();

  const handleOpen = useCallback(
    (pet: StorePet, position: [number, number]) => {
      flyMapToShowPinCard(map, position, nearby);
      onSelectPet(pet);
    },
    [map, nearby, onSelectPet]
  );

  return (
    <>
      {pets.map((pet, index) => {
        const position = getMarkerPosition(pet, index);
        const ring = distanceRing(userLl, position, nearby, focusRadiusM);
        const dim = nearby && ring === "none" && pet.lat != null && pet.lng != null;
        return (
          <PetMarkerInteractive
            key={pet.id}
            pet={pet}
            position={position}
            ring={ring}
            dim={dim}
            onOpen={handleOpen}
          />
        );
      })}
    </>
  );
}

function MapInstanceRef({ mapRef }: { mapRef: MutableRefObject<LeafletMap | null> }) {
  const map = useMap();
  useEffect(() => {
    mapRef.current = map;
    return () => {
      mapRef.current = null;
    };
  }, [map, mapRef]);
  return null;
}

function MapRecenter({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  const skipFirst = useRef(true);
  useEffect(() => {
    if (skipFirst.current) {
      skipFirst.current = false;
      return;
    }
    map.flyTo(center, zoom, { duration: 0.55 });
  }, [center[0], center[1], zoom, map]);
  return null;
}

function MapZoomSync({ onZoom }: { onZoom: (z: number) => void }) {
  const map = useMap();
  useEffect(() => {
    const report = () => onZoom(map.getZoom());
    map.on("zoomend", report);
    report();
    return () => {
      map.off("zoomend", report);
    };
  }, [map, onZoom]);
  return null;
}

function NearbyOverlays({
  userLl,
  show,
  focusRadiusM,
}: {
  userLl: [number, number];
  show: boolean;
  focusRadiusM: number;
}) {
  if (!show) return null;
  const r1 = Math.max(30, Math.round(focusRadiusM / 3));
  const r2 = Math.max(r1 + 1, Math.round((2 * focusRadiusM) / 3));
  const r3 = focusRadiusM;
  return (
    <>
      <Circle
        center={userLl}
        radius={r1}
        pathOptions={{
          color: "#8B3A15",
          weight: 2,
          fillColor: "#8B3A15",
          fillOpacity: 0.06,
        }}
      />
      <Circle
        center={userLl}
        radius={r2}
        pathOptions={{
          color: "#005763",
          weight: 2,
          fillColor: "#005763",
          fillOpacity: 0.05,
        }}
      />
      <Circle
        center={userLl}
        radius={r3}
        pathOptions={{
          color: "#56423c",
          weight: 2,
          dashArray: "4 6",
          fillOpacity: 0.03,
        }}
      />
      <Marker
        position={userLl}
        icon={divIcon({
          className: "bud-user-dot",
          iconSize: [28, 28],
          iconAnchor: [14, 14],
          html: renderToStaticMarkup(
            <div
              style={{
                width: 28,
                height: 28,
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "rgba(0,87,99,0.22)",
                  animation: "bud-breathing-kf 2.2s ease-in-out infinite",
                }}
              />
              <span
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  background: "#005763",
                  border: "2px solid white",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                  zIndex: 1,
                }}
              />
            </div>
          ),
        })}
      />
      <Marker
        position={userLl}
        zIndexOffset={-100}
        icon={divIcon({
          className: "bud-radar-sweep-marker pointer-events-none",
          iconSize: [240, 240],
          iconAnchor: [120, 120],
          html: `<div style="width:240px;height:240px;pointer-events:none;mix-blend-mode:multiply;opacity:0.35" class="bud-sighting-radar" aria-hidden="true"
            ></div>`,
        })}
      />
    </>
  );
}

function RingChipRow({
  value,
  onChange,
}: {
  value: 500 | 1000 | 2000;
  onChange: (r: 500 | 1000 | 2000) => void;
}) {
  const opts: (500 | 1000 | 2000)[] = [500, 1000, 2000];
  return (
    <div className="pointer-events-auto flex justify-center gap-2">
      {opts.map((r) => (
        <button
          key={r}
          type="button"
          onClick={() => onChange(r)}
          className={`rounded-full px-3 py-1 font-body text-[11px] font-bold backdrop-blur-md ${
            value === r ? "bg-bud-primary text-white" : "border border-black/10 bg-white/80 text-bud-text"
          }`}
        >
          {r >= 1000 ? `${r / 1000}km` : `${r}m`}
        </button>
      ))}
    </div>
  );
}

function NearestPetBar({
  pets,
  userLl,
  show,
  nearbyMode,
  onOpen,
  mapRef,
}: {
  pets: StorePet[];
  userLl: [number, number];
  show: boolean;
  nearbyMode: boolean;
  onOpen: (p: StorePet) => void;
  mapRef: MutableRefObject<LeafletMap | null>;
}) {
  const nearest = useMemo(() => {
    if (!show || pets.length === 0) return null;
    let best: { pet: StorePet; d: number } | null = null;
    for (const p of pets) {
      if (p.lat == null || p.lng == null) continue;
      const d = distanceMeters(userLl, [p.lat, p.lng]);
      if (!best || d < best.d) best = { pet: p, d };
    }
    return best;
  }, [pets, userLl, show]);

  if (!show || !nearest) return null;
  const walk = metersToWalkMinutes(nearest.d);

  return (
    <div className="pointer-events-auto absolute bottom-4 left-1/2 z-[1100] w-[92%] max-w-md -translate-x-1/2">
      <button
        type="button"
        onClick={() => {
          const map = mapRef.current;
          const pet = nearest.pet;
          const idx = pets.findIndex((p) => p.id === pet.id);
          const position = getMarkerPosition(pet, idx >= 0 ? idx : 0);
          if (map) {
            flyMapToShowPinCard(map, position, nearbyMode);
          }
          onOpen(pet);
        }}
        className="flex h-16 w-full items-center gap-3 rounded-2xl border border-black/8 bg-white/90 px-3 shadow-md backdrop-blur-xl transition-transform active:scale-[0.99] motion-safe:hover:shadow-lg"
      >
        <img
          src={nearest.pet.image_url || ""}
          alt=""
          className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-white"
        />
        <div className="min-w-0 flex-1 text-left">
          <p className="truncate font-headline text-sm font-bold text-bud-text">{nearest.pet.name}</p>
          <p className="font-body text-xs text-bud-text-muted">
            {Math.round(nearest.d)}m · ~{walk} min walk
          </p>
        </div>
        <span className="text-bud-accent" aria-hidden>
          ›
        </span>
      </button>
    </div>
  );
}

export function MapView({ onSelectPet }: MapViewProps) {
  const mapRef = useRef<LeafletMap | null>(null);
  const pets = usePetStore((s) => s.pets);
  const [mapSearch, setMapSearch] = useState("");
  const fallbackLatLng = useUiStore((s) => s.userLatLng);
  const nearbyFocusRadius = useUiStore((s) => s.nearbyFocusRadius);
  const setNearbyFocusRadius = useUiStore((s) => s.setNearbyFocusRadius);
  const setFilterDrawerOpen = useUiStore((s) => s.setFilterDrawerOpen);
  const filterSnapshot = useFilterStore();
  const filterActive = useFilterStore((s) => s.isActive());
  const filterCount = useFilterStore((s) => s.activeCount());
  const { position } = useUserLocation();

  const effectiveUserLl = useMemo<[number, number]>(
    () => (position ? [position.lat, position.lng] : fallbackLatLng),
    [position, fallbackLatLng]
  );

  const filteredPets = useMemo(() => {
    const q = mapSearch.trim().toLowerCase();
    const base =
      !q || !q.length
        ? pets
        : pets.filter((p) => {
            const breed = (p.breed ?? "").toLowerCase();
            const desc = (p.description ?? "").toLowerCase();
            return (
              p.name.toLowerCase().includes(q) ||
              p.location_text.toLowerCase().includes(q) ||
              breed.includes(q) ||
              desc.includes(q)
            );
          });
    const f = {
      species: filterSnapshot.species,
      statuses: filterSnapshot.statuses,
      maxDistanceKm: filterSnapshot.maxDistanceKm,
      reportedWithin: filterSnapshot.reportedWithin,
      hasPhoto: filterSnapshot.hasPhoto,
      verifiedOnly: filterSnapshot.verifiedOnly,
      stillMissingOnly: filterSnapshot.stillMissingOnly,
    };
    return applyFilters(base, f, { userLatLng: effectiveUserLl });
  }, [pets, mapSearch, filterSnapshot, effectiveUserLl]);

  const mapCenter: [number, number] = useMemo(() => {
    if (position) return [position.lat, position.lng];
    return DEFAULT_CENTER;
  }, [position]);

  const mapZoom = useMemo(() => {
    if (position) return USER_LOC_ZOOM;
    return DEFAULT_ZOOM;
  }, [position]);

  const [liveZoom, setLiveZoom] = useState<number | null>(null);
  useEffect(() => {
    setLiveZoom(null);
  }, [mapZoom]);
  const effectiveLiveZoom = liveZoom ?? mapZoom;
  const showNearbyView = Boolean(position) && effectiveLiveZoom >= NEARBY_ZOOM_THRESHOLD;

  const mapPets = useMemo(() => {
    if (!showNearbyView || !position) return filteredPets;
    return petsWithinMeters(filteredPets, effectiveUserLl, nearbyFocusRadius);
  }, [showNearbyView, position, filteredPets, effectiveUserLl, nearbyFocusRadius]);

  const onMapZoom = useCallback((z: number) => setLiveZoom(z), []);

  return (
    <div className="relative min-h-0 w-full flex-1">
      {showNearbyView ? (
        <div className="pointer-events-none absolute inset-0 z-[900] bg-black/[0.12] motion-reduce:bg-black/10" aria-hidden />
      ) : null}

      <div className="pointer-events-none absolute left-3 right-3 top-4 z-[1000] flex flex-col items-center gap-2">
        <div className="pointer-events-auto flex w-full max-w-sm items-center gap-2">
          <p className="shrink-0 text-center font-headline text-sm font-bold text-bud-text drop-shadow-sm">
            Search Area Map
          </p>
          <button
            type="button"
            onClick={() => setFilterDrawerOpen(true)}
            className={`relative ml-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-bud-text-muted/15 shadow-sm backdrop-blur-sm ${
              filterActive ? "bg-bud-primary text-white" : "bg-bud-card/95 text-bud-text-muted"
            }`}
            aria-label="Open filters"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z"
              />
            </svg>
            {filterCount > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-white px-0.5 text-[10px] font-bold text-bud-primary">
                {filterCount}
              </span>
            ) : null}
          </button>
        </div>
        <p className="pointer-events-auto text-center font-body text-[11px] text-bud-text-muted bg-bud-card/85 rounded-full py-1 px-3">
          {showNearbyView
            ? "Nearby reports — zoom out to see all"
            : "Areas are approximate for privacy"}
        </p>
        <div className="pointer-events-auto w-full max-w-sm px-1">
          <input
            type="search"
            value={mapSearch}
            onChange={(e) => setMapSearch(e.target.value)}
            placeholder="Filter by name, breed, notes…"
            aria-label="Filter pets on the map"
            className="w-full rounded-full border border-bud-text-muted/10 bg-bud-card/95 px-4 py-2.5 font-body text-sm text-bud-text shadow-ambient outline-none backdrop-blur-sm placeholder:text-bud-text-muted/65 focus:ring-2 focus:ring-bud-primary/35"
          />
        </div>
        {showNearbyView ? <RingChipRow value={nearbyFocusRadius} onChange={setNearbyFocusRadius} /> : null}
      </div>

      <MapContainer center={mapCenter} zoom={mapZoom} style={{ width: "100%", height: "100%" }} zoomControl={false}>
        <MapInstanceRef mapRef={mapRef} />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <MapZoomSync onZoom={onMapZoom} />
        <MapRecenter center={mapCenter} zoom={mapZoom} />
        <NearbyOverlays userLl={effectiveUserLl} show={showNearbyView} focusRadiusM={nearbyFocusRadius} />
        <PetMarkers
          pets={mapPets}
          nearby={showNearbyView}
          userLl={effectiveUserLl}
          focusRadiusM={nearbyFocusRadius}
          onSelectPet={onSelectPet}
        />
      </MapContainer>

      <NearestPetBar
        pets={mapPets}
        userLl={effectiveUserLl}
        show={showNearbyView}
        nearbyMode={showNearbyView}
        mapRef={mapRef}
        onOpen={onSelectPet}
      />
    </div>
  );
}
