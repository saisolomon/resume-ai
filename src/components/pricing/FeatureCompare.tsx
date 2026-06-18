import { Check, Minus, Clock, ChevronDown } from "lucide-react";

/**
 * Progressive disclosure (principle 10). The pack cards show the 4-5
 * features that drive the decision; the full matrix overwhelms if shown
 * up front, so it lives behind a collapsed "Compare all features" toggle
 * for the minority who want to scan every line. Native <details> for
 * keyboard + screen-reader support, matching PricingFAQ.
 */

type Cell = boolean | "soon" | string;
type Row = { feature: string; single: Cell; five: Cell; twenty: Cell };

const ROWS: Row[] = [
  { feature: "Tailored runs (credits)", single: "1", five: "5", twenty: "20" },
  { feature: "4 resume angles per run", single: true, five: true, twenty: true },
  { feature: "3 cover letter variants", single: true, five: true, twenty: true },
  { feature: "ATS deep-scan + per-bullet impact", single: true, five: true, twenty: true },
  { feature: "Unlimited chat fine-tune edits", single: true, five: true, twenty: true },
  { feature: "PDF + DOCX downloads", single: true, five: true, twenty: true },
  { feature: "Saved dashboard + side-by-side compare", single: false, five: true, twenty: true },
  { feature: "LinkedIn profile rewrite", single: false, five: "1×", twenty: "1×" },
  { feature: "Outreach templates for hiring managers", single: false, five: false, twenty: true },
  { feature: "Cover letters in English + Spanish", single: false, five: false, twenty: true },
  { feature: "Interview prep — 10 sessions", single: false, five: false, twenty: "soon" },
  { feature: "Human review by a certified recruiter", single: false, five: false, twenty: "soon" },
  { feature: "Credits never expire", single: true, five: true, twenty: true },
  { feature: "Cost per resume", single: "$9.00", five: "$5.80", twenty: "$3.95" },
];

function CellValue({ value }: { value: Cell }) {
  if (value === true)
    return (
      <>
        <Check
          className="mx-auto size-5 text-[#1A7F45]"
          aria-hidden="true"
        />
        <span className="sr-only">Included</span>
      </>
    );
  if (value === false)
    return (
      <>
        <Minus className="mx-auto size-5 text-[#C7C7CC]" aria-hidden="true" />
        <span className="sr-only">Not included</span>
      </>
    );
  if (value === "soon")
    return (
      <span className="inline-flex items-center gap-1 text-[12px] font-medium text-[#92400E]">
        <Clock className="size-4" aria-hidden="true" />
        Soon
      </span>
    );
  return (
    <span className="text-[14px] font-medium tabular-nums text-[#1D1D1F]">
      {value}
    </span>
  );
}

export function FeatureCompare() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-12 sm:px-8">
      <details className="group overflow-hidden rounded-2xl bg-white shadow-card">
        <summary className="focus-ring flex list-none cursor-pointer items-center justify-between gap-4 px-6 py-5 text-left text-[17px] font-medium text-[#1D1D1F] transition-colors hover:bg-[#FAFAFA] sm:px-8">
          Compare all features
          <ChevronDown
            aria-hidden="true"
            className="size-5 shrink-0 text-[#86868B] transition-transform duration-200 group-open:rotate-180"
          />
        </summary>

        <div className="overflow-x-auto border-t border-[#D2D2D7]/70">
          <table className="w-full min-w-[520px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[#D2D2D7]/70 text-[13px] text-[#86868B]">
                <th scope="col" className="px-6 py-4 font-medium sm:px-8">
                  Feature
                </th>
                <th scope="col" className="px-3 py-4 text-center font-medium">
                  Single
                </th>
                <th scope="col" className="px-3 py-4 text-center font-medium">
                  5-pack
                </th>
                <th scope="col" className="px-3 py-4 text-center font-medium">
                  20-pack
                </th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row, i) => (
                <tr
                  key={row.feature}
                  className={
                    i !== ROWS.length - 1
                      ? "border-b border-[#D2D2D7]/50"
                      : ""
                  }
                >
                  <th
                    scope="row"
                    className="px-6 py-3.5 text-left text-[14px] font-normal text-[#1D1D1F] sm:px-8"
                  >
                    {row.feature}
                  </th>
                  <td className="px-3 py-3.5 text-center">
                    <CellValue value={row.single} />
                  </td>
                  <td className="bg-[#FAFAFA] px-3 py-3.5 text-center">
                    <CellValue value={row.five} />
                  </td>
                  <td className="px-3 py-3.5 text-center">
                    <CellValue value={row.twenty} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </section>
  );
}
