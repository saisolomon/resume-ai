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
  good: "bg-[#1A7F45]",
  warn: "bg-[#B45309]",
  bad: "bg-[#B91C1C]",
} as const;

function Bar({ label, value }: { label: string; value: number }) {
  const band = scoreBand(value);
  return (
    <div>
      <div className="flex justify-between text-[13px]">
        <span className="text-[#6E6E73]">{label}</span>
        <span className="font-mono font-medium tabular-nums text-[#1D1D1F]">
          {value}
        </span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#F5F5F7]">
        <div
          className={`h-full ${BAR_BG[band]} transition-[width] duration-700 ease-out`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

/** Renders one row of keyword chips with a label. Light wash backgrounds
 * map to the score palette so each row's tone is semantically obvious. */
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
      ? "bg-[#F0FDF4] text-[#1A7F45]"
      : tone === "missing"
        ? "bg-[#FFFBEB] text-[#B45309]"
        : "bg-[#FEF2F2] text-[#B91C1C]";

  return (
    <div>
      <div className="text-[13px] font-medium text-[#86868B]">{label}</div>
      {empty ? (
        <div className="mt-1.5 text-[13px] text-[#A1A1A6]">—</div>
      ) : (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {items.map((kw) => (
            <span
              key={kw}
              className={`inline-flex items-center rounded-md px-2 py-0.5 text-[12px] font-medium ${toneCls}`}
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
    <div className="space-y-5 rounded-2xl bg-white p-6 shadow-card">
      {/* Top score */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-[15px] font-medium text-[#1D1D1F]">
            ATS score
          </div>
          <div className="mt-1 text-[13px] text-[#86868B]">
            ATS-passing band. The interview is the human.
          </div>
        </div>
        <ScoreBadge score={score.total} size="lg" />
      </div>

      <div className="space-y-3 border-t border-[#D2D2D7]/70 pt-5">
        <Bar label="Keyword match" value={score.keywordMatch} />
        <Bar label="Format safety" value={score.formatSafety} />
        <Bar label="Narrative fit" value={score.narrativeFit} />
      </div>

      <div className="space-y-4 border-t border-[#D2D2D7]/70 pt-5">
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
        <div className="border-t border-[#D2D2D7]/70 pt-5">
          <div className="text-[13px] font-medium text-[#86868B]">
            Narrative
          </div>
          <p className="mt-2 text-[14px] leading-relaxed text-[#1D1D1F]">
            {score.breakdown.narrativeRationale}
          </p>
        </div>
      )}
    </div>
  );
}
