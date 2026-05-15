import { useMemo, useState } from "react";
import { BudLogoMark } from "./BudLogoMark";
import {
  getOnboardingProfile,
  saveOnboardingProfile,
  type OnboardingProfile,
} from "../lib/onboardingProfile";
import { colors, radius } from "../styles/tokens";

type OnboardingState = OnboardingProfile;

function StepPill({ step, active }: { step: string; active: boolean }) {
  if (active) {
    return (
      <span className="inline-flex items-center rounded-full bg-bud-primary px-3 py-1 font-body text-xs font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.22)]">
        {step}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full border border-white/45 bg-white/38 px-3 py-1 font-body text-xs font-semibold text-bud-text/85 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] backdrop-blur-xl">
      {step}
    </span>
  );
}

type OnboardingModalProps = {
  onComplete: () => void;
  onSkip?: () => void;
};

export function OnboardingModal({ onComplete, onSkip }: OnboardingModalProps) {
  const existing = getOnboardingProfile();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [state, setState] = useState<OnboardingState>({
    name: existing?.name ?? "",
    barangay: existing?.barangay ?? "",
    city: existing?.city ?? "",
    role: existing?.role ?? "pet-parent",
    notifications: existing?.notifications ?? true,
  });

  const canContinue = useMemo(() => {
    if (step === 1) return state.name.trim().length > 1;
    if (step === 2) return state.city.trim().length > 1;
    return true;
  }, [state.city, state.name, step]);

  return (
    <div
      className="absolute inset-0 z-[8000] flex flex-col bg-bud-bg/95 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-10 pt-10">
        <div className="mx-auto w-full" style={{ maxWidth: 430 }}>
          <div className="text-center">
            <div className="inline-flex items-center justify-center rounded-full border border-white/55 bg-white/[0.52] px-4 py-2 shadow-[0_16px_44px_-14px_rgba(44,26,14,0.2)] backdrop-blur-2xl backdrop-saturate-150 ring-1 ring-white/45">
              <span className="font-headline text-sm font-extrabold text-bud-text">Setup</span>
            </div>

            <div className="mt-5 flex justify-center">
              <BudLogoMark variant="marketing" />
            </div>

            <h1
              id="onboarding-title"
              className="mt-4 font-headline text-[28px] leading-tight font-extrabold"
              style={{ color: colors.onSurface }}
            >
              Let’s personalize Bud
            </h1>
            <p className="mt-2 font-body" style={{ color: colors.onSurfaceVariant }}>
              Three quick steps—so reports and matches feel local.
            </p>

            <div className="mt-4 flex items-center justify-center gap-2">
              <StepPill step="1 • You" active={step === 1} />
              <StepPill step="2 • Area" active={step === 2} />
              <StepPill step="3 • Alerts" active={step === 3} />
            </div>
          </div>

          <div className="mt-7 rounded-[1.35rem] border border-white/55 bg-white/[0.54] px-5 py-5 shadow-[0_32px_72px_-22px_rgba(44,26,14,0.24)] backdrop-blur-[28px] backdrop-saturate-150 ring-1 ring-white/45">
            {step === 1 && (
              <div>
                <div
                  className="font-body text-sm font-semibold"
                  style={{ color: colors.onSurface }}
                >
                  What should we call you?
                </div>
                <div className="mt-3">
                  <label className="block">
                    <span
                      className="mb-1 block font-body text-sm font-semibold"
                      style={{ color: colors.onSurface }}
                    >
                      Display name
                    </span>
                    <input
                      type="text"
                      autoComplete="name"
                      className="w-full rounded-xl border border-white/50 bg-white/82 px-4 py-3 font-body text-bud-text shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] outline-none backdrop-blur-sm placeholder:text-bud-text-muted/75"
                      placeholder="e.g., Sam"
                      value={state.name}
                      onChange={(e) => setState((s) => ({ ...s, name: e.target.value }))}
                    />
                  </label>
                </div>

                <div className="mt-4">
                  <div
                    className="font-body text-sm font-semibold"
                    style={{ color: colors.onSurface }}
                  >
                    How will you use Bud?
                  </div>
                  <div className="mt-2 grid grid-cols-1 gap-2">
                    {(
                      [
                        {
                          id: "pet-parent" as const,
                          title: "Pet parent",
                          desc: "Report and track your pet.",
                        },
                        {
                          id: "rescuer" as const,
                          title: "Rescuer / Volunteer",
                          desc: "Help match sightings to reports.",
                        },
                        {
                          id: "barangay-staff" as const,
                          title: "Barangay staff",
                          desc: "Coordinate community updates.",
                        },
                      ] as const
                    ).map((r) => {
                      const active = state.role === r.id;
                      return (
                        <button
                          key={r.id}
                          type="button"
                          className={`rounded-xl border px-4 py-3 text-left backdrop-blur-md transition-[background,border-color,transform] motion-safe:active:scale-[0.99] ${
                            active
                              ? "border-bud-primary/45 bg-white/58 shadow-[inset_0_1px_0_rgba(255,255,255,0.88)] ring-2 ring-bud-primary/35"
                              : "border-white/35 bg-white/26 hover:bg-white/38"
                          }`}
                          onClick={() => setState((s) => ({ ...s, role: r.id }))}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div
                                className="font-body text-sm font-semibold"
                                style={{ color: colors.onSurface }}
                              >
                                {r.title}
                              </div>
                              <div
                                className="mt-0.5 font-body text-xs"
                                style={{ color: colors.onSurfaceVariant }}
                              >
                                {r.desc}
                              </div>
                            </div>

                            {active && (
                              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-bud-primary px-2 py-1 font-body text-xs font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.22)]">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                                  <path
                                    d="M20 6L9 17l-5-5"
                                    stroke="currentColor"
                                    strokeWidth="2.2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                                Selected
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <div
                  className="font-body text-sm font-semibold"
                  style={{ color: colors.onSurface }}
                >
                  Where should matches be centered?
                </div>
                <p className="mt-1 font-body text-xs" style={{ color: colors.onSurfaceVariant }}>
                  You can change this later in Profile.
                </p>

                <div className="mt-3 grid grid-cols-1 gap-3">
                  <label className="block">
                    <span
                      className="mb-1 block font-body text-sm font-semibold"
                      style={{ color: colors.onSurface }}
                    >
                      City / Municipality
                    </span>
                    <input
                      type="text"
                      className="w-full rounded-xl border border-white/50 bg-white/82 px-4 py-3 font-body text-bud-text shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] outline-none backdrop-blur-sm placeholder:text-bud-text-muted/75"
                      placeholder="e.g., San Fernando"
                      value={state.city}
                      onChange={(e) => setState((s) => ({ ...s, city: e.target.value }))}
                    />
                  </label>

                  <label className="block">
                    <span
                      className="mb-1 block font-body text-sm font-semibold"
                      style={{ color: colors.onSurface }}
                    >
                      Barangay (optional)
                    </span>
                    <input
                      type="text"
                      className="w-full rounded-xl border border-white/50 bg-white/82 px-4 py-3 font-body text-bud-text shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] outline-none backdrop-blur-sm placeholder:text-bud-text-muted/75"
                      placeholder="e.g., Dolores"
                      value={state.barangay}
                      onChange={(e) => setState((s) => ({ ...s, barangay: e.target.value }))}
                    />
                  </label>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <div
                  className="font-body text-sm font-semibold"
                  style={{ color: colors.onSurface }}
                >
                  Alerts & updates
                </div>
                <p className="mt-1 font-body text-xs" style={{ color: colors.onSurfaceVariant }}>
                  Get notified when there are new nearby reports.
                </p>

                <button
                  type="button"
                  className="mt-4 flex w-full items-center justify-between rounded-xl border border-white/40 bg-white/32 px-4 py-3 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] transition-colors hover:bg-white/42"
                  onClick={() =>
                    setState((s) => ({ ...s, notifications: !s.notifications }))
                  }
                >
                  <div className="text-left">
                    <div
                      className="font-body text-sm font-semibold"
                      style={{ color: colors.onSurface }}
                    >
                      Nearby alerts
                    </div>
                    <div
                      className="mt-0.5 font-body text-xs"
                      style={{ color: colors.onSurfaceVariant }}
                    >
                      {state.notifications ? "Enabled" : "Disabled"}
                    </div>
                  </div>
                  <span
                    aria-hidden
                    className="inline-flex items-center px-3 py-1 font-body text-xs font-semibold"
                    style={{
                      background: state.notifications
                        ? colors.tertiaryContainer
                        : colors.surfaceContainerHighest,
                      color: state.notifications ? colors.onPrimary : colors.onSurfaceVariant,
                      borderRadius: radius.full,
                    }}
                  >
                    {state.notifications ? "On" : "Off"}
                  </span>
                </button>

                <div className="mt-4 rounded-xl border border-white/35 bg-white/28 px-4 py-3 backdrop-blur-md">
                  <div className="font-body text-xs" style={{ color: colors.onSurfaceVariant }}>
                    Summary
                  </div>
                  <div className="mt-1 font-body text-sm" style={{ color: colors.onSurface }}>
                    {state.name || "—"} • {state.role.replace("-", " ")}
                  </div>
                  <div className="mt-0.5 font-body text-xs" style={{ color: colors.onSurfaceVariant }}>
                    {state.barangay ? `${state.barangay}, ` : ""}
                    {state.city || "—"}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-5 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="inline-flex w-full justify-center rounded-full border border-white/45 bg-white/38 py-3 font-body font-semibold text-bud-text shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] backdrop-blur-xl transition-colors hover:bg-white/48"
                onClick={() => {
                  if (step > 1) {
                    setStep((s) => (s > 1 ? ((s - 1) as 1 | 2) : s));
                    return;
                  }
                  onSkip?.();
                }}
              >
                Back
              </button>

              {step < 3 ? (
                <button
                  type="button"
                  className={`inline-flex w-full justify-center rounded-full bg-bud-primary py-3 font-headline font-extrabold text-white shadow-[0_2px_12px_rgba(28,26,23,0.07)] transition-[opacity,filter] hover:brightness-[1.03] disabled:pointer-events-none ${
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
                  className="inline-flex w-full justify-center rounded-full bg-bud-primary py-3 font-headline font-extrabold text-white shadow-[0_2px_12px_rgba(28,26,23,0.07)] transition-[filter] hover:brightness-[1.03]"
                  onClick={() => {
                    saveOnboardingProfile(state);
                    onComplete();
                  }}
                >
                  Finish
                </button>
              )}
            </div>

            {onSkip && step === 1 ? (
              <button
                type="button"
                className="inline-flex w-full justify-center rounded-full py-3 font-body font-semibold text-bud-text-muted transition-colors hover:text-bud-text"
                onClick={onSkip}
              >
                Skip for now
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
