import { createContext, useContext, type ReactNode } from "react";
import {
  useGeolocation,
  type GeoPosition,
  type GeolocationStatus,
} from "../hooks/useGeolocation";

type LocationContextValue = {
  position: GeoPosition | null;
  status: GeolocationStatus;
  error: GeolocationPositionError | null;
};

const LocationContext = createContext<LocationContextValue | null>(null);

export function LocationProvider({ children }: { children: ReactNode }) {
  const geo = useGeolocation();
  return <LocationContext.Provider value={geo}>{children}</LocationContext.Provider>;
}

export function useUserLocation(): LocationContextValue {
  const ctx = useContext(LocationContext);
  if (!ctx) {
    throw new Error("useUserLocation must be used within LocationProvider");
  }
  return ctx;
}
