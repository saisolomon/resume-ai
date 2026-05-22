import Link from "next/link";
import { ScoreBadge } from "@/components/try/ScoreBadge";

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
      className="flex items-center justify-between border border-neutral-800 bg-neutral-950 hover:border-neutral-600 rounded-lg p-4"
    >
      <div className="min-w-0">
        <div className="font-medium truncate">{jdTitle}</div>
        <div className="text-sm text-neutral-500">{jdCompany}</div>
        <div className="text-xs text-neutral-600 mt-1">
          {new Date(createdAt).toLocaleString()} · {readyCount}/{cardCount} cards · {status}
        </div>
      </div>
      {topScore !== null ? (
        <div className="ml-4 flex flex-col items-center">
          <ScoreBadge score={topScore} size="md" />
          <span className="text-[10px] text-neutral-500 mt-1">top</span>
        </div>
      ) : null}
    </Link>
  );
}
