import Link from "next/link";
import { Shield } from "lucide-react";

/**
 * Closing CTA — repeat the offer + 30-day guarantee, Apple-light.
 *
 * Three white cards on the mist canvas (anchored center, scale 1.02,
 * shadow-xl), then the Hormozi guarantee block below in its own pocket
 * of whitespace. Pill primary CTA. Sentence-case throughout.
 *
 * Guarantee copy preserved verbatim per the business invariants.
 */

const PRICING = [
  {
    pack: "Single",
    credits: "1 credit",
    price: "$9",
    perUnit: null,
    tagline: "Tailored for one job. One purchase. Done.",
    anchored: false,
  },
  {
    pack: "5-pack",
    credits: "5 credits",
    price: "$29",
    perUnit: "$5.80 per resume",
    tagline: "For the active job hunt.",
    anchored: true,
  },
  {
    pack: "20-pack",
    credits: "20 credits + bonuses",
    price: "$79",
    perUnit: "$3.95 per resume",
    tagline: "The full job hunt, ammunition included.",
    anchored: false,
  },
];

export function ClosingCTA() {
  return (
    <section
      className="py-32 sm:py-40"
      aria-label="Pricing and 30-day guarantee"
    >
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        {/* ─── Pricing trio ─── */}
        <div className="mb-24 text-center sm:mb-32">
          <h2 className="text-display text-[#1D1D1F]">Start with one.</h2>
          <p className="mx-auto mt-4 max-w-xl text-[17px] leading-relaxed text-[#6E6E73]">
            Pay once. Credits never expire. Every credit gets you 4 tailored
            resume angles and 3 cover letter variants.
          </p>

          <div className="mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-3 sm:items-stretch">
            {PRICING.map((p) => (
              <div
                key={p.pack}
                className={`relative flex flex-col items-center gap-3 rounded-[20px] bg-white p-8 transition-shadow duration-300 ${
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
                <span className="text-[13px] font-medium text-[#6E6E73]">
                  {p.pack}
                </span>
                <div className="text-[44px] font-semibold leading-none tracking-tight text-[#1D1D1F]">
                  {p.price}
                </div>
                <div className="text-[13px] text-[#86868B]">
                  {p.credits}
                  {p.perUnit && (
                    <>
                      {" · "}
                      <span>{p.perUnit}</span>
                    </>
                  )}
                </div>
                <p className="mt-2 max-w-[18ch] text-[15px] leading-snug text-[#1D1D1F]">
                  {p.tagline}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-8 text-[13px] text-[#86868B]">
            No subscription. No auto-renew. Credits never expire.
          </p>
        </div>

        {/* ─── Guarantee ─── */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-white shadow-card">
            <Shield className="size-7 text-[#1D1D1F]" aria-hidden="true" />
          </div>
          <h3 className="text-display text-[#1D1D1F]">
            30 days. No interview, full refund.
          </h3>
          <p className="mt-5 text-[19px] leading-relaxed text-[#6E6E73]">
            One email. No support hoops.
          </p>
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
