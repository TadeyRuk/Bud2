import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { usePetStore, type Pet } from "../stores/petStore";
import { resizeImage, uploadAvatar } from "../lib/storage";
import { showError, showSuccess } from "../lib/api";
import { StatusBadge } from "../components/StatusBadge";
import { getOnboardingProfile, roleLabel } from "../lib/onboardingProfile";

const glassPanel =
  "rounded-[1.35rem] border border-white/45 bg-white/[0.38] shadow-[0_24px_56px_-20px_rgba(44,26,14,0.18)] backdrop-blur-2xl backdrop-saturate-150 ring-1 ring-white/32";

const glassRow =
  "rounded-2xl border border-white/40 bg-white/[0.34] shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] backdrop-blur-xl transition-transform active:scale-[0.99]";

const inputWell =
  "w-full rounded-xl border border-white/35 bg-[#E2DDD5]/92 px-3 py-2.5 font-body text-sm text-bud-text outline-none backdrop-blur-sm ring-bud-primary/20 placeholder:text-bud-text-muted focus:ring-2";

type ProfileProps = {
  onRequestAuth?: () => void;
  onSelectPet: (pet: Pet) => void;
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

export function Profile({ onSelectPet }: ProfileProps) {
  const onboardingLocal = getOnboardingProfile();
  const { user, profile, signOut, fetchProfile, updateProfile } = useAuthStore();
  const pets = usePetStore((s) => s.pets);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editBarangay, setEditBarangay] = useState("");
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const avatarRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) fetchProfile();
  }, [user, fetchProfile]);

  useEffect(() => {
    if (profile) {
      setEditName(profile.display_name);
      setEditBio(profile.bio);
      setEditPhone(profile.phone ?? "");
      setEditBarangay(profile.barangay ?? "");
    }
  }, [profile]);

  const myPets = useMemo(() => {
    if (user) return pets.filter((p) => p.reporter_id === user.id);
    return pets.filter((p) => p.reporter_id === "");
  }, [pets, user]);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      const resized = await resizeImage(file);
      const url = await uploadAvatar(resized, user.id);
      if (url) {
        await updateProfile({ avatar_url: url });
        showSuccess("Avatar updated!");
      }
    } catch {
      showError("Failed to upload avatar. Please try again.");
    }
  }

  async function handleSaveProfile() {
    const result = await updateProfile({
      display_name: editName.trim(),
      bio: editBio.trim(),
      phone: editPhone.trim(),
      barangay: editBarangay.trim(),
    });
    if (result.error) {
      showError(result.error);
    } else {
      showSuccess("Profile updated!");
      setEditing(false);
    }
  }

  const guestDisplayName = onboardingLocal?.name?.trim() || "Neighbor";
  const guestArea = [onboardingLocal?.barangay, onboardingLocal?.city].filter(Boolean).join(", ");

  if (!user) {
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

          <Link
            to="/onboarding"
            className="mt-6 inline-flex w-full justify-center rounded-[1.12rem] bg-bud-primary py-3.5 font-body text-sm font-bold uppercase tracking-widest text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_10px_28px_rgba(139,58,21,0.35)] transition-[filter] hover:brightness-[1.04] active:scale-[0.98]"
          >
            {onboardingLocal ? "Update my details" : "Complete setup"}
          </Link>
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
                    <p className="font-body truncate text-xs text-bud-text-muted">{pet.location_text}</p>
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

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center space-y-5 px-4 pb-28 pt-6 transition-opacity duration-200">
      <div className={`${glassPanel} w-full p-6 text-center`}>
        <button
          type="button"
          onClick={() => avatarRef.current?.click()}
          className="group relative mx-auto h-28 w-28 overflow-hidden rounded-full border-2 border-white/55 bg-white/35 shadow-[0_12px_40px_-8px_rgba(44,26,14,0.2)] ring-2 ring-white/30 backdrop-blur-md"
        >
          <img
            src={
              profile?.avatar_url ||
              "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop"
            }
            alt=""
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/35 opacity-0 backdrop-blur-[2px] transition-opacity group-hover:opacity-100">
            <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
            </svg>
          </div>
        </button>
        <input ref={avatarRef} type="file" accept="image/*" className="sr-only" onChange={handleAvatarChange} />

        {editing ? (
          <div className="mt-5 w-full space-y-3 text-left">
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className={`${inputWell} text-center font-headline text-xl font-bold`}
              aria-label="Display name"
            />
            <textarea
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
              rows={2}
              className={`${inputWell} resize-none text-center text-bud-text-muted`}
              aria-label="Bio"
            />
            <input
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="Phone (optional)"
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
              className={inputWell}
            />
            <input
              placeholder="Barangay / neighborhood"
              value={editBarangay}
              onChange={(e) => setEditBarangay(e.target.value)}
              className={inputWell}
            />
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="flex-1 rounded-xl border border-white/50 bg-white/35 py-2.5 font-body text-sm font-bold text-bud-text backdrop-blur-md transition-colors hover:bg-white/45"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveProfile}
                className="flex-1 rounded-xl bg-bud-primary py-2.5 font-body text-sm font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <>
            <h1 className="font-headline mt-5 text-2xl font-bold text-bud-text">
              {profile?.display_name || user.email}
            </h1>
            {(profile?.phone || profile?.barangay) && (
              <div className="mx-auto mt-2 max-w-xs space-y-0.5 font-body text-xs text-bud-text-muted">
                {profile.phone ? <p>Phone: {profile.phone}</p> : null}
                {profile.barangay ? <p>Area: {profile.barangay}</p> : null}
              </div>
            )}
            <p className="font-body mx-auto mt-2 max-w-sm text-sm leading-relaxed text-bud-text-muted">
              {profile?.bio || "Neighbor & volunteer. Here to help reunite pets with their families."}
            </p>
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="mt-4 font-body text-sm font-semibold text-bud-accent underline-offset-2 hover:underline"
            >
              Edit profile
            </button>
          </>
        )}
      </div>

      {onboardingLocal && (
        <section className={`${glassPanel} w-full p-4 text-center`}>
          <h2 className="font-headline text-sm font-bold text-bud-text">Your Bud setup</h2>
          <span className="mt-2 inline-flex rounded-full border border-white/40 bg-white/45 px-3 py-1 font-body text-xs font-semibold text-bud-accent backdrop-blur-sm">
            {roleLabel(onboardingLocal.role)}
          </span>
          <p className="font-body mt-2 text-xs text-bud-text-muted">
            {[onboardingLocal.barangay, onboardingLocal.city].filter(Boolean).join(", ") || "Local area not set"}
          </p>
        </section>
      )}

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
                  <p className="font-body truncate text-xs text-bud-text-muted">{pet.location_text}</p>
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

        <button
          type="button"
          onClick={signOut}
          className="flex w-full items-center justify-center rounded-2xl border border-red-200/70 bg-red-50/55 px-4 py-3.5 backdrop-blur-md transition-transform active:scale-[0.99]"
        >
          <span className="font-body text-sm font-bold text-red-700">Sign out</span>
        </button>
      </div>
    </div>
  );
}
