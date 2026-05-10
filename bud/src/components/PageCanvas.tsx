import type { ReactNode } from "react";
import { colors } from "../styles/tokens";

type PageCanvasProps = {
  children: ReactNode;
  /** When false, inner content does not scroll (parent handles layout). */
  scroll?: boolean;
};

export function PageCanvas({ children, scroll = true }: PageCanvasProps) {
  const gradient = `linear-gradient(165deg, ${colors.surfaceContainerLow} 0%, ${colors.background} 48%, ${colors.outlineVariant}33 100%)`;

  return (
    <div className="relative h-full min-h-0 w-full flex flex-col">
      <div className="pointer-events-none absolute inset-0 z-0" style={{ background: gradient }} aria-hidden />
      <div className="bud-motif-bg pointer-events-none absolute inset-0 z-0 opacity-[0.055]" aria-hidden />
      <div
        className={`relative z-10 flex min-h-0 flex-1 flex-col ${scroll ? "overflow-y-auto overflow-x-hidden" : "overflow-hidden"}`}
      >
        {children}
      </div>
    </div>
  );
}
