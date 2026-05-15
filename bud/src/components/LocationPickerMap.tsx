import { useEffect, useMemo, useRef } from "react";
import { divIcon } from "leaflet";
import type { LatLngExpression } from "leaflet";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";

const DEFAULT_CENTER: [number, number] = [14.5995, 120.9842];
const DEFAULT_ZOOM = 15;
const PIN_FLY_ZOOM = 16;

function formatCoordFallback(lat: number, lng: number): string {
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}

/**
 * Label for the map pin — prefers OSM Nominatim (aligned with OSM tiles), then BigDataCloud.
 * @see https://operations.osmfoundation.org/policies/nominatim/
 */
export async function reverseGeocodeRoughAddress(lat: number, lng: number): Promise<string> {
  try {
    const nom = new URL("https://nominatim.openstreetmap.org/reverse");
    nom.searchParams.set("format", "jsonv2");
    nom.searchParams.set("lat", String(lat));
    nom.searchParams.set("lon", String(lng));
    const nRes = await fetch(nom.toString(), {
      headers: {
        Accept: "application/json",
        "Accept-Language": "en",
      },
    });
    if (nRes.ok) {
      const j = (await nRes.json()) as { display_name?: string };
      if (typeof j.display_name === "string" && j.display_name.trim()) {
        return j.display_name.split(",").slice(0, 4).join(",").trim();
      }
    }
  } catch {
    /* fall through */
  }

  try {
    const url = new URL("https://api.bigdatacloud.net/data/reverse-geocode-client");
    url.searchParams.set("latitude", String(lat));
    url.searchParams.set("longitude", String(lng));
    url.searchParams.set("localityLanguage", "en");
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error("geo");
    const j = (await res.json()) as Record<string, unknown>;
    const locality = typeof j.locality === "string" ? j.locality : "";
    const city = typeof j.city === "string" ? j.city : "";
    const sub = typeof j.principalSubdivision === "string" ? j.principalSubdivision : "";
    const parts = [locality, city, sub].filter(Boolean);
    if (parts.length > 0) return parts.join(", ");
  } catch {
    /* use coordinate fallback */
  }
  return formatCoordFallback(lat, lng);
}

function MapClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

/** Leaflet often mis-measures hidden flex layouts; nudge after mount. */
function MapInvalidateSize() {
  const map = useMap();
  useEffect(() => {
    const raf = requestAnimationFrame(() => map.invalidateSize());
    const timer = window.setTimeout(() => map.invalidateSize(), 220);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
    };
  }, [map]);
  return null;
}

/** Keeps the map viewport centered on the pin so the label matches what you see. */
function MapPanToPin({ pinLat, pinLng }: { pinLat: number | null; pinLng: number | null }) {
  const map = useMap();
  const last = useRef<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (pinLat == null || pinLng == null) return;
    const prev = last.current;
    if (prev && prev.lat === pinLat && prev.lng === pinLng) return;
    last.current = { lat: pinLat, lng: pinLng };

    const targetZoom = Math.max(map.getZoom(), PIN_FLY_ZOOM);
    map.flyTo([pinLat, pinLng], targetZoom, { duration: 0.42 });
  }, [map, pinLat, pinLng]);

  return null;
}

type LocationPickerMapProps = {
  className?: string;
  center?: [number, number];
  pinLat: number | null;
  pinLng: number | null;
  onPick: (lat: number, lng: number) => void;
};

export function LocationPickerMap({
  className,
  center = DEFAULT_CENTER,
  pinLat,
  pinLng,
  onPick,
}: LocationPickerMapProps) {
  const position: LatLngExpression | null =
    pinLat != null && pinLng != null ? [pinLat, pinLng] : null;

  const pinIcon = useMemo(
    () =>
      divIcon({
        className: "bud-location-picker-pin",
        html: `<div style="display:flex;justify-content:center;width:40px;height:48px;margin:-48px 0 0 -20px" aria-hidden="true">
          <svg width="40" height="48" viewBox="0 0 40 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 4C12.3 4 6 10.1 6 17.4c0 9.2 14 22.6 14 22.6s14-13.4 14-22.6C34 10.1 27.7 4 20 4z" fill="#8B3A15" stroke="#FFFFFF" stroke-width="1.5"/>
            <circle cx="20" cy="17" r="4.5" fill="#FFFFFF"/>
          </svg>
        </div>`,
        iconSize: [40, 48],
        iconAnchor: [20, 48],
      }),
    []
  );

  return (
    <div
      className={`relative z-0 overflow-hidden rounded-2xl border border-bud-text-muted/15 bg-bud-surface-well shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] ${className ?? ""}`}
    >
      <div className="h-60 w-full min-h-[240px] [&_.leaflet-container]:h-full [&_.leaflet-container]:min-h-[240px] [&_.leaflet-container]:w-full [&_.leaflet-container]:rounded-2xl">
        <MapContainer
          center={position ?? center}
          zoom={DEFAULT_ZOOM}
          scrollWheelZoom
          className="size-full min-h-[240px] rounded-2xl"
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapInvalidateSize />
          <MapPanToPin pinLat={pinLat} pinLng={pinLng} />
          <MapClickHandler onPick={onPick} />
          {position ? (
            <Marker
              position={position}
              icon={pinIcon}
              draggable
              eventHandlers={{
                dragend: (e) => {
                  const ll = e.target.getLatLng();
                  onPick(ll.lat, ll.lng);
                },
              }}
            />
          ) : null}
        </MapContainer>
      </div>
    </div>
  );
}
