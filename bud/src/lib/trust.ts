export type TrustLevel = "new" | "helper" | "trusted" | "steward";

export function computeTrust(input: {
  sightingsCount: number;
  reunionsAssistedCount: number;
}): TrustLevel {
  const { sightingsCount, reunionsAssistedCount } = input;
  if (sightingsCount >= 10 && reunionsAssistedCount >= 3) return "steward";
  if (sightingsCount >= 4 || reunionsAssistedCount >= 1) return "trusted";
  if (sightingsCount >= 1) return "helper";
  return "new";
}

export function trustLabel(level: TrustLevel): string {
  switch (level) {
    case "steward":
      return "Steward";
    case "trusted":
      return "Trusted";
    case "helper":
      return "Helper";
    default:
      return "New Neighbor";
  }
}
