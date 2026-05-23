/**
 * AtsHonestySection — "The score is a floor, not a ceiling."
 *
 * Three white cards on the alt canvas. Sentence-case throughout, no
 * insurgent eyebrow strip, no monospaced section counter. Confidence
 * through specificity, not aggression.
 *
 * Three sub-blocks:
 *   1. The floor      — ATS bots cull resumes that miss keywords.
 *   2. The ceiling    — A recruiter spends six seconds reading.
 *   3. What ATS isn't — Scores aren't a guarantee of interviews.
 */

import { scoreBand } from "@/components/try/ScoreBadge";

const BLOCKS: {
  step: string;
  title: string;
  body: string;
  exhibit: React.ReactNode;
}[] = [
  {
    step: "The floor",
    title: "Bots cull resumes that miss keywords.",
    body: "We score against the job description with the same parsing rules an ATS uses. Then we name the missing keywords explicitly — we don't stuff them. You decide which ones actually fit.",
    exhibit: (
      <FloorExhibit
        match={["P99 latency", "distributed", "Postgres", "Go"]}
        missing={["incident", "SLO"]}
      />
    ),
  },
  {
    step: "The ceiling",
    title: "A human spends six seconds on the first pass.",
    body: "We optimize for that read too. Quantified bullets, skill-based not task-based, present-tense for current roles. The rules are from NYU Wasserman's career center — applied through Sonnet, not invented by it.",
    exhibit: <CeilingExhibit />,
  },
  {
    step: "What ATS isn't",
    title: "A high number doesn't book a callback.",
    body: "Passing the bot is necessary, not sufficient. The interview is the human. We score honest so you can trust the rest of what we say.",
    exhibit: <CeilingNumberExhibit />,
  },
];

export function AtsHonestySection() {
  return (
    <section
      aria-label="The score is a floor, not a ceiling"
      className="bg-[#FAFAFA] py-24 sm:py-32"
    >
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        <div className="mb-16 max-w-2xl">
          <h2 className="text-h1 text-[#1D1D1F]">
            The score is a floor.{" "}
            <span className="text-[#6E6E73]">Not a ceiling.</span>
          </h2>
          <p className="mt-4 text-[17px] leading-relaxed text-[#6E6E73]">
            Most resume tools sell the ATS number as magic. We tell you what
            it actually is — what it catches, what it misses, and where the
            real read still lives.
          </p>
        </div>

        <div className="grid gap-6 sm:gap-8 lg:grid-cols-3">
          {BLOCKS.map((block) => (
            <article
              key={block.step}
              className="flex flex-col gap-5 rounded-2xl bg-white p-8 shadow-card"
            >
              <span className="text-[13px] font-medium text-[#86868B]">
                {block.step}
              </span>

              <h3 className="text-[20px] font-semibold leading-snug tracking-tight text-[#1D1D1F]">
                {block.title}
              </h3>

              <p className="text-[15px] leading-relaxed text-[#6E6E73]">
                {block.body}
              </p>

              <div className="mt-auto rounded-xl bg-[#FAFAFA] p-5">
                {block.exhibit}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Floor exhibit — two rows of keyword chips on light surfaces.
 * Matched in mint-wash, missing in rose-wash; calmly differentiated.
 */
function FloorExhibit({
  match,
  missing,
}: {
  match: string[];
  missing: string[];
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <span className="text-[11px] font-medium uppercase tracking-[0.04em] text-[#86868B]">
          matched
        </span>
        <div className="flex flex-wrap gap-1.5">
          {match.map((kw) => (
            <span
              key={kw}
              className="inline-flex items-center rounded-md bg-[#F0FDF4] px-2 py-0.5 text-[12px] font-medium text-[#1A7F45]"
            >
              {kw}
            </span>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-[11px] font-medium uppercase tracking-[0.04em] text-[#86868B]">
          missing
        </span>
        <div className="flex flex-wrap gap-1.5">
          {missing.map((kw) => (
            <span
              key={kw}
              className="inline-flex items-center rounded-md bg-[#FEF2F2] px-2 py-0.5 text-[12px] font-medium text-[#B91C1C]"
            >
              {kw}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Ceiling exhibit — a single recruiter-read pattern. Hairline dashes
 * separate the timestamp from the read step.
 */
function CeilingExhibit() {
  const items = [
    { t: "0.0s", label: "Name + most recent role" },
    { t: "1.5s", label: "Top bullet on top job" },
    { t: "3.0s", label: "Numbers + scope" },
    { t: "6.0s", label: "Keep or pass" },
  ];
  return (
    <div className="flex flex-col gap-2.5">
      {items.map((item) => (
        <div key={item.t} className="flex items-center gap-3">
          <span className="w-10 font-mono text-[12px] tabular-nums text-[#86868B]">
            {item.t}
          </span>
          <span className="h-px w-3 flex-shrink-0 bg-[#D2D2D7]" aria-hidden="true" />
          <span className="text-[13px] text-[#1D1D1F]">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

/**
 * What-ATS-isn't exhibit — green score badge paired with quietly listed
 * things it does NOT measure. Same scoreBand thresholds as the live product.
 */
function CeilingNumberExhibit() {
  const sampleScore = 91;
  const band = scoreBand(sampleScore);
  const bandColor =
    band === "good"
      ? "bg-[#1A7F45]"
      : band === "warn"
        ? "bg-[#B45309]"
        : "bg-[#B91C1C]";

  const negatives = [
    "an interview",
    "a callback",
    "a hiring manager's read",
    "a story about you",
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span
          aria-label="ATS score 91"
          className={`inline-flex items-center justify-center rounded-full px-3 py-1 font-mono text-[15px] font-medium tabular-nums text-white ${bandColor}`}
        >
          {sampleScore}
        </span>
        <span className="font-mono text-[15px] text-[#86868B]">≠</span>
        <span className="text-[13px] text-[#1D1D1F]">{negatives[0]}</span>
      </div>
      <ul className="flex flex-col gap-1 pl-[3.25rem]">
        {negatives.slice(1).map((n) => (
          <li key={n} className="flex items-center gap-2">
            <span className="font-mono text-[12px] text-[#A1A1A6]">≠</span>
            <span className="text-[12px] text-[#86868B]">{n}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
