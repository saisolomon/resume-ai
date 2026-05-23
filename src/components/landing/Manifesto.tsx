/**
 * Manifesto — calm statement of purpose, no insurgent attacks.
 *
 * The earlier version named Indeed, LinkedIn Easy Apply, and "generic AI"
 * by category. Apple voice is confidence through specificity — we don't
 * punch down to make the point. The headline lands, the right column lists
 * the category practices we declined to copy, but the rhythm is editorial
 * (not combative).
 */
const POINTS: { name: string; body: string }[] = [
  {
    name: "One generic resume.",
    body: "Built once, sent everywhere. Fits zero jobs in particular.",
  },
  {
    name: "Easy-apply pile-up.",
    body: "Dropped into the same pile as 800 other applicants.",
  },
  {
    name: "Generic AI output.",
    body: "Reads like every other AI resume. Recruiters spot it in six seconds.",
  },
];

export function Manifesto() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20">
          <div>
            <h2 className="text-display text-[#1D1D1F]">
              We built the resume tool we wished existed.
            </h2>
            <p className="mt-6 max-w-md text-[17px] leading-relaxed text-[#6E6E73]">
              You already write good resumes. You don&apos;t need a tool that
              writes them for you — you need one that retailors them per
              application, without burning your evening every time.
            </p>
          </div>

          <ul className="divide-y divide-[#D2D2D7]/70 border-y border-[#D2D2D7]/70">
            {POINTS.map((p) => (
              <li key={p.name} className="flex flex-col gap-1 py-5">
                <span className="text-[15px] font-semibold text-[#1D1D1F]">
                  {p.name}
                </span>
                <span className="text-[15px] leading-relaxed text-[#6E6E73]">
                  {p.body}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
