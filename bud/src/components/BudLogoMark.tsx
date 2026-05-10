import type { ReactNode } from "react";

/** Single source for Bud glyph path — matches app shell header */
export const BUD_GLYPH_PATH =
  "M12 2c-1.5 0-2.8.4-3.9 1.1A4.5 4.5 0 005 3.5C3.5 3.5 2 5 2 7v1c0 3.5 3 7 4 8s2.5 2 6 2 5-1 6-2 4-4.5 4-8V7c0-2-1.5-3.5-3-3.5-.6 0-1.2.2-1.7.6A6.3 6.3 0 0012 2zm-1 5.5c.8 0 1.5.7 1.5 1.5S11.8 10.5 11 10.5 9.5 9.8 9.5 9s.7-1.5 1.5-1.5zm3 0c.8 0 1.5.7 1.5 1.5S15.8 10.5 15 10.5 13.5 9.8 13.5 9s.7-1.5 1.5-1.5z";

type BudLogoMarkProps = {
  variant?: "header" | "splash" | "marketing";
  className?: string;
  trailing?: ReactNode;
};

const variantClass = {
  header: { glyph: "h-8 w-8", wordmark: "text-2xl leading-none" },
  splash: {
    glyph: "h-[5rem] w-[5rem] sm:h-[5.5rem] sm:w-[5.5rem]",
    wordmark: "text-[3.1rem] leading-none sm:text-[3.45rem]",
  },
  marketing: { glyph: "h-10 w-10", wordmark: "text-[34px] leading-none" },
} as const;

export function BudLogoMark({ variant = "header", className = "", trailing }: BudLogoMarkProps) {
  const v = variantClass[variant];

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span className={`shrink-0 text-bud-primary ${v.glyph}`} aria-hidden>
        <svg className="h-full w-full" viewBox="0 0 24 24" fill="currentColor">
          <path d={BUD_GLYPH_PATH} />
        </svg>
      </span>
      <span className={`font-headline font-extrabold tracking-tight text-bud-text ${v.wordmark}`}>Bud</span>
      {trailing}
    </span>
  );
}
