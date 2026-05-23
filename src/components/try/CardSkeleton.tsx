/**
 * Skeleton shown while a card's content is generating.
 *
 * Matches the dimensions + angle-chip placement of CardTile so the layout
 * doesn't jump when content lands. The shimmer is `animate-pulse` on the
 * inner placeholders; the angle chip stays visible (no pulse) so the user
 * always knows which angle is in flight.
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
      className="relative flex aspect-[3/4] flex-col overflow-hidden rounded-lg border border-neutral-800 bg-neutral-950 p-5"
      aria-label={`${angleLabel} card — generating`}
    >
      <div className="flex items-center justify-between">
        <div className="inline-flex w-fit items-center rounded-md bg-white/95 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-blue-700">
          {angleLabel}
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-neutral-600">
          {templateSlug}
        </span>
      </div>

      <div className="mt-6 flex-1 space-y-2.5">
        <div className="h-3 w-3/4 animate-pulse rounded bg-neutral-800" />
        <div className="h-2 w-1/2 animate-pulse rounded bg-neutral-800" />
        <div className="mt-6 h-2 w-2/3 animate-pulse rounded bg-neutral-800" />
        <div className="h-2 w-3/5 animate-pulse rounded bg-neutral-800" />
        <div className="h-2 w-4/5 animate-pulse rounded bg-neutral-800" />
        <div className="mt-6 h-2 w-1/2 animate-pulse rounded bg-neutral-800" />
        <div className="h-2 w-3/5 animate-pulse rounded bg-neutral-800" />
      </div>

      <div className="mt-4 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
        <span className="size-1.5 animate-pulse rounded-full bg-neutral-500" aria-hidden="true" />
        Generating
      </div>
    </div>
  );
}