/** Haversine distance in meters between WGS84 lat/lng pairs. */
export function distanceMeters(aWgs: [number, number], bWgs: [number, number]): number {
  const [lat1, lon1] = aWgs;
  const [lat2, lon2] = bWgs;
  const R = 6371000;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const s =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
  return R * c;
}

export function metersToWalkMinutes(m: number): number {
  return Math.max(1, Math.round(m / 80));
}

/** Meters per degree latitude at `lat` (for rough ring sizing). */
export function metersToLatDegrees(meters: number, _atLat: number): number {
  return meters / 111320;
}

export function metersToLngDegrees(meters: number, atLat: number): number {
  return meters / (111320 * Math.cos((atLat * Math.PI) / 180) || 1e-6);
}
