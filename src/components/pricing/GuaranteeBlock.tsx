import { Shield } from "lucide-react";

/**
 * 30-day guarantee — Apple-light. Shield tile on white, soft shadow,
 * generous whitespace. Headline copy is locked verbatim per Design.md.
 */
export function GuaranteeBlock() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-2xl px-6 text-center sm:px-8">
        <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-white shadow-card">
          <Shield className="size-7 text-[#1D1D1F]" aria-hidden="true" />
        </div>
        <h2 className="text-display text-[#1D1D1F]">
          30 days. No interview, full refund.
        </h2>
        <p className="mt-5 text-[19px] leading-relaxed text-[#6E6E73]">
          One email. No support hoops.
        </p>
      </div>
    </section>
  );
}
