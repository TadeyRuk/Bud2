/**
 * Soft orange / teal / cream blobs behind app chrome — low opacity so UI stays readable.
 */
export function AppBubbleBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-bud-bg" />
      <div className="bud-motif-bg absolute inset-0 opacity-[0.055]" />

      <div className="absolute -left-[18%] top-[8%] h-[min(52vmin,280px)] w-[min(52vmin,280px)] rounded-full bg-bud-primary/[0.14] blur-3xl" />
      <div className="absolute -right-[12%] top-[28%] h-[min(48vmin,260px)] w-[min(48vmin,260px)] rounded-full bg-bud-primary/[0.11] blur-3xl" />
      <div className="absolute left-[22%] bottom-[6%] h-[min(44vmin,240px)] w-[min(44vmin,240px)] rounded-full bg-bud-accent/[0.09] blur-3xl" />
      <div className="absolute -right-[8%] bottom-[18%] h-[min(36vmin,200px)] w-[min(36vmin,200px)] rounded-full bg-white/35 blur-3xl" />
      <div className="absolute left-1/2 top-[42%] h-[min(40vmin,220px)] w-[min(40vmin,220px)] -translate-x-1/2 rounded-full bg-[#E8A078]/20 blur-3xl" />
    </div>
  );
}
