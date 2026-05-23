import { Check } from "lucide-react";

/**
 * DarkPatternCompare — "What we don't do."
 *
 * The single most conviction-heavy block on the landing. The category
 * runs on dark patterns; we name them, then reject each one. Research
 * brief Section 10.3 — locked.
 *
 * Layout: two columns. Left is greyed and strikethrough-heavy ("everyone
 * else does this"). Right is white and clear ("here's what we do"). The
 * column heads carry generic competitor labels — not specific brand
 * names — because we don't need to punch down to win this one. The rows
 * themselves do the work.
 *
 * Voice: declarative. Period after each line. No exclamation marks. No
 * "we promise" hedging.
 */

type Row = {
  /** The category dark pattern. Will be visually de-emphasized + may carry
   * a strikethrough where a price or commitment is being rejected. */
  category: { lead: string; strike?: string; tail?: string };
  /** The resume.ai counter — clear, declarative. */
  ours: string;
};

const ROWS: Row[] = [
  {
    category: {
      lead: "$2.95 trials that auto-renew to ",
      strike: "$24.95/mo",
      tail: ".",
    },
    ours: "Per-credit. $9, $29, or $79. Pay once.",
  },
  {
    category: { lead: "Hidden pricing at checkout." },
    ours: "All three prices on this page. Right above this block.",
  },
  {
    category: { lead: "Watermarked downloads." },
    ours: "No watermarks. Ever.",
  },
  {
    category: { lead: "Cancellation buried four clicks deep." },
    ours: "Nothing to cancel. Credits don't expire.",
  },
  {
    category: { lead: "Templates over interviews." },
    ours: "Four tailored angles, not 35 templates.",
  },
  {
    category: { lead: "AI that sounds like every other AI." },
    ours: "Sonnet rewrites your bullets in your voice.",
  },
  {
    category: { lead: "ATS theater." },
    ours: "Honest scoring. Recruiter-readable bullets.",
  },
];

export function DarkPatternCompare() {
  return (
    <section
      aria-label="What we don't do — dark patterns we visibly reject"
      className="border-t border-neutral-900 py-16 sm:py-20"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12 grid items-end gap-6 sm:grid-cols-[1fr_auto]">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
              The compare
            </span>
            <h2 className="mt-3 text-h1 text-white">
              What we don&apos;t do.
            </h2>
            <p className="mt-4 max-w-xl text-sm text-neutral-400">
              The category runs on dark patterns. We named the ones we refuse
              to copy — in order, on the same page. If something changes here,
              you&apos;ll see it.
            </p>
          </div>
          <span className="font-mono text-[11px] tabular-nums text-neutral-600">
            07 / patterns rejected
          </span>
        </div>

        {/* Compare grid. Two-column on desktop, single-column on mobile
            (where each row reads as a paired "left / right" stack). */}
        <div className="overflow-hidden rounded-xl border border-neutral-800">
          {/* Column heads */}
          <div className="grid grid-cols-1 border-b border-neutral-800 bg-neutral-950 lg:grid-cols-2">
            <div className="border-b border-neutral-900 px-5 py-4 lg:border-b-0 lg:border-r lg:border-neutral-900">
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-600">
                What every other tool does
              </span>
            </div>
            <div className="px-5 py-4">
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
                What resume.ai does
              </span>
            </div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-neutral-900">
            {ROWS.map((row, i) => (
              <div
                key={i}
                className="grid grid-cols-1 lg:grid-cols-2"
              >
                {/* Left — competitor pattern. Greyed text, strikethrough on
                    the dollar amount if present. The "×" mono marker
                    visually rhymes with the Manifesto section. */}
                <div className="flex items-start gap-3 border-b border-neutral-900 bg-neutral-950 px-5 py-5 lg:border-b-0 lg:border-r lg:border-neutral-900">
                  <span
                    aria-hidden="true"
                    className="mt-1 font-mono text-xs text-neutral-700"
                  >
                    ×
                  </span>
                  <p className="text-sm text-neutral-500">
                    {row.category.lead}
                    {row.category.strike && (
                      <span className="text-neutral-400 line-through decoration-neutral-700 decoration-1 underline-offset-2">
                        {row.category.strike}
                      </span>
                    )}
                    {row.category.tail}
                  </p>
                </div>

                {/* Right — resume.ai's counter. White text, Check icon in
                    the brand inversion. */}
                <div className="flex items-start gap-3 bg-black px-5 py-5">
                  <Check
                    className="mt-0.5 size-4 flex-shrink-0 text-white"
                    aria-hidden="true"
                  />
                  <p className="text-sm font-medium text-white">{row.ours}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footnote — keeps the block from feeling like a polemic by
            offering the user verification. */}
        <p className="mt-6 text-center font-mono text-[11px] text-neutral-500">
          We expect this list to be read by competitor employees. We expect to
          stand behind every line of it.
        </p>
      </div>
    </section>
  );
}
