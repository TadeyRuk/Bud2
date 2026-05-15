import type { GeoPosition } from "../hooks/useGeolocation";

type LatLng = { lat: number; lng: number };

const EARTH_RADIUS_KM = 6371;

export function haversineDistanceKm(a: LatLng, b: LatLng): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

export function formatDistanceKm(km: number): string {
  if (km < 1) {
    const meters = Math.round(km * 1000);
    return `${meters} m`;
  }
  if (km < 10) {
    return `${km.toFixed(1)} km`;
  }
  return `${Math.round(km)} km`;
}

export function petDistanceKm(
  pet: { lat: number | null; lng: number | null },
  user: GeoPosition
): number | null {
  if (pet.lat == null || pet.lng == null) return null;
  return haversineDistanceKm(user, { lat: pet.lat, lng: pet.lng });
}

export function sortPetsByDistance<T extends { lat: number | null; lng: number | null }>(
  pets: T[],
  user: GeoPosition | null
): T[] {
  if (!user) return pets;

  return [...pets].sort((a, b) => {
    const distA = petDistanceKm(a, user) ?? Infinity;
    const distB = petDistanceKm(b, user) ?? Infinity;
    return distA - distB;
  });
}

/** Rough bbox around `center` for rough-cut queries (uses composite lat,lng index). */
export type BoundingBoxKm = {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
};

export function boundingBoxKm(center: GeoPosition, radiusKm: number): BoundingBoxKm {
  const lat = Math.max(-89.9, Math.min(89.9, center.lat));
  const latDelta = radiusKm / 111;
  const cosLat = Math.max(Math.cos((lat * Math.PI) / 180), 0.01);
  const lngDelta = radiusKm / (111 * cosLat);

  return {
    minLat: center.lat - latDelta,
    maxLat: center.lat + latDelta,
    minLng: center.lng - lngDelta,
    maxLng: center.lng + lngDelta,
  };
}
