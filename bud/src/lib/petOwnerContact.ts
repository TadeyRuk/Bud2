import type { Pet } from "../stores/petStore";
import { DEMO_REPORTER_ID } from "../data/pets";

/** Demo-stable “guardian” line — not real numbers; formatted for PH-style display. */
function syntheticPhone(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const nine = 900000000 + (h % 99999999);
  const digits = String(nine).padStart(9, "0").slice(0, 9);
  return `+63 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)}`;
}

/**
 * Phone to show for “Contact owner” (seed data, demo pets, or `owner_phone` on user reports).
 */
export function getOwnerPhoneDisplay(pet: Pet): string {
  const raw = pet.owner_phone?.trim();
  if (raw) return raw.includes("+") ? raw : `+63 ${raw.replace(/^0/, "").replace(/\s+/g, " ").trim()}`;
  if (pet.reporter_id === DEMO_REPORTER_ID || pet.id.startsWith("nationwide-")) {
    return syntheticPhone(pet.id);
  }
  return syntheticPhone(`${pet.reporter_id}:${pet.id}`);
}
