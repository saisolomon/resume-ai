import Link from "next/link";
import { ScoreBadge } from "@/components/try/ScoreBadge";
import { ArrowUpRight } from "lucide-react";

/**
 * Renders one run in the dashboard list.
 *
 * Status semantics:
 *  - "ready" → all 4 cards landed; green pill
 *  - "running" / "scraping" → animated pulse pill
 *  - "failed" → red pill
 *  - everything else falls back to "in progress"
 *
 * Layout: title + company on the left, mono meta line below, score
 * badge on the right inside a hairline-bordered "top" cell. The whole
 * row is a Link with an ArrowUpRight that nudges on hover — gives
 * users a quick visual confirmation the row is interactive.
 */

function StatusPill({ status, readyCount, cardCount }: { status: string; readyCount: number; cardCount: number }) {
  const isReady = status === "ready" || readyCount === cardCount;
  if (isReady) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-900 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-green-400">
        <span className="size-1.5 rounded-full bg-green-500" aria-hidden="true" />
        Ready
      </span>
    );
  }
  if (status === "failed") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-900 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-red-400">
        <span className="size-1.5 rounded-full bg-red-500" aria-hidden="true" />
        Failed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-900 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-400">
      <span className="size-1.5 animate-pulse rounded-full bg-neutral-500" aria-hidden="true" />
      Tailoring
    </span>
  );
}

export function RunListItem({
  runId,
  jdTitle,
  jdCompany,
  topScore,
  readyCount,
  cardCount,
  createdAt,
  status,
}: {
  runId: string;
  jdTitle: string;
  jdCompany: string;
  topScore: number | null;
  readyCount: number;
  cardCount: number;
  createdAt: number;
  status: string;
}) {
  return (
    <Link
      href={`/run/${runId}`}
      className="group flex items-center gap-4 rounded-xl border border-neutral-800 bg-neutral-950 p-4 transition-colors hover:border-neutral-700 hover:bg-neutral-900/40 focus:outline-none focus:ring-2 focus:ring-white/40"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-3">
          <h3 className="truncate text-base font-semibold text-white">
            {jdTitle}
          </h3>
          <StatusPill status={status} readyCount={readyCount} cardCount={cardCount} />
        </div>
        <div className="mt-1 truncate text-sm text-neutral-400">{jdCompany}</div>
        <div className="mt-2 flex items-center gap-3 font-mono text-xs text-neutral-500">
          <span className="tabular-nums">{new Date(createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
          <span aria-hidden="true" className="text-neutral-700">·</span>
          <span className="tabular-nums">
            {readyCount.toString().padStart(2, "0")}/{cardCount.toString().padStart(2, "0")} cards
          </span>
        </div>
      </div>

      {topScore !== null && (
        <div className="flex shrink-0 flex-col items-center gap-1 rounded-lg border border-neutral-800 bg-neutral-900/60 px-3 py-2">
          <ScoreBadge score={topScore} size="md" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
            Top
          </span>
        </div>
      )}

      <ArrowUpRight
        className="size-4 shrink-0 text-neutral-600 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white"
        aria-hidden="true"
      />
    </Link>
  );
}