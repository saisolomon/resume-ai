import { Check } from "lucide-react";

type StackItem = { item: string; value: string };

// 20-pack implied-value stack. Per Design.md, the dream-outcome stack lives
// in the 20-pack — every obstacle to landing a job has a line in this list.
// Numbers are "if you bought each component separately on the open market"
// — they're plausible-but-defensible (e.g., interview prep tools charge
// $50-150/mo; the human review market starts around $150).
const twentyPackStack: StackItem[] = [
  { item: "20 × 4-angle resume gallery (80 designs total)", value: "$180" },
  { item: "20 × 3-variant cover letter (60 letters)", value: "$60" },
  { item: "20 × ATS deep-scan + per-bullet impact", value: "$80" },
  { item: "Unlimited chat fine-tune edits per run", value: "$30" },
  { item: "LinkedIn profile rewrite (1× included)", value: "$40" },
  { item: "10 × interview prep sessions — likely Qs + practice", value: "$150" },
  { item: "20 × outreach DM templates for hiring managers", value: "$60" },
  { item: "Cover letter generator in English + Spanish", value: "$20" },
  { item: "1 × human review by a certified recruiter", value: "$150" },
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
    <section className="border-t border-neutral-900 bg-neutral-950/60 py-20 sm:py-24">
      <div className="mx-auto max-w-3xl px-6">
        <div className="text-center">
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
            20-pack — value stack
          </span>
          <h2 className="mt-4 text-h1 text-white sm:text-3xl">
            Everything in the 20-pack.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-neutral-400">
            Priced separately on the open market, this stack runs $
            {total}+. You pay $79 once. Credits never expire.
          </p>
        </div>

        <div className="mt-12 overflow-hidden rounded-xl border border-neutral-800 bg-black">
          {twentyPackStack.map((row, i) => (
            <div
              key={i}
              className={`flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-neutral-950/60 ${
                i !== twentyPackStack.length - 1
                  ? "border-b border-neutral-900"
                  : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <Check
                  className="size-4 shrink-0 translate-y-0.5 text-white"
                  aria-hidden="true"
                />
                <span className="text-sm text-neutral-200">{row.item}</span>
              </div>
              <span className="font-mono text-sm font-medium tabular-nums text-neutral-500">
                {row.value}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-neutral-800 bg-neutral-800 text-center">
          <div className="bg-black p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
              Total open-market value
            </p>
            <p className="mt-3 font-mono text-2xl font-medium tabular-nums text-neutral-500">
              ${total}
            </p>
          </div>
          <div className="bg-black p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
              You pay
            </p>
            <p className="mt-3 font-mono text-3xl font-bold tabular-nums text-white sm:text-4xl">
              $79
            </p>
            <p className="mt-1 text-xs text-neutral-500">
              Once. Credits don&apos;t expire.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
