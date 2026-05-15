import { useEffect, useState } from "react";

export type GeoPosition = { lat: number; lng: number };

export type GeolocationStatus = "idle" | "loading" | "ready" | "error";

type GeolocationState = {
  position: GeoPosition | null;
  status: GeolocationStatus;
  error: GeolocationPositionError | null;
};

// Requires a secure context (https:// or localhost).
function isGeolocationSupported(): boolean {
  return typeof navigator !== "undefined" && "geolocation" in navigator;
}

export function useGeolocation(): GeolocationState {
  const [state, setState] = useState<GeolocationState>({
    position: null,
    status: "idle",
    error: null,
  });

  useEffect(() => {
    if (!isGeolocationSupported()) {
      setState({ position: null, status: "error", error: null });
      return;
    }

    setState((prev) => ({ ...prev, status: "loading" }));

    navigator.geolocation.getCurrentPosition(
      (coords) => {
        setState({
          position: { lat: coords.coords.latitude, lng: coords.coords.longitude },
          status: "ready",
          error: null,
        });
      },
      (error) => {
        setState({ position: null, status: "error", error });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  return state;
}
