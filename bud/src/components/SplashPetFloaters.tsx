import type { ReactNode } from "react";

/**
 * Decorative pet-themed glyphs around the splash logo — low contrast, gentle motion.
 */
const paw = (
  <svg viewBox="0 0 24 24" className="h-full w-full" fill="currentColor" aria-hidden>
    <ellipse cx="12" cy="17.2" rx="4.8" ry="3.4" />
    <circle cx="8.4" cy="11.2" r="2.35" />
    <circle cx="12.1" cy="9" r="2.35" />
    <circle cx="15.7" cy="11.2" r="2.35" />
    <circle cx="11.2" cy="7.4" r="2.05" />
  </svg>
);

const heart = (
  <svg viewBox="0 0 24 24" className="h-full w-full" fill="currentColor" aria-hidden>
    <path d="M12 20s-7.2-4.35-9.6-8.4C.35 8.55 2.1 5 5.25 5c1.65 0 3.15.9 3.9 2.25C10.05 5.9 11.55 5 13.2 5 16.35 5 18.1 8.55 16.6 11.6 14.2 15.65 12 20 12 20z" />
  </svg>
);

const fish = (
  <svg viewBox="0 0 24 24" className="h-full w-full" fill="currentColor" aria-hidden>
    <ellipse cx="11.2" cy="12" rx="5.5" ry="3.6" />
    <path d="M17 12l3.2 2.4v-4.8L17 12z" />
    <circle cx="8.6" cy="11.2" r="1.15" fill="#fcf9f5" opacity="0.92" />
  </svg>
);

const FLOATERS: Array<{
  top: string;
  left?: string;
  right?: string;
  size: string;
  anim: "a" | "b" | "c";
  delay: string;
  glyph: ReactNode;
  tone: string;
}> = [
  { top: "14%", left: "10%", size: "h-9 w-9", anim: "a", delay: "0s", glyph: paw, tone: "text-bud-primary/[0.42]" },
  { top: "22%", right: "12%", size: "h-8 w-8", anim: "b", delay: "-0.6s", glyph: heart, tone: "text-bud-accent/[0.38]" },
  { top: "42%", left: "6%", size: "h-7 w-7", anim: "c", delay: "-1.1s", glyph: fish, tone: "text-bud-primary/[0.34]" },
  { top: "48%", right: "8%", size: "h-10 w-10", anim: "a", delay: "-2s", glyph: paw, tone: "text-bud-accent/[0.32]" },
  { top: "68%", left: "14%", size: "h-8 w-8", anim: "b", delay: "-1.4s", glyph: heart, tone: "text-bud-primary/[0.36]" },
  { top: "72%", right: "18%", size: "h-7 w-7", anim: "c", delay: "-0.3s", glyph: paw, tone: "text-bud-accent/[0.36]" },
];

export function SplashPetFloaters() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {FLOATERS.map((f, i) => (
        <span
          key={i}
          className={`bud-splash-float-decor absolute ${f.size} ${f.tone} bud-splash-float-${f.anim}`}
          style={{
            top: f.top,
            left: f.left,
            right: f.right,
            animationDelay: f.delay,
          }}
        >
          {f.glyph}
        </span>
      ))}
    </div>
  );
}
