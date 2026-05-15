import type { GeoPosition } from "../hooks/useGeolocation";
import { petDistanceKm } from "./geo";

export const FUZZ_RADIUS_M = 600;

type LatLng = { lat: number; lng: number };

function seededUnit(seed: number): number {
  const x = Math.sin(seed * 127.1 + seed * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function hashSeed(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h * 31 + id.charCodeAt(i)) | 0;
  }
  return Math.abs(h) + 1;
}

/** Deterministic ~400–800 m offset from exact coords (stable per pet id). */
export function fuzzCoordinates(lat: number, lng: number, seed: string): LatLng {
  const numericSeed = hashSeed(seed);
  const angle = seededUnit(numericSeed) * 2 * Math.PI;
  const minR = 0.004;
  const maxR = 0.008;
  const t = seededUnit(numericSeed + 1);
  const r = minR + t * (maxR - minR);
  const latOff = r * Math.cos(angle);
  const lngOff = r * Math.sin(angle);

  return {
    lat: Number((lat + latOff).toFixed(6)),
    lng: Number((lng + lngOff).toFixed(6)),
  };
}

export function hasPetCoordinates(pet: {
  lat: number | null;
  lng: number | null;
}): pet is { lat: number; lng: number } {
  return pet.lat != null && pet.lng != null;
}

export function formatDistanceBucket(km: number): string {
  if (km < 0.5) return "Within 500 m";
  if (km < 2) return "Within 2 km";
  if (km < 10) return "2–10 km";
  return "10+ km";
}

export function getPublicLocationLabel(
  pet: { id: string; lat: number | null; lng: number | null },
  viewerPosition: GeoPosition | null,
  options?: { suffix?: boolean }
): string {
  const suffix = options?.suffix ?? true;

  if (!hasPetCoordinates(pet)) {
    return "Location not pinned";
  }

  if (!viewerPosition) {
    return "Approximate area on map";
  }

  const km = petDistanceKm(pet, viewerPosition);
  if (km == null) {
    return "Approximate area on map";
  }

  const bucket = formatDistanceBucket(km);
  return suffix ? `${bucket} away` : bucket;
}

export function getFuzzyMapCenter(pet: {
  id: string;
  lat: number;
  lng: number;
}): LatLng {
  return fuzzCoordinates(pet.lat, pet.lng, pet.id);
}
