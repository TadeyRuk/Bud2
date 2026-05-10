import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageCanvas } from "../components/PageCanvas";
import { colors, radius, shadows } from "../styles/tokens";

function BudGlyph() {
  return (
    <span aria-hidden style={{ color: colors.primary }}>
      <svg className="w-14 h-14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2c-1.5 0-2.8.4-3.9 1.1A4.5 4.5 0 005 3.5C3.5 3.5 2 5 2 7v1c0 3.5 3 7 4 8s2.5 2 6 2 5-1 6-2 4-4.5 4-8V7c0-2-1.5-3.5-3-3.5-.6 0-1.2.2-1.7.6A6.3 6.3 0 0012 2zm-1 5.5c.8 0 1.5.7 1.5 1.5S11.8 10.5 11 10.5 9.5 9.8 9.5 9s.7-1.5 1.5-1.5zm3 0c.8 0 1.5.7 1.5 1.5S15.8 10.5 15 10.5 13.5 9.8 13.5 9s.7-1.5 1.5-1.5z" />
      </svg>
    </span>
  );
}

export function SplashPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const id = window.setTimeout(() => navigate("/landing", { replace: true }), 1400);
    return () => window.clearTimeout(id);
  }, [navigate]);

  return (
    <PageCanvas>
      <div className="mx-auto flex h-full min-h-0 w-full flex-col items-center justify-center px-5 py-10" style={{ maxWidth: 430 }}>
        <div
          className="bud-splash-logo-wrap relative grid place-items-center"
          style={{
            width: 160,
            height: 160,
            borderRadius: radius.full,
            background: colors.surfaceCard,
            boxShadow: shadows.float,
          }}
        >
          <div
            aria-hidden
            className="bud-splash-ring-pulse absolute inset-[10px]"
            style={{
              borderRadius: radius.full,
              boxShadow: `inset 0 0 0 2px ${colors.primary}22`,
            }}
          />
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              borderRadius: radius.full,
              background: `radial-gradient(circle at 32% 28%, ${colors.outlineVariant}, transparent 52%)`,
              opacity: 0.2,
            }}
          />
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              borderRadius: radius.full,
              background: `radial-gradient(circle at 50% 58%, ${colors.tertiaryContainer}, transparent 58%)`,
              opacity: 0.35,
            }}
          />
          <BudGlyph />
        </div>

        <div className="bud-splash-title mt-7 text-center">
          <div className="font-headline text-4xl font-extrabold tracking-tight" style={{ color: colors.onSurface }}>
            Bud
          </div>
          <div className="mt-2 font-body text-sm font-semibold" style={{ color: colors.onSurfaceVariant }}>
            Lost pet finder
          </div>
        </div>

        <div
          className="mt-8 relative overflow-hidden"
          style={{
            width: 190,
            height: 10,
            borderRadius: radius.full,
            background: colors.surfaceContainerHighest,
            boxShadow: shadows.card,
          }}
          aria-label="Loading"
        >
          <div
            aria-hidden
            className="bud-splash-progress-shimmer absolute inset-y-0"
            style={{
              width: "40%",
              borderRadius: radius.full,
              background: `linear-gradient(90deg, transparent, ${colors.primary}, transparent)`,
              transform: "translateX(-65%)",
              opacity: 0.92,
            }}
          />
        </div>
      </div>
    </PageCanvas>
  );
}
