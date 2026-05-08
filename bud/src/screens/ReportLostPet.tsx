import { useRef, useState } from "react";
import { usePetStore } from "../stores/petStore";
import { useAuthStore } from "../stores/authStore";
import { showError, showSuccess } from "../lib/api";
import type { PetType } from "../types/database";

type ReportLostPetProps = {
  onRequestAuth: () => void;
};

export function ReportLostPet({ onRequestAuth }: ReportLostPetProps) {
  const [petType, setPetType] = useState<PetType>("dog");
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [traits, setTraits] = useState("");
  const [color, setColor] = useState("");
  const [gender, setGender] = useState("Unknown");
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const selectedFile = useRef<File | null>(null);

  const user = useAuthStore((s) => s.user);
  const addPet = usePetStore((s) => s.addPet);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      setPreview(null);
      selectedFile.current = null;
      return;
    }
    selectedFile.current = file;
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(file));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!user) {
      onRequestAuth();
      return;
    }

    if (!name.trim()) {
      showError("Please enter the pet's name");
      return;
    }
    if (!location.trim()) {
      showError("Please enter the last seen location");
      return;
    }

    setSubmitting(true);

    const result = await addPet(
      {
        name: name.trim(),
        breed: null,
        color: color.trim() || "Unknown",
        fur_color: color.trim() || "Unknown",
        gender,
        status: "LOST",
        type: petType,
        location_text: location.trim(),
        lat: null,
        lng: null,
        image_url: null,
        description: traits.trim(),
      },
      selectedFile.current ?? undefined
    );

    setSubmitting(false);

    if (result.error) {
      showError(result.error);
    } else {
      showSuccess("Report submitted! The community has been notified.");
      setName("");
      setLocation("");
      setTraits("");
      setColor("");
      setGender("Unknown");
      setPetType("dog");
      if (preview) URL.revokeObjectURL(preview);
      setPreview(null);
      selectedFile.current = null;
    }
  }

  return (
    <div className="px-5 pt-6 pb-28 space-y-8 transition-opacity duration-200 overflow-y-auto min-h-0">
      <header className="pl-3 border-l-[6px] border-bud-primary">
        <h1 className="font-headline text-4xl font-black tracking-tight text-bud-text leading-tight">
          Bring Them
          <br />
          <span className="text-bud-primary">Home.</span>
        </h1>
        <p className="font-body text-bud-text-muted text-sm mt-3 max-w-[300px]">
          Provide details about the pet you&apos;ve lost. The more accurate the
          information, the better our community can help.
        </p>
      </header>

      {!user && (
        <div className="bg-bud-surface-low rounded-2xl p-4 text-center">
          <p className="font-body text-sm text-bud-text-muted mb-3">
            You need to sign in to submit a report.
          </p>
          <button
            type="button"
            onClick={onRequestAuth}
            className="bg-bud-primary text-white font-body text-sm font-bold uppercase tracking-widest py-3 px-6 rounded-xl"
          >
            Sign In
          </button>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-6">
        <section className="bg-bud-surface-low rounded-[1.75rem] p-5 flex flex-col gap-4">
          <div>
            <p className="font-body text-sm font-semibold text-bud-text">Photo</p>
            <p className="font-body text-xs text-bud-text-muted mt-1">
              A clear face shot helps neighbors recognize them quickly.
            </p>
          </div>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full aspect-[4/3] max-h-44 rounded-2xl bg-bud-surface-well flex items-center justify-center overflow-hidden border-2 border-dashed border-bud-text-muted/25"
          >
            {preview ? (
              <img src={preview} alt="Pet preview" className="w-full h-full object-cover" />
            ) : (
              <span className="font-body text-sm text-bud-text-muted">Tap to upload a photo</span>
            )}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={onFileChange}
            aria-label="Upload pet photo"
          />
        </section>

        <div>
          <label htmlFor="pet-type" className="font-body text-xs font-semibold text-bud-text uppercase tracking-wide">
            Pet type
          </label>
          <select
            id="pet-type"
            value={petType}
            onChange={(e) => setPetType(e.target.value as PetType)}
            className="mt-2 w-full rounded-lg bg-bud-surface-well px-3 py-3 font-body text-bud-text text-sm outline-none focus:ring-2 focus:ring-bud-primary/30"
          >
            <option value="dog">Dog</option>
            <option value="cat">Cat</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="pet-name" className="font-body text-xs font-semibold text-bud-text uppercase tracking-wide">
            Pet name
          </label>
          <input
            id="pet-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Barnaby"
            required
            className="mt-2 w-full rounded-lg bg-bud-surface-well px-3 py-3 font-body text-bud-text text-sm placeholder:text-bud-text-muted/60 outline-none focus:ring-2 focus:ring-bud-primary/30"
          />
        </div>

        <div>
          <label htmlFor="pet-color" className="font-body text-xs font-semibold text-bud-text uppercase tracking-wide">
            Color / collar
          </label>
          <input
            id="pet-color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            placeholder="e.g. Golden, Red Collar"
            className="mt-2 w-full rounded-lg bg-bud-surface-well px-3 py-3 font-body text-bud-text text-sm placeholder:text-bud-text-muted/60 outline-none focus:ring-2 focus:ring-bud-primary/30"
          />
        </div>

        <div>
          <label htmlFor="pet-gender" className="font-body text-xs font-semibold text-bud-text uppercase tracking-wide">
            Gender
          </label>
          <select
            id="pet-gender"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="mt-2 w-full rounded-lg bg-bud-surface-well px-3 py-3 font-body text-bud-text text-sm outline-none focus:ring-2 focus:ring-bud-primary/30"
          >
            <option value="Unknown">Unknown</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        <div>
          <label htmlFor="last-seen" className="font-body text-xs font-semibold text-bud-text uppercase tracking-wide">
            Last seen location
          </label>
          <input
            id="last-seen"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Street, landmark, or barangay"
            required
            className="mt-2 w-full rounded-lg bg-bud-surface-well px-3 py-3 font-body text-bud-text text-sm placeholder:text-bud-text-muted/60 outline-none focus:ring-2 focus:ring-bud-primary/30"
          />
        </div>

        <div>
          <label htmlFor="traits" className="font-body text-xs font-semibold text-bud-text uppercase tracking-wide">
            Description / traits
          </label>
          <textarea
            id="traits"
            value={traits}
            onChange={(e) => setTraits(e.target.value)}
            rows={4}
            placeholder="Collar color, markings, behavior, anything that helps identify them…"
            className="mt-2 w-full rounded-lg bg-bud-surface-well px-3 py-3 font-body text-bud-text text-sm placeholder:text-bud-text-muted/60 outline-none focus:ring-2 focus:ring-bud-primary/30 resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={submitting || !user}
          className="w-full bg-bud-primary text-white font-body text-sm font-bold uppercase tracking-widest py-4 rounded-xl shadow-ambient active:scale-[0.99] transition-transform disabled:opacity-60"
        >
          {submitting ? "Submitting…" : "Submit Report"}
        </button>
      </form>
    </div>
  );
}
