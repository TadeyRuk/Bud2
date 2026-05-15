import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import { divIcon } from "leaflet";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import "leaflet.markercluster";
import { useUserLocation } from "../context/LocationContext";
import type { GeoPosition, GeolocationStatus } from "../hooks/useGeolocation";
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
const PIN_ICON_WIDTH = 200;
const PIN_ICON_HEIGHT = 120;

function PinMarkerHtml({ pet }: { pet: StorePet }) {
  const bubbleColor = pet.status === "LOST" ? CLUSTER_LOST_COLOR : CLUSTER_FOUND_COLOR;
  const imageUrl =
    pet.image_url ||
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' fill='%23e8e5dc'%3E%3Crect width='80' height='80'/%3E%3C/svg%3E";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", pointerEvents: "auto" }}>
      <div
        style={{
          background: bubbleColor,
          borderRadius: "50%",
          width: 44,
          height: 44,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
          position: "relative",
          color: "white",
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
        </svg>
        <div
          style={{
            position: "absolute",
            bottom: -4,
            left: "50%",
            transform: "translateX(-50%) rotate(45deg)",
            width: 12,
            height: 12,
            background: bubbleColor,
            borderRadius: 2,
          }}
          aria-hidden="true"
        />
      </div>
      <div
        style={{
          marginTop: 8,
          background: "#fff",
          borderRadius: 12,
          padding: "8px 10px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
          display: "flex",
          alignItems: "center",
          gap: 8,
          maxWidth: 200,
          minWidth: 120,
        }}
      >
        <img
          src={imageUrl}
          alt=""
          style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            objectFit: "cover",
            flexShrink: 0,
          }}
        />
        <div style={{ minWidth: 0, textAlign: "left" }}>
          <p
            style={{
              fontFamily: "Manrope, sans-serif",
              fontWeight: 700,
              fontSize: 12,
              color: "#2C1A0E",
              margin: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {pet.name}
          </p>
          <span
            style={{
              display: "inline-block",
              fontSize: 10,
              fontWeight: 700,
              borderRadius: 4,
              padding: "1px 6px",
              marginTop: 2,
              background: pet.status === "LOST" ? "#fee2e2" : "#ccfbf1",
              color: pet.status === "LOST" ? "#b91c1c" : "#0f766e",
            }}
          >
            {pet.status}
          </span>
        </div>
      </div>
    </div>
  );
}

function makePinIcon(pet: StorePet) {
  const html = renderToStaticMarkup(<PinMarkerHtml pet={pet} />);
  return divIcon({
    html,
    className: "",
    iconSize: [PIN_ICON_WIDTH, PIN_ICON_HEIGHT],
    iconAnchor: [PIN_ICON_WIDTH / 2, 44],
    popupAnchor: [0, -44],
  });
}

function getPetFromMarker(marker: L.Marker): StorePet | undefined {
  return (marker.options as L.MarkerOptions & { pet?: StorePet }).pet;
}

function hasMapCoordinates(pet: StorePet): pet is StorePet & { lat: number; lng: number } {
  return pet.lat != null && pet.lng != null;
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

  return L.divIcon({
    html: `<div style="background:${color};color:#fff;width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:Manrope,sans-serif;font-weight:700;font-size:14px;box-shadow:0 2px 8px rgba(0,0,0,0.2);border:2px solid #fff">${count}</div>`,
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

    group.on("clusterclick", (event) => {
      const cluster = event.layer;
      if (cluster.getChildCount() !== 1) return;
      const [marker] = cluster.getAllChildMarkers();
      const pet = marker ? getPetFromMarker(marker) : undefined;
      if (pet) onSelectPet(pet);
    });

    for (const pet of pets) {
      if (!hasMapCoordinates(pet)) continue;

      const marker = L.marker([pet.lat, pet.lng], {
        icon: makePinIcon(pet),
        title: pet.name,
      }) as L.Marker & { options: L.MarkerOptions & { pet: StorePet } };
      marker.options.pet = pet;
      marker.on("click", () => onSelectPet(pet));
      group.addLayer(marker);
    }

    map.addLayer(group);

    return () => {
      map.removeLayer(group);
      group.clearLayers();
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
    const withCoords = pets.filter(hasMapCoordinates);
    if (!q) return withCoords;
    return withCoords.filter((p) => {
      const breed = (p.breed ?? "").toLowerCase();
      const desc = (p.description ?? "").toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.location_text.toLowerCase().includes(q) ||
        breed.includes(q) ||
        desc.includes(q)
      );
    });
  }, [pets, mapSearch]);

  return (
    <div className="relative flex-1 min-h-0 w-full">
      <div className="pointer-events-none absolute top-4 left-3 right-3 z-[1000] flex flex-col items-center gap-2">
        <p className="pointer-events-auto text-center font-headline text-sm font-bold text-bud-text drop-shadow-sm bg-bud-card/90 rounded-full py-1.5 px-4 shadow-ambient">
          Search Area Map
        </p>
        <div className="pointer-events-auto w-full max-w-sm px-1">
          <input
            type="search"
            value={mapSearch}
            onChange={(e) => setMapSearch(e.target.value)}
            placeholder="Filter by name, area, breed…"
            aria-label="Filter pets on the map"
            className="w-full rounded-full border border-bud-text-muted/10 bg-bud-card/95 px-4 py-2.5 font-body text-sm text-bud-text shadow-ambient outline-none backdrop-blur-sm placeholder:text-bud-text-muted/65 focus:ring-2 focus:ring-bud-primary/35"
          />
        </div>
      </div>

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
