import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageCanvas } from "../components/PageCanvas";
import { BudLogoMark } from "../components/BudLogoMark";
import { SplashPetFloaters } from "../components/SplashPetFloaters";

export function SplashPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const id = window.setTimeout(() => navigate("/landing", { replace: true }), 1400);
    return () => window.clearTimeout(id);
  }, [navigate]);

  return (
    <PageCanvas scroll={false}>
      <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center px-5 py-10">
        <span className="sr-only">Bud is loading</span>

        <div className="relative mx-auto flex w-full max-w-[min(100%,380px)] flex-col items-center px-2">
          <SplashPetFloaters />
          <div className="relative z-[1] bud-splash-lockup-reveal flex flex-col items-center">
            <BudLogoMark variant="splash" className="max-w-[min(100%,340px)] justify-center" />
          </div>
        </div>

        <div className="bud-splash-title mt-5 text-center">
          <p className="font-body text-xs font-semibold tracking-wide text-bud-text-muted sm:text-sm">
            Lost pet finder · neighbors helping neighbors
          </p>
        </div>
      </div>
    </PageCanvas>
  );
}
