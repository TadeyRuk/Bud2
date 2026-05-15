import { useEffect, useMemo, useRef } from "react";
import { divIcon } from "leaflet";
import type { LatLngExpression } from "leaflet";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";

const DEFAULT_CENTER: [number, number] = [14.5995, 120.9842];
const DEFAULT_ZOOM = 16;
const PIN_FLY_ZOOM = 17;

function MapClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      e.originalEvent.stopPropagation();
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function MapInvalidateSize() {
  const map = useMap();
  useEffect(() => {
    const raf = requestAnimationFrame(() => map.invalidateSize());
    const t = window.setTimeout(() => map.invalidateSize(), 240);
    const t2 = window.setTimeout(() => map.invalidateSize(), 520);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(t);
      window.clearTimeout(t2);
    };
  }, [map]);
  return null;
}

function MapPanToPin({ pinLat, pinLng }: { pinLat: number | null; pinLng: number | null }) {
  const map = useMap();
  const last = useRef<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (pinLat == null || pinLng == null) return;
    const prev = last.current;
    if (prev && prev.lat === pinLat && prev.lng === pinLng) return;
    last.current = { lat: pinLat, lng: pinLng };
    const z = Math.max(map.getZoom(), PIN_FLY_ZOOM);
    map.flyTo([pinLat, pinLng], z, { duration: 0.38 });
  }, [map, pinLat, pinLng]);

  return null;
}

type SightingMiniMapProps = {
  center: [number, number];
  pinLat: number | null;
  pinLng: number | null;
  onPick: (lat: number, lng: number) => void;
  showRadar?: boolean;
  onMapPointerDownCapture?: (e: React.PointerEvent) => void;
  /** Read-only preview (no drag / map tap) */
  readOnly?: boolean;
  /** Map box height in px */
  heightPx?: 120 | 140;
};

export function SightingMiniMap({
  center,
  pinLat,
  pinLng,
  onPick,
  showRadar = false,
  onMapPointerDownCapture,
  readOnly = false,
  heightPx = 140,
}: SightingMiniMapProps) {
  const h = `${heightPx}px`;
  const position: LatLngExpression | null =
    pinLat != null && pinLng != null ? [pinLat, pinLng] : null;

  const pinIcon = useMemo(
    () =>
      divIcon({
        className: "bud-sighting-mini-pin",
        html: `<div style="display:flex;justify-content:center;width:36px;height:44px;margin:-44px 0 0 -18px" aria-hidden="true">
          <svg width="36" height="44" viewBox="0 0 40 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 4C12.3 4 6 10.1 6 17.4c0 9.2 14 22.6 14 22.6s14-13.4 14-22.6C34 10.1 27.7 4 20 4z" fill="#8B3A15" stroke="#FFFFFF" stroke-width="1.5"/>
            <circle cx="20" cy="17" r="4.5" fill="#FFFFFF"/>
          </svg>
        </div>`,
        iconSize: [36, 44],
        iconAnchor: [18, 44],
      }),
    []
  );

  return (
    <div
      className="relative z-0 overflow-hidden rounded-2xl border border-bud-text-muted/15 bg-bud-surface-well shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]"
      onPointerDownCapture={onMapPointerDownCapture}
    >
      <div
        className="relative w-full [&_.leaflet-container]:w-full [&_.leaflet-container]:rounded-2xl"
        style={{ height: h }}
      >
        {showRadar ? (
          <div
            className="pointer-events-none absolute inset-0 z-[401] flex items-center justify-center overflow-hidden rounded-2xl"
            aria-hidden
          >
            <div
              className="bud-sighting-radar h-[120%] w-[120%] opacity-40 motion-reduce:opacity-25"
              style={{
                background:
                  "conic-gradient(from 0deg, transparent 0deg, rgba(0,87,99,0.35) 42deg, transparent 84deg)",
              }}
            />
          </div>
        ) : null}
        <MapContainer
          center={position ?? center}
          zoom={DEFAULT_ZOOM}
          scrollWheelZoom={false}
          dragging={!readOnly}
          className="size-full rounded-2xl"
          style={{ height: h, width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapInvalidateSize />
          <MapPanToPin pinLat={pinLat} pinLng={pinLng} />
          {readOnly ? null : <MapClickHandler onPick={onPick} />}
          {position ? (
            <Marker
              position={position}
              icon={pinIcon}
              draggable={!readOnly}
              eventHandlers={
                readOnly
                  ? undefined
                  : {
                      dragend: (e) => {
                        const ll = e.target.getLatLng();
                        onPick(ll.lat, ll.lng);
                      },
                    }
              }
            />
          ) : null}
        </MapContainer>
      </div>
    </div>
  );
}

export { DEFAULT_CENTER as SIGHTING_MAP_DEFAULT_CENTER };
