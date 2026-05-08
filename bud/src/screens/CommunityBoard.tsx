import { useMemo, useState } from "react";
import type { Pet } from "../data/pets";
import { pets } from "../data/pets";
import { StatusBadge } from "../components/StatusBadge";

type CommunityBoardProps = {
  onSelectPet: (pet: Pet) => void;
  onHaveInfo: (pet: Pet) => void;
};

export function CommunityBoard({ onSelectPet, onHaveInfo }: CommunityBoardProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return pets;
    return pets.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        (p.breed?.toLowerCase().includes(q) ?? false)
    );
  }, [query]);

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
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search pets, area, breed…"
          className="flex-1 bg-transparent font-body text-bud-text placeholder:text-bud-text-muted/70 text-sm outline-none min-w-0"
          aria-label="Search pets"
        />
      </div>

      <div className="space-y-4">
        {filtered.map((pet) => (
          <article
            key={pet.id}
            className="bg-bud-card rounded-2xl overflow-hidden shadow-ambient active:scale-[0.99] transition-transform"
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
                  src={pet.image}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3">
                  <StatusBadge status={pet.status} />
                </div>
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
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                    />
                  </svg>
                  <div>
                    <p className="font-body text-xs font-semibold text-bud-text uppercase tracking-wide">
                      Last seen
                    </p>
                    <p className="font-body text-sm text-bud-text-muted">
                      {pet.location}
                    </p>
                    <p className="font-body text-xs text-bud-text-muted mt-1">
                      {pet.date}
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
                  onHaveInfo(pet);
                }}
                className="w-full bg-bud-primary text-white font-body text-sm font-bold uppercase tracking-widest py-3.5 rounded-xl transition-transform active:scale-[0.98]"
              >
                I Have Info
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
