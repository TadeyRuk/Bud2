import { useMemo } from "react";
import { useFilterStore, defaultFilters } from "../stores/filterStore";
import { useUiStore } from "../stores/uiStore";
import { usePetStore } from "../stores/petStore";
import { applyFilters } from "../lib/applyFilters";
import { FILTER_PRESETS } from "../data/filterPresets";
import { useUserLocation } from "../context/LocationContext";

const SPECIES = [
  { id: "dog" as const, label: "Dog" },
  { id: "cat" as const, label: "Cat" },
  { id: "other" as const, label: "Other" },
];

const STATUSES = [
  { id: "LOST" as const, label: "Lost", cls: "bg-red-600 text-white" },
  { id: "FOUND" as const, label: "Found", cls: "bg-green-600 text-white" },
  { id: "REUNITED" as const, label: "Reunited", cls: "bg-blue-500 text-white" },
];

const TIME_OPTS: { id: "24h" | "7d" | "30d" | "any"; label: string }[] = [
  { id: "24h", label: "24h" },
  { id: "7d", label: "7 days" },
  { id: "30d", label: "30 days" },
  { id: "any", label: "Any" },
];

const DIST_STOPS: Array<0 | 0.5 | 1 | 2 | 3 | 5> = [0, 0.5, 1, 2, 3, 5];

