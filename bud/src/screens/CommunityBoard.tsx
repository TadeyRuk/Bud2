import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePetStore, type Pet } from "../stores/petStore";
import { StatusBadge } from "../components/StatusBadge";
import { supabase, supabaseConfigured } from "../lib/supabase";
import { useAuthStore } from "../stores/authStore";
import { showError, showSuccess } from "../lib/api";

type CommunityBoardProps = {
  onSelectPet: (pet: Pet) => void;
  onRequestAuth: () => void;
};

export function CommunityBoard({ onSelectPet, onRequestAuth }: CommunityBoardProps) {
  const [query, setQuery] = useState("");
  const pets = usePetStore((s) => s.pets);
  const loading = usePetStore((s) => s.loading);
  const hasMore = usePetStore((s) => s.hasMore);
  const fetchPets = usePetStore((s) => s.fetchPets);
  const searchPets = usePetStore((s) => s.searchPets);
  const user = useAuthStore((s) => s.user);
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

  async function handleHaveInfo(pet: Pet) {
    if (!user) {
      onRequestAuth();
      return;
    }

    const message = window.prompt(`Share info about ${pet.name}:`);
    if (!message) return;

    if (supabaseConfigured) {
      const { error } = await supabase.from("sightings").insert({
        pet_id: pet.id,
        reporter_id: user.id,
        message,
        location_text: "",
        lat: null,
        lng: null,
        photo_url: null,
      });

      if (error) {
        showError(error);
        return;
      }

      if (pet.reporter_id && pet.reporter_id !== user.id) {
        await supabase.from("notifications").insert({
          user_id: pet.reporter_id,
          type: "sighting" as const,
          title: `New sighting for ${pet.name}`,
          body: message.slice(0, 200),
          pet_id: pet.id,
          read: false,
        });
      }
    }

    showSuccess(`Thanks — your info about ${pet.name} was shared with the community.`);
  }

  const filtered = useMemo(() => {
    if (!query.trim()) return pets;
    const q = query.trim().toLowerCase();
    return pets.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.location_text.toLowerCase().includes(q) ||
        (p.breed?.toLowerCase().includes(q) ?? false)
    );
  }, [pets, query]);

  return (
    <div className="px-4 pt-4 pb-2 space-y-5 transition-opacity duration-200">
      <div className="pl-1">
        <h1 className="font-headline text-3xl font-extrabold text-bud-text tracking-tight leading-none">
          Community
          <br />
          Board
        </h1>
        <p className="font-body text-bud-text-muted text-sm mt-2 max-w-[280px]">
          Recent alerts and sightings near you.
        </p>
      </div>

      <div className="bg-bud-card rounded-2xl shadow-ambient flex items-center gap-2 px-3 py-2.5">
        <svg
          className="w-5 h-5 text-bud-text-muted shrink-0"
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
          className="flex-1 bg-transparent font-body text-bud-text placeholder:text-bud-text-muted/70 text-sm outline-none min-w-0"
          aria-label="Search pets"
        />
      </div>

      {loading && filtered.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 border-2 border-bud-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-12 px-6">
          <p className="font-headline text-lg font-bold text-bud-text">No pets found</p>
          <p className="font-body text-sm text-bud-text-muted mt-2">
            {query ? "Try a different search term." : "No reports yet. Be the first to help!"}
          </p>
          {!query && (
            <button
              type="button"
              onClick={() => fetchPets(true)}
              className="mt-4 font-body text-sm font-semibold text-bud-primary"
            >
              Retry
            </button>
          )}
        </div>
      )}

      <div className="space-y-4">
        {filtered.map((pet) => (
          <article
            key={pet.id}
            className={`bg-bud-card rounded-2xl overflow-hidden shadow-ambient active:scale-[0.99] transition-transform ${
              pet.syncing ? "opacity-70" : ""
            }`}
          >
            <div
              role="button"
              tabIndex={0}
              onClick={() => onSelectPet(pet)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelectPet(pet);
                }
              }}
              className="w-full text-left cursor-pointer"
            >
              <div className="relative h-44 w-full">
                <img
                  src={pet.image_url || ""}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' fill='%23e8e5dc'%3E%3Crect width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999' font-size='14'%3ENo photo%3C/text%3E%3C/svg%3E";
                  }}
                />
                <div className="absolute top-3 left-3">
                  <StatusBadge status={pet.status === "REUNITED" ? "FOUND" : pet.status} />
                </div>
                {pet.syncing && (
                  <div className="absolute top-3 right-3 bg-amber-500 text-white text-xs font-body font-semibold px-2 py-1 rounded-full">
                    Syncing…
                  </div>
                )}
              </div>
              <div className="p-4 space-y-3 bg-bud-card">
                <div>
                  <h2 className="font-headline text-xl font-bold text-bud-text">
                    {pet.name}
                  </h2>
                  <p className="font-body text-sm text-bud-text-muted mt-0.5">
                    {[pet.breed, pet.color].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <div className="bg-bud-bg rounded-xl p-3 flex gap-3">
                  <svg
                    className="w-5 h-5 text-bud-primary shrink-0 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.8}
                    stroke="currentColor"
                    aria-hidden
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  <div>
                    <p className="font-body text-xs font-semibold text-bud-text uppercase tracking-wide">
                      Last seen
                    </p>
                    <p className="font-body text-sm text-bud-text-muted">
                      {pet.location_text}
                    </p>
                    <p className="font-body text-xs text-bud-text-muted mt-1">
                      {pet.date || new Date(pet.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-4 pb-4">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleHaveInfo(pet);
                }}
                className="w-full bg-bud-primary text-white font-body text-sm font-bold uppercase tracking-widest py-3.5 rounded-xl transition-transform active:scale-[0.98]"
              >
                I Have Info
              </button>
            </div>
          </article>
        ))}
      </div>

      <div ref={sentinelRef} className="h-4" />

      {loading && filtered.length > 0 && (
        <div className="flex items-center justify-center py-4">
          <div className="w-5 h-5 border-2 border-bud-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
