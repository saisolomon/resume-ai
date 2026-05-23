/**
 * The four angles section — the most product-specific block on the page.
 *
 * Calls out the exact output structure (Engineering depth / Leadership /
 * Cross-functional / Specialist) using the editorial-blue label that
 * appears on real card tiles. This is the page's most "developer tool"
 * moment — it teaches the user what they're going to get, in the same
 * vocabulary the product uses internally.
 */
const ANGLES: {
  label: string;
  body: string;
  detail: string;
}[] = [
  {
    label: "Engineering depth",
    body: "For senior IC roles. Surfaces system-design, scale, ownership signals.",
    detail: "Used when the JD reads heavy on architecture, P99, scale.",
  },
  {
    label: "Leadership",
    body: "For tech lead / staff+. Foregrounds people-impact, mentorship, scope.",
    detail: "Used when the JD asks for team leadership, cross-team work.",
  },
  {
    label: "Cross-functional",
    body: "For PM-adjacent roles. Highlights product partnership and outcomes.",
    detail: "Used when the JD names design / product / GTM collaboration.",
  },
  {
    label: "Specialist",
    body: "For domain roles (ML, infra, security). Leads with the depth match.",
    detail: "Used when the JD names a specific stack or sub-discipline.",
  },
];

export function TheFourAngles() {
  return (
    <section className="border-t border-neutral-900 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-10 grid items-end gap-6 sm:grid-cols-[1fr_auto]">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
              The output
            </span>
            <h2 className="mt-3 text-h1 text-white">
              One JD. Four angles, ranked.
            </h2>
            <p className="mt-3 max-w-xl text-sm text-neutral-400">
              We don&apos;t guess which version of you the recruiter wants. We
              generate four, score them, and let you pick.
            </p>
          </div>
          <span className="font-mono text-[11px] tabular-nums text-neutral-600">
            04 / angles
          </span>
        </div>

        <div className="grid gap-px overflow-hidden rounded-xl border border-neutral-800 bg-neutral-800 sm:grid-cols-2 lg:grid-cols-4">
          {ANGLES.map((angle) => (
            <div
              key={angle.label}
              className="flex flex-col gap-3 bg-black p-6"
            >
              <div className="inline-flex w-fit items-center rounded-md bg-white/95 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-blue-700">
                {angle.label}
              </div>
              <div className="text-sm text-neutral-200">{angle.body}</div>
              <div className="mt-auto text-xs text-neutral-500">
                {angle.detail}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
