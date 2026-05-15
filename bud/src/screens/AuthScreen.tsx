import { useState } from "react";
import { showError, showSuccess } from "../lib/api";
import { useAuthStore } from "../stores/authStore";

type AuthScreenProps = {
  onClose: () => void;
};

export function AuthScreen({ onClose }: AuthScreenProps) {
  const signIn = useAuthStore((s) => s.signIn);
  const signUp = useAuthStore((s) => s.signUp);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    const e = email.trim();
    if (!e || !password) {
      showError("Enter email and password.");
      return;
    }
    setBusy(true);
    try {
      const fn = mode === "signin" ? signIn : signUp;
      const { error } = await fn(e, password);
      if (error) {
        showError(error);
        return;
      }
      showSuccess(mode === "signin" ? "Signed in." : "Check your email to confirm, then sign in.");
      onClose();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="absolute inset-0 z-[8000] flex flex-col bg-bud-bg">
      <header className="flex shrink-0 items-center justify-between border-b border-bud-surface-low px-4 pb-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="flex h-10 w-10 items-center justify-center rounded-full text-bud-text transition-colors hover:bg-bud-surface-low"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <h1 className="font-headline text-lg font-bold text-bud-text">{mode === "signin" ? "Sign in" : "Create account"}</h1>
        <span className="w-10" />
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 py-6">
        <p className="font-body text-sm text-bud-text-muted">Sign in to report sightings and contact owners when online.</p>

        <label className="block">
          <span className="font-body text-xs font-semibold uppercase tracking-wide text-bud-text">Email</span>
          <input
            type="email"
            value={email}
            onChange={(ev) => setEmail(ev.target.value)}
            autoComplete="email"
            className="mt-1.5 w-full rounded-xl bg-bud-surface-well px-3 py-3 font-body text-sm text-bud-text outline-none placeholder:text-bud-text-muted"
            placeholder="you@example.com"
          />
        </label>

        <label className="block">
          <span className="font-body text-xs font-semibold uppercase tracking-wide text-bud-text">Password</span>
          <input
            type="password"
            value={password}
            onChange={(ev) => setPassword(ev.target.value)}
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            className="mt-1.5 w-full rounded-xl bg-bud-surface-well px-3 py-3 font-body text-sm text-bud-text outline-none placeholder:text-bud-text-muted"
            placeholder="••••••••"
          />
        </label>

        <button
          type="button"
          disabled={busy}
          onClick={() => void submit()}
          className="mt-2 w-full rounded-[1.12rem] bg-bud-primary py-3.5 font-body text-sm font-bold uppercase tracking-widest text-white shadow-ambient disabled:opacity-60"
        >
          {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Sign up"}
        </button>

        <button
          type="button"
          onClick={() => setMode((m) => (m === "signin" ? "signup" : "signin"))}
          className="font-body text-sm font-semibold text-bud-accent"
        >
          {mode === "signin" ? "Need an account? Sign up" : "Have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}
