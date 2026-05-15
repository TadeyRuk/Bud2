import { supabase, supabaseConfigured } from "./supabase";
import { DEMO_REPORTER_ID } from "../data/pets";

const GUEST_REPORTER_KEY = "bud.guest-reporter-id";

type PetLike = { id: string; reporter_id: string };

/** Stable anonymous id for offline mode so this device can manage its own reports. */
export function getGuestReporterId(): string {
  try {
    let id = window.localStorage.getItem(GUEST_REPORTER_KEY);
    if (!id) {
      id = `guest_${crypto.randomUUID()}`;
      window.localStorage.setItem(GUEST_REPORTER_KEY, id);
    }
    return id;
  } catch {
    return "guest_ephemeral";
  }
}

/** Who new pets should be attributed to right now (never demo id). */
export async function resolveReporterIdForNewPet(): Promise<string> {
  if (!supabaseConfigured) {
    return getGuestReporterId();
  }
  const user = (await supabase.auth.getUser()).data.user;
  return user?.id ?? "";
}

/**
 * Current actor id for ownership checks: logged-in user, or offline guest id.
 * Signed-out + Supabase: null (cannot prove ownership of cloud rows).
 */
export async function resolveActorReporterId(): Promise<string | null> {
  if (!supabaseConfigured) {
    return getGuestReporterId();
  }
  const user = (await supabase.auth.getUser()).data.user;
  return user?.id ?? null;
}

export function isDemoPet(pet: PetLike): boolean {
  return pet.reporter_id === DEMO_REPORTER_ID;
}

/** Legacy offline rows used empty reporter_id — attach to this device’s guest id when merging. */
export function migrateLegacyGuestReporterIds<T extends PetLike>(pets: T[]): T[] {
  if (supabaseConfigured) return pets;
  const gid = getGuestReporterId();
  return pets.map((p) =>
    p.reporter_id === "" && !isDemoPet(p) ? { ...p, reporter_id: gid } : p
  );
}

export function canManagePetAsActor(pet: PetLike, actorId: string | null): boolean {
  if (actorId == null || actorId === "") return false;
  if (isDemoPet(pet)) return false;
  if (pet.reporter_id === actorId) return true;
  /** Offline legacy rows kept `reporter_id` empty before guest ids — treat as this device’s session. */
  if (!supabaseConfigured && pet.reporter_id === "" && actorId === getGuestReporterId()) return true;
  return false;
}

/** Sync helper for React: logged-in user id, offline guest id, or null when signed out on cloud. */
export function getActorReporterIdForUi(user: { id: string } | null | undefined): string | null {
  if (user) return user.id;
  if (!supabaseConfigured) return getGuestReporterId();
  return null;
}

export function isPetOwnerInUi(pet: PetLike, user: { id: string } | null | undefined): boolean {
  return canManagePetAsActor(pet, getActorReporterIdForUi(user));
}
