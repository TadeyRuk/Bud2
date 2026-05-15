import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { usePetStore, type Pet } from "../stores/petStore";
import { useAuthStore } from "../stores/authStore";
import { useUiStore } from "../stores/uiStore";
import { useSightingStore } from "../stores/sightingStore";
import { useFilterStore } from "../stores/filterStore";
import { applyFilters } from "../lib/applyFilters";
import { GlassPetStatusChip } from "../components/GlassPetStatusChip";
import { BreakingStrip } from "../components/BreakingStrip";
import { useUserLocation } from "../context/LocationContext";
import { formatDistanceKm, petDistanceKm, sortPetsByDistance } from "../lib/geo";

const PET_IMAGE_PLACEHOLDER =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500"><defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#F6F3EF"/><stop offset="55%" stop-color="#EDE8E0"/><stop offset="100%" stop-color="#E2DDD5"/></linearGradient><radialGradient id="v" cx="50%" cy="35%" r="70%"><stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.5"/><stop offset="100%" stop-color="#FFFFFF" stop-opacity="0"/></radialGradient></defs><rect width="800" height="500" fill="url(#bg)"/><rect width="800" height="500" fill="url(#v)"/><g opacity="0.22" fill="#8B3A15"><ellipse cx="322" cy="210" rx="26" ry="32"/><ellipse cx="478" cy="210" rx="26" ry="32"/><ellipse cx="268" cy="288" rx="22" ry="28"/><ellipse cx="532" cy="288" rx="22" ry="28"/><ellipse cx="400" cy="348" rx="68" ry="54"/></g><text x="400" y="428" text-anchor="middle" fill="#6B6560" font-family="system-ui,sans-serif" font-size="20" font-weight="600" letter-spacing="0.02em">Photo coming soon</text></svg>`
  );

type CommunityBoardProps = {
  /** The community feed scroller (`overflow-y-auto` in MainShell) — required so tap-to-focus uses real scrollTop, not broken `scrollIntoView` in nested layouts. */
  listScrollRef: RefObject<HTMLElement | null>;
  onSelectPet: (pet: Pet) => void;
  onRequestAuth: () => void;
};

/** Scroll the feed so `card` sits just under the top padding of the scroll parent (mirrors “scroll this card into view”). */
function scrollFeedCardIntoView(scrollParent: HTMLElement, card: HTMLElement) {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const parentRect = scrollParent.getBoundingClientRect();
  const cardRect = card.getBoundingClientRect();
  const topPadding = 8;
  const deltaY = cardRect.top - parentRect.top - topPadding;
  if (Math.abs(deltaY) < 2) return;
  const nextTop = scrollParent.scrollTop + deltaY;
  scrollParent.scrollTo({
    top: Math.max(0, nextTop),
    behavior: reduceMotion ? "auto" : "smooth",
  });
}

