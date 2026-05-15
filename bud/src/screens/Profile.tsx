import { useMemo, useState } from "react";
import { usePetStore, type Pet } from "../stores/petStore";
import { PetLocationLabel } from "../components/PetLocationLabel";
import { StatusBadge } from "../components/StatusBadge";
import { getOnboardingProfile, roleLabel } from "../lib/onboardingProfile";

const glassPanel =
  "rounded-[1.35rem] border border-white/45 bg-white/[0.38] shadow-[0_24px_56px_-20px_rgba(44,26,14,0.18)] backdrop-blur-2xl backdrop-saturate-150 ring-1 ring-white/32";

const glassRow =
  "rounded-2xl border border-white/40 bg-white/[0.34] shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] backdrop-blur-xl transition-transform active:scale-[0.99]";

type ProfileProps = {
  onSelectPet: (pet: Pet) => void;
  onEditSetup: () => void;
};

function initialsFromName(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);
  const s = parts.map((p) => p[0]).join("");
  return s.toUpperCase() || "?";
}

export function Profile({ onSelectPet, onEditSetup }: ProfileProps) {
  const onboardingLocal = getOnboardingProfile();
  const pets = usePetStore((s) => s.pets);
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const myPets = useMemo(() => pets.filter((p) => p.reporter_id === ""), [pets]);

  const guestDisplayName = onboardingLocal?.name?.trim() || "Neighbor";
  const guestArea = [onboardingLocal?.barangay, onboardingLocal?.city].filter(Boolean).join(", ");

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-5 px-4 pb-28 pt-6 transition-opacity duration-200">
      <div className={`${glassPanel} w-full p-6 text-center`}>
        <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full border-2 border-white/55 bg-gradient-to-br from-bud-primary/35 via-white/40 to-bud-accent/25 font-headline text-3xl font-extrabold text-bud-primary shadow-[0_12px_40px_-8px_rgba(44,26,14,0.2)] ring-2 ring-white/35 backdrop-blur-md">
          {initialsFromName(guestDisplayName)}
        </div>

        <h1 className="font-headline mt-5 text-2xl font-bold text-bud-text">{guestDisplayName}</h1>
        {guestArea ? (
          <p className="font-body mx-auto mt-2 max-w-sm text-sm text-bud-text-muted">{guestArea}</p>
        ) : (
          <p className="font-body mx-auto mt-2 max-w-sm text-sm text-bud-text-muted">
            Add where you&apos;re based so matches stay local.
          </p>
        )}

        {onboardingLocal ? (
          <p className="font-body mx-auto mt-3 max-w-sm text-sm leading-relaxed text-bud-text-muted">
            {roleLabel(onboardingLocal.role)} ·{" "}
            {onboardingLocal.notifications ? "Nearby alerts on" : "Alerts off"}
          </p>
        ) : (
          <p className="font-body mx-auto mt-3 max-w-sm text-sm leading-relaxed text-bud-text-muted">
            Finish setup once to personalize Bud.
          </p>
        )}

        <button
          type="button"
          onClick={onEditSetup}
          className="mt-6 inline-flex w-full justify-center rounded-[1.12rem] bg-bud-primary py-3.5 font-body text-sm font-bold uppercase tracking-widest text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_10px_28px_rgba(139,58,21,0.35)] transition-[filter] hover:brightness-[1.04] active:scale-[0.98]"
        >
          {onboardingLocal ? "Update my details" : "Complete setup"}
        </button>
      </div>

      {myPets.length > 0 && (
        <section className="w-full">
          <h2 className="font-headline mb-3 px-1 text-center text-lg font-bold text-bud-text">My reports</h2>
          <div className="space-y-2.5">
            {myPets.map((pet) => (
              <button
                key={pet.id}
                type="button"
                onClick={() => onSelectPet(pet)}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left ${glassRow}`}
              >
                <img
                  src={pet.image_url || ""}
                  alt=""
                  className="h-14 w-14 shrink-0 rounded-xl object-cover ring-1 ring-white/50"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                <div className="min-w-0 flex-1">
                  <p className="font-headline truncate text-sm font-bold text-bud-text">{pet.name}</p>
                  <PetLocationLabel pet={pet} />
                </div>
                <StatusBadge status={pet.status === "REUNITED" ? "FOUND" : pet.status} />
              </button>
            ))}
          </div>
        </section>
      )}

      <div className="w-full space-y-2.5">
        <button
          type="button"
          onClick={() => setShowGuidelines(!showGuidelines)}
          className={`flex w-full items-center justify-between px-4 py-3.5 text-left ${glassRow}`}
        >
          <span className="font-body text-sm font-medium text-bud-text">Safety & community guidelines</span>
          <svg className="h-5 w-5 shrink-0 text-bud-text-muted" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
        {showGuidelines && (
          <div className="rounded-2xl border border-white/35 bg-white/28 p-4 font-body text-sm leading-relaxed text-bud-text-muted backdrop-blur-md">
            <p>1. Always meet in a public, well-lit area when reuniting pets.</p>
            <p className="mt-2">2. Never share personal home addresses publicly.</p>
            <p className="mt-2">3. Report suspicious activity to your barangay immediately.</p>
            <p className="mt-2">4. Be kind and patient — lost pet owners are under stress.</p>
          </div>
        )}

        <button
          type="button"
          onClick={() => setShowHelp(!showHelp)}
          className={`flex w-full items-center justify-between px-4 py-3.5 text-left ${glassRow}`}
        >
          <span className="font-body text-sm font-medium text-bud-text">Help & support</span>
          <svg className="h-5 w-5 shrink-0 text-bud-text-muted" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
        {showHelp && (
          <div className="rounded-2xl border border-white/35 bg-white/28 p-4 font-body text-sm text-bud-text-muted backdrop-blur-md">
            <p>Have a question or need help? Reach out to us:</p>
            <p className="mt-2 font-semibold text-bud-accent">support@getbud.app</p>
          </div>
        )}
      </div>
    </div>
  );
}
