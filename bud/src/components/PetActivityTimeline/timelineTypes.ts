import type { LocalPetSighting } from "../../stores/sightingStore";
import type { StatusChange } from "../../stores/statusHistoryStore";
import type { ContactTimelineEvent } from "../../stores/contactTimelineStore";

export type TimelineEvent =
  | { kind: "sighting"; data: LocalPetSighting }
  | { kind: "status"; data: StatusChange }
  | { kind: "contact"; data: ContactTimelineEvent };

export function timelineEventId(e: TimelineEvent): string {
  return `${e.kind}-${e.data.id}`;
}

export function timelineEventTime(e: TimelineEvent): number {
  return new Date(e.data.createdAt).getTime();
}
