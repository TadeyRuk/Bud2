export type BarangayDesk = {
  id: string;
  barangay: string;
  city: string;
  phone: string;
  lat: number;
  lng: number;
};

/** Representative community help desks (demo). Sorted by distance at runtime. */
export const BARANGAY_HELP_DESKS: BarangayDesk[] = [
  { id: "ncr-1", barangay: "Barangay Culiat", city: "Quezon City", phone: "+63 2 8931 9201", lat: 14.676, lng: 121.0437 },
  { id: "ncr-2", barangay: "Barangay Poblacion", city: "Makati City", phone: "+63 2 8882 1000", lat: 14.5547, lng: 121.0244 },
  { id: "ncr-3", barangay: "Barangay Plainview", city: "Mandaluyong City", phone: "+63 2 8536 2500", lat: 14.5794, lng: 121.0359 },
  { id: "ncr-4", barangay: "Barangay San Antonio", city: "Pasig City", phone: "+63 2 8643 9111", lat: 14.5896, lng: 121.0619 },
  { id: "ncr-adm", barangay: "DILG Public Assistance", city: "Metro Manila", phone: "+63 2 925 0347", lat: 14.5905, lng: 120.9817 },
  { id: "ceb-1", barangay: "Barangay Lahug", city: "Cebu City", phone: "+63 32 255 0300", lat: 10.3321, lng: 123.8947 },
  { id: "ceb-2", barangay: "Barangay Guadalupe", city: "Cebu City", phone: "+63 32 253 9031", lat: 10.3182, lng: 123.8851 },
  { id: "dvo-1", barangay: "Barangay Poblacion", city: "Davao City", phone: "+63 82 241 1000", lat: 7.0731, lng: 125.6128 },
  { id: "ilo-1", barangay: "Barangay City Proper", city: "Iloilo City", phone: "+63 33 321 0381", lat: 10.7202, lng: 122.5621 },
  { id: "bcd-1", barangay: "Barangay 16", city: "Bacolod City", phone: "+63 34 709 8888", lat: 10.684, lng: 122.9563 },
  { id: "dag-1", barangay: "Barangay Lucao", city: "Dagupan City", phone: "+63 75 522 2363", lat: 16.0431, lng: 120.3333 },
  { id: "bag-1", barangay: "Barangay Session", city: "Baguio City", phone: "+63 74 446 8111", lat: 16.4023, lng: 120.596 },
  { id: "gen-1", barangay: "Barangay Lagao", city: "General Santos City", phone: "+63 83 301 7777", lat: 6.1164, lng: 125.1716 },
  { id: "cag-1", barangay: "Barangay Carmen", city: "Cagayan de Oro", phone: "+63 88 858 6700", lat: 8.4542, lng: 124.6319 },
];

function haversineKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const q =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((aLat * Math.PI) / 180) * Math.cos((bLat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(q)));
}

export function nearestBarangayDesks(
  petLat: number | null,
  petLng: number | null,
  fallback: [number, number],
  limit = 5
): { desk: BarangayDesk; distanceKm: number }[] {
  const lat = petLat ?? fallback[0];
  const lng = petLng ?? fallback[1];
  return [...BARANGAY_HELP_DESKS]
    .map((desk) => ({
      desk,
      distanceKm: Number(haversineKm(lat, lng, desk.lat, desk.lng).toFixed(1)),
    }))
    .sort((x, y) => x.distanceKm - y.distanceKm)
    .slice(0, limit);
}
