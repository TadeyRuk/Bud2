import { Link } from "react-router-dom";
import { PageCanvas } from "../components/PageCanvas";
import { BudLogoMark } from "../components/BudLogoMark";
import { colors, radius, shadows } from "../styles/tokens";

export function WelcomePage() {
  return (
    <PageCanvas>
      <div className="flex min-h-0 flex-1 flex-col justify-between px-6 pb-10 pt-12">
        <div className="mx-auto w-full max-w-[430px] text-center">
          <div className="flex justify-center">
            <BudLogoMark variant="marketing" />
          </div>
          <p className="mt-6 font-headline text-2xl font-extrabold leading-tight" style={{ color: colors.onSurface }}>
            Welcome to Bud
          </p>
          <p className="mt-2 font-body text-sm leading-relaxed" style={{ color: colors.onSurfaceVariant }}>
            Pick how you&apos;d like to continue. You can always sign in later from the app.
          </p>
        </div>

        <div className="mx-auto mt-8 w-full max-w-[430px] space-y-4">
          <Link
            to="/landing"
            className="flex w-full items-center justify-center rounded-full bg-bud-primary py-4 font-headline text-base font-extrabold text-white transition-transform active:scale-[0.98] motion-safe:hover:brightness-[1.04]"
            style={{
              boxShadow: `${shadows.float}, inset 0 1px 0 rgba(255,255,255,0.22), 0 14px 36px rgba(139,58,21,0.28)`,
            }}
          >
            Continue as guest
          </Link>
          <p className="text-center font-body text-[11px]" style={{ color: colors.onSurfaceVariant }}>
            Guests go to Report · Match · Reunite and can set up in a few taps.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <Link
              to="/signin"
              className="inline-flex min-h-[52px] items-center justify-center rounded-full border-2 font-body text-sm font-semibold transition-colors active:scale-[0.98]"
              style={{
                borderColor: colors.tertiary,
                color: colors.tertiary,
                background: colors.surfaceCard,
                borderRadius: radius.full,
              }}
            >
              Sign in
            </Link>
            <Link
              to="/signup"
              className="inline-flex min-h-[52px] items-center justify-center rounded-full border-2 border-bud-text/[0.12] bg-white/80 font-body text-sm font-semibold text-bud-text shadow-sm transition-colors active:scale-[0.98] motion-safe:hover:bg-white"
              style={{ borderRadius: radius.full }}
            >
              Sign up
            </Link>
          </div>
        </div>

        <p className="mx-auto mt-10 max-w-[320px] text-center font-body text-xs leading-snug" style={{ color: colors.onSurfaceVariant }}>
          <span style={{ color: colors.tertiary }} className="font-semibold">
            Sign in
          </span>{" "}
          saves reports to your account.{" "}
          <span style={{ color: colors.primary }} className="font-semibold">
            Guest
          </span>{" "}
          still gets the full neighbor experience offline-first.
        </p>
      </div>
    </PageCanvas>
  );
}
