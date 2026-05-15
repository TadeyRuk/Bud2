import { useEffect, useMemo, useRef } from "react";
import { useAuthStore } from "../stores/authStore";
import { useUiStore } from "../stores/uiStore";
import { usePetStore, type Pet } from "../stores/petStore";
import { supabase, supabaseConfigured } from "../lib/supabase";
import { showError, showSuccess } from "../lib/api";
import { GlassPetStatusChip } from "../components/GlassPetStatusChip";
import { DEMO_REPORTER_ID } from "../data/pets";
import { isPetOwnerInUi } from "../lib/petOwnership";
import { OwnerPetActions } from "../components/OwnerPetActions";
import { useContactTimelineStore } from "../stores/contactTimelineStore";
import { useStatusHistoryStore } from "../stores/statusHistoryStore";
import { PetActivityTimeline } from "../components/PetActivityTimeline/PetActivityTimeline";
import { getFoundResolutionCopy } from "../lib/foundPetResolution";

const PET_IMAGE_PLACEHOLDER =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500"><defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#F6F3EF"/><stop offset="55%" stop-color="#EDE8E0"/><stop offset="100%" stop-color="#E2DDD5"/></linearGradient><radialGradient id="v" cx="50%" cy="35%" r="70%"><stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.5"/><stop offset="100%" stop-color="#FFFFFF" stop-opacity="0"/></radialGradient></defs><rect width="800" height="500" fill="url(#bg)"/><rect width="800" height="500" fill="url(#v)"/><g opacity="0.22" fill="#8B3A15"><ellipse cx="322" cy="210" rx="26" ry="32"/><ellipse cx="478" cy="210" rx="26" ry="32"/><ellipse cx="268" cy="288" rx="22" ry="28"/><ellipse cx="532" cy="288" rx="22" ry="28"/><ellipse cx="400" cy="348" rx="68" ry="54"/></g><text x="400" y="428" text-anchor="middle" fill="#6B6560" font-family="system-ui,sans-serif" font-size="20" font-weight="600" letter-spacing="0.02em">Photo coming soon</text></svg>`
  );

type PetDetailProps = {
  pet: Pet;
  onBack: () => void;
  onRequestAuth: () => void;
};

async function sharePet(pet: Pet) {
  const shareData = {
    title: `${pet.status === "LOST" ? "Lost" : "Found"}: ${pet.name}`,
    text: `${pet.name} — ${pet.description?.slice(0, 100)}…`,
    url: window.location.href,
  };

  if (navigator.share) {
    try {
      await navigator.share(shareData);
      return;
    } catch {
      // User cancelled or API failed — fall through to clipboard
    }
  }

  try {
    await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
    showSuccess("Link copied to clipboard!");
  } catch {
    showError("Unable to share. Please copy the URL manually.");
  }
}

