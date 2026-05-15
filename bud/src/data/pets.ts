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

type CityReport = {
  city: string;
  landmark: string;
  islandGroup: "Luzon" | "Visayas" | "Mindanao";
  lat: number;
  lng: number;
};

const CITY_REPORTS: CityReport[] = [
  { islandGroup: "Luzon", city: "Laoag City, Ilocos Norte", landmark: "Aurora Park", lat: 18.196, lng: 120.5927 },
  { islandGroup: "Luzon", city: "Vigan City, Ilocos Sur", landmark: "Calle Crisologo", lat: 17.5747, lng: 120.3869 },
  { islandGroup: "Luzon", city: "San Fernando, La Union", landmark: "Poro Point", lat: 16.6186, lng: 120.31 },
  { islandGroup: "Luzon", city: "Dagupan City, Pangasinan", landmark: "Tondaligan Beach", lat: 16.0431, lng: 120.3333 },
  { islandGroup: "Luzon", city: "Baguio City, Benguet", landmark: "Burnham Park", lat: 16.4023, lng: 120.596 },
  { islandGroup: "Luzon", city: "Tabuk City, Kalinga", landmark: "City Hall area", lat: 17.4084, lng: 121.4442 },
  { islandGroup: "Luzon", city: "Tuguegarao City, Cagayan", landmark: "Rizal Park", lat: 17.6132, lng: 121.7269 },
  { islandGroup: "Luzon", city: "Cauayan City, Isabela", landmark: "SM City Cauayan", lat: 16.9355, lng: 121.7723 },
  { islandGroup: "Luzon", city: "Bayombong, Nueva Vizcaya", landmark: "Capitol Park", lat: 16.4812, lng: 121.1497 },
  { islandGroup: "Luzon", city: "Baler, Aurora", landmark: "Sabang Beach", lat: 15.7589, lng: 121.5625 },
  { islandGroup: "Luzon", city: "Tarlac City, Tarlac", landmark: "Maria Cristina Park", lat: 15.4865, lng: 120.5897 },
  { islandGroup: "Luzon", city: "Cabanatuan City, Nueva Ecija", landmark: "Freedom Park", lat: 15.4869, lng: 120.973 },
  { islandGroup: "Luzon", city: "San Fernando, Pampanga", landmark: "Capitol grounds", lat: 15.0333, lng: 120.6833 },
  { islandGroup: "Luzon", city: "Angeles City, Pampanga", landmark: "Marquee Mall", lat: 15.164, lng: 120.6092 },
  { islandGroup: "Luzon", city: "Olongapo City, Zambales", landmark: "SM Olongapo Central", lat: 14.837, lng: 120.2842 },
  { islandGroup: "Luzon", city: "Balanga City, Bataan", landmark: "Plaza Mayor", lat: 14.676, lng: 120.5362 },
  { islandGroup: "Luzon", city: "Malolos City, Bulacan", landmark: "Barasoain Church", lat: 14.8436, lng: 120.8114 },
  { islandGroup: "Luzon", city: "Quezon City, Metro Manila", landmark: "Quezon Memorial Circle", lat: 14.6514, lng: 121.0493 },
  { islandGroup: "Luzon", city: "Manila, Metro Manila", landmark: "Rizal Park", lat: 14.5826, lng: 120.9787 },
  { islandGroup: "Luzon", city: "Makati City, Metro Manila", landmark: "Ayala Triangle", lat: 14.5569, lng: 121.0234 },
  { islandGroup: "Luzon", city: "Pasig City, Metro Manila", landmark: "Capitol Commons", lat: 14.5755, lng: 121.0656 },
  { islandGroup: "Luzon", city: "Taguig City, Metro Manila", landmark: "BGC High Street", lat: 14.5507, lng: 121.0507 },
  { islandGroup: "Luzon", city: "Pasay City, Metro Manila", landmark: "Mall of Asia complex", lat: 14.5352, lng: 120.9822 },
  { islandGroup: "Luzon", city: "Antipolo City, Rizal", landmark: "Hinulugang Taktak", lat: 14.5886, lng: 121.1757 },
  { islandGroup: "Luzon", city: "Calamba City, Laguna", landmark: "The Plaza", lat: 14.2117, lng: 121.1653 },
  { islandGroup: "Luzon", city: "Santa Rosa City, Laguna", landmark: "Solenad Nuvali", lat: 14.2386, lng: 121.0574 },
  { islandGroup: "Luzon", city: "Tagaytay City, Cavite", landmark: "Picnic Grove", lat: 14.1097, lng: 120.9836 },
  { islandGroup: "Luzon", city: "Dasmarinas City, Cavite", landmark: "Promenade area", lat: 14.3294, lng: 120.9367 },
  { islandGroup: "Luzon", city: "Batangas City, Batangas", landmark: "Plaza Mabini", lat: 13.7565, lng: 121.0583 },
  { islandGroup: "Luzon", city: "Lipa City, Batangas", landmark: "SM City Lipa", lat: 13.9411, lng: 121.1623 },
  { islandGroup: "Luzon", city: "Lucena City, Quezon", landmark: "Perez Park", lat: 13.9414, lng: 121.6239 },
  { islandGroup: "Luzon", city: "Boac, Marinduque", landmark: "Boac Cathedral", lat: 13.4469, lng: 121.84 },
  { islandGroup: "Luzon", city: "Calapan City, Oriental Mindoro", landmark: "City Plaza", lat: 13.4105, lng: 121.1803 },
  { islandGroup: "Luzon", city: "Puerto Princesa, Palawan", landmark: "Baywalk Park", lat: 9.7439, lng: 118.7353 },
  { islandGroup: "Luzon", city: "Coron, Palawan", landmark: "Town plaza", lat: 11.9986, lng: 120.2043 },
  { islandGroup: "Luzon", city: "Legazpi City, Albay", landmark: "Penaranda Park", lat: 13.1391, lng: 123.7438 },
  { islandGroup: "Luzon", city: "Naga City, Camarines Sur", landmark: "SM City Naga terminal", lat: 13.6218, lng: 123.1948 },
  { islandGroup: "Luzon", city: "Sorsogon City, Sorsogon", landmark: "Rompeolas Baywalk", lat: 12.9742, lng: 124.0058 },
  { islandGroup: "Luzon", city: "Daet, Camarines Norte", landmark: "Bagasbas Beach", lat: 14.1292, lng: 122.9821 },
  { islandGroup: "Luzon", city: "Virac, Catanduanes", landmark: "Capitol grounds", lat: 13.5799, lng: 124.2306 },
  { islandGroup: "Visayas", city: "Catbalogan City, Samar", landmark: "Pier area", lat: 11.7753, lng: 124.8861 },
  { islandGroup: "Visayas", city: "Tacloban City, Leyte", landmark: "Balyuan Amphitheater", lat: 11.2443, lng: 125.005 },
  { islandGroup: "Visayas", city: "Ormoc City, Leyte", landmark: "City plaza", lat: 11.0064, lng: 124.6075 },
  { islandGroup: "Visayas", city: "Maasin City, Southern Leyte", landmark: "City hall grounds", lat: 10.1336, lng: 124.8447 },
  { islandGroup: "Visayas", city: "Borongan City, Eastern Samar", landmark: "Baybay Boulevard", lat: 11.607, lng: 125.431 },
  { islandGroup: "Visayas", city: "Naval, Biliran", landmark: "Port area", lat: 11.5606, lng: 124.3972 },
  { islandGroup: "Visayas", city: "Roxas City, Capiz", landmark: "People's Park", lat: 11.5853, lng: 122.7511 },
  { islandGroup: "Visayas", city: "Kalibo, Aklan", landmark: "Magsaysay Park", lat: 11.7061, lng: 122.3648 },
  { islandGroup: "Visayas", city: "Malay, Aklan", landmark: "Caticlan Jetty Port", lat: 11.9253, lng: 121.9497 },
  { islandGroup: "Visayas", city: "San Jose de Buenavista, Antique", landmark: "Evelio Javier Freedom Park", lat: 10.7469, lng: 121.9441 },
  { islandGroup: "Visayas", city: "Iloilo City, Iloilo", landmark: "Iloilo Esplanade", lat: 10.7057, lng: 122.5644 },
  { islandGroup: "Visayas", city: "Passi City, Iloilo", landmark: "City plaza", lat: 11.1078, lng: 122.6419 },
  { islandGroup: "Visayas", city: "Bacolod City, Negros Occidental", landmark: "Capitol Lagoon", lat: 10.6765, lng: 122.9509 },
  { islandGroup: "Visayas", city: "Talisay City, Negros Occidental", landmark: "The Ruins", lat: 10.731, lng: 122.97 },
  { islandGroup: "Visayas", city: "Dumaguete City, Negros Oriental", landmark: "Rizal Boulevard", lat: 9.3068, lng: 123.3054 },
  { islandGroup: "Visayas", city: "Bayawan City, Negros Oriental", landmark: "Bayawan Boulevard", lat: 9.3649, lng: 122.804 },
  { islandGroup: "Visayas", city: "Cebu City, Cebu", landmark: "IT Park", lat: 10.3318, lng: 123.9066 },
  { islandGroup: "Visayas", city: "Mandaue City, Cebu", landmark: "Parkmall area", lat: 10.3342, lng: 123.9381 },
  { islandGroup: "Visayas", city: "Lapu-Lapu City, Cebu", landmark: "Mactan Shrine", lat: 10.3103, lng: 124.0152 },
  { islandGroup: "Visayas", city: "Toledo City, Cebu", landmark: "Port area", lat: 10.3773, lng: 123.6386 },
  { islandGroup: "Visayas", city: "Tagbilaran City, Bohol", landmark: "Plaza Rizal", lat: 9.6496, lng: 123.8536 },
  { islandGroup: "Visayas", city: "Panglao, Bohol", landmark: "Public market", lat: 9.5787, lng: 123.7459 },
  { islandGroup: "Visayas", city: "Siquijor, Siquijor", landmark: "Port terminal", lat: 9.214, lng: 123.515 },
  { islandGroup: "Visayas", city: "Bantayan, Cebu", landmark: "Municipal plaza", lat: 11.1674, lng: 123.7228 },
  { islandGroup: "Mindanao", city: "Zamboanga City, Zamboanga del Sur", landmark: "Paseo del Mar", lat: 6.9047, lng: 122.076 },
  { islandGroup: "Mindanao", city: "Pagadian City, Zamboanga del Sur", landmark: "Rotonda", lat: 7.8257, lng: 123.437 },
  { islandGroup: "Mindanao", city: "Dipolog City, Zamboanga del Norte", landmark: "Boulevard", lat: 8.5883, lng: 123.3409 },
  { islandGroup: "Mindanao", city: "Dapitan City, Zamboanga del Norte", landmark: "Rizal Shrine", lat: 8.6544, lng: 123.4243 },
  { islandGroup: "Mindanao", city: "Ipil, Zamboanga Sibugay", landmark: "Municipal plaza", lat: 7.7844, lng: 122.5867 },
  { islandGroup: "Mindanao", city: "Isabela City, Basilan", landmark: "Port area", lat: 6.7041, lng: 121.9712 },
  { islandGroup: "Mindanao", city: "Jolo, Sulu", landmark: "Capitol grounds", lat: 6.0522, lng: 121.0022 },
  { islandGroup: "Mindanao", city: "Bongao, Tawi-Tawi", landmark: "Chinese Pier", lat: 5.0292, lng: 119.7731 },
  { islandGroup: "Mindanao", city: "Cagayan de Oro, Misamis Oriental", landmark: "Limketkai Center", lat: 8.4822, lng: 124.6472 },
  { islandGroup: "Mindanao", city: "El Salvador City, Misamis Oriental", landmark: "Divine Mercy Shrine road", lat: 8.563, lng: 124.5218 },
  { islandGroup: "Mindanao", city: "Malaybalay City, Bukidnon", landmark: "Capitol grounds", lat: 8.1575, lng: 125.1278 },
  { islandGroup: "Mindanao", city: "Valencia City, Bukidnon", landmark: "City oval", lat: 7.9042, lng: 125.0928 },
  { islandGroup: "Mindanao", city: "Iligan City, Lanao del Norte", landmark: "Paseo de Santiago", lat: 8.228, lng: 124.2452 },
  { islandGroup: "Mindanao", city: "Marawi City, Lanao del Sur", landmark: "Provincial capitol area", lat: 8.0034, lng: 124.2839 },
  { islandGroup: "Mindanao", city: "Ozamiz City, Misamis Occidental", landmark: "Cotta Fort", lat: 8.1465, lng: 123.8443 },
  { islandGroup: "Mindanao", city: "Oroquieta City, Misamis Occidental", landmark: "City plaza", lat: 8.4859, lng: 123.8048 },
  { islandGroup: "Mindanao", city: "Butuan City, Agusan del Norte", landmark: "Guingona Park", lat: 8.9475, lng: 125.5406 },
  { islandGroup: "Mindanao", city: "Cabadbaran City, Agusan del Norte", landmark: "City plaza", lat: 9.1226, lng: 125.5355 },
  { islandGroup: "Mindanao", city: "Bayugan City, Agusan del Sur", landmark: "Rotonda", lat: 8.7561, lng: 125.7675 },
  { islandGroup: "Mindanao", city: "Surigao City, Surigao del Norte", landmark: "City boulevard", lat: 9.789, lng: 125.495 },
  { islandGroup: "Mindanao", city: "Tandag City, Surigao del Sur", landmark: "Capitol grounds", lat: 9.0783, lng: 126.1986 },
  { islandGroup: "Mindanao", city: "Bislig City, Surigao del Sur", landmark: "Baywalk", lat: 8.2153, lng: 126.3167 },
  { islandGroup: "Mindanao", city: "Davao City, Davao del Sur", landmark: "People's Park", lat: 7.0644, lng: 125.6082 },
  { islandGroup: "Mindanao", city: "Tagum City, Davao del Norte", landmark: "City hall grounds", lat: 7.4478, lng: 125.8076 },
  { islandGroup: "Mindanao", city: "Panabo City, Davao del Norte", landmark: "Freedom Park", lat: 7.3081, lng: 125.6841 },
  { islandGroup: "Mindanao", city: "Digos City, Davao del Sur", landmark: "Rizal Park", lat: 6.7497, lng: 125.3572 },
  { islandGroup: "Mindanao", city: "Mati City, Davao Oriental", landmark: "Baywalk", lat: 6.9551, lng: 126.2166 },
  { islandGroup: "Mindanao", city: "Nabunturan, Davao de Oro", landmark: "Municipal plaza", lat: 7.6078, lng: 125.9665 },
  { islandGroup: "Mindanao", city: "Kidapawan City, Cotabato", landmark: "City plaza", lat: 7.0083, lng: 125.0894 },
  { islandGroup: "Mindanao", city: "Koronadal City, South Cotabato", landmark: "City hall grounds", lat: 6.4997, lng: 124.8469 },
  { islandGroup: "Mindanao", city: "General Santos City, South Cotabato", landmark: "Oval Plaza", lat: 6.1164, lng: 125.1716 },
  { islandGroup: "Mindanao", city: "Tacurong City, Sultan Kudarat", landmark: "City plaza", lat: 6.6925, lng: 124.6764 },
  { islandGroup: "Mindanao", city: "Cotabato City, Maguindanao del Norte", landmark: "People's Palace", lat: 7.2236, lng: 124.2464 },
  { islandGroup: "Mindanao", city: "Midsayap, Cotabato", landmark: "Municipal plaza", lat: 7.191, lng: 124.5305 },
  { islandGroup: "Mindanao", city: "Polomolok, South Cotabato", landmark: "Public market", lat: 6.2217, lng: 125.0639 },
  { islandGroup: "Mindanao", city: "Alabel, Sarangani", landmark: "Capitol complex", lat: 6.1018, lng: 125.2905 },
];

