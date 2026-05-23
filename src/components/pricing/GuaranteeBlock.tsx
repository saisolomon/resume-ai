import { Shield } from "lucide-react";

/**
 * 30-day guarantee block.
 *
 * Copy is locked verbatim per Design.md. The shield icon sits in a
 * hairline-bordered tile — no glow, no badge — matching the developer-
 * tool restraint elsewhere on the page.
 */
export function GuaranteeBlock() {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-2xl px-6 text-center">
        <div className="mx-auto mb-6 flex size-14 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-950">
          <Shield className="size-7 text-white" aria-hidden="true" />
        </div>
        <h2 className="text-h1 text-white sm:text-3xl">
          30 days. No interview, full refund.
        </h2>
        <p className="mt-4 text-base text-neutral-400">
          One email, no support hoops.
        </p>
      </div>
    </section>
  );
}