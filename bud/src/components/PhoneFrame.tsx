import type { ReactNode } from "react";

type PhoneFrameProps = {
  children: ReactNode;
};

export function PhoneFrame({ children }: PhoneFrameProps) {
  return (
    <div className="min-h-screen bg-[#111] flex items-center justify-center p-6">
      <div
        className="relative w-[390px] h-[844px] shrink-0 rounded-[40px] overflow-hidden shadow-phone bg-bud-bg flex flex-col"
        role="presentation"
      >
        {children}
      </div>
    </div>
  );
}
