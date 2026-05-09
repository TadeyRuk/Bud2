import { useState } from "react";
import { useAuthStore } from "../stores/authStore";
import toast from "react-hot-toast";

type AuthScreenProps = {
  onClose: () => void;
};

export function AuthScreen({ onClose }: AuthScreenProps) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");

  const { signIn, signUp, loading } = useAuthStore();

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
      onClose();
    }
  }

  return (
    <div className="absolute inset-0 z-[60] bg-bud-bg flex flex-col">
      <header className="shrink-0 flex items-center justify-between px-4 pt-4 pb-2">
        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-full text-bud-text-muted hover:bg-bud-surface-low transition-colors"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-8">
        <div className="pl-3 border-l-[6px] border-bud-primary mb-8">
          <h1 className="font-headline text-3xl font-black tracking-tight text-bud-text leading-tight">
            {mode === "signin" ? "Welcome\nBack." : "Join the\nCommunity."}
          </h1>
          <p className="font-body text-bud-text-muted text-sm mt-3 max-w-[300px]">
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
                className="font-body text-xs font-semibold text-bud-text uppercase tracking-wide"
              >
                Your Name
              </label>
              <input
                id="auth-name"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Alex Rivera"
                className="mt-2 w-full rounded-lg bg-bud-surface-well px-3 py-3 font-body text-bud-text text-sm placeholder:text-bud-text-muted/60 outline-none focus:ring-2 focus:ring-bud-primary/30"
              />
            </div>
          )}

          <div>
            <label
              htmlFor="auth-email"
              className="font-body text-xs font-semibold text-bud-text uppercase tracking-wide"
            >
              Email
            </label>
            <input
              id="auth-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-2 w-full rounded-lg bg-bud-surface-well px-3 py-3 font-body text-bud-text text-sm placeholder:text-bud-text-muted/60 outline-none focus:ring-2 focus:ring-bud-primary/30"
            />
          </div>

          <div>
            <label
              htmlFor="auth-password"
              className="font-body text-xs font-semibold text-bud-text uppercase tracking-wide"
            >
              Password
            </label>
            <input
              id="auth-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-2 w-full rounded-lg bg-bud-surface-well px-3 py-3 font-body text-bud-text text-sm placeholder:text-bud-text-muted/60 outline-none focus:ring-2 focus:ring-bud-primary/30"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-bud-primary text-white font-body text-sm font-bold uppercase tracking-widest py-4 rounded-xl shadow-ambient active:scale-[0.99] transition-transform disabled:opacity-60"
          >
            {loading ? "Please wait…" : mode === "signin" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <p className="font-body text-sm text-bud-text-muted text-center mt-6">
          {mode === "signin" ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="text-bud-primary font-semibold"
          >
            {mode === "signin" ? "Sign Up" : "Sign In"}
          </button>
        </p>
      </div>
    </div>
  );
}
