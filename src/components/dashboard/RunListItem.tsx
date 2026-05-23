import Link from "next/link";
import { ScoreBadge } from "@/components/try/ScoreBadge";
import { ArrowUpRight } from "lucide-react";

/**
 * Renders one run in the dashboard list, Apple-light.
 *
 * White card with soft shadow on the mist canvas. Status pill uses
 * the score palette wash tones (green/amber/red) rather than dark fills,
 * keeping the row calm. The whole row is a Link with an ArrowUpRight
 * that drifts slightly on hover.
 */

function StatusPill({
  status,
  readyCount,
  cardCount,
}: {
  status: string;
  readyCount: number;
  cardCount: number;
}) {
  const isReady = status === "ready" || readyCount === cardCount;
  if (isReady) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F0FDF4] px-2.5 py-0.5 text-[12px] font-medium text-[#1A7F45]">
        <span className="size-1.5 rounded-full bg-[#1A7F45]" aria-hidden="true" />
        Ready
      </span>
    );
  }
  if (status === "failed") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FEF2F2] px-2.5 py-0.5 text-[12px] font-medium text-[#B91C1C]">
        <span className="size-1.5 rounded-full bg-[#B91C1C]" aria-hidden="true" />
        Failed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F5F5F7] px-2.5 py-0.5 text-[12px] font-medium text-[#6E6E73]">
      <span className="size-1.5 animate-pulse rounded-full bg-[#86868B]" aria-hidden="true" />
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
      className="focus-ring group flex items-center gap-4 rounded-2xl bg-white p-5 shadow-card transition-shadow duration-200 hover:shadow-card-hover"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-3">
          <h3 className="truncate text-[17px] font-semibold text-[#1D1D1F]">
            {jdTitle}
          </h3>
          <StatusPill
            status={status}
            readyCount={readyCount}
            cardCount={cardCount}
          />
        </div>
        <div className="mt-1 truncate text-[15px] text-[#6E6E73]">
          {jdCompany}
        </div>
        <div className="mt-2 flex items-center gap-3 text-[13px] text-[#86868B]">
          <span className="tabular-nums">
            {new Date(createdAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })}
          </span>
          <span aria-hidden="true" className="text-[#D2D2D7]">
            ·
          </span>
          <span className="font-mono tabular-nums">
            {readyCount.toString().padStart(2, "0")}/
            {cardCount.toString().padStart(2, "0")} cards
          </span>
        </div>
      </div>

      {topScore !== null && (
        <div className="flex shrink-0 flex-col items-center gap-1 rounded-xl bg-[#F5F5F7] px-4 py-3">
          <ScoreBadge score={topScore} size="md" />
          <span className="text-[11px] font-medium text-[#86868B]">Top</span>
        </div>
      )}

      <ArrowUpRight
        className="size-5 shrink-0 text-[#86868B] transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#1D1D1F]"
        aria-hidden="true"
      />
    </Link>
  );
}