export function PetDetail({ pet, onBack, onRequestAuth }: PetDetailProps) {
  const bodyScrollRef = useRef<HTMLDivElement>(null);
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const openSightingSheet = useUiStore((s) => s.openSightingSheet);
  const recordContact = useContactTimelineStore((s) => s.recordContact);
  const petLatest = usePetStore((s) => s.pets.find((p) => p.id === pet.id)) ?? pet;
  const reuniteAt = useStatusHistoryStore((s) =>
    s.changes.find((c) => c.petId === petLatest.id && c.to === "REUNITED")?.createdAt
  );
  const statusHistoryChanges = useStatusHistoryStore((s) => s.changes);
  const isOwner = isPetOwnerInUi(petLatest, user);

  const foundResolution = useMemo(() => {
    if (petLatest.status !== "FOUND") return null;
    return getFoundResolutionCopy(petLatest, statusHistoryChanges);
  }, [petLatest, statusHistoryChanges]);

  useEffect(() => {
    const el = bodyScrollRef.current;
    if (!el) return;
    el.scrollTo({ top: 0, behavior: "auto" });
  }, [pet.id]);

  const metaLine = [
    [petLatest.breed, petLatest.color].filter(Boolean).join(" · ") || "Pet",
    `#${petLatest.id.slice(0, 8)}`,
  ].join(" · ");

  async function handleContact(type: "owner" | "barangay") {
    if (!user) {
      onRequestAuth();
      return;
    }

    if (supabaseConfigured) {
      const { error } = await supabase.from("contacts").insert({
        pet_id: petLatest.id,
        requester_id: user.id,
        contact_type: type,
        message: "",
      });

      if (error) {
        showError(error);
        return;
      }

      if (
        petLatest.reporter_id &&
        petLatest.reporter_id !== DEMO_REPORTER_ID &&
        petLatest.reporter_id !== user.id
      ) {
        await supabase.from("notifications").insert({
          user_id: petLatest.reporter_id,
          type: "contact_request" as const,
          title: `Someone wants to help with ${petLatest.name}`,
          body: `A neighbor reached out via ${type === "owner" ? "direct contact" : "barangay desk"}.`,
          pet_id: petLatest.id,
          read: false,
        });
      }
    }

    if (type === "barangay") {
      showSuccess("Connecting to barangay desk…");
    } else {
      showSuccess("Contact request sent to the owner!");
    }

    recordContact({
      petId: petLatest.id,
      contactType: type,
      byUserId: user.id,
      byUserName: profile?.display_name?.trim() || user.email || "Neighbor",
    });
  }

  const glassFrame =
    "overflow-hidden rounded-2xl border border-white/50 bg-white/[0.22] shadow-[0_24px_64px_-18px_rgba(44,26,14,0.28),inset_0_1px_0_rgba(255,255,255,0.65)] ring-1 ring-black/[0.04] backdrop-blur-xl backdrop-saturate-150";

  return (
    <div className="absolute inset-0 z-50 flex h-full max-h-full min-h-0 flex-col overflow-hidden bg-bud-bg/55 backdrop-blur-[3px] transition-opacity duration-200">
      {petLatest.status === "REUNITED" && reuniteAt ? (
        <div className="absolute left-0 right-0 top-0 z-[60] bg-blue-500/90 px-4 py-1.5 text-center font-body text-[11px] font-bold uppercase tracking-wide text-white">
          Reunited on{" "}
          {new Date(reuniteAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
        </div>
      ) : null}
      <header
        className={`absolute left-0 right-0 z-50 flex items-center justify-between p-3 pr-3 pt-4 ${petLatest.status === "REUNITED" && reuniteAt ? "top-7" : "top-0"}`}
      >
        <button
          type="button"
          onClick={onBack}
          aria-label="Go back"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/45 bg-white/40 text-bud-text shadow-sm backdrop-blur-md transition-transform active:scale-95"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => sharePet(petLatest)}
          aria-label="Share"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/45 bg-white/40 text-bud-text shadow-sm backdrop-blur-md transition-transform active:scale-95"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.935-2.186 2.25 2.25 0 00-3.935 2.186z" />
          </svg>
        </button>
      </header>

      <div
        ref={bodyScrollRef}
        className={`min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain px-4 pb-[max(2rem,env(safe-area-inset-bottom,0px)+12px)] [-webkit-overflow-scrolling:touch] touch-pan-y ${petLatest.status === "REUNITED" && reuniteAt ? "pt-24" : "pt-14"}`}
      >
        <article className={`mx-auto w-full max-w-lg ${glassFrame}`}>
          <div className="relative mx-auto aspect-[3/4] max-h-64 w-full overflow-hidden rounded-t-2xl bg-gradient-to-br from-bud-surface-well to-bud-surface-low">
            <img
              src={petLatest.image_url || PET_IMAGE_PLACEHOLDER}
              alt=""
              className="absolute inset-0 h-full w-full rounded-t-2xl object-cover object-[center_22%]"
              loading="eager"
              decoding="async"
              onError={(e) => {
                (e.target as HTMLImageElement).src = PET_IMAGE_PLACEHOLDER;
              }}
            />

            <div
              className="pointer-events-none absolute inset-0 opacity-90"
              style={{
                background:
                  "radial-gradient(ellipse 85% 55% at 50% 22%, rgba(139, 58, 21, 0.14), transparent 62%)",
              }}
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#FCF9F5]/92 via-[#FCF9F5]/55 from-[22%] via-[48%] to-transparent to-[76%]" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/14 via-transparent to-transparent from-[58%]" />
            <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/30" />

            <div className="absolute left-3 top-3 z-[2]">
              <GlassPetStatusChip pet={petLatest} />
            </div>

            <div className="absolute bottom-0 left-0 right-0 z-[2] space-y-2 px-4 pb-5 pt-16">
              <div className="flex items-start gap-2">
                <h1 className="font-headline flex-1 text-2xl font-bold leading-tight tracking-tight text-[#1c1c19]">
                  {petLatest.name}
                </h1>
                {petLatest.status === "REUNITED" && (
                  <span className="shrink-0 rounded-full bg-white/90 px-2.5 py-1 font-body text-[10px] font-bold uppercase tracking-wide text-green-700 shadow-sm backdrop-blur-sm">
                    Reunited
                  </span>
                )}
              </div>
              <div className="flex items-start gap-2 text-bud-text-muted">
                <svg
                  className="mt-0.5 h-4 w-4 shrink-0 text-bud-accent"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  aria-hidden
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                  />
                </svg>
                <p className="font-body text-[13px] leading-snug drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)] line-clamp-3">
                  {metaLine}
                </p>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden border-t border-white/45 bg-gradient-to-b from-white/[0.42] to-white/[0.28] px-4 py-4 backdrop-blur-2xl">
            <div
              className="pointer-events-none absolute inset-0 overflow-hidden rounded-b-2xl"
              aria-hidden
            >
              <div className="absolute -right-12 top-6 h-44 w-44 rounded-full bg-bud-primary/[0.18] blur-3xl" />
              <div className="absolute -left-10 bottom-24 h-40 w-40 rounded-full bg-bud-primary/[0.14] blur-3xl" />
              <div className="absolute left-1/3 top-1/2 h-32 w-32 -translate-x-1/2 rounded-full bg-[#E8A078]/25 blur-3xl" />
              <div className="absolute right-1/4 bottom-8 h-28 w-28 rounded-full bg-white/50 blur-2xl" />
            </div>

            <div className="relative z-[1] flex items-start justify-between gap-4 border-b border-black/5 px-1 py-3">
              <div className="flex min-w-0 flex-1 gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/55 bg-white/55 shadow-sm backdrop-blur-md">
                  <svg
                    className="h-5 w-5 text-bud-accent"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.8}
                    stroke="currentColor"
                    aria-hidden
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                    />
                  </svg>
                </div>
                <div className="min-w-0 pt-0.5">
                  <p className="font-body text-[10px] font-bold uppercase tracking-[0.16em] text-bud-text/75">
                    Last seen
                  </p>
                  <p className="font-body text-sm font-semibold leading-snug text-bud-text line-clamp-3">
                    {petLatest.location_text || "Location shared"}
                  </p>
                </div>
              </div>
              <div className="shrink-0 pt-1 text-right">
                <p className="font-headline text-lg font-bold tabular-nums leading-none text-bud-primary drop-shadow-sm">
                  {petLatest.date
                    ? petLatest.date.slice(0, 10)
                    : new Date(petLatest.created_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                </p>
                <p className="font-body mt-1 text-[10px] font-semibold uppercase tracking-wide text-bud-text-muted">
                  Reported
                </p>
              </div>
            </div>

            <div className="relative z-[1]">
            <dl className="mt-0 grid grid-cols-2 gap-0 font-body text-sm">
              <div className="border-b border-black/5 p-3 backdrop-blur-md">
                <dt className="text-xs font-semibold uppercase tracking-wide text-bud-text-muted">Breed</dt>
                <dd className="mt-1 font-medium text-bud-text">{petLatest.breed ?? "—"}</dd>
              </div>
              <div className="border-b border-black/5 p-3 backdrop-blur-md">
                <dt className="text-xs font-semibold uppercase tracking-wide text-bud-text-muted">Color / collar</dt>
                <dd className="mt-1 font-medium text-bud-text">{petLatest.color}</dd>
              </div>
              <div className="border-b border-black/5 p-3 backdrop-blur-md">
                <dt className="text-xs font-semibold uppercase tracking-wide text-bud-text-muted">Gender</dt>
                <dd className="mt-1 font-medium text-bud-text">{petLatest.gender}</dd>
              </div>
              <div className="border-b border-black/5 p-3 backdrop-blur-md">
                <dt className="text-xs font-semibold uppercase tracking-wide text-bud-text-muted">Fur</dt>
                <dd className="mt-1 font-medium text-bud-text">{petLatest.fur_color}</dd>
              </div>
            </dl>

            <section className="mt-5 border-b border-black/5 pb-5">
              <h2 className="font-headline text-lg font-bold text-bud-text">About {petLatest.name}</h2>
              <p className="font-body mt-2 text-sm leading-relaxed text-bud-text-muted">{petLatest.description}</p>
            </section>

            <PetActivityTimeline petId={petLatest.id} petName={petLatest.name} />

            <div className="mt-6 space-y-3">
              {petLatest.status === "FOUND" && !isOwner && foundResolution ? (
                <div className="rounded-[1.25rem] border border-bud-text/[0.08] bg-bud-surface-well/95 p-4 shadow-sm">
                  <h3 className="font-headline text-base font-bold text-bud-accent">{foundResolution.headline}</h3>
                  <p className="font-body mt-2 text-sm leading-relaxed text-bud-text-muted">{foundResolution.body}</p>
                </div>
              ) : null}

              {petLatest.status === "LOST" && !isOwner ? (
                <>
                  <button
                    type="button"
                    onClick={() => handleContact("owner")}
                    className="h-14 w-full rounded-full bg-bud-primary font-body text-base font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_10px_28px_rgba(139,58,21,0.38)] transition-transform active:scale-[0.98] motion-safe:hover:brightness-[1.05]"
                  >
                    Contact Owner
                  </button>
                  <button
                    type="button"
                    onClick={() => handleContact("barangay")}
                    className="h-12 w-full rounded-full border-2 border-bud-accent bg-transparent font-body text-sm font-semibold text-bud-accent shadow-sm transition-transform active:scale-[0.98]"
                  >
                    Contact Barangay
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      if (!user) {
                        onRequestAuth();
                        return;
                      }
                      openSightingSheet(
                        petLatest.id,
                        e.currentTarget.getBoundingClientRect(),
                        e.currentTarget
                      );
                    }}
                    className="h-12 w-full rounded-full border border-bud-text/[0.12] bg-bud-surface-well/90 font-body text-sm font-semibold text-bud-text shadow-sm transition-transform active:scale-[0.98] motion-safe:hover:bg-bud-surface-well"
                  >
                    Report a sighting
                  </button>
                </>
              ) : null}

              {isOwner ? <OwnerPetActions pet={petLatest} variant="detail" onAfterRemove={onBack} /> : null}
            </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
