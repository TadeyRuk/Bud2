const STORAGE_KEY = "bud.onboarding";

export type OnboardingRole = "pet-parent" | "rescuer" | "barangay-staff";

export type OnboardingProfile = {
  name: string;
  barangay: string;
  city: string;
  role: OnboardingRole;
  notifications: boolean;
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function isRole(v: unknown): v is OnboardingRole {
  return v === "pet-parent" || v === "rescuer" || v === "barangay-staff";
}

export function getOnboardingProfile(): OnboardingProfile | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return null;
    const name = typeof parsed.name === "string" ? parsed.name : "";
    const barangay = typeof parsed.barangay === "string" ? parsed.barangay : "";
    const city = typeof parsed.city === "string" ? parsed.city : "";
    const role = isRole(parsed.role) ? parsed.role : "pet-parent";
    const notifications =
      typeof parsed.notifications === "boolean" ? parsed.notifications : true;
    return { name, barangay, city, role, notifications };
  } catch {
    return null;
  }
}

export function saveOnboardingProfile(profile: OnboardingProfile): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

export function roleLabel(role: OnboardingRole): string {
  switch (role) {
    case "pet-parent":
      return "Pet parent";
    case "rescuer":
      return "Rescuer / Volunteer";
    case "barangay-staff":
      return "Barangay staff";
    default:
      return "Community member";
  }
}
