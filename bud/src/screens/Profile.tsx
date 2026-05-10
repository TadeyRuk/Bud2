import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../stores/authStore";
import { usePetStore, type Pet } from "../stores/petStore";
import { resizeImage, uploadAvatar } from "../lib/storage";
import { showError, showSuccess } from "../lib/api";
import { StatusBadge } from "../components/StatusBadge";

type ProfileProps = {
  onRequestAuth: () => void;
  onSelectPet: (pet: Pet) => void;
};

export function Profile({ onRequestAuth, onSelectPet }: ProfileProps) {
  const { user, profile, signOut, fetchProfile, updateProfile } = useAuthStore();
  const pets = usePetStore((s) => s.pets);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
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
    }
  }, [profile]);

  const myPets = pets.filter((p) => user && p.reporter_id === user.id);

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
    });
    if (result.error) {
      showError(result.error);
    } else {
      showSuccess("Profile updated!");
      setEditing(false);
    }
  }

  if (!user) {
    return (
      <div className="px-5 pt-8 pb-28 space-y-8 transition-opacity duration-200">
        <div className="flex flex-col items-center text-center pt-12">
          <div className="w-24 h-24 rounded-full bg-bud-surface-well flex items-center justify-center ring-4 ring-bud-card shadow-ambient">
            <svg className="w-10 h-10 text-bud-text-muted" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
          <h1 className="font-headline text-2xl font-bold text-bud-text mt-4">Welcome to Bud</h1>
          <p className="font-body text-sm text-bud-text-muted mt-2 max-w-xs">
            Sign in to report lost pets, track your reports, and help your community.
          </p>
          <button
            type="button"
            onClick={onRequestAuth}
            className="mt-6 bg-bud-primary text-white font-body text-sm font-bold uppercase tracking-widest py-4 px-10 rounded-xl shadow-ambient active:scale-[0.99] transition-transform"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 pt-8 pb-28 space-y-6 transition-opacity duration-200">
      <div className="flex flex-col items-center text-center">
        <button
          type="button"
          onClick={() => avatarRef.current?.click()}
          className="relative w-24 h-24 rounded-full bg-bud-surface-well overflow-hidden ring-4 ring-bud-card shadow-ambient group"
        >
          <img
            src={profile?.avatar_url || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop"}
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
            </svg>
          </div>
        </button>
        <input
          ref={avatarRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={handleAvatarChange}
        />

        {editing ? (
          <div className="mt-4 w-full space-y-3">
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full text-center rounded-lg bg-bud-surface-well px-3 py-2 font-headline text-xl font-bold text-bud-text outline-none focus:ring-2 focus:ring-bud-primary/30"
            />
            <textarea
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
              rows={2}
              className="w-full text-center rounded-lg bg-bud-surface-well px-3 py-2 font-body text-sm text-bud-text-muted outline-none focus:ring-2 focus:ring-bud-primary/30 resize-none"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="flex-1 border-2 border-bud-text-muted/30 text-bud-text-muted font-body text-sm font-bold py-2.5 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveProfile}
                className="flex-1 bg-bud-primary text-white font-body text-sm font-bold py-2.5 rounded-xl"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <>
            <h1 className="font-headline text-2xl font-bold text-bud-text mt-4">
              {profile?.display_name || user.email}
            </h1>
            <p className="font-body text-sm text-bud-text-muted mt-1 max-w-xs">
              {profile?.bio || "Neighbor & volunteer. Here to help reunite pets with their families."}
            </p>
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="mt-2 font-body text-xs font-semibold text-bud-primary"
            >
              Edit Profile
            </button>
          </>
        )}
      </div>

      {myPets.length > 0 && (
        <section>
          <h2 className="font-headline text-lg font-bold text-bud-text mb-3">My Reports</h2>
          <div className="space-y-2">
            {myPets.map((pet) => (
              <button
                key={pet.id}
                type="button"
                onClick={() => onSelectPet(pet)}
                className="w-full flex items-center gap-3 px-4 py-3 bg-bud-card rounded-2xl shadow-ambient text-left active:scale-[0.99] transition-transform"
              >
                <img
                  src={pet.image_url || ""}
                  alt=""
                  className="w-12 h-12 rounded-xl object-cover shrink-0"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-headline text-sm font-bold text-bud-text truncate">{pet.name}</p>
                  <p className="font-body text-xs text-bud-text-muted">{pet.location_text}</p>
                </div>
                <StatusBadge status={pet.status === "REUNITED" ? "FOUND" : pet.status} />
              </button>
            ))}
          </div>
        </section>
      )}

      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setShowGuidelines(!showGuidelines)}
          className="w-full flex items-center justify-between px-4 py-4 text-left bg-bud-card rounded-2xl shadow-ambient active:scale-[0.99] transition-transform"
        >
          <span className="font-body text-sm font-medium text-bud-text">Safety & community guidelines</span>
          <svg className="w-5 h-5 text-bud-text-muted" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
        {showGuidelines && (
          <div className="bg-bud-surface-low rounded-2xl p-4 font-body text-sm text-bud-text-muted space-y-2">
            <p>1. Always meet in a public, well-lit area when reuniting pets.</p>
            <p>2. Never share personal home addresses publicly.</p>
            <p>3. Report suspicious activity to your barangay immediately.</p>
            <p>4. Be kind and patient — lost pet owners are under stress.</p>
          </div>
        )}

        <button
          type="button"
          onClick={() => setShowHelp(!showHelp)}
          className="w-full flex items-center justify-between px-4 py-4 text-left bg-bud-card rounded-2xl shadow-ambient active:scale-[0.99] transition-transform"
        >
          <span className="font-body text-sm font-medium text-bud-text">Help & support</span>
          <svg className="w-5 h-5 text-bud-text-muted" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
        {showHelp && (
          <div className="bg-bud-surface-low rounded-2xl p-4 font-body text-sm text-bud-text-muted space-y-2">
            <p>Have a question or need help? Reach out to us:</p>
            <p className="font-semibold text-bud-text">support@getbud.app</p>
          </div>
        )}

        <button
          type="button"
          onClick={signOut}
          className="w-full flex items-center justify-center px-4 py-4 text-left bg-red-50 rounded-2xl active:scale-[0.99] transition-transform"
        >
          <span className="font-body text-sm font-bold text-red-600">Sign Out</span>
        </button>
      </div>
    </div>
  );
}
