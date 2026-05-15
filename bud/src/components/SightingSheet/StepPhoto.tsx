import { useRef } from "react";

type StepPhotoProps = {
  preview: string | null;
  onFile: (file: File | null) => void;
};

export function StepPhoto({ preview, onFile }: StepPhotoProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-4 px-1">
      <div>
        <p className="font-body text-sm font-semibold text-bud-text">Photo (optional)</p>
        <p className="mt-1 font-body text-xs text-bud-text-muted">
          We never share your photo without the owner&apos;s review.
        </p>
      </div>

      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            fileRef.current?.click();
          }
        }}
        onClick={() => fileRef.current?.click()}
        className={`relative flex h-40 w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed transition-colors outline-none focus-visible:ring-2 focus-visible:ring-bud-primary/40 ${
          preview
            ? "border-bud-primary/50 bg-bud-primary/5"
            : "border-bud-primary/30 bg-white/50 hover:border-bud-primary/45"
        }`}
      >
        {preview ? (
          <>
            <img src={preview} alt="" className="absolute inset-0 h-full w-full object-cover bud-sighting-pop-in motion-reduce:animate-none" />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onFile(null);
              }}
              className="absolute bottom-2 right-2 z-[1] rounded-full bg-black/55 px-2.5 py-1 font-body text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur-sm"
            >
              Remove
            </button>
          </>
        ) : (
          <>
            <span className="pointer-events-none absolute bottom-6 left-1/2 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full bg-bud-primary/15 motion-safe:bud-sighting-bubble-idle motion-reduce:opacity-40">
              <svg className="h-4 w-4 text-bud-primary" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <ellipse cx="12" cy="17.2" rx="4.8" ry="3.4" />
                <circle cx="8.4" cy="11.2" r="2.35" />
                <circle cx="12.1" cy="9" r="2.35" />
                <circle cx="15.7" cy="11.2" r="2.35" />
                <circle cx="11.2" cy="7.4" r="2.05" />
              </svg>
            </span>
            <span className="relative z-[1] font-body text-sm text-bud-text-muted">Tap to upload a photo</span>
          </>
        )}
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0] ?? null;
          onFile(f);
          e.target.value = ""
        }}
      />
    </div>
  );
}