export function CommunityBoard({ listScrollRef, onSelectPet, onRequestAuth }: CommunityBoardProps) {
  const [query, setQuery] = useState("");
  const pets = usePetStore((s) => s.pets);
  const loading = usePetStore((s) => s.loading);
  const hasMore = usePetStore((s) => s.hasMore);
  const fetchPets = usePetStore((s) => s.fetchPets);
  const searchPets = usePetStore((s) => s.searchPets);
  const user = useAuthStore((s) => s.user);
  const { position } = useUserLocation();
  const openSightingSheet = useUiStore((s) => s.openSightingSheet);
  const setFilterDrawerOpen = useUiStore((s) => s.setFilterDrawerOpen);
  const userLatLng = useUiStore((s) => s.userLatLng);
  const sightingPulsePetId = useUiStore((s) => s.sightingPulsePetId);
  const countForPet = useSightingStore((s) => s.countForPet);

  const species = useFilterStore((s) => s.species);
  const statuses = useFilterStore((s) => s.statuses);
  const maxDistanceKm = useFilterStore((s) => s.maxDistanceKm);
  const reportedWithin = useFilterStore((s) => s.reportedWithin);
  const hasPhoto = useFilterStore((s) => s.hasPhoto);
  const verifiedOnly = useFilterStore((s) => s.verifiedOnly);
  const stillMissingOnly = useFilterStore((s) => s.stillMissingOnly);
  const filterActiveFn = useFilterStore((s) => s.isActive);
  const filterCountFn = useFilterStore((s) => s.activeCount);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    fetchPets(true);
  }, [fetchPets]);

  const handleSearch = useCallback(
    (value: string) => {
      setQuery(value);
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        searchPets(value);
      }, 300);
    },
    [searchPets]
  );

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchPets(false);
    }
  }, [loading, hasMore, fetchPets]);

  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMore();
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  function handleHaveInfo(pet: Pet, e: React.MouseEvent<HTMLButtonElement>) {
    if (!user) {
      onRequestAuth();
      return;
    }

    openSightingSheet(pet.id, e.currentTarget.getBoundingClientRect(), e.currentTarget);
  }

  const filterShape = useMemo(
    () => ({ species, statuses, maxDistanceKm, reportedWithin, hasPhoto, verifiedOnly, stillMissingOnly }),
    [species, statuses, maxDistanceKm, reportedWithin, hasPhoto, verifiedOnly, stillMissingOnly]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base =
      !q || !q.length
        ? pets
        : pets.filter(
            (p) =>
              p.name.toLowerCase().includes(q) ||
              p.location_text.toLowerCase().includes(q) ||
              (p.breed?.toLowerCase().includes(q) ?? false)
          );
    const afterFilters = applyFilters(base, filterShape, { userLatLng });
    return sortPetsByDistance(afterFilters, position);
  }, [pets, query, filterShape, userLatLng, position]);

  return (
    <div className="relative min-h-full bg-black/[0.03]">
      <div className="relative z-10 space-y-5 px-4 pb-2 pt-2 transition-opacity duration-200">
        <div className="pl-1">
          <p className="font-body text-[11px] font-semibold uppercase tracking-[0.2em] text-bud-accent">Nearby</p>
          <h1 className="font-headline mt-1 text-3xl font-extrabold leading-none tracking-tight text-bud-text">
            Community
            <br />
            Board
          </h1>
          <p className="font-body mt-2 max-w-[280px] text-sm leading-relaxed text-bud-text-muted">
            Recent alerts and sightings near you.
          </p>
        </div>

        <BreakingStrip onSelectPet={onSelectPet} />

        <div className="flex items-center gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2.5 rounded-xl border border-white/65 bg-white/[0.58] px-3 py-2.5 shadow-[0_6px_28px_rgba(44,26,14,0.1),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-xl ring-1 ring-black/[0.05]">
          <svg
            className="h-5 w-5 shrink-0 text-bud-accent"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.8}
            stroke="currentColor"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search pets, area, breed…"
            className="min-w-0 flex-1 bg-transparent font-body text-sm font-medium text-bud-text outline-none placeholder:text-bud-text-muted"
            aria-label="Search pets"
          />
        </div>
          <button
            type="button"
            onClick={() => setFilterDrawerOpen(true)}
            className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/65 shadow-sm backdrop-blur-xl transition-colors ${
              filterActiveFn() ? "bg-bud-primary text-white" : "bg-white/[0.58] text-bud-text-muted"
            }`}
            aria-label="Open filters"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z"
              />
            </svg>
            {filterCountFn() > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-white px-0.5 text-[10px] font-bold text-bud-primary">
                {filterCountFn()}
              </span>
            ) : null}
          </button>
        </div>

        {loading && filtered.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-bud-primary border-t-transparent" />
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="px-6 py-12 text-center">
            <p className="font-headline text-lg font-bold text-bud-text">No pets found</p>
            <p className="font-body mt-2 text-sm text-bud-text-muted">
              {query ? "Try a different search term." : "No reports yet. Be the first to help!"}
            </p>
            {!query && (
              <button
                type="button"
                onClick={() => fetchPets(true)}
                className="mt-4 font-body text-sm font-semibold text-bud-accent underline-offset-2 hover:underline"
              >
                Retry
              </button>
            )}
          </div>
        )}

        <div className="flex flex-col gap-2 rounded-xl bg-black/[0.04] p-2 pt-1">
          {filtered.map((pet) => {
            const distanceKm = position ? petDistanceKm(pet, position) : null;
            const distanceLabel =
              distanceKm != null ? formatDistanceKm(distanceKm) : null;
            const metaLine = [
              [pet.breed, pet.color].filter(Boolean).join(" · ") || "Pet",
              distanceLabel ?? `#${pet.id.slice(0, 8)}`,
            ].join(" · ");
            const sightingCount = countForPet(pet.id);

            return (
              <article
                key={pet.id}
                tabIndex={0}
                aria-label={`${pet.name} — open details`}
                className={`group mx-auto min-h-[72px] w-full cursor-pointer touch-pan-y overflow-hidden rounded-2xl text-left shadow-sm transition-[transform,filter] duration-300 motion-safe:hover:shadow-md motion-safe:active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-bud-primary/40 ${
                  pet.status === "REUNITED"
                    ? "border-2 border-blue-500/35 bg-white/95 ring-2 ring-blue-500/10"
                    : "border border-transparent bg-white/90"
                } ${pet.syncing ? "opacity-70" : ""}`}
                onClick={(e) => {
                  if ((e.target as HTMLElement).closest("button")) return;
                  const card = e.currentTarget as HTMLElement;
                  const sp = listScrollRef.current;
                  if (sp) scrollFeedCardIntoView(sp, card);
                  requestAnimationFrame(() => onSelectPet(pet));
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    if ((e.target as HTMLElement).closest("button")) return;
                    const card = e.currentTarget as HTMLElement;
                    const sp = listScrollRef.current;
                    if (sp) scrollFeedCardIntoView(sp, card);
                    requestAnimationFrame(() => onSelectPet(pet));
                  }
                }}
              >
                <div className="relative w-full">
                  <div className="relative aspect-[3/4] max-h-[min(72vh,520px)] w-full overflow-hidden bg-bud-surface-well">
                    <img
                      src={pet.image_url || PET_IMAGE_PLACEHOLDER}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover object-[center_28%] motion-safe:transition-transform motion-safe:duration-[640ms] motion-safe:ease-out md:motion-safe:group-hover:scale-[1.03]"
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = PET_IMAGE_PLACEHOLDER;
                      }}
                    />

                    {/* White lift from bottom — photo stays full bleed; copy sits on soft white */}
                    <div
                      className="pointer-events-none absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(to top, #FFFFFF 0%, rgba(255,255,255,0.94) 24%, rgba(255,255,255,0.62) 44%, rgba(255,255,255,0.18) 58%, transparent 74%)",
                      }}
                      aria-hidden
                    />

                    <div className="absolute right-3 top-3 z-[2]">
                      <GlassPetStatusChip pet={pet} />
                    </div>

                    {sightingCount > 0 ? (
                      <div
                        className={`absolute left-3 top-12 z-[2] rounded-full bg-bud-primary px-2.5 py-1 font-body text-[10px] font-bold uppercase tracking-wide text-white shadow-md ${
                          sightingPulsePetId === pet.id ? "motion-safe:bud-sighting-pop-in" : ""
                        }`}
                        aria-hidden
                      >
                        {sightingCount} tip{sightingCount === 1 ? "" : "s"}
                      </div>
                    ) : null}

                    {pet.syncing && (
                      <div className="absolute left-3 top-3 z-[2] rounded-full border border-white/45 bg-white/75 px-3 py-1.5 font-body text-[10px] font-bold uppercase tracking-wide text-bud-text shadow-lg backdrop-blur-xl">
                        Syncing…
                      </div>
                    )}

                    <div className="absolute bottom-0 left-0 right-0 z-[2] space-y-3 px-4 pb-5 pt-10">
                      <h2 className="font-headline text-base font-semibold leading-snug tracking-tight text-[#1c1c19]">
                        {pet.name}
                      </h2>

                      <div className="flex items-start gap-2 text-sm text-black/60">
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
                        <p className="font-body text-[13px] leading-snug line-clamp-2">{metaLine}</p>
                      </div>

                      <div className="flex min-h-[72px] items-end justify-between gap-3 border-t border-bud-text/[0.08] pt-3">
                        <div className="min-w-0 flex-1">
                          <p className="font-body text-[10px] font-bold uppercase tracking-[0.16em] text-bud-text-muted">
                            Last seen
                          </p>
                          <p className="font-body text-xs font-medium leading-snug text-bud-text-muted line-clamp-2">
                            {pet.location_text || "Location shared"}
                          </p>
                          {distanceLabel && (
                            <p className="font-body mt-1 text-xs font-semibold text-bud-accent">
                              {distanceLabel} away
                            </p>
                          )}
                        </div>
                        <div className="shrink-0 text-right text-xs text-bud-text-muted">
                          <p className="font-headline text-xs font-semibold tabular-nums leading-none text-bud-text-muted">
                            {pet.date
                              ? pet.date.slice(0, 10)
                              : new Date(pet.created_at).toLocaleDateString(undefined, {
                                  month: "short",
                                  day: "numeric",
                                })}
                          </p>
                          <p className="font-body mt-1 text-[10px] font-semibold uppercase tracking-wide text-bud-text-muted/80">
                            Reported
                          </p>
                        </div>
                      </div>

                    {pet.status === "LOST" ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleHaveInfo(pet, e);
                        }}
                        className="relative z-[3] mt-1 w-full rounded-[1.12rem] bg-bud-primary py-3.5 font-body text-sm font-bold uppercase tracking-widest text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_10px_28px_rgba(139,58,21,0.38)] transition-transform active:scale-[0.98] motion-safe:hover:brightness-[1.05]"
                      >
                        I Have Info
                      </button>
                    ) : null}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div ref={sentinelRef} className="h-4" />

        {loading && filtered.length > 0 && (
          <div className="flex justify-center py-4">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-bud-primary border-t-transparent" />
          </div>
        )}
      </div>
    </div>
  );
}
