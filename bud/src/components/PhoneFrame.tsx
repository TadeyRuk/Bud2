import type { ReactNode } from "react";
import { AppBubbleBackground } from "./AppBubbleBackground";

type PhoneFrameProps = {
  children: ReactNode;
};

export function PhoneFrame({ children }: PhoneFrameProps) {
  return (
    <div className="flex min-h-dvh items-stretch justify-center bg-[#111] p-0 sm:items-center sm:p-4 md:p-6">
      <div
        id="bud-phone-overlay-portal"
        className="relative flex h-dvh w-full max-h-none flex-col overflow-hidden shadow-phone sm:h-[min(844px,calc(100dvh-2rem))] sm:max-h-[844px] sm:w-full sm:max-w-[430px] sm:rounded-[40px] sm:ring-1 sm:ring-white/10"
        role="presentation"
      >
        <AppBubbleBackground />
        <div
          id="bud-shell-mount"
          className="relative z-10 flex min-h-0 flex-1 flex-col"
        >
          {children}
        </div>
      </div>
    </div>
  );
}
