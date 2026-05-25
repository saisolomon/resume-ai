import { Check, Clock } from "lucide-react";

type StackItem = { item: string; value: string; comingSoon?: boolean };

// 20-pack implied-value stack. Per Design.md, the dream-outcome stack lives
// in the 20-pack — every obstacle to landing a job has a line in this list.
// Numbers are "if you bought each component separately on the open market"
// — they're plausible-but-defensible (e.g., interview prep tools charge
// $50-150/mo; the human review market starts around $150).
//
// `comingSoon: true` items are on the roadmap — they render with a muted
// clock + a "Coming soon" pill so the value stack stays honest. They still
// count toward the total because that's what the buyer will get over the
// lifetime of credits (which never expire).
const twentyPackStack: StackItem[] = [
  { item: "20 × 4-angle resume gallery (80 designs total)", value: "$180" },
  { item: "20 × 3-variant cover letter (60 letters)", value: "$60" },
  { item: "20 × ATS deep-scan + per-bullet impact", value: "$80" },
  { item: "Unlimited chat fine-tune edits per run", value: "$30" },
  { item: "LinkedIn profile rewrite (1× included)", value: "$40" },
  { item: "20 × outreach DM templates for hiring managers", value: "$60" },
  { item: "Cover letter generator in English + Spanish", value: "$20" },
  { item: "10 × interview prep sessions — likely Qs + practice", value: "$150", comingSoon: true },
  { item: "1 × human review by a certified recruiter", value: "$150", comingSoon: true },
];

/**
 * Hormozi-style value stack — the "if you priced every component
 * separately, here's the bill" block. Per the brand spec, we let the math
 * tell the story rather than shouting it with red badges. Hairline rows,
 * mono dollar columns, no animation.
 *
 * Sits under the 20-pack card on /pricing as the implicit-value sell.
 */
export function ValueStack() {
  const total = twentyPackStack.reduce(
    (sum, x) => sum + Number(x.value.replace("$", "")),
    0,
  );

  return (
    <section className="bg-[#FAFAFA] py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-6 sm:px-8">
        <div className="text-center">
          <h2 className="text-h1 text-[#1D1D1F]">Everything in the 20-pack.</h2>
          <p className="mx-auto mt-4 max-w-xl text-[17px] leading-relaxed text-[#6E6E73]">
            Priced separately on the open market, this stack runs ${total}+.
            You pay $79 once. Credits never expire.
          </p>
        </div>

        <div className="mt-12 overflow-hidden rounded-2xl bg-white shadow-card">
          {twentyPackStack.map((row, i) => (
            <div
              key={i}
              className={`flex items-center justify-between gap-4 px-6 py-4 sm:px-8 ${
                i !== twentyPackStack.length - 1
                  ? "border-b border-[#D2D2D7]/70"
                  : ""
              }`}
            >
              <div className="flex items-start gap-3">
                {row.comingSoon ? (
                  <Clock
                    className="mt-0.5 size-5 shrink-0 text-[#86868B]"
                    aria-hidden="true"
                  />
                ) : (
                  <Check
                    className="mt-0.5 size-5 shrink-0 text-[#1A7F45]"
                    aria-hidden="true"
                  />
                )}
                <span
                  className={`flex flex-wrap items-center gap-x-2 text-[15px] ${
                    row.comingSoon ? "text-[#6E6E73]" : "text-[#1D1D1F]"
                  }`}
                >
                  {row.item}
                  {row.comingSoon && (
                    <span
                      className="inline-flex items-center rounded-full bg-[#FEF3C7] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.04em] text-[#92400E]"
                      aria-label="Coming soon"
                    >
                      Coming soon
                    </span>
                  )}
                </span>
              </div>
              <span className="font-mono text-[15px] font-medium tabular-nums text-[#86868B]">
                {row.value}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-white p-8 text-center shadow-card">
            <p className="text-[13px] font-medium text-[#6E6E73]">
              Total open-market value
            </p>
            <p className="mt-3 font-mono text-[36px] font-medium leading-none tabular-nums text-[#86868B] line-through decoration-[#86868B]/40">
              ${total}
            </p>
          </div>
          <div className="rounded-2xl bg-white p-8 text-center shadow-card">
            <p className="text-[13px] font-medium text-[#6E6E73]">You pay</p>
            <p className="mt-3 font-mono text-[44px] font-semibold leading-none tracking-tight tabular-nums text-[#1D1D1F]">
              $79
            </p>
            <p className="mt-2 text-[13px] text-[#86868B]">
              Once. Credits don&apos;t expire.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
