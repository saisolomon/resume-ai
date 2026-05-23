import { Shield } from "lucide-react";

export function GuaranteeBlock() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-2xl px-6 text-center">
        <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl border border-neutral-800 bg-neutral-950">
          <Shield className="size-7 text-white" aria-hidden="true" />
        </div>
        <h2 className="text-2xl font-semibold sm:text-3xl text-white">
          30 days. No interview, full refund.
        </h2>
        <p className="mt-4 text-base text-neutral-400">
          One email, no support hoops.
        </p>
      </div>
    </section>
  );
}
