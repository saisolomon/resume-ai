import { ScoreBadge } from "./ScoreBadge";

interface AtsScore {
  total: number;
  keywordMatch: number;
  formatSafety: number;
  narrativeFit: number;
  breakdown: {
    keywordsFound: string[];
    keywordsMissing: string[];
    formatIssues: string[];
    narrativeRationale: string;
  };
}

function Bar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs text-neutral-400">
        <span>{label}</span>
        <span className="font-semibold text-white">{value}</span>
      </div>
      <div className="mt-1 h-1 rounded bg-neutral-800 overflow-hidden">
        <div className="h-full bg-green-500" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export function ScoreBreakdown({ score }: { score: AtsScore }) {
  return (
    <div className="rounded-lg bg-neutral-950 border border-neutral-800 p-5 space-y-4">
      <div className="flex flex-col items-center">
        <ScoreBadge score={score.total} size="lg" />
        <span className="text-xs text-neutral-400 mt-2">ATS score</span>
      </div>
      <div className="space-y-3">
        <Bar label="Keyword match" value={score.keywordMatch} />
        <Bar label="Format safety" value={score.formatSafety} />
        <Bar label="Narrative fit" value={score.narrativeFit} />
      </div>
      <div className="rounded bg-neutral-900 p-3 text-xs space-y-2">
        <div>
          <span className="text-neutral-500">Found:</span>{" "}
          <span className="text-white">{score.breakdown.keywordsFound.join(", ") || "—"}</span>
        </div>
        <div>
          <span className="text-neutral-500">Missing:</span>{" "}
          <span className="text-amber-400">{score.breakdown.keywordsMissing.join(", ") || "—"}</span>
        </div>
        {score.breakdown.formatIssues.length > 0 && (
          <div>
            <span className="text-neutral-500">Format issues:</span>{" "}
            <span className="text-red-400">{score.breakdown.formatIssues.join(", ")}</span>
          </div>
        )}
        <div className="pt-2 border-t border-neutral-800">
          <span className="text-neutral-500">Narrative:</span>{" "}
          <span className="text-neutral-300">{score.breakdown.narrativeRationale}</span>
        </div>
      </div>
    </div>
  );
}
