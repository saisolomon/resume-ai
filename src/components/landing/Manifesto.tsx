/**
 * Manifesto / against-the-status-quo block.
 *
 * The page's most opinionated moment — names the competition (template
 * builders, Easy Apply, generic AI). Editorial two-column layout: left
 * is the manifesto headline, right is the three-line indictment. The
 * right column uses hairline separators rather than bullets so it
 * reads as a written argument, not a checklist.
 */
const POINTS: { source: string; claim: string }[] = [
  {
    source: "Indeed Resume.",
    claim: "Builds one generic resume. Fits zero jobs.",
  },
  {
    source: "LinkedIn Easy Apply.",
    claim: "Drops you in the same pile as 800 other applicants.",
  },
  {
    source: "Generic AI resume tools.",
    claim: "Output copy a recruiter clears in four seconds.",
  },
];

export function Manifesto() {
  return (
    <section className="border-t border-neutral-900 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
              Against the template factory
            </span>
            <h2 className="mt-4 text-display text-white">
              Take your job hunt back.
            </h2>
            <p className="mt-6 max-w-md text-base text-neutral-400">
              You already write good resumes. You don&apos;t need a tool that
              writes them for you. You need one that retailors them per
              application — without burning your evening every time.
            </p>
          </div>

          <ul className="divide-y divide-neutral-900 border-y border-neutral-900">
            {POINTS.map((p) => (
              <li key={p.source} className="flex items-baseline gap-4 py-5">
                <span
                  aria-hidden="true"
                  className="font-mono text-xs text-neutral-600"
                >
                  ×
                </span>
                <div>
                  <span className="text-sm font-semibold text-white">
                    {p.source}
                  </span>{" "}
                  <span className="text-sm text-neutral-400">{p.claim}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
