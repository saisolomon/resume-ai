import { Check } from "lucide-react";

/**
 * What we don't do — category practices we declined to copy.
 *
 * Reframed from the prior "dark pattern compare" — Apple voice is
 * confidence through specificity, not insurgent attack. The left column
 * lists category practices (no specific competitor brands by name); the
 * right column lists how resume.ai works. Two columns of light cards on
 * the alt canvas, hairline divider between rows.
 *
 * Filename is preserved (`DarkPatternCompare.tsx`) to avoid a rename
 * cascade through tests and imports; the exported function is renamed
 * to `WhatWeDontDo` and the old name is kept as a back-compat alias.
 */

type Row = {
  category: string;
  ours: string;
};

const ROWS: Row[] = [
  {
    category: "Trials that quietly auto-renew at four times the trial price.",
    ours: "Per-credit. $9, $29, or $79. Pay once.",
  },
  {
    category: "Pricing hidden until the checkout screen.",
    ours: "All three prices on this page. Right above this block.",
  },
  {
    category: "Watermarked downloads on the free tier.",
    ours: "No watermarks. Ever.",
  },
  {
    category: "Cancellation buried four clicks deep.",
    ours: "Nothing to cancel. Credits don't expire.",
  },
  {
    category: "Templates sold as outcomes.",
    ours: "Four tailored angles, not 35 templates.",
  },
  {
    category: "AI that sounds like every other AI.",
    ours: "Sonnet rewrites your bullets in your voice.",
  },
  {
    category: "ATS scoring presented as a guarantee.",
    ours: "Honest scoring. Recruiter-readable bullets.",
  },
];

export function WhatWeDontDo() {
  return (
    <section
      aria-label="What we don't do — category practices we declined to copy"
      className="bg-[#FAFAFA] py-24 sm:py-32"
    >
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        <div className="mb-16 max-w-2xl">
          <h2 className="text-h1 text-[#1D1D1F]">What we don&apos;t do.</h2>
          <p className="mt-4 text-[17px] leading-relaxed text-[#6E6E73]">
            The category runs on a small set of recurring practices. Here are
            the ones we chose not to copy — on the same page, before you pay.
          </p>
        </div>

        {/* Single card with rows. Two columns on desktop, stacked on mobile. */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-card">
          {/* Column heads */}
          <div className="grid grid-cols-1 border-b border-[#D2D2D7]/70 lg:grid-cols-2">
            <div className="px-6 py-4 lg:border-r lg:border-[#D2D2D7]/70 lg:px-8">
              <span className="text-[13px] font-medium text-[#86868B]">
                Category practices
              </span>
            </div>
            <div className="border-t border-[#D2D2D7]/70 px-6 py-4 lg:border-l-0 lg:border-t-0 lg:px-8">
              <span className="text-[13px] font-medium text-[#1D1D1F]">
                How resume.ai works
              </span>
            </div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-[#D2D2D7]/70">
            {ROWS.map((row, i) => (
              <div key={i} className="grid grid-cols-1 lg:grid-cols-2">
                {/* Left — category practice */}
                <div className="flex items-start gap-3 px-6 py-5 lg:border-r lg:border-[#D2D2D7]/70 lg:px-8">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 text-[15px] text-[#A1A1A6]"
                  >
                    —
                  </span>
                  <p className="text-[15px] leading-relaxed text-[#86868B]">
                    {row.category}
                  </p>
                </div>

                {/* Right — our practice */}
                <div className="flex items-start gap-3 border-t border-[#D2D2D7]/70 px-6 py-5 lg:border-l-0 lg:border-t-0 lg:px-8">
                  <Check
                    className="mt-0.5 size-5 flex-shrink-0 text-[#1A7F45]"
                    aria-hidden="true"
                  />
                  <p className="text-[15px] font-medium leading-relaxed text-[#1D1D1F]">
                    {row.ours}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-8 text-center text-[13px] text-[#86868B]">
          We expect this list to be read closely. We expect to stand behind
          every line of it.
        </p>
      </div>
    </section>
  );
}

/**
 * Back-compat alias — keep the old name exported so existing imports
 * (`import { DarkPatternCompare } from ...`) keep working through the
 * rename without ripple.
 */
export const DarkPatternCompare = WhatWeDontDo;
