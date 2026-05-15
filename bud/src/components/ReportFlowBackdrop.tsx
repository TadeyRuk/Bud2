import { colors } from "../styles/tokens";

/**
 * Layered mesh + grid for the report wizard — readable, on-brand, no pointer tracking.
 */
export function ReportFlowBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
      <div
        className="absolute inset-0 opacity-90"
        style={{
          background: `
            radial-gradient(ellipse 85% 55% at 15% 20%, ${colors.primary}14, transparent 55%),
            radial-gradient(ellipse 70% 50% at 92% 18%, ${colors.tertiary}12, transparent 50%),
            radial-gradient(ellipse 110% 80% at 50% 100%, ${colors.surfaceContainerHighest}99, transparent 55%),
            linear-gradient(175deg, ${colors.background} 0%, ${colors.surfaceContainerLow} 45%, ${colors.background} 100%)
          `,
        }}
      />
      <div
        className="bud-report-flow-drift absolute -left-[20%] top-[10%] h-[70%] w-[70%] rounded-full blur-3xl"
        style={{ background: `${colors.primary}0d` }}
      />
      <div
        className="bud-report-flow-drift-reverse absolute -right-[25%] bottom-[5%] h-[55%] w-[60%] rounded-full blur-3xl opacity-80"
        style={{ background: `${colors.tertiary}0c` }}
      />
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `linear-gradient(${colors.onSurface}08 1px, transparent 1px), linear-gradient(90deg, ${colors.onSurface}06 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
          maskImage: "linear-gradient(to bottom, black 0%, black 55%, transparent 100%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, ${colors.onSurface} 1px, transparent 0)`,
          backgroundSize: "24px 24px",
        }}
      />
    </div>
  );
}
