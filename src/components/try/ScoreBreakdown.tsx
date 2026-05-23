import { ScoreBadge, scoreBand } from "./ScoreBadge";

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

const BAR_BG = {
  good: "bg-green-500",
  warn: "bg-amber-500",
  bad: "bg-red-500",
} as const;

function Bar({ label, value }: { label: string; value: number }) {
  const band = scoreBand(value);
  return (
    <div>
      <div className="flex justify-between text-xs">
        <span className="text-neutral-400">{label}</span>
        <span className="font-mono font-semibold tabular-nums text-white">
          {value}
        </span>
      </div>
      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-neutral-900">
        <div
          className={`h-full ${BAR_BG[band]} transition-[width] duration-500`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

/** Renders one row of comma-separated keyword chips with a label. */
function KeywordRow({
  label,
  items,
  tone,
}: {
  label: string;
  items: string[];
  tone: "found" | "missing" | "issue";
}) {
  const empty = items.length === 0;
  const toneCls =
    tone === "found"
      ? "border-neutral-800 text-neutral-200"
      : tone === "missing"
        ? "border-amber-900/70 text-amber-300"
        : "border-red-900/70 text-red-300";

  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
        {label}
      </div>
      {empty ? (
        <div className="mt-1.5 text-xs text-neutral-600">—</div>
      ) : (
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {items.map((kw) => (
            <span
              key={kw}
              className={`inline-flex items-center rounded border px-1.5 py-0.5 font-mono text-[11px] ${toneCls}`}
            >
              {kw}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function ScoreBreakdown({ score }: { score: AtsScore }) {
  return (
    <div className="space-y-5 rounded-xl border border-neutral-800 bg-neutral-950 p-5">
      {/* Top score */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
            ATS score
          </div>
          <div className="mt-1 text-xs text-neutral-400">
            Weighted: keyword + format + narrative
          </div>
        </div>
        <ScoreBadge score={score.total} size="lg" />
      </div>

      <div className="space-y-3 border-t border-neutral-900 pt-5">
        <Bar label="Keyword match" value={score.keywordMatch} />
        <Bar label="Format safety" value={score.formatSafety} />
        <Bar label="Narrative fit" value={score.narrativeFit} />
      </div>

      <div className="space-y-4 border-t border-neutral-900 pt-5">
        <KeywordRow
          label="Found in resume"
          items={score.breakdown.keywordsFound}
          tone="found"
        />
        <KeywordRow
          label="Missing — consider adding"
          items={score.breakdown.keywordsMissing}
          tone="missing"
        />
        {score.breakdown.formatIssues.length > 0 && (
          <KeywordRow
            label="Format issues"
            items={score.breakdown.formatIssues}
            tone="issue"
          />
        )}
      </div>

      {score.breakdown.narrativeRationale && (
        <div className="border-t border-neutral-900 pt-5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
            Narrative
          </div>
          <p className="mt-2 text-xs leading-relaxed text-neutral-300">
            {score.breakdown.narrativeRationale}
          </p>
        </div>
      )}
    </div>
  );
}