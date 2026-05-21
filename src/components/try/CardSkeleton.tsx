export function CardSkeleton({ angleLabel, templateSlug }: { angleLabel: string; templateSlug: string }) {
  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-4 aspect-[3/4] animate-pulse flex flex-col">
      <div className="text-[10px] uppercase tracking-wider text-blue-400 font-semibold mb-2">
        {angleLabel} · {templateSlug}
      </div>
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-neutral-800 rounded w-3/4" />
        <div className="h-2 bg-neutral-800 rounded w-1/2" />
        <div className="h-2 bg-neutral-800 rounded w-2/3" />
        <div className="h-2 bg-neutral-800 rounded w-3/5" />
      </div>
      <div className="text-xs text-neutral-500 text-center mt-2">Generating…</div>
    </div>
  );
}
