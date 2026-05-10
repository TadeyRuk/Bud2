import type { ReactNode } from "react";

type PhoneFrameProps = {
  children: ReactNode;
};

export function PhoneFrame({ children }: PhoneFrameProps) {
  return (
    <div className="min-h-dvh bg-[#111] flex items-stretch justify-center sm:items-center p-0 sm:p-4 md:p-6">
      <div
        className="relative flex h-dvh w-full max-h-none flex-col overflow-hidden bg-bud-bg shadow-phone sm:h-[min(844px,calc(100dvh-2rem))] sm:max-h-[844px] sm:w-full sm:max-w-[430px] sm:rounded-[40px] sm:ring-1 sm:ring-white/10"
        role="presentation"
      >
        {children}
      </div>
    </div>
  );
}
