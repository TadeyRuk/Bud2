import { useEffect } from "react";
import { divIcon } from "leaflet";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import type { Pet as StorePet } from "../stores/petStore";
import { usePetStore } from "../stores/petStore";

type MapViewProps = {
  onSelectPet: (pet: StorePet) => void;
};

const DEFAULT_CENTER: [number, number] = [12.8797, 121.7740];
const DEFAULT_ZOOM = 5;

function PinMarkerHtml({ pet }: { pet: StorePet }) {
  const bubbleColor = pet.status === "LOST" ? "#C1440E" : "#005763";
  const imageUrl =
    pet.image_url ||
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' fill='%23e8e5dc'%3E%3Crect width='80' height='80'/%3E%3C/svg%3E";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
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
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
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
          aria-hidden
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
    iconAnchor: [22, 44],
    popupAnchor: [0, -50],
  });
}

function PetMarkers({ onSelectPet }: MapViewProps) {
  const pets = usePetStore((s) => s.pets);
  const fetchPets = usePetStore((s) => s.fetchPets);

  useEffect(() => {
    if (pets.length === 0) {
      fetchPets(true);
    }
  }, [fetchPets, pets.length]);

  return (
    <>
      {pets
        .filter((p) => p.lat != null && p.lng != null)
        .map((pet) => (
          <Marker
            key={pet.id}
            position={[pet.lat!, pet.lng!]}
            icon={makePinIcon(pet)}
            eventHandlers={{ click: () => onSelectPet(pet) }}
            title={pet.name}
          />
        ))}
    </>
  );
}

export function MapView({ onSelectPet }: MapViewProps) {
  return (
    <div className="relative flex-1 min-h-0 w-full">
      <div className="absolute top-4 left-3 right-3 z-[1000] pointer-events-none">
        <p className="text-center font-headline text-sm font-bold text-bud-text drop-shadow-sm bg-bud-card/90 rounded-full py-1.5 mx-auto max-w-[220px] shadow-ambient pointer-events-auto">
          Search Area Map
        </p>
      </div>

      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        style={{ width: "100%", height: "100%" }}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <PetMarkers onSelectPet={onSelectPet} />
      </MapContainer>
    </div>
  );
}
