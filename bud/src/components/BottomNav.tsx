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
      className={`flex flex-col items-center justify-center gap-0.5 w-full py-2 rounded-full transition-all duration-200 active:scale-95 ${
        isActive
          ? "bg-bud-primary text-white shadow-md"
          : "text-zinc-400 hover:text-white"
      }`}
    >
      {icon}
      <span className="font-body text-[10px] font-semibold uppercase tracking-widest">
        {label}
      </span>
    </button>
  );
}

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav
      className="absolute bottom-0 left-0 right-0 z-40 bg-bud-nav px-1 pt-2 pb-6 rounded-t-3xl shadow-[0_-8px_24px_rgba(0,0,0,0.35)]"
      aria-label="Main"
    >
      <div className="grid grid-cols-4 items-end gap-0 relative">
        <div className="flex justify-center">
          <TabButton
            label="Community"
            ariaLabel="Community board"
            isActive={active === "community"}
            onClick={() => onChange("community")}
            icon={
              <svg
                className="w-6 h-6"
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
        </div>

        <div className="flex justify-center">
          <TabButton
            label="Map"
            ariaLabel="Map view"
            isActive={active === "map"}
            onClick={() => onChange("map")}
            icon={
              <svg
                className="w-6 h-6"
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
        </div>

        <div className="flex flex-col items-center justify-end relative min-h-[52px]">
          <button
            type="button"
            onClick={() => onChange("report")}
            aria-label="Report lost pet"
            className={`absolute -top-9 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-bud-primary text-white shadow-fab flex items-center justify-center transition-transform duration-200 active:scale-95 ring-4 ring-bud-nav ${
              active === "report" ? "ring-white/20 scale-105" : ""
            }`}
          >
            <svg
              className="w-7 h-7"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.2}
              stroke="currentColor"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
          </button>
          <span
            className={`font-body text-[10px] font-semibold uppercase tracking-widest pb-1 ${
              active === "report" ? "text-bud-primary" : "text-zinc-500"
            }`}
          >
            Report
          </span>
        </div>

        <div className="flex justify-center">
          <TabButton
            label="Profile"
            ariaLabel="Profile"
            isActive={active === "profile"}
            onClick={() => onChange("profile")}
            icon={
              <svg
                className="w-6 h-6"
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
