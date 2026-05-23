import Link from "next/link";
import { Shield, ArrowRight } from "lucide-react";

/**
 * Closing CTA — the page's repeat-the-offer moment.
 *
 * Two-block layout:
 *   1. Pricing trio (Single $9 / 5-pack $29 / 20-pack $79) — center-anchored
 *      so the DarkPatternCompare section below can truthfully claim "all
 *      three prices on this page, right above this block." The 5-pack is
 *      visually anchored per Design.md (white border ring, larger price).
 *   2. Hormozi 30-day guarantee — risk-reversal close. Editorial-centered,
 *      single brand-accent CTA.
 *
 * The component keeps the existing CTA wiring (#start anchor + /pricing
 * deep-link) so the form above remains the conversion target.
 */

const PRICING = [
  {
    pack: "Single",
    credits: "1 credit",
    price: "$9",
    perUnit: null,
    tagline: "One job? One purchase.",
    anchored: false,
  },
  {
    pack: "5-pack",
    credits: "5 credits",
    price: "$29",
    perUnit: "$5.80 each",
    tagline: "For the active job hunt.",
    anchored: true,
  },
  {
    pack: "20-pack",
    credits: "20 credits + bonuses",
    price: "$79",
    perUnit: "$3.95 each",
    tagline: "Full job hunt, ammunition included.",
    anchored: false,
  },
];

export function ClosingCTA() {
  return (
    <section
      className="border-t border-neutral-900 bg-neutral-950/60 py-16 sm:py-20"
      aria-label="Pricing and 30-day guarantee"
    >
      <div className="mx-auto max-w-6xl px-6">
        {/* ─── Pricing trio ─── */}
        <div className="mb-16 text-center sm:mb-20">
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
            Pricing
          </span>
          <h2 className="mt-3 text-h1 text-white">
            $9. $29. $79. That&apos;s it.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-neutral-400">
            Pay once. Credits never expire. Every credit gets you 4 tailored
            resume angles and 3 cover letter variants.
          </p>

          <div className="mx-auto mt-10 grid max-w-4xl gap-px overflow-hidden rounded-xl border border-neutral-800 bg-neutral-800 sm:grid-cols-3">
            {PRICING.map((p) => (
              <div
                key={p.pack}
                className={`flex flex-col items-center gap-2 px-5 py-7 ${
                  p.anchored ? "bg-neutral-900" : "bg-black"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-neutral-400">
                    {p.pack}
                  </span>
                  {p.anchored && (
                    <span className="inline-flex items-center rounded-full bg-white px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-black">
                      Most popular
                    </span>
                  )}
                </div>
                <div className="font-mono text-3xl font-semibold tabular-nums tracking-tight text-white sm:text-4xl">
                  {p.price}
                </div>
                <div className="font-mono text-[11px] text-neutral-500">
                  {p.credits}
                  {p.perUnit && (
                    <>
                      <span className="text-neutral-700"> · </span>
                      <span>{p.perUnit}</span>
                    </>
                  )}
                </div>
                <p className="mt-1 text-xs text-neutral-500">{p.tagline}</p>
              </div>
            ))}
          </div>

          <p className="mt-6 text-[11px] text-neutral-500">
            No subscription. No auto-renew. Credits never expire.
          </p>
        </div>

        {/* ─── Guarantee ─── */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-6 flex size-14 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-950">
            <Shield className="size-7 text-white" aria-hidden="true" />
          </div>
          <h3 className="text-display text-white">
            30 days. No interview, full refund.
          </h3>
          <p className="mt-4 text-base text-neutral-400">
            One email, no support hoops. Try it on the next real JD you see.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="#start"
              className="group inline-flex h-12 items-center gap-2 rounded-md bg-white px-7 text-sm font-semibold text-black transition-colors hover:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
            >
              Tailor my resume
              <ArrowRight
                className="size-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex h-12 items-center text-sm text-neutral-400 underline decoration-neutral-700 underline-offset-4 transition-colors hover:text-white hover:decoration-white"
            >
              See full pricing
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
