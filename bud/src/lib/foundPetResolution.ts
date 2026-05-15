import type { Pet } from "../stores/petStore";
import type { StatusChange } from "../stores/statusHistoryStore";

/** Human-readable length between two ISO timestamps (for “how long until found”). */
export function formatDurationBetween(fromIso: string, toIso: string): string {
  const ms = new Date(toIso).getTime() - new Date(fromIso).getTime();
  if (ms <= 0 || !Number.isFinite(ms)) return "less than a day";
  const minutes = Math.round(ms / 60_000);
  if (minutes < 90) return `${Math.max(1, minutes)} minutes`;
  const hours = Math.round(minutes / 60);
  if (hours < 48) return `${hours} hour${hours === 1 ? "" : "s"}`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? "" : "s"}`;
}

/** Short narrative for FOUND listings (replaces help / contact CTAs). */
export function getFoundResolutionCopy(
  pet: Pet,
  changes: StatusChange[]
): { headline: string; body: string } {
  const chron = changes
    .filter((c) => c.petId === pet.id)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const firstEntry = chron.find((c) => c.from === null);
  const reportedIso = firstEntry?.createdAt ?? pet.created_at;
  const foundEntry = [...chron].reverse().find((c) => c.to === "FOUND");
  const foundIso = foundEntry?.createdAt ?? pet.updated_at;

  const durationLabel = formatDurationBetween(reportedIso, foundIso);
  const where =
    pet.location_text?.trim() ||
    pet.description?.trim()?.slice(0, 120) ||
    "the area neighbors were watching";

  const desc = pet.description?.trim();
  const whereLower = where.toLowerCase();
  const descAddsDetail =
    desc && desc.length > 0 && (desc.length > where.length + 20 || !desc.toLowerCase().startsWith(whereLower.slice(0, 12)));

  let body = `${pet.name} was reported found near ${where}. From the first alert to this update, about ${durationLabel} went by.`;
  if (descAddsDetail) {
    body += ` ${desc}`;
  }

  return {
    headline: "Found — safe outcome",
    body,
  };
}
