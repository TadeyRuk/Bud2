import type { ReactNode } from "react";

export type TabId = "community" | "map" | "report" | "profile";

type BottomNavProps = {
  active: TabId;
  onChange: (tab: TabId) => void;
};

function TabButton({
  label,
  icon,
  isActive,
  onClick,
  ariaLabel,
}: {
  label: string;
  icon: ReactNode;
  isActive: boolean;
  onClick: () => void;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      aria-current={isActive ? "page" : undefined}
      className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-0 rounded-full px-1 py-1 transition-colors duration-200 active:scale-95 ${
        isActive ? "text-bud-primary" : "text-gray-400 hover:text-bud-text/70"
      }`}
    >
      {icon}
      <span className="font-body text-[9px] font-semibold uppercase tracking-wider">{label}</span>
    </button>
  );
}

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav
      className="pointer-events-none absolute bottom-5 left-1/2 z-40 w-[min(20.5rem,calc(100%-2.25rem))] -translate-x-1/2 px-0"
      aria-label="Main"
    >
      <div className="pointer-events-auto rounded-full border border-black/10 bg-white/95 px-1 py-1 shadow-[0_16px_44px_rgba(44,26,14,0.14)] backdrop-blur-sm">
        <div className="relative grid grid-cols-4 items-end gap-0">
          <TabButton
            label="Community"
            ariaLabel="Community board"
            isActive={active === "community"}
            onClick={() => onChange("community")}
            icon={
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.8}
                stroke="currentColor"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M18 18.72a9.09 9.09 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                />
              </svg>
            }
          />

          <TabButton
            label="Map"
            ariaLabel="Map view"
            isActive={active === "map"}
            onClick={() => onChange("map")}
            icon={
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.8}
                stroke="currentColor"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437a.75.75 0 00.503-.69V6.259a.75.75 0 00-.503-.724l-4.875-2.437a.75.75 0 00-.752 0l-4.875 2.437a.75.75 0 00-.503.724v7.323c0 .29.166.558.425.69l4.875 2.437a.75.75 0 00.752 0l4.875-2.437a.75.75 0 00.425-.69V6.259a.75.75 0 00-.425-.69l-4.875-2.437a.75.75 0 00-.752 0L9 3.516"
                />
              </svg>
            }
          />

          <div className="relative flex min-h-[44px] flex-col items-center justify-end">
            <button
              type="button"
              onClick={() => onChange("report")}
              aria-label="Report lost pet"
              className={`absolute -top-8 left-1/2 flex -translate-x-1/2 items-center justify-center rounded-full bg-bud-primary p-3 text-white shadow-lg transition-all duration-200 active:scale-95 ${
                active === "report" ? "ring-2 ring-bud-primary/30" : ""
              }`}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.2}
                stroke="currentColor"
                aria-hidden
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </button>
            <span
              className={`pb-0.5 font-body text-[9px] font-semibold uppercase tracking-wider transition-colors duration-200 ${
                active === "report" ? "text-bud-primary" : "text-gray-400"
              }`}
            >
              Report
            </span>
          </div>

          <TabButton
            label="Profile"
            ariaLabel="Profile"
            isActive={active === "profile"}
            onClick={() => onChange("profile")}
            icon={
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.8}
                stroke="currentColor"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                />
              </svg>
            }
          />
        </div>
      </div>
    </nav>
  );
}
