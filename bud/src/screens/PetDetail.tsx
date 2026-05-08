import { useAuthStore } from "../stores/authStore";
import { usePetStore, type Pet } from "../stores/petStore";
import { supabase, supabaseConfigured } from "../lib/supabase";
import { showError, showSuccess } from "../lib/api";

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
  const user = useAuthStore((s) => s.user);
  const updatePetStatus = usePetStore((s) => s.updatePetStatus);
  const isOwner = user && pet.reporter_id === user.id;

  async function handleContact(type: "owner" | "barangay") {
    if (!user) {
      onRequestAuth();
      return;
    }

    if (supabaseConfigured) {
      const { error } = await supabase.from("contacts").insert({
        pet_id: pet.id,
        requester_id: user.id,
        contact_type: type,
        message: "",
      });

      if (error) {
        showError(error);
        return;
      }

      if (pet.reporter_id && pet.reporter_id !== user.id) {
        await supabase.from("notifications").insert({
          user_id: pet.reporter_id,
          type: "contact_request" as const,
          title: `Someone wants to help with ${pet.name}`,
          body: `A neighbor reached out via ${type === "owner" ? "direct contact" : "barangay desk"}.`,
          pet_id: pet.id,
          read: false,
        });
      }
    }

    if (type === "barangay") {
      showSuccess("Connecting to barangay desk…");
    } else {
      showSuccess("Contact request sent to the owner!");
    }
  }

  async function handleMarkReunited() {
    const { error } = await updatePetStatus(pet.id, "REUNITED");
    if (error) {
      showError(error);
    } else {
      showSuccess(`${pet.name} has been marked as reunited!`);
    }
  }

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-bud-bg transition-opacity duration-200">
      <header className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-3 pt-4">
        <button
          type="button"
          onClick={onBack}
          aria-label="Go back"
          className="w-11 h-11 flex items-center justify-center rounded-full bg-bud-card text-bud-text shadow-ambient active:scale-95 transition-transform"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => sharePet(pet)}
          aria-label="Share"
          className="w-11 h-11 flex items-center justify-center rounded-full bg-bud-card text-bud-text shadow-ambient active:scale-95 transition-transform"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.935-2.186 2.25 2.25 0 00-3.935 2.186z" />
          </svg>
        </button>
      </header>

      <div className="relative w-full h-[38%] shrink-0 bg-bud-surface-well">
        <img
          src={pet.image_url || ""}
          alt=""
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' fill='%23e8e5dc'%3E%3Crect width='400' height='300'/%3E%3C/svg%3E";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-transparent pointer-events-none" />
      </div>

      <main className="flex-1 min-h-0 overflow-y-auto -mt-6 relative z-10 bg-bud-card rounded-t-3xl px-5 pt-7 pb-8 shadow-[0_-8px_24px_rgba(44,26,14,0.08)]">
        <div className="flex items-center gap-3">
          <h1 className="font-headline text-4xl font-extrabold text-bud-text tracking-tight leading-none flex-1">
            {pet.name}
          </h1>
          {pet.status === "REUNITED" && (
            <span className="shrink-0 bg-green-100 text-green-700 font-body text-xs font-bold uppercase px-3 py-1.5 rounded-full">
              Reunited
            </span>
          )}
        </div>

        <div className="flex items-start gap-2 mt-3 text-bud-text-muted">
          <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
          <p className="font-body text-sm">{pet.location_text}</p>
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-3 font-body text-sm">
          <div className="bg-bud-bg rounded-xl p-3">
            <dt className="text-bud-text-muted text-xs uppercase tracking-wide font-semibold">Breed</dt>
            <dd className="text-bud-text font-medium mt-1">{pet.breed ?? "—"}</dd>
          </div>
          <div className="bg-bud-bg rounded-xl p-3">
            <dt className="text-bud-text-muted text-xs uppercase tracking-wide font-semibold">Color / collar</dt>
            <dd className="text-bud-text font-medium mt-1">{pet.color}</dd>
          </div>
          <div className="bg-bud-bg rounded-xl p-3">
            <dt className="text-bud-text-muted text-xs uppercase tracking-wide font-semibold">Gender</dt>
            <dd className="text-bud-text font-medium mt-1">{pet.gender}</dd>
          </div>
          <div className="bg-bud-bg rounded-xl p-3">
            <dt className="text-bud-text-muted text-xs uppercase tracking-wide font-semibold">Fur</dt>
            <dd className="text-bud-text font-medium mt-1">{pet.fur_color}</dd>
          </div>
        </dl>

        <section className="mt-8">
          <h2 className="font-headline text-lg font-bold text-bud-text">About {pet.name}</h2>
          <p className="font-body text-bud-text-muted text-sm leading-relaxed mt-2">
            {pet.description}
          </p>
        </section>

        <div className="mt-8 space-y-3">
          {pet.status !== "REUNITED" && (
            <>
              <button
                type="button"
                onClick={() => handleContact("owner")}
                className="w-full bg-bud-primary text-white font-body text-sm font-bold uppercase tracking-widest py-4 rounded-xl shadow-ambient active:scale-[0.99] transition-transform"
              >
                Contact Owner
              </button>
              <button
                type="button"
                onClick={() => handleContact("barangay")}
                className="w-full border-2 border-bud-accent text-bud-accent bg-transparent font-body text-sm font-bold uppercase tracking-widest py-4 rounded-xl active:scale-[0.99] transition-transform"
              >
                Contact Barangay
              </button>
            </>
          )}

          {isOwner && pet.status !== "REUNITED" && (
            <button
              type="button"
              onClick={handleMarkReunited}
              className="w-full bg-green-600 text-white font-body text-sm font-bold uppercase tracking-widest py-4 rounded-xl shadow-ambient active:scale-[0.99] transition-transform"
            >
              Mark as Reunited
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
