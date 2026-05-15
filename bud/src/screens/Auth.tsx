import { useEffect, useState } from "react";
import { useAuthStore } from "../stores/authStore";
import toast from "react-hot-toast";

type AuthScreenProps = {
  onClose: () => void;
  /** When set, called after a successful sign-in/up instead of `onClose`. */
  onSuccess?: () => void;
  initialMode?: "signin" | "signup";
  variant?: "overlay" | "page";
};

export function AuthScreen({
  onClose,
  onSuccess,
  initialMode = "signin",
  variant = "overlay",
}: AuthScreenProps) {
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");

  const { signIn, signUp, loading } = useAuthStore();

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    if (mode === "signup" && !displayName) {
      toast.error("Please enter your name");
      return;
    }

    const result =
      mode === "signin"
        ? await signIn(email, password)
        : await signUp(email, password, displayName);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(mode === "signin" ? "Welcome back!" : "Account created! Check your email to confirm.");
      if (onSuccess) onSuccess();
      else onClose();
    }
  }

  const rootClass =
    variant === "overlay"
      ? "absolute inset-0 z-[60] flex flex-col bg-bud-bg"
      : "flex min-h-0 flex-1 flex-col bg-transparent";

  return (
    <div className={rootClass}>
      <header className="flex shrink-0 items-center justify-between px-4 pb-2 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-2 text-bud-text-muted transition-colors hover:bg-bud-surface-low"
          aria-label={variant === "page" ? "Back" : "Close"}
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-8 pt-4">
        <div className="mb-8 border-l-[6px] border-bud-primary pl-3">
          <h1 className="whitespace-pre-line font-headline text-3xl font-black leading-tight tracking-tight text-bud-text">
            {mode === "signin" ? "Welcome\nBack." : "Join the\nCommunity."}
          </h1>
          <p className="mt-3 max-w-[300px] font-body text-sm text-bud-text-muted">
            {mode === "signin"
              ? "Sign in to report pets, share sightings, and help reunite families."
              : "Create an account to start helping your community find lost pets."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {mode === "signup" && (
            <div>
              <label
                htmlFor="auth-name"
                className="font-body text-xs font-semibold uppercase tracking-wide text-bud-text"
              >
                Your Name
              </label>
              <input
                id="auth-name"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Alex Rivera"
                className="mt-2 w-full rounded-lg bg-bud-surface-well px-3 py-3 font-body text-sm text-bud-text outline-none placeholder:text-bud-text-muted/60 focus:ring-2 focus:ring-bud-primary/30"
              />
            </div>
          )}

          <div>
            <label
              htmlFor="auth-email"
              className="font-body text-xs font-semibold uppercase tracking-wide text-bud-text"
            >
              Email
            </label>
            <input
              id="auth-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-2 w-full rounded-lg bg-bud-surface-well px-3 py-3 font-body text-sm text-bud-text outline-none placeholder:text-bud-text-muted/60 focus:ring-2 focus:ring-bud-primary/30"
            />
          </div>

          <div>
            <label
              htmlFor="auth-password"
              className="font-body text-xs font-semibold uppercase tracking-wide text-bud-text"
            >
              Password
            </label>
            <input
              id="auth-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-2 w-full rounded-lg bg-bud-surface-well px-3 py-3 font-body text-sm text-bud-text outline-none placeholder:text-bud-text-muted/60 focus:ring-2 focus:ring-bud-primary/30"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="shadow-ambient w-full rounded-xl bg-bud-primary py-4 font-body text-sm font-bold uppercase tracking-widest text-white transition-transform active:scale-[0.99] disabled:opacity-60"
          >
            {loading ? "Please wait…" : mode === "signin" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center font-body text-sm text-bud-text-muted">
          {mode === "signin" ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="font-semibold text-bud-accent"
          >
            {mode === "signin" ? "Sign Up" : "Sign In"}
          </button>
        </p>
      </div>
    </div>
  );
}
