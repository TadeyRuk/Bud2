export const colors = {
  // Surfaces — matched from live UI
  background: "#F0EBE3", // warm beige canvas
  surfaceCard: "#FFFFFF", // lifted card on beige
  surfaceContainerLow: "#EDE8E0", // subtle section bg
  surfaceContainerHighest: "#E2DDD5", // input wells / recessed

  // Brand
  primary: "#8B3A15", // terracotta CTA button
  primaryContainer: "#A64B2A", // hover/pressed state
  onPrimary: "#FFFFFF",

  // Text
  onSurface: "#1C1A17", // headlines (near-black brown)
  onSurfaceVariant: "#6B6560", // subtext, metadata

  // Status badges
  lostBadge: "#F5C5C0", // soft red pill bg
  lostBadgeText: "#8B2020",
  foundBadge: "#007180", // teal pill bg
  foundBadgeText: "#FFFFFF",

  // Navigation bar
  navBackground: "#1C1A17",
  navActive: "#8B3A15",
  navInactive: "#7A7570",

  // Secondary
  tertiary: "#005763",
  tertiaryContainer: "#007180",
  outlineVariant: "#DCC1B8",

  // Utility
  secondary: "#48473E",
  secondaryContainer: "#E6E3D6",
  onSecondaryFixedVariant: "#48473E",
} as const;

export const fonts = {
  display: "'Manrope', sans-serif",
  body: "'Work Sans', sans-serif",
} as const;

export const radius = {
  sm: "0.25rem",
  md: "0.75rem",
  lg: "1rem",
  xl: "1.5rem",
  full: "9999px",
} as const;

export const spacing = [0, 4, 8, 12, 16, 24, 32, 48, 64] as const;

export const shadows = {
  card: "0 2px 12px rgba(28,26,23,0.07)",
  float: "0 8px 24px rgba(28,26,23,0.06)",
} as const;
