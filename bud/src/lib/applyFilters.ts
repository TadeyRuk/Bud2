import { distanceMeters } from "./distance";
import type { Pet } from "../stores/petStore";
import type { FilterStateShape } from "../stores/filterStore";
import type { LocalPetSighting } from "../stores/sightingStore";
import { DEMO_REPORTER_ID } from "../data/pets";

function withinReportedWindow(iso: string, window: FilterStateShape["reportedWithin"]): boolean {
  if (window === "any") return true;
  const t = new Date(iso).getTime();
  const now = Date.now();
  const max =
    window === "24h"
      ? 86_400_000
      : window === "7d"
        ? 7 * 86_400_000
        : 30 * 86_400_000;
  return now - t <= max;
}

/** “Verified” listing = posted by a real account, not the seeded demo reporter. */
function isVerifiedListing(pet: Pet): boolean {
  return !!pet.reporter_id && pet.reporter_id !== DEMO_REPORTER_ID;
}

export function applyFilters(
  pets: Pet[],
  filters: FilterStateShape,
  ctx: { userLatLng: [number, number] }
): Pet[] {
  return pets.filter((p) => {
    if (filters.stillMissingOnly && p.status !== "LOST") return false;

    if (filters.species.length && !filters.species.includes(p.type)) return false;
    if (filters.statuses.length > 0 && !filters.statuses.includes(p.status)) return false;

    if (filters.hasPhoto && !p.image_url) return false;

    if (filters.verifiedOnly && !isVerifiedListing(p)) return false;

    if (!withinReportedWindow(p.created_at, filters.reportedWithin)) return false;

    if (filters.maxDistanceKm > 0) {
      const lat = p.lat;
      const lng = p.lng;
      if (lat == null || lng == null) return false;
      const d = distanceMeters(ctx.userLatLng, [lat, lng]);
      if (d > filters.maxDistanceKm * 1000) return false;
    }

    return true;
  });
}

export function buildSightingMap(rows: LocalPetSighting[]): Map<string, LocalPetSighting[]> {
  const m = new Map<string, LocalPetSighting[]>();
  for (const s of rows) {
    const list = m.get(s.petId) ?? [];
    list.push(s);
    m.set(s.petId, list);
  }
  return m;
}
