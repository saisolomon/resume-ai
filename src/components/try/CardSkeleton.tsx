/**
 * Skeleton shown while a card's content is generating — Apple-light.
 *
 * Matches the dimensions + angle-chip placement of CardTile so the layout
 * doesn't jump when content lands. Soft pulse on placeholder lines. The
 * angle chip stays visible (no pulse) so the user always knows which
 * angle is in flight.
 */
export function CardSkeleton({
  angleLabel,
  templateSlug,
}: {
  angleLabel: string;
  templateSlug: string;
}) {
  return (
    <div
      className="relative flex aspect-[3/4] flex-col overflow-hidden rounded-2xl bg-white p-5 shadow-card"
      aria-label={`${angleLabel} card — generating`}
    >
      <div className="flex items-center justify-between">
        <div className="inline-flex w-fit items-center rounded-md bg-white/95 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.04em] text-[#3B82F6] ring-1 ring-[#D2D2D7]/60">
          {angleLabel}
        </div>
        <span className="font-mono text-[11px] text-[#A1A1A6]">
          {templateSlug}
        </span>
      </div>

      <div className="mt-6 flex-1 space-y-2.5">
        <div className="h-3 w-3/4 animate-pulse rounded bg-[#F5F5F7]" />
        <div className="h-2 w-1/2 animate-pulse rounded bg-[#F5F5F7]" />
        <div className="mt-6 h-2 w-2/3 animate-pulse rounded bg-[#F5F5F7]" />
        <div className="h-2 w-3/5 animate-pulse rounded bg-[#F5F5F7]" />
        <div className="h-2 w-4/5 animate-pulse rounded bg-[#F5F5F7]" />
        <div className="mt-6 h-2 w-1/2 animate-pulse rounded bg-[#F5F5F7]" />
        <div className="h-2 w-3/5 animate-pulse rounded bg-[#F5F5F7]" />
      </div>

      <div className="mt-4 flex items-center gap-2 text-[12px] font-medium text-[#86868B]">
        <span
          className="size-1.5 animate-pulse rounded-full bg-[#86868B]"
          aria-hidden="true"
        />
        Generating
      </div>
    </div>
  );
}
