import { useEffect, useRef, useState, type MutableRefObject } from "react";
import type { Pet } from "../../stores/petStore";
import { reverseGeocodeRoughAddress } from "../LocationPickerMap";
import { SightingMiniMap, SIGHTING_MAP_DEFAULT_CENTER } from "./SightingMiniMap";

export type WhenChoice = "just-now" | "within-hour" | "earlier-today";

type StepLocationProps = {
  pet: Pet;
  pinLat: number | null;
  pinLng: number | null;
  onPick: (lat: number, lng: number) => void;
  when: WhenChoice;
  onWhen: (w: WhenChoice) => void;
  locationLabel: string;
  onLocationLabel: (v: string) => void;
  sheetOpen: boolean;
  mapInteractionRef: MutableRefObject<boolean>;
};

export function StepLocation({
  pet,
  pinLat,
  pinLng,
  onPick,
  when,
  onWhen,
  locationLabel,
  onLocationLabel,
  sheetOpen,
  mapInteractionRef,
}: StepLocationProps) {
  const [showRadar, setShowRadar] = useState(true);
  const locationEditedByUser = useRef(false);

  const center: [number, number] =
    pet.lat != null && pet.lng != null
      ? [pet.lat, pet.lng]
      : SIGHTING_MAP_DEFAULT_CENTER;

  useEffect(() => {
    if (!sheetOpen) return;
    setShowRadar(true);
    const t = window.setTimeout(() => setShowRadar(false), 2400);
    return () => window.clearTimeout(t);
  }, [sheetOpen]);

  useEffect(() => {
    if (pinLat == null || pinLng == null) return;
    locationEditedByUser.current = false;
    let cancelled = false;
    const timer = window.setTimeout(() => {
      void reverseGeocodeRoughAddress(pinLat, pinLng).then((label) => {
        if (!cancelled && !locationEditedByUser.current) onLocationLabel(label);
      });
    }, 420);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [pinLat, pinLng, onLocationLabel]);

  const chips: { id: WhenChoice; label: string }[] = [
    { id: "just-now", label: "Just now" },
    { id: "within-hour", label: "Within an hour" },
    { id: "earlier-today", label: "Earlier today" },
  ];

  return (
    <div className="space-y-4 px-1">
      <div>
        <p className="font-body text-sm font-semibold text-bud-text">Where did you see them?</p>
        <p className="mt-1 font-body text-xs text-bud-text-muted">Tap the map to drop a pin. Drag to adjust.</p>
      </div>

      <SightingMiniMap
        center={center}
        pinLat={pinLat}
        pinLng={pinLng}
        onPick={(lat, lng) => {
          mapInteractionRef.current = true;
          window.setTimeout(() => {
            mapInteractionRef.current = false;
          }, 100);
          onPick(lat, lng);
        }}
        showRadar={showRadar}
        onMapPointerDownCapture={() => {
          mapInteractionRef.current = true;
          window.setTimeout(() => {
            mapInteractionRef.current = false;
          }, 350);
        }}
      />

      {pinLat != null && pinLng != null ? (
        <p className="font-body text-[11px] leading-snug text-bud-text-muted">
          <span className="font-semibold text-bud-text/80">Pin:</span> {pinLat.toFixed(5)}, {pinLng.toFixed(5)}
        </p>
      ) : (
        <p className="font-body text-[11px] text-bud-accent">Tap the map to place a pin to continue.</p>
      )}

      <div>
        <label htmlFor="sighting-area-label" className="font-body text-xs font-semibold uppercase tracking-wide text-bud-text">
          Area label
        </label>
        <input
          id="sighting-area-label"
          value={locationLabel}
          onChange={(e) => {
            locationEditedByUser.current = true;
            onLocationLabel(e.target.value);
          }}
          placeholder="From your pin — edit anytime"
          className="mt-2 w-full rounded-xl border border-white/50 bg-white/85 px-3 py-2.5 font-body text-sm text-bud-text outline-none ring-bud-primary/20 placeholder:text-bud-text-muted/70 focus:ring-2"
        />
      </div>

      <div>
        <p className="font-body text-xs font-semibold uppercase tracking-wide text-bud-text">When?</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {chips.map((c) => {
            const active = when === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onWhen(c.id)}
                className={`rounded-full px-3 py-2 font-body text-xs font-semibold transition-transform motion-safe:active:scale-[0.97] ${
                  active
                    ? "bud-sighting-pop-in bg-bud-primary text-white shadow-md motion-reduce:animate-none"
                    : "border border-bud-text-muted/20 bg-white/55 text-bud-text"
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
