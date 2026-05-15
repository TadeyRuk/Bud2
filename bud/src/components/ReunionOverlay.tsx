import { useCallback, useRef } from "react";
import { toPng } from "html-to-image";
import { useReunionStore } from "../stores/reunionStore";
import { usePetStore } from "../stores/petStore";
import { useSightingStore } from "../stores/sightingStore";
import { showSuccess, showError } from "../lib/api";

export function ReunionOverlay() {
  const activePetId = useReunionStore((s) => s.activePetId);
  const close = useReunionStore((s) => s.close);
  const pet = usePetStore((s) => (activePetId ? s.pets.find((p) => p.id === activePetId) : undefined));
  const count = useSightingStore((s) => (activePetId ? s.countForPet(activePetId) : 0));
  const cardRef = useRef<HTMLDivElement>(null);

  const share = useCallback(async () => {
    if (!pet) return;
    const title = `${pet.name} is home`;
    const text = `Reunited with help from neighbors on Bud.`;
    try {
      if (navigator.share) {
        await navigator.share({ title, text, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(`${title}\n${text}\n${window.location.href}`);
        showSuccess("Copied to clipboard!");
      }
    } catch {
      showError("Could not share.");
    }
  }, [pet]);

  const download = useCallback(async () => {
    if (!cardRef.current || !pet) return;
    try {
      const data = await toPng(cardRef.current, { pixelRatio: 2 });
      const a = document.createElement("a");
      a.href = data;
      a.download = `${pet.name}-reunited.png`;
      a.click();
      showSuccess("Card saved!");
    } catch {
      showError("Could not export image.");
    }
  }, [pet]);

  if (!activePetId || !pet) return null;

  return (
    <div
      className="absolute inset-0 z-[200] flex flex-col items-center justify-center bg-black/60 px-4 py-10 backdrop-blur-sm"
      role="dialog"
      aria-label="Reunion celebration"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden motion-safe:opacity-100" aria-hidden>
        {Array.from({ length: 18 }).map((_, i) => (
          <span
            key={i}
            className="absolute h-2 w-2 rounded-full bg-bud-primary/80 motion-safe:animate-[bud-bubble-rise_1.2s_ease-out_infinite] motion-reduce:hidden"
            style={{
              left: `${(i * 53) % 100}%`,
              top: `${(i * 17) % 100}%`,
              animationDelay: `${i * 80}ms`,
            }}
          />
        ))}
      </div>

      <div
        ref={cardRef}
        className="relative z-[1] w-full max-w-sm overflow-hidden rounded-3xl border-2 border-blue-500/35 bg-white/95 shadow-2xl"
      >
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-bud-surface-well">
          <img src={pet.image_url || ""} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
          <p className="absolute bottom-4 left-4 right-4 font-headline text-3xl font-extrabold text-white drop-shadow-md">
            {pet.name} is home.
          </p>
        </div>
        <div className="space-y-2 px-4 py-4">
          <p className="font-body text-sm text-bud-text-muted">Thanks for everyone who shared sightings ({count} tips).</p>
        </div>
      </div>

      <div className="relative z-[1] mt-4 w-full max-w-sm space-y-2">
        <button
          type="button"
          onClick={() => void share()}
          className="w-full rounded-2xl bg-bud-primary py-3 font-body text-sm font-bold text-white shadow-md"
        >
          Share the good news
        </button>
        <button
          type="button"
          onClick={() => void download()}
          className="w-full rounded-2xl border-2 border-bud-accent py-2.5 font-body text-sm font-semibold text-bud-accent"
        >
          Download card
        </button>
        <button type="button" onClick={close} className="w-full py-2 font-body text-sm font-semibold text-white/90">
          Back to feed
        </button>
      </div>
    </div>
  );
}
