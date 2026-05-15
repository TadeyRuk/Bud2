import toast from "react-hot-toast";

export type ToastKind = "sighting" | "status" | "match" | "reunion" | "system";

const stripe: Record<ToastKind, string> = {
  sighting: "#8B3A15",
  status: "#005763",
  match: "#16a34a",
  reunion: "#3b82f6",
  system: "#56423c",
};

export function budToast(opts: { kind: ToastKind; title: string; body?: string }) {
  const { kind, title, body } = opts;
  const color = stripe[kind];

  return toast.custom(
    (t) => (
      <div
        className={`pointer-events-auto flex max-w-[320px] gap-0 overflow-hidden rounded-2xl border border-black/8 bg-white/95 shadow-lg backdrop-blur-md transition-all ${
          t.visible ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
        }`}
        role="status"
      >
        <span className="w-1 shrink-0 self-stretch" style={{ background: color }} />
        <div className="flex min-w-0 flex-1 items-start gap-3 p-3 pr-4">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
            style={{ background: `${color}18`, color }}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
            </svg>
          </span>
          <div className="min-w-0 pt-0.5">
            <p className="font-body text-sm font-semibold text-bud-text">{title}</p>
            {body ? <p className="mt-1 font-body text-xs leading-snug text-bud-text-muted line-clamp-2">{body}</p> : null}
          </div>
        </div>
      </div>
    ),
    { duration: 3200 }
  );
}

export function showErrorToast(message: string) {
  budToast({ kind: "status", title: "Error", body: message });
}

export function showSuccessToast(msg: string) {
  budToast({ kind: "system", title: msg });
}
