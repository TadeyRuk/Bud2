export function Profile() {
  return (
    <div className="px-5 pt-8 pb-28 space-y-8 transition-opacity duration-200">
      <div className="flex flex-col items-center text-center">
        <div className="w-24 h-24 rounded-full bg-bud-surface-well overflow-hidden ring-4 ring-bud-card shadow-ambient">
          <img
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        <h1 className="font-headline text-2xl font-bold text-bud-text mt-4">
          Alex Rivera
        </h1>
        <p className="font-body text-sm text-bud-text-muted mt-1 max-w-xs">
          Neighbor & volunteer. Here to help reunite pets with their families.
        </p>
      </div>

      <div className="space-y-3">
        <button
          type="button"
          className="w-full flex items-center justify-between px-4 py-4 text-left bg-bud-card rounded-2xl shadow-ambient active:scale-[0.99] transition-transform"
        >
          <span className="font-body text-sm font-medium text-bud-text">
            Notifications
          </span>
          <svg
            className="w-5 h-5 text-bud-text-muted"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.25 4.5l7.5 7.5-7.5 7.5"
            />
          </svg>
        </button>
        <button
          type="button"
          className="w-full flex items-center justify-between px-4 py-4 text-left bg-bud-card rounded-2xl shadow-ambient active:scale-[0.99] transition-transform"
        >
          <span className="font-body text-sm font-medium text-bud-text">
            Safety & community guidelines
          </span>
          <svg
            className="w-5 h-5 text-bud-text-muted"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.25 4.5l7.5 7.5-7.5 7.5"
            />
          </svg>
        </button>
        <button
          type="button"
          className="w-full flex items-center justify-between px-4 py-4 text-left bg-bud-card rounded-2xl shadow-ambient active:scale-[0.99] transition-transform"
        >
          <span className="font-body text-sm font-medium text-bud-text">
            Help & support
          </span>
          <svg
            className="w-5 h-5 text-bud-text-muted"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.25 4.5l7.5 7.5-7.5 7.5"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
