export type PetStatus = "LOST" | "FOUND";
export type PetType = "dog" | "cat" | "other";

/** Marks seeded demo rows so they are not shown as the signed-out user's reports. */
export const DEMO_REPORTER_ID = "__bud_demo__";

/** Seed rows used by petStore / Supabase fallback (matches backend merge). */
export type LegacyPet = {
  id: string;
  name: string;
  breed?: string;
  color: string;
  furColor: string;
  gender: string;
  status: PetStatus;
  type: PetType;
  location: string;
  date: string;
  image: string;
  description: string;
  lat?: number;
  lng?: number;
  ownerName?: string;
  ownerContact?: string;
};

export const DEMO_PETS: LegacyPet[] = [
  {
    id: "barnaby",
    name: "Barnaby",
    breed: "Golden Retriever",
    color: "Red Collar",
    furColor: "Golden",
    gender: "Male",
    status: "LOST",
    type: "dog",
    location: "Near San Park",
    date: "Today · 0.8 mi away",
    image:
      "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=900&h=1125&fit=crop&q=82",
    description:
      "Barnaby is friendly but may be scared. He was last seen wearing a red collar with a silver tag. Please call if you spot him—he may respond to treats.",
    lat: 14.5995,
    lng: 120.9842,
  },
  {
    id: "orange-tabby",
    name: "Orange Tabby Cat",
    breed: undefined,
    color: "Orange",
    furColor: "Orange tabby",
    gender: "Unknown",
    status: "FOUND",
    type: "cat",
    location: "Key Location Street",
    date: "2 hrs ago",
    image:
      "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800&h=1000&fit=crop&q=80",
    description:
      "Found near the bakery alley—calm but hungry. No collar. Community is holding the cat safely while searching for the owner.",
    lat: 14.601,
    lng: 120.986,
  },
  {
    id: "luna",
    name: "Luna",
    breed: "Domestic Shorthair",
    color: "Black",
    furColor: "Black",
    gender: "Female",
    status: "FOUND",
    type: "cat",
    location: "Reunited with family",
    date: "14 hrs search",
    image:
      "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=800&h=1000&fit=crop&q=80",
    description:
      "Luna is home safe. Thank you to everyone who shared sightings and checked in—this is what community care looks like.",
    lat: 14.598,
    lng: 120.9825,
  },
];

const PIN_BY_ID: Record<string, { topPct: number; leftPct: number }> = {
  barnaby: { topPct: 38, leftPct: 34 },
  "orange-tabby": { topPct: 24, leftPct: 64 },
  luna: { topPct: 58, leftPct: 49 },
};

/** UI model for map/board screens (includes static-map pin). */
export type Pet = LegacyPet & {
  pin: { topPct: number; leftPct: number };
};

const MAP_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBcnGwFDAsfPLb8FpWyRAzCrsm9ChOSyl7v1QeEkMLPCbXxh3rBg9PFKrP0-kFj2i5hH22GXG-15aK8r5qdFTu8yqPilLXq-0XSLrrG2UINR98i1Kq-M3QrJ9RPC9shpNs0UYSOJShAxy8asPMkgU4zptPf-BvZXDCNtgrZi0-myPPyTAZM4ME1pv5w0M1FJvEZSw3eQPmbZvGdBXYF4CH2p7-fbQfuVXRzzWm_ms8BRgH67Zad3lGzD-myHaBJdeczPCFaPEMfH5FC";

export const STATIC_MAP_IMAGE_URL = MAP_IMG;

export const pets: Pet[] = DEMO_PETS.map((p) => ({
  ...p,
  pin: PIN_BY_ID[p.id] ?? { topPct: 50, leftPct: 50 },
}));

export function getPetById(id: string): Pet | undefined {
  return pets.find((p) => p.id === id);
}
