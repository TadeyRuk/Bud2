import { useCallback, useMemo } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import type { Pet } from "../data/pets";
import { pets, STATIC_MAP_IMAGE_URL } from "../data/pets";
import { StatusBadge } from "../components/StatusBadge";

type MapViewProps = {
  onSelectPet: (pet: Pet) => void;
};

const mapContainerStyle = { width: "100%", height: "100%" };

const defaultCenter = { lat: 14.5995, lng: 120.9845 };

function StaticMap({ onSelectPet }: MapViewProps) {
  return (
    <div className="relative flex-1 min-h-0 w-full bg-bud-surface-low overflow-hidden">
      <div className="absolute inset-0 bg-[#e8e5dc]">
        <img
          src={STATIC_MAP_IMAGE_URL}
          alt=""
          className="w-full h-full object-cover opacity-70 mix-blend-multiply"
        />
      </div>

      <div className="absolute top-4 left-3 right-3 z-10">
        <p className="text-center font-headline text-sm font-bold text-bud-text drop-shadow-sm">
          Search Area Map
        </p>
        <div className="mt-2 bg-bud-card rounded-xl flex items-center px-3 py-2 shadow-ambient">
          <svg
            className="w-5 h-5 text-bud-text-muted"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.8}
            stroke="currentColor"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          <span className="ml-2 font-body text-sm text-bud-text-muted">
            Pan and tap pins for details
          </span>
        </div>
      </div>

      {pets.map((pet) => (
        <button
          key={pet.id}
          type="button"
          onClick={() => onSelectPet(pet)}
          className="absolute z-20 flex flex-col items-center -translate-x-1/2 -translate-y-full cursor-pointer group"
          style={{
            top: `${pet.pin.topPct}%`,
            left: `${pet.pin.leftPct}%`,
          }}
          aria-label={`${pet.name} marker`}
        >
          <div
            className={`rounded-full w-11 h-11 flex items-center justify-center shadow-ambient relative ${
              pet.status === "LOST"
                ? "bg-bud-primary text-white"
                : "bg-bud-accent-container text-white"
            }`}
          >
            <svg
              className="w-6 h-6"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden
            >
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
            <div
              className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 rounded-sm ${
                pet.status === "LOST" ? "bg-bud-primary" : "bg-bud-accent-container"
              }`}
              aria-hidden
            />
          </div>
          <div className="mt-2 bg-bud-card rounded-xl p-2 shadow-ambient flex items-center gap-2 max-w-[200px]">
            <img
              src={pet.image}
              alt=""
              className="w-10 h-10 rounded-lg object-cover shrink-0"
            />
            <div className="min-w-0 text-left">
              <p className="font-headline font-bold text-xs text-bud-text truncate">
                {pet.name}
              </p>
              <StatusBadge status={pet.status} />
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

function GoogleMapInner({ onSelectPet }: MapViewProps) {
  const center = useMemo(() => defaultCenter, []);

  const onLoad = useCallback(() => {
    /* map instance available if needed */
  }, []);

  return (
    <div className="relative flex-1 min-h-0 w-full">
      <div className="absolute top-4 left-3 right-3 z-10 pointer-events-none">
        <p className="text-center font-headline text-sm font-bold text-bud-text drop-shadow-sm bg-bud-card/90 rounded-full py-1.5 mx-auto max-w-[220px] shadow-ambient pointer-events-auto">
          Search Area Map
        </p>
      </div>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={14}
        onLoad={onLoad}
        options={{
          disableDefaultUI: true,
          zoomControl: true,
          styles: [
            { featureType: "poi", stylers: [{ visibility: "off" }] },
            {
              featureType: "water",
              elementType: "geometry",
              stylers: [{ color: "#c8d5d8" }],
            },
          ],
        }}
      >
        {pets.map((pet) =>
          pet.lat != null && pet.lng != null ? (
            <Marker
              key={pet.id}
              position={{ lat: pet.lat, lng: pet.lng }}
              onClick={() => onSelectPet(pet)}
              title={pet.name}
            />
          ) : null
        )}
      </GoogleMap>
    </div>
  );
}

function MapWithLoader({
  apiKey,
  onSelectPet,
}: MapViewProps & { apiKey: string }) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    id: "bud-google-maps",
  });

  if (loadError || !isLoaded) {
    return <StaticMap onSelectPet={onSelectPet} />;
  }

  return <GoogleMapInner onSelectPet={onSelectPet} />;
}

export function MapView({ onSelectPet }: MapViewProps) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (apiKey) {
    return <MapWithLoader apiKey={apiKey} onSelectPet={onSelectPet} />;
  }

  return <StaticMap onSelectPet={onSelectPet} />;
}
