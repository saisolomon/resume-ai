import { Check } from "lucide-react";

type StackItem = { item: string; value: string };

const huntStack: StackItem[] = [
  { item: "Unlimited tailored runs (all 4 angles, all 4 templates)", value: "$25" },
  { item: "Chat fine-tune editor + custom angles", value: "$15" },
  { item: "ATS deep-scan with per-bullet impact", value: "$15" },
  { item: "Side-by-side compare + JD watchlist", value: "$10" },
  { item: "Cover letter generator (3 variants per JD)", value: "$15" },
  { item: "LinkedIn profile rewrite (quarterly)", value: "$10" },
  { item: "Interview prep — likely questions + practice", value: "$15" },
  { item: "Outreach templates for hiring managers", value: "$10" },
  { item: "1 human review credit / month", value: "$25" },
];

/**
 * Hormozi-style value stack — the "if you priced every component
 * separately, here's the bill" block. The trick is making it read
 * informational rather than salesy: monospaced dollar values, hairline
 * dividers, no red badges or strikethrough animation.
 */
export function ValueStack() {
  const total = huntStack.reduce(
    (sum, x) => sum + Number(x.value.replace("$", "")),
    0,
  );

  return (
    <section className="border-t border-neutral-900 bg-neutral-950/60 py-20 sm:py-24">
      <div className="mx-auto max-w-3xl px-6">
        <div className="text-center">
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
            Hunt — value stack
          </span>
          <h2 className="mt-4 text-h1 text-white sm:text-3xl">
            ${total}+ of tooling. $35/mo.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-neutral-400">
            Everything that gets you from open tab to signed offer — in one
            place.
          </p>
        </div>

        <div className="mt-12 overflow-hidden rounded-xl border border-neutral-800 bg-black">
          {huntStack.map((row, i) => (
            <div
              key={i}
              className={`flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-neutral-950/60 ${
                i !== huntStack.length - 1
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
              Total implied value
            </p>
            <p className="mt-3 font-mono text-2xl font-medium tabular-nums text-neutral-500 line-through decoration-neutral-700">
              ${total}/mo
            </p>
          </div>
          <div className="bg-black p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
              You pay
            </p>
            <p className="mt-3 font-mono text-3xl font-bold tabular-nums text-white sm:text-4xl">
              $35/mo
            </p>
            <p className="mt-1 text-xs text-neutral-500">
              $28/mo if you go annual.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}