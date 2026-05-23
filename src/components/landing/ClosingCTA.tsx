import Link from "next/link";
import { Shield, ArrowRight } from "lucide-react";

/**
 * Closing CTA — the page's repeat-the-offer moment.
 *
 * Editorial-centered, single brand-accent CTA, with the Hormozi-aligned
 * 30-day guarantee restated as the page's risk-reversal close. The
 * shield icon sits in a hairline-bordered tile rather than a glowing
 * badge — keeps the developer-tool tone.
 */
export function ClosingCTA() {
  return (
    <section className="border-t border-neutral-900 bg-neutral-950/60 py-20 sm:py-24">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <div className="mx-auto mb-6 flex size-14 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-950">
          <Shield className="size-7 text-white" aria-hidden="true" />
        </div>
        <h2 className="text-display text-white">
          30 days. No interview, full refund.
        </h2>
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
            See pricing
          </Link>
        </div>
      </div>
    </section>
  );
}
