import { useEffect, useRef, type CSSProperties, type RefObject } from "react";
import { colors } from "../styles/tokens";

type CursorReactiveBackdropProps = {
  boundsRef: RefObject<HTMLElement | null>;
  className?: string;
};

/**
 * Soft radial wash that follows the pointer (respects reduced motion).
 */
export function CursorReactiveBackdrop({ boundsRef, className = "" }: CursorReactiveBackdropProps) {
  const layerRef = useRef<HTMLDivElement>(null);
  const target = useRef({ x: 50, y: 42 });
  const current = useRef({ x: 50, y: 42 });
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const el = boundsRef.current;
    const layer = layerRef.current;
    if (!el || !layer) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      layer.style.setProperty("--mx", "52%");
      layer.style.setProperty("--my", "38%");
      return;
    }

    function tick() {
      raf.current = null;
      const L = layerRef.current;
      if (!L) return;
      const cx = current.current.x;
      const cy = current.current.y;
      const tx = target.current.x;
      const ty = target.current.y;
      const nx = cx + (tx - cx) * 0.08;
      const ny = cy + (ty - cy) * 0.08;
      current.current = { x: nx, y: ny };
      L.style.setProperty("--mx", `${nx}%`);
      L.style.setProperty("--my", `${ny}%`);
      if (Math.abs(tx - nx) > 0.15 || Math.abs(ty - ny) > 0.12) {
        raf.current = requestAnimationFrame(tick);
      }
    }

    function queueTick() {
      if (raf.current === null) raf.current = requestAnimationFrame(tick);
    }

    function onMove(e: PointerEvent) {
      const root = boundsRef.current;
      if (!root) return;
      const r = root.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) return;
      target.current = {
        x: ((e.clientX - r.left) / r.width) * 100,
        y: ((e.clientY - r.top) / r.height) * 100,
      };
      queueTick();
    }

    function onLeave() {
      target.current = { x: 50, y: 42 };
      queueTick();
    }

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      if (raf.current !== null) cancelAnimationFrame(raf.current);
    };
  }, [boundsRef]);

  return (
    <div
      ref={layerRef}
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden
      style={
        {
          "--mx": "50%",
          "--my": "42%",
          background: `
            radial-gradient(
              120% 90% at var(--mx) var(--my),
              ${colors.primary}22,
              transparent 52%
            ),
            radial-gradient(
              80% 70% at calc(var(--mx) * 0.85 + 12%) calc(var(--my) * 0.9 + 5%),
              ${colors.tertiary}18,
              transparent 48%
            ),
            radial-gradient(
              ellipse 140% 88% at 50% 108%,
              ${colors.outlineVariant}55,
              ${colors.background} 52%
            ),
            linear-gradient(168deg, ${colors.surfaceContainerLow} 0%, ${colors.background} 46%, ${colors.surfaceContainerHighest}ee 100%)
          `,
        } as CSSProperties
      }
    />
  );
}
