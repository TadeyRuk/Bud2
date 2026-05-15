import { useUserLocation } from "../context/LocationContext";
import { getPublicLocationLabel } from "../lib/locationPrivacy";

type PetForLocation = {
  id: string;
  lat: number | null;
  lng: number | null;
};

type PetLocationLabelProps = {
  pet: PetForLocation;
  variant?: "inline" | "lastSeen";
  showMapHint?: boolean;
  className?: string;
};

export function PetLocationLabel({
  pet,
  variant = "inline",
  showMapHint = false,
  className = "",
}: PetLocationLabelProps) {
  const { position } = useUserLocation();
  const label = getPublicLocationLabel(pet, position, {
    suffix: variant !== "lastSeen",
  });

  if (variant === "lastSeen") {
    return (
      <div className={className}>
        <p className="font-body text-sm font-semibold leading-snug text-bud-text line-clamp-3">
          {label}
        </p>
        {showMapHint && (
          <p className="font-body mt-1 text-xs text-bud-text-muted">
            Exact addresses are hidden for privacy.
          </p>
        )}
      </div>
    );
  }

  return (
    <p className={`font-body truncate text-xs text-bud-text-muted ${className}`.trim()}>
      {label}
    </p>
  );
}
