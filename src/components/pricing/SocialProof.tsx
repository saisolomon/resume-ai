import { Star } from "lucide-react";

/**
 * Social proof at the price point (principle 9). A testimonial placed
 * directly below the pricing table is the single highest-converting spot
 * for one — the visitor is in decision mode and a real voice here resolves
 * the last doubt.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * PLACEHOLDER CONTENT — NOT REAL CUSTOMERS YET.
 *
 * Principle 12 (urgency/proof without fakery) is non-negotiable here: we do
 * NOT want fabricated quotes or invented metrics shipping as if they were
 * verified. So while `PLACEHOLDER` is true this section renders with an
 * honest "Example" marker and blank ("—") stats, and the quote reads as
 * illustrative, not attributed to a specific named person.
 *
 * TO GO LIVE: paste a real customer quote into `testimonial`, fill `stats`
 * with real numbers, then set `PLACEHOLDER = false`. The markers disappear
 * and the section becomes genuine social proof.
 * ─────────────────────────────────────────────────────────────────────────
 */
const PLACEHOLDER = true;

const testimonial = {
  // A real quote ideally names the ROI/value relative to the price. Keep it
  // about the deliverable, not a career outcome — the brand explicitly does
  // not promise interviews/offers (see ClosingCTA.tsx).
  quote:
    "Four tailored angles off a single paste — I shipped the Leadership version in minutes instead of burning an evening hand-editing.",
  attribution: "Early access user", // ← replace with a real name + role/company
};

const stats: { value: string; label: string }[] = [
  { value: "—", label: "resumes tailored" },
  { value: "—", label: "avg ATS score lift" },
  { value: "—", label: "would recommend" },
];

export function SocialProof() {
  return (
    <section
      aria-label="What people are saying"
      className="mx-auto max-w-3xl px-6 pb-4 sm:px-8"
    >
      <figure className="rounded-2xl bg-white p-8 shadow-card sm:p-10">
        <div className="flex items-center gap-3">
          <span
            role="img"
            aria-label="Rated 5 out of 5"
            className="flex items-center gap-1 text-[#1A7F45]"
          >
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="size-4 fill-current" aria-hidden="true" />
            ))}
          </span>
          {PLACEHOLDER && (
            <span className="inline-flex items-center rounded-full bg-[#FEF3C7] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.04em] text-[#92400E]">
              Example
            </span>
          )}
        </div>

        <blockquote className="mt-5 text-[21px] leading-snug tracking-[-0.01em] text-[#1D1D1F]">
          &ldquo;{testimonial.quote}&rdquo;
        </blockquote>

        <figcaption className="mt-5 text-[15px] text-[#6E6E73]">
          — {testimonial.attribution}
        </figcaption>

        <div className="mt-8 grid grid-cols-3 gap-4 border-t border-[#D2D2D7]/70 pt-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-mono text-[28px] font-semibold leading-none tabular-nums text-[#1D1D1F]">
                {s.value}
              </div>
              <div className="mt-2 text-[13px] text-[#86868B]">{s.label}</div>
            </div>
          ))}
        </div>

        {PLACEHOLDER && (
          <p className="mt-6 text-center text-[13px] text-[#A1A1A6]">
            Example testimonial and placeholder stats — real figures coming
            soon.
          </p>
        )}
      </figure>
    </section>
  );
}
