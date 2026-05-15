import type { FilterStateShape } from "../stores/filterStore";

export const FILTER_PRESETS: { id: string; label: string; patch: Partial<FilterStateShape> }[] = [
  {
    id: "dogs-1km",
    label: "Dogs within 1km",
    patch: { species: ["dog"], maxDistanceKm: 1 },
  },
  {
    id: "24h",
    label: "Just reported (24h)",
    patch: { reportedWithin: "24h" },
  },
  {
    id: "reunited-month",
    label: "Reunited highlights",
    patch: { statuses: ["REUNITED"], reportedWithin: "30d" },
  },
];
