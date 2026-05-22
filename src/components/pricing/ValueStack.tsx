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

export function ValueStack() {
  const total = huntStack.reduce(
    (sum, x) => sum + Number(x.value.replace("$", "")),
    0,
  );

  return (
    <section className="border-t border-neutral-900 bg-neutral-950/60 py-20">
      <div className="mx-auto max-w-3xl px-6">
        <div className="text-center">
          <div className="text-xs uppercase tracking-widest text-neutral-500">
            Hunt — value stack
          </div>
          <h2 className="mt-3 text-2xl font-semibold sm:text-3xl text-white">
            ${total}+ of tooling. $35/mo.
          </h2>
          <p className="mt-3 text-sm text-neutral-400">
            Everything that gets you from open tab to signed offer — in one
            place.
          </p>
        </div>

        <div className="mt-10 overflow-hidden rounded-2xl border border-neutral-800 bg-black">
          {huntStack.map((row, i) => (
            <div
              key={i}
              className={`flex items-center justify-between gap-4 px-5 py-4 ${
                i !== huntStack.length - 1
                  ? "border-b border-neutral-900"
                  : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <Check className="size-4 shrink-0 mt-0.5 text-white" aria-hidden="true" />
                <span className="text-sm text-neutral-200">{row.item}</span>
              </div>
              <span className="text-sm font-medium text-neutral-500 tabular-nums">
                {row.value}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-neutral-800 bg-black p-6 text-center">
          <p className="text-xs uppercase tracking-widest text-neutral-500">
            Total implied value
          </p>
          <p className="mt-2 text-2xl font-semibold text-neutral-500 line-through decoration-neutral-700">
            ${total}/mo
          </p>
          <p className="mt-1 text-sm text-neutral-400">You pay</p>
          <p className="mt-1 text-4xl font-bold text-white">$35/mo</p>
          <p className="mt-2 text-xs text-neutral-500">
            $28/mo if you go annual.
          </p>
        </div>
      </div>
    </section>
  );
}
