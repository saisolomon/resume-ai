import Link from "next/link";
import { Check } from "lucide-react";

/**
 * Closing CTA — repeat the offer, Apple-light.
 *
 * Three white cards on the mist canvas (anchored center, scale 1.02,
 * shadow-xl). Pill primary CTA. Sentence-case throughout. No refund or
 * guarantee language — credits are consumed on generation and we don't
 * promise career outcomes.
 *
 * Each card carries an abbreviated 4-bullet "what you get" list. The
 * full feature list (with Coming Soon markers on items still in
 * roadmap) lives on /pricing — the "See full pricing" CTA below routes
 * there. Bullets here are deliberately limited to shipped features so
 * landing copy is honest without needing the Coming Soon pill UI.
 */

type Pack = {
  pack: string;
  credits: string;
  price: string;
  perUnit: string | null;
  tagline: string;
  anchored: boolean;
  bullets: string[];
};

// Anchor high (principle 1) — match /pricing: 20-pack first so each tier
// reads as a deal vs the $79 anchor; 5-pack stays the highlighted center.
const PRICING: Pack[] = [
  {
    pack: "20-pack",
    credits: "20 credits + bonuses",
    price: "$79",
    perUnit: "$3.95 per resume",
    tagline: "The full job hunt, ammunition included.",
    anchored: false,
    bullets: [
      "Everything in 5-pack, ×4",
      "Outreach templates per JD",
      "Cover letters in English + Spanish",
      "Credits never expire",
    ],
  },
  {
    pack: "5-pack",
    credits: "5 credits",
    price: "$29",
    perUnit: "$5.80 per resume",
    tagline: "For the active job hunt.",
    anchored: true,
    bullets: [
      "Everything in Single, ×5",
      "LinkedIn profile rewrite",
      "Saved runs in your dashboard",
      "Credits never expire",
    ],
  },
  {
    pack: "Single",
    credits: "1 credit",
    price: "$9",
    perUnit: null,
    tagline: "Tailored for one job. One purchase. Done.",
    anchored: false,
    bullets: [
      "4 tailored resume designs",
      "3 cover letter variants",
      "ATS deep-scan + per-bullet impact",
      "Unlimited chat fine-tune edits",
    ],
  },
];

export function ClosingCTA() {
  return (
    <section
      className="py-32 sm:py-40"
      aria-label="Pricing"
    >
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        {/* ─── Pricing trio ─── */}
        <div className="text-center">
          <h2 className="text-display text-[#1D1D1F]">Start with one.</h2>
          <p className="mx-auto mt-4 max-w-xl text-[17px] leading-relaxed text-[#6E6E73]">
            Pay once. Credits never expire. Every credit gets you 4 tailored
            resume angles and 3 cover letter variants.
          </p>

          <div className="mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-3 sm:items-stretch">
            {PRICING.map((p) => (
              <div
                key={p.pack}
                className={`relative flex flex-col rounded-[20px] bg-white p-8 text-left transition-shadow duration-300 ${
                  p.anchored
                    ? "shadow-card-xl md:scale-[1.02]"
                    : "shadow-card hover:shadow-card-hover"
                }`}
              >
                {p.anchored && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#1D1D1F] px-3 py-1 text-[12px] font-medium text-white">
                    Most popular
                  </span>
                )}

                {/* Header: pack name + price + per-unit */}
                <span className="text-[13px] font-medium text-[#6E6E73]">
                  {p.pack}
                </span>
                <div className="mt-2 text-[44px] font-semibold leading-none tracking-tight text-[#1D1D1F]">
                  {p.price}
                </div>
                <div className="mt-2 text-[13px] text-[#86868B]">
                  {p.credits}
                  {p.perUnit && (
                    <>
                      {" · "}
                      <span>{p.perUnit}</span>
                    </>
                  )}
                </div>
                <p className="mt-3 text-[15px] leading-snug text-[#1D1D1F]">
                  {p.tagline}
                </p>

                {/* Hairline divider above the bullet list */}
                <div
                  className="my-5 h-px bg-[#D2D2D7]"
                  aria-hidden="true"
                />

                {/* Offerings — abbreviated. Full list on /pricing. */}
                <ul className="flex-1 space-y-2.5 text-[14px]">
                  {p.bullets.map((b, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <Check
                        className={`mt-0.5 size-4 shrink-0 ${
                          p.anchored ? "text-[#1A7F45]" : "text-[#6E6E73]"
                        }`}
                        aria-hidden="true"
                      />
                      <span className="text-[#1D1D1F]">{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <p className="mt-8 text-[13px] text-[#86868B]">
            No subscription. No auto-renew. Credits never expire.
          </p>

          {/* CTA row — sits directly below pricing now that the guarantee
              block is gone. Same pair: primary into the start flow,
              secondary to full pricing. */}
          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="#start"
              className="focus-ring inline-flex h-14 items-center rounded-full bg-[#1D1D1F] px-8 text-[17px] font-medium text-white transition-colors duration-200 hover:bg-black"
            >
              Tailor my resume
            </Link>
            <Link
              href="/pricing"
              className="focus-ring inline-flex h-14 items-center rounded-full border border-[#D2D2D7] bg-white px-8 text-[17px] font-medium text-[#1D1D1F] transition-colors duration-200 hover:border-[#86868B] hover:bg-[#F5F5F7]"
            >
              See full pricing
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
