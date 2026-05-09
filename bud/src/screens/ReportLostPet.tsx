import { useRef, useState } from "react";

export function ReportLostPet() {
  const [petType, setPetType] = useState<"dog" | "cat" | "other">("dog");
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [traits, setTraits] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    window.alert(
      "Thank you — your report was saved locally for this demo. In a real app this would notify the community."
    );
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

      <form onSubmit={onSubmit} className="space-y-6">
        <section className="bg-bud-surface-low rounded-[1.75rem] p-5 flex flex-col gap-4">
          <div>
            <p className="font-body text-sm font-semibold text-bud-text">
              Photo
            </p>
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
              <img
                src={preview}
                alt="Pet preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="font-body text-sm text-bud-text-muted">
                Tap to upload a photo
              </span>
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
          <label
            htmlFor="pet-type"
            className="font-body text-xs font-semibold text-bud-text uppercase tracking-wide"
          >
            Pet type
          </label>
          <select
            id="pet-type"
            value={petType}
            onChange={(e) =>
              setPetType(e.target.value as "dog" | "cat" | "other")
            }
            className="mt-2 w-full rounded-lg bg-bud-surface-well px-3 py-3 font-body text-bud-text text-sm outline-none focus:ring-2 focus:ring-bud-primary/30"
          >
            <option value="dog">Dog</option>
            <option value="cat">Cat</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="pet-name"
            className="font-body text-xs font-semibold text-bud-text uppercase tracking-wide"
          >
            Pet name
          </label>
          <input
            id="pet-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Barnaby"
            className="mt-2 w-full rounded-lg bg-bud-surface-well px-3 py-3 font-body text-bud-text text-sm placeholder:text-bud-text-muted/60 outline-none focus:ring-2 focus:ring-bud-primary/30"
          />
        </div>

        <div>
          <label
            htmlFor="last-seen"
            className="font-body text-xs font-semibold text-bud-text uppercase tracking-wide"
          >
            Last seen location
          </label>
          <input
            id="last-seen"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Street, landmark, or barangay"
            className="mt-2 w-full rounded-lg bg-bud-surface-well px-3 py-3 font-body text-bud-text text-sm placeholder:text-bud-text-muted/60 outline-none focus:ring-2 focus:ring-bud-primary/30"
          />
        </div>

        <div>
          <label
            htmlFor="traits"
            className="font-body text-xs font-semibold text-bud-text uppercase tracking-wide"
          >
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
          className="w-full bg-bud-primary text-white font-body text-sm font-bold uppercase tracking-widest py-4 rounded-xl shadow-ambient active:scale-[0.99] transition-transform"
        >
          Submit Report
        </button>
      </form>
    </div>
  );
}
