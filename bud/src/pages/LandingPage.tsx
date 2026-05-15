import { useMemo } from "react";
import { Link } from "react-router-dom";
import { PageCanvas } from "../components/PageCanvas";
import { BudLogoMark } from "../components/BudLogoMark";
import { colors, radius, shadows } from "../styles/tokens";

function FeaturePill({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-black/10 bg-black/[0.08] px-3 py-1 font-body text-xs font-medium">
      {label}
    </span>
  );
}

export function LandingPage() {
  const styleText = useMemo(
    () => `
@keyframes bud-float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}
@keyframes bud-fade-up {
  0% { opacity: 0; transform: translateY(10px); }
  100% { opacity: 1; transform: translateY(0); }
}
@keyframes bud-sheen {
  0% { transform: translateX(-60%); opacity: 0; }
  15% { opacity: 0.22; }
  55% { opacity: 0.18; }
  100% { transform: translateX(160%); opacity: 0; }
}
`,
    []
  );

  return (
    <PageCanvas>
      <div className="h-full min-h-0 px-5 pt-10 pb-10">
      <style>{styleText}</style>

      <div className="mx-auto w-full" style={{ maxWidth: 430 }}>
        <div style={{ animation: "bud-fade-up 520ms ease-out both" }}>
          <div className="flex justify-center">
            <BudLogoMark variant="marketing" />
          </div>
          <p
            className="mt-4 text-center font-body text-sm font-semibold"
            style={{ color: colors.onSurfaceVariant }}
          >
            Find lost pets faster, together.
          </p>
        </div>

        <div className="mt-8">
          <div
            className="relative overflow-hidden px-5 py-5"
            style={{
              background: colors.surfaceCard,
              borderRadius: radius.xl,
              boxShadow: shadows.float,
              animation: "bud-fade-up 560ms ease-out 90ms both",
            }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              aria-hidden
              style={{
                background: `linear-gradient(90deg, transparent, ${colors.outlineVariant}, transparent)`,
                width: "45%",
                transform: "translateX(-60%)",
                opacity: 0,
                animation: "bud-sheen 2.8s ease-in-out 900ms infinite",
              }}
            />

            <h1
              className="font-headline text-[30px] leading-tight font-extrabold"
              style={{ color: colors.onSurface }}
            >
              Report. Match. Reunite.
            </h1>
            <p className="mt-2 font-body" style={{ color: colors.onSurfaceVariant }}>
              Post a report, scan nearby sightings, and share to your community—
              all in one warm, simple flow.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <FeaturePill label="Lost / Found badges" />
              <FeaturePill label="Barangay-friendly" />
              <FeaturePill label="Map sightings" />
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <div
            className="px-4 py-4"
            style={{
              background: colors.surfaceContainerLow,
              borderRadius: radius.xl,
              animation: "bud-fade-up 560ms ease-out 180ms both",
            }}
          >
            <div
              className="h-10 w-10 grid place-items-center"
              style={{
                borderRadius: radius.lg,
                background: colors.surfaceContainerHighest,
                color: colors.tertiary,
              }}
              aria-hidden
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 21s7-4.35 7-11a7 7 0 10-14 0c0 6.65 7 11 7 11z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <path
                  d="M12 13.2a3.2 3.2 0 100-6.4 3.2 3.2 0 000 6.4z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
              </svg>
            </div>
            <div className="mt-2 font-body text-sm font-semibold" style={{ color: colors.onSurface }}>
              Nearby
            </div>
            <div className="mt-1 font-body text-xs" style={{ color: colors.onSurfaceVariant }}>
              See sightings around you.
            </div>
          </div>

          <div
            className="px-4 py-4"
            style={{
              background: colors.surfaceContainerLow,
              borderRadius: radius.xl,
              animation: "bud-fade-up 560ms ease-out 230ms both",
            }}
          >
            <div
              className="h-10 w-10 grid place-items-center"
              style={{
                borderRadius: radius.lg,
                background: colors.surfaceContainerHighest,
                color: colors.primary,
              }}
              aria-hidden
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 8v8m-4-4h8"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <path
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
              </svg>
            </div>
            <div className="mt-2 font-body text-sm font-semibold" style={{ color: colors.onSurface }}>
              Report
            </div>
            <div className="mt-1 font-body text-xs" style={{ color: colors.onSurfaceVariant }}>
              Create a post in seconds.
            </div>
          </div>
        </div>

        <div
          className="mt-7 px-5 py-5"
          style={{
            background: colors.surfaceCard,
            borderRadius: radius.xl,
            boxShadow: shadows.card,
            animation: "bud-fade-up 560ms ease-out 280ms both",
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div
                className="font-body text-sm font-semibold"
                style={{ color: colors.onSurface }}
              >
                Ready to set up?
              </div>
              <div
                className="mt-1 font-body text-xs"
                style={{ color: colors.onSurfaceVariant }}
              >
                A quick 3-step onboarding and you&apos;re in.
              </div>
            </div>
            <div
              aria-hidden
              className="shrink-0"
              style={{
                width: 70,
                height: 70,
                borderRadius: radius.full,
                background: colors.surfaceContainerHighest,
                animation: "bud-float 3.6s ease-in-out infinite",
                boxShadow: shadows.card,
                display: "grid",
                placeItems: "center",
                color: colors.primary,
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path
                  d="M3 12h18"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <path
                  d="M15 6l6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          <Link
            to="/onboarding"
            className="mt-4 inline-flex h-14 w-full items-center justify-center rounded-full bg-bud-primary font-headline text-base font-extrabold text-white shadow-md transition-transform active:scale-95"
          >
            Get Started
          </Link>

          <Link
            to="/app"
            className="mt-3 inline-flex h-12 w-full items-center justify-center rounded-full bg-black/5 font-body text-sm font-semibold text-current transition-colors hover:bg-black/10"
          >
            Skip for now
          </Link>
        </div>
      </div>
      </div>
    </PageCanvas>
  );
}

