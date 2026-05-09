import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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

  const styleText = useMemo(
    () => `
@keyframes bud-pop {
  0% { opacity: 0; transform: scale(0.92); filter: blur(2px); }
  60% { opacity: 1; transform: scale(1.02); filter: blur(0px); }
  100% { opacity: 1; transform: scale(1); }
}
@keyframes bud-glow {
  0%,100% { opacity: 0.10; transform: scale(0.96); }
  50% { opacity: 0.22; transform: scale(1.04); }
}
@keyframes bud-orbit {
  0% { transform: rotate(0deg) translateX(38px) rotate(0deg); opacity: 0.0; }
  10% { opacity: 0.7; }
  100% { transform: rotate(360deg) translateX(38px) rotate(-360deg); opacity: 0.0; }
}
@keyframes bud-progress {
  0% { transform: translateX(-65%); }
  100% { transform: translateX(165%); }
}
`,
    []
  );

  return (
    <div className="h-full min-h-0 px-5 py-10" style={{ background: colors.background }}>
      <style>{styleText}</style>

      <div
        className="mx-auto w-full h-full min-h-0 flex flex-col items-center justify-center"
        style={{ maxWidth: 430 }}
      >
        <div
          className="relative grid place-items-center"
          style={{
            width: 160,
            height: 160,
            borderRadius: radius.full,
            background: colors.surfaceCard,
            boxShadow: shadows.float,
            animation: "bud-pop 520ms ease-out both",
          }}
        >
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              borderRadius: radius.full,
              background: `radial-gradient(circle at 30% 25%, ${colors.outlineVariant}, transparent 55%)`,
              opacity: 0.22,
            }}
          />
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              borderRadius: radius.full,
              background: `radial-gradient(circle at 50% 55%, ${colors.tertiaryContainer}, transparent 58%)`,
              animation: "bud-glow 2.2s ease-in-out infinite",
            }}
          />

          <BudGlyph />

          <span
            aria-hidden
            className="absolute"
            style={{
              width: 10,
              height: 10,
              borderRadius: radius.full,
              background: colors.primary,
              boxShadow: shadows.card,
              animation: "bud-orbit 1.15s ease-in-out infinite",
            }}
          />
          <span
            aria-hidden
            className="absolute"
            style={{
              width: 8,
              height: 8,
              borderRadius: radius.full,
              background: colors.tertiary,
              boxShadow: shadows.card,
              animation: "bud-orbit 1.25s ease-in-out 120ms infinite",
            }}
          />
        </div>

        <div className="mt-7 text-center" style={{ animation: "bud-pop 650ms ease-out 120ms both" }}>
          <div
            className="font-headline text-4xl font-extrabold tracking-tight"
            style={{ color: colors.onSurface }}
          >
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
            className="absolute inset-y-0"
            style={{
              width: "40%",
              borderRadius: radius.full,
              background: `linear-gradient(90deg, transparent, ${colors.primary}, transparent)`,
              transform: "translateX(-65%)",
              animation: "bud-progress 1.1s ease-in-out infinite",
              opacity: 0.9,
            }}
          />
        </div>
      </div>
    </div>
  );
}

