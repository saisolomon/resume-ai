/**
 * AtsHonestySection — "Why we score honest."
 *
 * The most contrarian moment on the landing page. Every competitor sells
 * the ATS score as a magic number; recruiters openly call those scores
 * "meaningless theater." This section says the quiet part out loud: an
 * ATS score is a floor, not a ceiling. We score it because the bots are
 * real; we tell you what the score *isn't* because the humans are real too.
 *
 * Three sub-blocks (editorial three-column on desktop, stacked on mobile):
 *   1. The floor      — ATS bots cull resumes that miss keywords.
 *   2. The ceiling    — A recruiter spends 6 seconds reading.
 *   3. What ATS isn't — Scores aren't a guarantee of interviews.
 *
 * Voice: confident, not arrogant. "We're a tool that respects you" —
 * not "we're the only honest one."
 */

import { scoreBand } from "@/components/try/ScoreBadge";

const BLOCKS: {
  label: string;
  kicker: string;
  title: string;
  body: string;
  exhibit: React.ReactNode;
}[] = [
  {
    label: "01 — The floor",
    kicker: "ATS bots are real",
    title: "Bots cull resumes that miss keywords.",
    body: "We score the resume against the JD with the same parsing rules an ATS uses. Then we name the missing keywords explicitly — we don't stuff them. You decide which ones actually fit.",
    exhibit: (
      <FloorExhibit
        match={["P99 latency", "distributed", "Postgres", "Go"]}
        missing={["incident", "SLO"]}
      />
    ),
  },
  {
    label: "02 — The ceiling",
    kicker: "Recruiters read in six seconds",
    title: "A human spends 6 seconds on the first pass.",
    body: "We optimize for that read too. Quantified bullets, skill-based not task-based, present-tense for current roles. The rules are from NYU Wasserman's career center — applied through Sonnet, not invented by it.",
    exhibit: <CeilingExhibit />,
  },
  {
    label: "03 — What ATS isn't",
    kicker: "Scores aren't guarantees",
    title: "A high number doesn't book a callback.",
    body: "Recruiters tell us competitor ATS scores are theater. So we're explicit: passing the bot is necessary, not sufficient. The interview is the human. We score honest so you can trust the rest of what we say.",
    exhibit: <CeilingNumberExhibit />,
  },
];

export function AtsHonestySection() {
  return (
    <section
      aria-label="Why we score honest"
      className="border-t border-neutral-900 py-16 sm:py-20"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12 grid items-end gap-6 sm:grid-cols-[1fr_auto]">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
              ATS scoring, explained honestly
            </span>
            <h2 className="mt-3 text-h1 text-white">
              The score is a floor.
              <br className="hidden sm:block" />
              <span className="text-neutral-500"> Not a ceiling.</span>
            </h2>
            <p className="mt-4 max-w-xl text-sm text-neutral-400">
              Most resume tools sell the ATS number as magic. We tell you what
              it actually is — what it catches, what it misses, and where the
              real read still lives.
            </p>
          </div>
          <span className="font-mono text-[11px] tabular-nums text-neutral-600">
            03 / honest answers
          </span>
        </div>

        {/* Three blocks. Hairline grid via 1px gap + neutral-900 bg, same
            pattern as HowItWorks and TheFourAngles so the page reads
            consistently. */}
        <div className="grid gap-px overflow-hidden rounded-xl border border-neutral-800 bg-neutral-800 sm:grid-cols-1 lg:grid-cols-3">
          {BLOCKS.map((block) => (
            <article
              key={block.label}
              className="flex flex-col gap-5 bg-black p-6 lg:p-7"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-neutral-500">
                  {block.label}
                </span>
                <span className="text-[11px] font-medium text-neutral-500">
                  {block.kicker}
                </span>
              </div>

              <h3 className="text-lg font-semibold leading-snug text-white">
                {block.title}
              </h3>

              <p className="text-sm leading-relaxed text-neutral-400">
                {block.body}
              </p>

              <div className="mt-auto rounded-lg border border-neutral-900 bg-neutral-950 p-4">
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
 * Floor exhibit — two rows of keyword chips. Matched ones in green; the
 * missing ones in red. Demonstrates the "name what's missing" promise.
 */
function FloorExhibit({
  match,
  missing,
}: {
  match: string[];
  missing: string[];
}) {
  return (
    <div className="flex flex-col gap-3 font-mono text-[11px]">
      <div className="flex flex-col gap-1.5">
        <span className="uppercase tracking-[0.08em] text-neutral-600">
          matched
        </span>
        <div className="flex flex-wrap gap-1.5">
          {match.map((kw) => (
            <span
              key={kw}
              className="inline-flex items-center rounded border border-green-600/40 bg-green-600/15 px-1.5 py-0.5 text-green-400"
            >
              {kw}
            </span>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="uppercase tracking-[0.08em] text-neutral-600">
          missing
        </span>
        <div className="flex flex-wrap gap-1.5">
          {missing.map((kw) => (
            <span
              key={kw}
              className="inline-flex items-center rounded border border-red-900/60 bg-red-950/30 px-1.5 py-0.5 text-red-400"
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
 * Ceiling exhibit — a single recruiter-read pattern. Six dots represent
 * six seconds; the captions name what the human actually scans for.
 */
function CeilingExhibit() {
  const items = [
    { t: "0.0s", label: "Name + most recent role" },
    { t: "1.5s", label: "Top bullet on top job" },
    { t: "3.0s", label: "Numbers + scope" },
    { t: "6.0s", label: "Keep or pass" },
  ];
  return (
    <div className="flex flex-col gap-2 font-mono text-[11px]">
      {items.map((item) => (
        <div
          key={item.t}
          className="flex items-center gap-3"
        >
          <span className="w-9 tabular-nums text-neutral-500">{item.t}</span>
          <span className="h-px flex-shrink-0 w-3 bg-neutral-800" aria-hidden="true" />
          <span className="text-neutral-300">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

/**
 * What-ATS-isn't exhibit — the same score-color band as the live product,
 * paired with a tiny "is not equal to" caption that names what the number
 * doesn't measure.
 */
function CeilingNumberExhibit() {
  // Use the live `scoreBand` so this stays in sync with the product
  // thresholds (≥85 green / 70–84 amber / <70 red).
  const sampleScore = 91;
  const band = scoreBand(sampleScore);
  const bandColor =
    band === "good"
      ? "bg-green-600"
      : band === "warn"
        ? "bg-amber-600"
        : "bg-red-600";

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
          className={`inline-flex items-center justify-center rounded-full px-3 py-1 font-mono text-base font-bold tabular-nums text-white ${bandColor}`}
        >
          {sampleScore}
        </span>
        <span className="font-mono text-base text-neutral-500">≠</span>
        <span className="text-xs text-neutral-300">
          {negatives[0]}
        </span>
      </div>
      <ul className="flex flex-col gap-1 pl-12 font-mono text-[11px] text-neutral-500">
        {negatives.slice(1).map((n) => (
          <li key={n} className="flex items-center gap-2">
            <span className="text-neutral-700">≠</span>
            <span>{n}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