const PET_TEMPLATES = [
  { name: "Mochi", breed: "Shih Tzu", color: "Pink harness", furColor: "White and tan", gender: "Female", type: "dog", image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=900&h=1125&fit=crop&q=82" },
  { name: "Kape", breed: "Aspin", color: "Blue collar", furColor: "Brown", gender: "Male", type: "dog", image: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=900&h=1125&fit=crop&q=82" },
  { name: "Tala", breed: "Siamese mix", color: "Purple collar", furColor: "Cream and gray", gender: "Female", type: "cat", image: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=800&h=1000&fit=crop&q=80" },
  { name: "Puti", breed: "Puspin", color: "No collar", furColor: "White", gender: "Male", type: "cat", image: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800&h=1000&fit=crop&q=80" },
  { name: "Bantay", breed: "Labrador mix", color: "Green collar", furColor: "Black", gender: "Male", type: "dog", image: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=900&h=1125&fit=crop&q=82" },
  { name: "Saging", breed: "Domestic Shorthair", color: "Yellow ribbon", furColor: "Ginger", gender: "Male", type: "cat", image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&h=1000&fit=crop&q=80" },
  { name: "Panda", breed: "Corgi", color: "Red bandana", furColor: "Black, white, and tan", gender: "Female", type: "dog", image: "https://images.unsplash.com/photo-1612536057832-2ff7ead58194?w=900&h=1125&fit=crop&q=82" },
  { name: "Ming", breed: "Puspin", color: "No collar", furColor: "Calico", gender: "Female", type: "cat", image: "https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=800&h=1000&fit=crop&q=80" },
  { name: "Nori", breed: "Persian", color: "Teal collar", furColor: "Gray", gender: "Male", type: "cat", image: "https://images.unsplash.com/photo-1533743983669-94fa5c4338ec?w=800&h=1000&fit=crop&q=80" },
  { name: "Datu", breed: "German Shepherd", color: "Black collar", furColor: "Black and tan", gender: "Male", type: "dog", image: "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=900&h=1125&fit=crop&q=82" },
  { name: "Kiko", breed: "Beagle", color: "Orange leash", furColor: "Tri-color", gender: "Male", type: "dog", image: "https://images.unsplash.com/photo-1505628346881-b72b27e84530?w=900&h=1125&fit=crop&q=82" },
  { name: "Bituin", breed: "Domestic Longhair", color: "Bell collar", furColor: "Tortoiseshell", gender: "Female", type: "cat", image: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=800&h=1000&fit=crop&q=80" },
] satisfies Array<Omit<LegacyPet, "id" | "status" | "location" | "date" | "description" | "lat" | "lng">>;

const TARGET_DEMO_COUNT = 400;

const METRO_CITY_MARKERS = [
  "Metro Manila",
  "Cebu City, Cebu",
  "Davao City, Davao",
  "Iloilo City, Iloilo",
  "Cagayan de Oro, Misamis Oriental",
  "Zamboanga City, Zamboanga del Sur",
] as const;

function isMetroCity(city: string): boolean {
  return METRO_CITY_MARKERS.some((marker) => city.includes(marker));
}

function seededUnit(seed: number): number {
  const x = Math.sin(seed * 127.1 + seed * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/** Deterministic offset from a city anchor; ring controls spread radius. */
export function scatterFromAnchor(
  lat: number,
  lng: number,
  seed: number,
  ring: number
): [number, number] {
  const angle = seededUnit(seed) * 2 * Math.PI;
  let minR: number;
  let maxR: number;

  if (ring === 0) {
    minR = 0;
    maxR = 0.003;
  } else if (ring === 3) {
    minR = 0.15;
    maxR = 0.35;
  } else {
    minR = 0.04;
    maxR = 0.12;
  }

  const t = ring === 0 ? seededUnit(seed + 1) * 0.5 : seededUnit(seed + 1);
  const r = minR + t * (maxR - minR);
  const latOff = r * Math.cos(angle);
  const lngOff = r * Math.sin(angle);

  return [Number((lat + latOff).toFixed(6)), Number((lng + lngOff).toFixed(6))];
}

type SeedSlot = { cityIndex: number; ring: number };

function buildSeedSlots(): SeedSlot[] {
  const slots: SeedSlot[] = [];

  for (let i = 0; i < CITY_REPORTS.length; i++) {
    slots.push({ cityIndex: i, ring: 0 });
  }

  for (const ring of [1, 2] as const) {
    for (let i = 0; i < CITY_REPORTS.length; i++) {
      slots.push({ cityIndex: i, ring });
    }
  }

  for (let i = 0; i < CITY_REPORTS.length; i++) {
    if (isMetroCity(CITY_REPORTS[i].city)) {
      slots.push({ cityIndex: i, ring: 1 });
      slots.push({ cityIndex: i, ring: 2 });
    }
  }

  let ruralIndex = 0;
  while (slots.length < TARGET_DEMO_COUNT) {
    slots.push({ cityIndex: ruralIndex % CITY_REPORTS.length, ring: 3 });
    ruralIndex += 1;
  }

  return slots.slice(0, TARGET_DEMO_COUNT);
}

const SEED_SLOTS = buildSeedSlots();

function reportDate(index: number) {
  if (index < 24) return `${index + 1} hrs ago`;
  return `${Math.floor(index / 24) + 1} days ago`;
}

export const DEMO_PETS: LegacyPet[] = SEED_SLOTS.map((slot, index) => {
  const report = CITY_REPORTS[slot.cityIndex];
  const template = PET_TEMPLATES[index % PET_TEMPLATES.length];
  const status: PetStatus = (index + 1) % 3 === 0 ? "FOUND" : "LOST";
  const location = `${report.landmark}, ${report.city}`;
  const [lat, lng] = scatterFromAnchor(report.lat, report.lng, index + 1, slot.ring);

  return {
    ...template,
    id: `nationwide-${String(index + 1).padStart(3, "0")}`,
    name: `${template.name} #${String(index + 1).padStart(3, "0")}`,
    status,
    location,
    date: reportDate(index),
    description:
      `Nationwide seed report in ${report.islandGroup}: ${template.name} was ` +
      `${status === "FOUND" ? "found near" : "last seen near"} ${location}.`,
    lat,
    lng,
  };
});

const COUNTRY_BOUNDS = {
  north: 18.75,
  south: 4.75,
  west: 118.25,
  east: 126.75,
};

function pinForCoordinates(lat?: number, lng?: number) {
  if (lat == null || lng == null) return { topPct: 50, leftPct: 50 };

  const topPct = ((COUNTRY_BOUNDS.north - lat) / (COUNTRY_BOUNDS.north - COUNTRY_BOUNDS.south)) * 100;
  const leftPct = ((lng - COUNTRY_BOUNDS.west) / (COUNTRY_BOUNDS.east - COUNTRY_BOUNDS.west)) * 100;

  return {
    topPct: Math.min(92, Math.max(8, topPct)),
    leftPct: Math.min(92, Math.max(8, leftPct)),
  };
}

/** UI model for map/board screens (includes static-map pin). */
export type Pet = LegacyPet & {
  pin: { topPct: number; leftPct: number };
};

const MAP_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBcnGwFDAsfPLb8FpWyRAzCrsm9ChOSyl7v1QeEkMLPCbXxh3rBg9PFKrP0-kFj2i5hH22GXG-15aK8r5qdFTu8yqPilLXq-0XSLrrG2UINR98i1Kq-M3QrJ9RPC9shpNs0UYSOJShAxy8asPMkgU4zptPf-BvZXDCNtgrZi0-myPPyTAZM4ME1pv5w0M1FJvEZSw3eQPmbZvGdBXYF4CH2p7-fbQfuVXRzzWm_ms8BRgH67Zad3lGzD-myHaBJdeczPCFaPEMfH5FC";

export const STATIC_MAP_IMAGE_URL = MAP_IMG;

export const pets: Pet[] = DEMO_PETS.map((p) => ({
  ...p,
  pin: pinForCoordinates(p.lat, p.lng),
}));

export function getPetById(id: string): Pet | undefined {
  return pets.find((p) => p.id === id);
}
