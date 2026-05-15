import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CursorReactiveBackdrop } from "../components/CursorReactiveBackdrop";
import { BudLogoMark } from "../components/BudLogoMark";
import { saveOnboardingProfile } from "../lib/onboardingProfile";
import { colors, radius } from "../styles/tokens";

type OnboardingState = {
  name: string;
  barangay: string;
  city: string;
  role: "pet-parent" | "rescuer" | "barangay-staff";
  notifications: boolean;
};

const ROLES = [
  {
    id: "pet-parent" as const,
    title: "Pet parent",
    tagline: "My pet is part of the family",
    hint: "Report • share updates • track sightings",
    icon: PawIcon,
    accent: colors.primary,
  },
  {
    id: "rescuer" as const,
    title: "Neighbor helper",
    tagline: "I spot, share, and match",
    hint: "Sightings • tips • keeping eyes open",
    icon: HeartIcon,
    accent: colors.tertiary,
  },
  {
    id: "barangay-staff" as const,
    title: "Community desk",
    tagline: "I coordinate on the ground",
    hint: "Barangay posts • follow-ups • reunions",
    icon: BuildingIcon,
    accent: colors.tertiaryContainer,
  },
];

export function OnboardingPage() {
  const navigate = useNavigate();
  const shellRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [state, setState] = useState<OnboardingState>({
    name: "",
    barangay: "",
    city: "",
    role: "pet-parent",
    notifications: true,
  });

  const canContinue = useMemo(() => {
    if (step === 1) return state.name.trim().length > 1;
    if (step === 2) return state.city.trim().length > 1;
    return true;
  }, [state.city, state.name, step]);

  const progress = step / 3;

  return (
    <div ref={shellRef} className="relative flex h-full min-h-0 w-full flex-col overflow-hidden bg-bud-bg">
      <CursorReactiveBackdrop boundsRef={shellRef} className="z-0" />
      <div
        className="pointer-events-none absolute inset-0 z-[1] opacity-[0.05]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'%3E%3Cpath fill='none' stroke='%231C1A17' stroke-opacity='0.35' d='M0%2080h160M80%200v160' stroke-width='0.5'/%3E%3C/svg%3E")`,
        }}
        aria-hidden
      />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden">
        <div className="mx-auto w-full max-w-[430px] px-5 pb-10 pt-8">
          <div className="flex flex-col items-center text-center">
            <div
              className="inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/55 px-4 py-2 shadow-[0_12px_40px_-12px_rgba(44,26,14,0.28)] backdrop-blur-xl"
              style={{ boxShadow: `0 14px 44px -14px rgba(28,26,23,0.12), inset 0 1px 0 rgba(255,255,255,0.75)` }}
            >
              <span className="font-headline text-[11px] font-extrabold uppercase tracking-[0.2em] text-bud-accent">
                Setup
              </span>
              <span className="font-body text-xs font-semibold text-bud-text/75">3 gentle steps</span>
            </div>

            <div className="mt-5 flex justify-center">
              <BudLogoMark variant="marketing" />
            </div>

            <h1 className="mt-5 font-headline text-[26px] font-extrabold leading-[1.12]" style={{ color: colors.onSurface }}>
              Make Bud feel like home
            </h1>
            <p className="mt-2 max-w-[300px] font-body text-sm leading-relaxed" style={{ color: colors.onSurfaceVariant }}>
              Tell us who you are and where you watch—matches stay grounded in real neighborhoods.
            </p>

            <div className="mt-6 w-full max-w-[280px]">
              <div
                className="h-2 overflow-hidden rounded-full"
                style={{ background: colors.surfaceContainerHighest }}
              >
                <div
                  className="h-full rounded-full transition-[width] duration-500 ease-out motion-reduce:transition-none"
                  style={{
                    width: `${progress * 100}%`,
                    background: `linear-gradient(90deg, ${colors.primary}, ${colors.tertiary})`,
                    boxShadow: `0 0 24px ${colors.primary}55`,
                  }}
                />
              </div>
              <div className="mt-2 flex justify-between font-body text-[10px] font-bold uppercase tracking-[0.18em] text-bud-text-muted">
                <span style={{ color: step === 1 ? colors.tertiary : undefined }}>You</span>
                <span style={{ color: step === 2 ? colors.tertiary : undefined }}>Place</span>
                <span style={{ color: step === 3 ? colors.tertiary : undefined }}>Alerts</span>
              </div>
            </div>
          </div>

          <div
            className="mt-8 rounded-[1.45rem] border border-white/55 bg-white/[0.42] px-5 py-5 shadow-[0_28px_80px_-24px_rgba(44,26,14,0.22)] backdrop-blur-[28px] backdrop-saturate-150"
            style={{ boxShadow: `0 32px 72px -22px rgba(44,26,14,0.18), inset 0 1px 0 rgba(255,255,255,0.65)` }}
          >
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <label htmlFor="ob-name" className="font-body text-xs font-bold uppercase tracking-wide text-bud-text">
                    What should we call you?
                  </label>
                  <input
                    id="ob-name"
                    type="text"
                    autoComplete="name"
                    placeholder="e.g., Sam"
                    value={state.name}
                    onChange={(e) => setState((s) => ({ ...s, name: e.target.value }))}
                    className="mt-2 w-full rounded-2xl border border-white/50 bg-white/85 px-4 py-3.5 font-body text-bud-text shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] outline-none ring-bud-primary/0 transition-shadow placeholder:text-bud-text-muted/70 focus:ring-2 focus:ring-bud-primary/35"
                  />
                </div>

                <div>
                  <p className="font-body text-xs font-bold uppercase tracking-wide text-bud-text">
                    How do you pitch in?
                  </p>
                  <p className="mt-1 font-body text-xs leading-snug text-bud-text-muted">
                    Move the cursor—light follows you. Pick the lane that fits; you can change this later.
                  </p>

                  <div className="mt-3 grid grid-cols-1 gap-3">
                    {ROLES.map((r) => {
                      const active = state.role === r.id;
                      return (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => setState((s) => ({ ...s, role: r.id }))}
                          className={`group relative overflow-hidden rounded-2xl border px-4 py-3.5 text-left transition-[transform,box-shadow,border-color] duration-200 motion-safe:active:scale-[0.99] ${
                            active
                              ? "border-white/70 bg-white/70 shadow-[0_18px_40px_-18px_rgba(28,26,23,0.28)] ring-2 ring-bud-primary/40"
                              : "border-white/35 bg-white/30 hover:border-white/55 hover:bg-white/45"
                          }`}
                        >
                          <div
                            className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full opacity-[0.22] blur-2xl transition-opacity group-hover:opacity-30"
                            style={{ background: r.accent }}
                            aria-hidden
                          />
                          <div className="relative flex gap-3">
                            <div
                              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-inner"
                              style={{
                                background: active
                                  ? `linear-gradient(145deg, ${r.accent}, ${colors.secondary})`
                                  : colors.surfaceContainerHighest,
                                color: active ? "#fff" : colors.onSurface,
                              }}
                            >
                              <r.icon className="h-6 w-6" muted={!active} />
                            </div>
                            <div className="min-w-0">
                              <div className="font-headline text-[15px] font-bold text-bud-text">{r.title}</div>
                              <div className="mt-0.5 font-body text-[13px] font-semibold" style={{ color: colors.tertiary }}>
                                {r.tagline}
                              </div>
                              <div className="mt-1 font-body text-xs leading-snug text-bud-text-muted">{r.hint}</div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-3">
                <p className="font-body text-xs font-bold uppercase tracking-wide text-bud-text">
                  Center your map
                </p>
                <p className="font-body text-xs leading-relaxed text-bud-text-muted">
                  Matches and “near you” use this anchor. Fine-tune anytime in Profile.
                </p>

                <label className="mt-2 block">
                  <span className="mb-1 block font-body text-sm font-semibold text-bud-text">City / Municipality</span>
                  <input
                    type="text"
                    className="w-full rounded-2xl border border-white/50 bg-white/85 px-4 py-3.5 font-body text-bud-text shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] outline-none placeholder:text-bud-text-muted/70 focus:ring-2 focus:ring-bud-primary/35"
                    placeholder="e.g., San Fernando"
                    value={state.city}
                    onChange={(e) => setState((s) => ({ ...s, city: e.target.value }))}
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block font-body text-sm font-semibold text-bud-text">Barangay (optional)</span>
                  <input
                    type="text"
                    className="w-full rounded-2xl border border-white/50 bg-white/85 px-4 py-3.5 font-body text-bud-text shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] outline-none placeholder:text-bud-text-muted/70 focus:ring-2 focus:ring-bud-primary/35"
                    placeholder="e.g., Dolores"
                    value={state.barangay}
                    onChange={(e) => setState((s) => ({ ...s, barangay: e.target.value }))}
                  />
                </label>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <p className="font-body text-xs font-bold uppercase tracking-wide text-bud-text">Stay in the loop</p>
                <p className="font-body text-xs leading-relaxed text-bud-text-muted">
                  We&apos;ll nudge you when new lost pet posts match your area—quietly, no spam.
                </p>

                <button
                  type="button"
                  className="mt-1 flex w-full items-center justify-between rounded-2xl border border-white/45 bg-white/45 px-4 py-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] transition-colors hover:bg-white/55"
                  onClick={() => setState((s) => ({ ...s, notifications: !s.notifications }))}
                >
                  <div className="text-left">
                    <div className="font-body text-sm font-semibold text-bud-text">Nearby alerts</div>
                    <div className="mt-0.5 font-body text-xs text-bud-text-muted">
                      {state.notifications ? "Enabled — we’ll keep it light" : "Off — you can enable later"}
                    </div>
                  </div>
                  <span
                    aria-hidden
                    className="inline-flex items-center px-3 py-1 font-body text-xs font-semibold"
                    style={{
                      background: state.notifications ? colors.tertiaryContainer : colors.surfaceContainerHighest,
                      color: state.notifications ? colors.onPrimary : colors.onSurfaceVariant,
                      borderRadius: radius.full,
                    }}
                  >
                    {state.notifications ? "On" : "Off"}
                  </span>
                </button>

                <div className="rounded-2xl border border-white/40 bg-white/35 px-4 py-3.5 backdrop-blur-md">
                  <div className="font-body text-[10px] font-bold uppercase tracking-widest text-bud-text-muted">
                    Summary
                  </div>
                  <div className="mt-1 font-body text-sm font-semibold text-bud-text">
                    {state.name || "—"} · {ROLES.find((x) => x.id === state.role)?.title}
                  </div>
                  <div className="mt-0.5 font-body text-xs text-bud-text-muted">
                    {state.barangay ? `${state.barangay}, ` : ""}
                    {state.city || "—"}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button
              type="button"
              className="inline-flex w-full justify-center rounded-full border border-white/45 bg-white/40 py-3.5 font-body font-semibold text-bud-text shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] backdrop-blur-xl transition-colors hover:bg-white/52"
              onClick={() => {
                if (step > 1) {
                  setStep((s) => (s > 1 ? ((s - 1) as 1 | 2 | 3) : s));
                  return;
                }
                navigate("/landing");
              }}
            >
              Back
            </button>

            {step < 3 ? (
              <button
                type="button"
                className={`inline-flex w-full justify-center rounded-full bg-bud-primary py-3.5 font-headline font-extrabold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_12px_32px_rgba(139,58,21,0.32)] transition-[opacity,filter] hover:brightness-[1.03] disabled:pointer-events-none ${
                  canContinue ? "" : "opacity-45"
                }`}
                disabled={!canContinue}
                onClick={() => setStep((s) => (s < 3 ? ((s + 1) as 2 | 3) : s))}
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                className="inline-flex w-full justify-center rounded-full bg-bud-primary py-3.5 font-headline font-extrabold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_12px_32px_rgba(139,58,21,0.32)] transition-[filter] hover:brightness-[1.03]"
                onClick={() => {
                  saveOnboardingProfile(state);
                  navigate("/app");
                }}
              >
                Finish
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PawIcon({ className, muted }: { className?: string; muted?: boolean }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 10c-1.2 0-2.2.85-2.45 2-.08.45-.5.78-.95.72a2.8 2.8 0 00-2.62 1.05 2.7 2.7 0 001.05 3.68c.55.3 1.22.35 1.82.2M12 10c1.2 0 2.2.85 2.45 2 .08.45.5.78.95.72a2.8 2.8 0 012.62 1.05 2.7 2.7 0 01-1.05 3.68c-.55.3-1.22.35-1.82.2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity={muted ? 0.55 : 1}
      />
      <ellipse cx="8.2" cy="7.2" rx="1.4" ry="1.7" fill="currentColor" opacity={muted ? 0.45 : 0.9} />
      <ellipse cx="11.9" cy="5.8" rx="1.4" ry="1.7" fill="currentColor" opacity={muted ? 0.45 : 0.9} />
      <ellipse cx="15.8" cy="7.2" rx="1.4" ry="1.7" fill="currentColor" opacity={muted ? 0.45 : 0.9} />
    </svg>
  );
}

function HeartIcon({ className, muted }: { className?: string; muted?: boolean }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 20s7-4.9 7-11.2c0-2.7-1.9-4.8-4.3-4.8-.9 0-1.9.35-2.7 1.1a4.86 4.86 0 00-2.7-1.1C6.9 4 5 6.1 5 8.8 5 15.1 12 20 12 20z"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinejoin="round"
        fill={muted ? "none" : "currentColor"}
        fillOpacity={muted ? 0 : 0.22}
        opacity={muted ? 0.55 : 1}
      />
    </svg>
  );
}

function BuildingIcon({ className, muted }: { className?: string; muted?: boolean }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7 21V10.2c0-.45.18-.88.5-1.2l3-2.6a1.65 1.65 0 012.1 0l3 2.6c.32.32.5.75.5 1.2V21"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={muted ? 0.55 : 1}
      />
      <path d="M5 21h14" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" opacity={muted ? 0.55 : 1} />
      <path
        d="M10 14h1.2M14 14h1.2M10 17.5h1.2M14 17.5h1.2"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity={muted ? 0.45 : 0.85}
      />
    </svg>
  );
}
