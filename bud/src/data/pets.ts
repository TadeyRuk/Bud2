export type PetStatus = "LOST" | "FOUND";
export type PetType = "dog" | "cat" | "other";

export type Pet = {
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
  /** Pin position on static map (percent of container) */
  pin: { topPct: number; leftPct: number };
  /** Optional lat/lng when using Google Maps */
  lat?: number;
  lng?: number;
};

const MAP_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBcnGwFDAsfPLb8FpWyRAzCrsm9ChOSyl7v1QeEkMLPCbXxh3rBg9PFKrP0-kFj2i5hH22GXG-15aK8r5qdFTu8yqPilLXq-0XSLrrG2UINR98i1Kq-M3QrJ9RPC9shpNs0UYSOJShAxy8asPMkgU4zptPf-BvZXDCNtgrZi0-myPPyTAZM4ME1pv5w0M1FJvEZSw3eQPmbZvGdBXYF4CH2p7-fbQfuVXRzzWm_ms8BRgH67Zad3lGzD-myHaBJdeczPCFaPEMfH5FC";

export const STATIC_MAP_IMAGE_URL = MAP_IMG;

export const pets: Pet[] = [
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
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBS09qsZ5-IfFOypkJJQZwkFWrwY6TfmYrS3Wwch4lSNJiz-JdYaMJEM5DOQn70blOQHjK-RTxvcjvEnEs9WvFDmOjJFvJhASgqyenI_YZJJY-f7Wlt5mpcP9rCNJ4JSZ8DA4tCyERo2bNXX2FLsigA7YYSXDr3gY4Jnl2nTrMzTAdsNrQKW5B09zY_x29XanZsLSwDk0z8u0fwpPEW05F6HEd9G5vme0N5v3TIy_c2Ah39z21RX3UHRe9_pAoxgFTaS3tkbsHqX3n1",
    description:
      "Barnaby is friendly but may be scared. He was last seen wearing a red collar with a silver tag. Please call if you spot him—he may respond to treats.",
    pin: { topPct: 38, leftPct: 34 },
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
    type: "other",
    location: "Key Location Street",
    date: "2 hrs ago",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDVgz3SqP1xSusxuVeTNJWbPLtY-VMqkKKWTnLnu0YQp-ukdt-_ddLvkIjVb1k78aE7yFJBSoZrRfsMl_0Oo6Wv0TddadEiH1uTteL9Kwx_tLWg4PLQSG6DPOMgG8v77xp_dPVQS98tXhFWs4ElrRfYB13-vsvxqx1boG6VOz4AbKZxYhyXcz8mmA40WZjxkO1zWyalfs9DyJ-xCy5AHAKFGhevQPKeriW3hO0_Fgxl97zoIxDMoKVsKxJlqaIZNue2y1Bbm2_9zA8m",
    description:
      "Found near the bakery alley—calm but hungry. No collar. Community is holding the cat safely while searching for the owner.",
    pin: { topPct: 24, leftPct: 64 },
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
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD3Qy4b90QLzov4ww2r2vz9pPUCdhNw8w0jvP7iYn7qV5zKZw9qE7hKio6kp6tBbZqngwuj7Yz5H-qfxsmiUwa5ydVT8ivP8GvNAYLxt0nkRb2LO0VTL1dLvzhXMzwCPvSHQUqrYqbjUknvTiLFZJWv1Buyob_7sm487lyGV7NjYYz0jPALbQsTOV4cvre609YNwQS-p0GbBFaqYRRZlp-BuDEOLN8bLYc0warxUQwiOi0OvQk6IkxTVFV-TSNFVPC6H63kLTOo3VvZ",
    description:
      "Luna is home safe. Thank you to everyone who shared sightings and checked in—this is what community care looks like.",
    pin: { topPct: 58, leftPct: 49 },
    lat: 14.598,
    lng: 120.9825,
  },
];

export function getPetById(id: string): Pet | undefined {
  return pets.find((p) => p.id === id);
}
