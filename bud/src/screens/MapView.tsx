import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet.markercluster";
import { useUserLocation } from "../context/LocationContext";
import type { GeoPosition, GeolocationStatus } from "../hooks/useGeolocation";
import { FUZZ_RADIUS_M, getFuzzyMapCenter, hasPetCoordinates } from "../lib/locationPrivacy";
import type { Pet as StorePet } from "../stores/petStore";
import { usePetStore } from "../stores/petStore";

type MapViewProps = {
  onSelectPet: (pet: StorePet) => void;
};

const DEFAULT_CENTER: [number, number] = [12.8797, 121.774];
const DEFAULT_ZOOM = 5;
const USER_ZOOM = 12;
const CLUSTER_LOST_COLOR = "#8B3A15";
const CLUSTER_FOUND_COLOR = "#005763";

const HIT_ICON = L.divIcon({
  html: "",
  className: "bud-fuzz-hit",
  iconSize: [1, 1],
  iconAnchor: [0, 0],
});

function getPetFromMarker(marker: L.Marker): StorePet | undefined {
  return (marker.options as L.MarkerOptions & { pet?: StorePet }).pet;
}

function createClusterIcon(cluster: L.MarkerCluster) {
  const markers = cluster.getAllChildMarkers() as L.Marker[];
  let lostCount = 0;
  for (const marker of markers) {
    const pet = (marker.options as L.MarkerOptions & { pet?: StorePet }).pet;
    if (pet?.status === "LOST") lostCount += 1;
  }
  const foundCount = markers.length - lostCount;
  const color = lostCount >= foundCount ? CLUSTER_LOST_COLOR : CLUSTER_FOUND_COLOR;
  const count = cluster.getChildCount();

  const box =
    "<" +
    "div" +
    ` style="background:${color};color:#fff;width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:Manrope,sans-serif;font-weight:700;font-size:14px;box-shadow:0 2px 8px rgba(0,0,0,0.2);border:2px solid #fff">${count}</` +
    "div>";
  return L.divIcon({
    html: box,
    className: "bud-cluster-icon",
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
}

function MapLocationController({
  target,
  status,
  fallbackCenter,
  fallbackZoom,
  userZoom,
}: {
  target: GeoPosition | null;
  status: GeolocationStatus;
  fallbackCenter: [number, number];
  fallbackZoom: number;
  userZoom: number;
}) {
  const map = useMap();
  const didApply = useRef(false);

  useEffect(() => {
    if (didApply.current) return;

    if (target) {
      map.setView([target.lat, target.lng], userZoom, { animate: true });
      didApply.current = true;
    } else if (status === "error") {
      map.setView(fallbackCenter, fallbackZoom, { animate: false });
      didApply.current = true;
    }
  }, [map, target, status, fallbackCenter, fallbackZoom, userZoom]);

  return null;
}

function ClusteredPetMarkers({
  pets,
  onSelectPet,
}: {
  pets: StorePet[];
  onSelectPet: (pet: StorePet) => void;
}) {
  const map = useMap();
  const fetchPets = usePetStore((s) => s.fetchPets);

  useEffect(() => {
    fetchPets(true);
  }, [fetchPets]);

  useEffect(() => {
    const group = L.markerClusterGroup({
      maxClusterRadius: 65,
      showCoverageOnHover: false,
      spiderfyOnMaxZoom: true,
      disableClusteringAtZoom: 14,
      iconCreateFunction: createClusterIcon,
    });
    const circlesLayer = L.layerGroup();

    group.on("clusterclick", (event) => {
      const cluster = event.layer;
      if (cluster.getChildCount() !== 1) return;
      const [marker] = cluster.getAllChildMarkers();
      const pet = marker ? getPetFromMarker(marker) : undefined;
      if (pet) {
        onSelectPet(pet);
      }
    });

    for (const pet of pets) {
      if (!hasPetCoordinates(pet)) continue;

      const center = getFuzzyMapCenter(pet);
      const color = pet.status === "LOST" ? CLUSTER_LOST_COLOR : CLUSTER_FOUND_COLOR;

      const circle = L.circle([center.lat, center.lng], {
        radius: FUZZ_RADIUS_M,
        color,
        fillColor: color,
        fillOpacity: 0.22,
        weight: 2,
      });
      circle.on("click", () => onSelectPet(pet));
      circlesLayer.addLayer(circle);

      const marker = L.marker([center.lat, center.lng], {
        icon: HIT_ICON,
        opacity: 0,
        interactive: false,
        keyboard: false,
      }) as L.Marker & { options: L.MarkerOptions & { pet: StorePet } };
      marker.options.pet = pet;
      group.addLayer(marker);
    }

    map.addLayer(circlesLayer);
    map.addLayer(group);

    return () => {
      map.removeLayer(group);
      map.removeLayer(circlesLayer);
      group.clearLayers();
      circlesLayer.clearLayers();
    };
  }, [map, pets, onSelectPet]);

  return null;
}

export function MapView({ onSelectPet }: MapViewProps) {
  const pets = usePetStore((s) => s.pets);
  const [mapSearch, setMapSearch] = useState("");
  const { position, status } = useUserLocation();

  const filteredPets = useMemo(() => {
    const q = mapSearch.trim().toLowerCase();
    const withCoords = pets.filter(hasPetCoordinates);
    if (!q) return withCoords;
    return withCoords.filter((p) => {
      const breed = (p.breed ?? "").toLowerCase();
      const desc = (p.description ?? "").toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        breed.includes(q) ||
        desc.includes(q)
      );
    });
  }, [pets, mapSearch]);

  return (
    <div className="relative flex-1 min-h-0 w-full">
      <header className="pointer-events-none absolute top-4 left-3 right-3 z-[1000] flex flex-col items-center gap-2">
        <p className="pointer-events-auto text-center font-headline text-sm font-bold text-bud-text drop-shadow-sm bg-bud-card/90 rounded-full py-1.5 px-4 shadow-ambient">
          Search Area Map
        </p>
        <p className="pointer-events-auto text-center font-body text-[11px] text-bud-text-muted bg-bud-card/85 rounded-full py-1 px-3">
          Areas are approximate for privacy
        </p>
        <div className="pointer-events-auto w-full max-w-sm px-1">
          <input
            type="search"
            value={mapSearch}
            onChange={(e) => setMapSearch(e.target.value)}
            placeholder="Filter by name, breed, notes…"
            aria-label="Filter pets on the map"
            className="w-full rounded-full border border-bud-text-muted/10 bg-bud-card/95 px-4 py-2.5 font-body text-sm text-bud-text shadow-ambient outline-none backdrop-blur-sm placeholder:text-bud-text-muted/65 focus:ring-2 focus:ring-bud-primary/35"
          />
        </div>
      </header>
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        style={{ width: "100%", height: "100%" }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <MapLocationController
          target={position}
          status={status}
          fallbackCenter={DEFAULT_CENTER}
          fallbackZoom={DEFAULT_ZOOM}
          userZoom={USER_ZOOM}
        />
        <ClusteredPetMarkers pets={filteredPets} onSelectPet={onSelectPet} />
      </MapContainer>
    </div>
  );
}
