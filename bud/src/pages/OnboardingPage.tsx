import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { colors, radius, shadows } from "../styles/tokens";

type OnboardingState = {
  name: string;
  barangay: string;
  city: string;
  role: "pet-parent" | "rescuer" | "barangay-staff";
  notifications: boolean;
};

function StepPill({ step, active }: { step: string; active: boolean }) {
  return (
    <span
      className="inline-flex items-center px-3 py-1 font-body text-xs font-semibold"
      style={{
        background: active ? colors.primary : colors.surfaceContainerHighest,
        color: active ? colors.onPrimary : colors.onSurfaceVariant,
        borderRadius: radius.full,
      }}
    >
      {step}
    </span>
  );
}

export function OnboardingPage() {
  const navigate = useNavigate();
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

  return (
    <div
      className="h-full min-h-0 overflow-y-auto px-5 pt-10 pb-10"
      style={{ background: colors.background }}
    >
      <div className="mx-auto w-full" style={{ maxWidth: 430 }}>
        <div className="text-center">
          <div
            className="inline-flex items-center justify-center px-4 py-2"
            style={{
              background: colors.surfaceContainerLow,
              borderRadius: radius.full,
              boxShadow: shadows.card,
            }}
          >
            <span
              className="font-headline text-sm font-extrabold"
              style={{ color: colors.onSurface }}
            >
              Setup
            </span>
          </div>

          <h1
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

        <div
          className="mt-7 px-5 py-5"
          style={{
            background: colors.surfaceCard,
            borderRadius: radius.xl,
            boxShadow: shadows.float,
          }}
        >
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
                    className="block mb-1 font-body text-sm font-semibold"
                    style={{ color: colors.onSurface }}
                  >
                    Display name
                  </span>
                  <input
                    type="text"
                    autoComplete="name"
                    className="w-full font-body px-4 py-3 outline-none"
                    style={{
                      background: colors.surfaceContainerHighest,
                      borderRadius: radius.xl,
                      color: colors.onSurface,
                    }}
                    placeholder="e.g., Sam"
                    value={state.name}
                    onChange={(e) =>
                      setState((s) => ({ ...s, name: e.target.value }))
                    }
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
                        id: "pet-parent",
                        title: "Pet parent",
                        desc: "Report and track your pet.",
                      },
                      {
                        id: "rescuer",
                        title: "Rescuer / Volunteer",
                        desc: "Help match sightings to reports.",
                      },
                      {
                        id: "barangay-staff",
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
                        className="text-left px-4 py-3"
                        style={{
                          background: active
                            ? colors.secondaryContainer
                            : colors.surfaceContainerLow,
                          borderRadius: radius.xl,
                          boxShadow: active ? shadows.card : undefined,
                          outline: active
                            ? `2px solid ${colors.outlineVariant}`
                            : "2px solid transparent",
                          transform: active ? "translateY(-1px)" : undefined,
                        }}
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
                            <span
                              className="shrink-0 inline-flex items-center gap-1 px-2 py-1 font-body text-xs font-semibold"
                              style={{
                                background: colors.primary,
                                color: colors.onPrimary,
                                borderRadius: radius.full,
                              }}
                            >
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                aria-hidden
                              >
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
                        {/* (desc rendered above) */}
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
                    className="block mb-1 font-body text-sm font-semibold"
                    style={{ color: colors.onSurface }}
                  >
                    City / Municipality
                  </span>
                  <input
                    type="text"
                    className="w-full font-body px-4 py-3 outline-none"
                    style={{
                      background: colors.surfaceContainerHighest,
                      borderRadius: radius.xl,
                      color: colors.onSurface,
                    }}
                    placeholder="e.g., San Fernando"
                    value={state.city}
                    onChange={(e) =>
                      setState((s) => ({ ...s, city: e.target.value }))
                    }
                  />
                </label>

                <label className="block">
                  <span
                    className="block mb-1 font-body text-sm font-semibold"
                    style={{ color: colors.onSurface }}
                  >
                    Barangay (optional)
                  </span>
                  <input
                    type="text"
                    className="w-full font-body px-4 py-3 outline-none"
                    style={{
                      background: colors.surfaceContainerHighest,
                      borderRadius: radius.xl,
                      color: colors.onSurface,
                    }}
                    placeholder="e.g., Dolores"
                    value={state.barangay}
                    onChange={(e) =>
                      setState((s) => ({ ...s, barangay: e.target.value }))
                    }
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
                className="mt-4 w-full flex items-center justify-between px-4 py-3"
                style={{
                  background: colors.surfaceContainerLow,
                  borderRadius: radius.xl,
                }}
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

              <div
                className="mt-4 px-4 py-3"
                style={{
                  background: colors.surfaceContainerHighest,
                  borderRadius: radius.xl,
                }}
              >
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

        <div className="mt-5 flex items-center gap-3">
          <button
            type="button"
            className="inline-flex w-full justify-center font-body font-semibold py-3"
            style={{
              background: colors.surfaceContainerLow,
              color: colors.onSurface,
              borderRadius: radius.full,
            }}
            onClick={() => {
              if (step > 1) {
                setStep((s) => (s > 1 ? ((s - 1) as 1 | 2) : s));
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
              className="inline-flex w-full justify-center font-headline font-extrabold py-3"
              style={{
                background: canContinue ? colors.primary : colors.primaryContainer,
                color: colors.onPrimary,
                borderRadius: radius.full,
                boxShadow: shadows.card,
                opacity: canContinue ? 1 : 0.55,
              }}
              disabled={!canContinue}
              onClick={() => setStep((s) => (s < 3 ? ((s + 1) as 2 | 3) : s))}
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              className="inline-flex w-full justify-center font-headline font-extrabold py-3"
              style={{
                background: colors.primary,
                color: colors.onPrimary,
                borderRadius: radius.full,
                boxShadow: shadows.card,
              }}
              onClick={() => {
                // Demo: store locally so we can use later
                window.localStorage.setItem("bud.onboarding", JSON.stringify(state));
                navigate("/app");
              }}
            >
              Finish
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