export function FilterDrawer() {
  const open = useUiStore((s) => s.filterDrawerOpen);
  const setOpen = useUiStore((s) => s.setFilterDrawerOpen);
  const fallbackLatLng = useUiStore((s) => s.userLatLng);
  const { position } = useUserLocation();
  const userLatLng = useMemo<[number, number]>(
    () => (position ? [position.lat, position.lng] : fallbackLatLng),
    [position, fallbackLatLng]
  );

  const pets = usePetStore((s) => s.pets);
  const species = useFilterStore((s) => s.species);
  const statuses = useFilterStore((s) => s.statuses);
  const maxDistanceKm = useFilterStore((s) => s.maxDistanceKm);
  const reportedWithin = useFilterStore((s) => s.reportedWithin);
  const hasPhoto = useFilterStore((s) => s.hasPhoto);
  const verifiedOnly = useFilterStore((s) => s.verifiedOnly);
  const stillMissingOnly = useFilterStore((s) => s.stillMissingOnly);
  const setKey = useFilterStore((s) => s.setKey);
  const toggleInArray = useFilterStore((s) => s.toggleInArray);
  const reset = useFilterStore((s) => s.reset);
  const isActiveFn = useFilterStore((s) => s.isActive);

  const filterShape = useMemo(
    () => ({
      species,
      statuses,
      maxDistanceKm,
      reportedWithin,
      hasPhoto,
      verifiedOnly,
      stillMissingOnly,
    }),
    [species, statuses, maxDistanceKm, reportedWithin, hasPhoto, verifiedOnly, stillMissingOnly]
  );

  const filteredLen = useMemo(() => {
    return applyFilters(pets, filterShape, { userLatLng }).length;
  }, [pets, filterShape, userLatLng]);

  if (!open) return null;

  return (
    <>
      <button
        type="button"
        aria-label="Close filters"
        className="absolute inset-0 z-[125] bg-black/35 backdrop-blur-[2px]"
        onClick={() => setOpen(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="filter-drawer-title"
        className="absolute right-0 top-0 z-[130] flex h-full w-[86%] max-w-sm flex-col border-l border-black/10 bg-bud-card/95 shadow-2xl backdrop-blur-xl motion-safe:animate-[bud-drawer-in_0.36s_cubic-bezier(0.34,1.56,0.64,1)_both] motion-reduce:animate-none"
      >
        <header className="flex items-center justify-between border-b border-black/8 px-3 py-3">
          <button type="button" onClick={() => setOpen(false)} className="rounded-full p-2 text-bud-text" aria-label="Back">
            ‹
          </button>
          <h2 id="filter-drawer-title" className="font-headline text-base font-bold text-bud-text">
            Filter
          </h2>
          {isActiveFn() ? (
            <button type="button" onClick={() => reset()} className="font-body text-xs font-semibold text-bud-accent">
              Reset
            </button>
          ) : (
            <span className="w-10" />
          )}
        </header>

        <div className="border-b border-black/6 bg-white/50 px-4 py-3">
          <p className="font-headline text-sm font-extrabold text-bud-text">
            Showing {filteredLen} of {pets.length} pets
          </p>
          <p className="mt-1 font-body text-xs text-bud-text-muted line-clamp-2">Narrow by species, status, distance, and more.</p>
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
          <section className="rounded-2xl border border-black/6 bg-white/70 p-4">
            <p className="font-body text-xs font-bold uppercase tracking-wide text-bud-text-muted">Species</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {SPECIES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  aria-pressed={species.includes(s.id)}
                  onClick={() => toggleInArray("species", s.id)}
                  className={`rounded-full px-3 py-1.5 font-body text-xs font-semibold ${
                    species.includes(s.id) ? "bg-bud-primary text-white" : "bg-black/[0.06] text-bud-text"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-black/6 bg-white/70 p-4">
            <p className="font-body text-xs font-bold uppercase tracking-wide text-bud-text-muted">Status</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {STATUSES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  aria-pressed={statuses.includes(s.id)}
                  onClick={() => toggleInArray("statuses", s.id)}
                  className={`rounded-full px-3 py-1.5 font-body text-xs font-bold uppercase tracking-wide ${
                    statuses.includes(s.id) ? s.cls : "bg-black/[0.06] text-bud-text-muted"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              aria-pressed={stillMissingOnly}
              onClick={() => setKey("stillMissingOnly", !stillMissingOnly)}
              className={`mt-3 w-full rounded-2xl border px-3 py-2.5 text-left font-body text-xs font-bold transition-colors ${
                stillMissingOnly
                  ? "border-bud-primary bg-bud-primary/10 text-bud-primary"
                  : "border-black/10 bg-white/80 text-bud-text"
              }`}
            >
              Still missing only — hide found and reunited
            </button>
            <p className="mt-1.5 font-body text-[11px] leading-snug text-bud-text-muted">
              Use this when you only want pets that have not been located yet (LOST).
            </p>
          </section>

          <section className="rounded-2xl border border-black/6 bg-white/70 p-4">
            <p className="font-body text-xs font-bold uppercase tracking-wide text-bud-text-muted">Distance from me</p>
            <input
              type="range"
              min={0}
              max={5}
              step={1}
              value={DIST_STOPS.indexOf(maxDistanceKm)}
              onChange={(e) => setKey("maxDistanceKm", DIST_STOPS[Number(e.target.value)] ?? 0)}
              className="mt-3 w-full accent-bud-primary"
            />
            <p className="mt-1 font-body text-xs text-bud-text-muted">
              {maxDistanceKm === 0 ? "Any distance" : `Within ${maxDistanceKm} km`}
            </p>
          </section>

          <section className="rounded-2xl border border-black/6 bg-white/70 p-4">
            <p className="font-body text-xs font-bold uppercase tracking-wide text-bud-text-muted">Reported within</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {TIME_OPTS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setKey("reportedWithin", t.id)}
                  className={`rounded-full px-2.5 py-1 font-body text-[11px] font-semibold ${
                    reportedWithin === t.id ? "bg-bud-primary text-white" : "bg-black/[0.06] text-bud-text-muted"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-black/6 bg-white/70 p-4 space-y-2">
            <label className="flex items-center justify-between gap-3">
              <span className="font-body text-sm font-medium text-bud-text">Has photo</span>
              <input type="checkbox" checked={hasPhoto} onChange={(e) => setKey("hasPhoto", e.target.checked)} />
            </label>
            <label className="flex items-center justify-between gap-3">
              <span className="font-body text-sm font-medium text-bud-text">Verified reporter</span>
              <input type="checkbox" checked={verifiedOnly} onChange={(e) => setKey("verifiedOnly", e.target.checked)} />
            </label>
          </section>

          <section className="rounded-2xl border border-black/6 bg-white/70 p-4">
            <p className="font-body text-xs font-bold uppercase tracking-wide text-bud-text-muted">Saved searches</p>
            <div className="mt-2 space-y-2">
              {FILTER_PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    useFilterStore.setState({ ...defaultFilters, ...p.patch });
                  }}
                  className="w-full rounded-xl border border-black/8 bg-white/80 px-3 py-2 text-left font-body text-xs font-semibold text-bud-text"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </section>
        </div>

        <footer className="border-t border-black/8 p-3">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="w-full rounded-2xl bg-bud-primary py-3 font-body text-sm font-bold text-white shadow-md"
          >
            Show {filteredLen} results
          </button>
        </footer>
      </div>
    </>
  );
}
