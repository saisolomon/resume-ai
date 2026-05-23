/**
 * The four angles section — names what the product actually outputs.
 *
 * Light card grid on the mist canvas; the editorial-blue angle chip is
 * preserved as the lone chromatic moment in each card. Calm copy — no
 * "developer tool" eyebrow strip, no monospaced section counter.
 */
const ANGLES: {
  label: string;
  body: string;
  detail: string;
}[] = [
  {
    label: "Engineering depth",
    body: "For senior IC roles. Surfaces system-design, scale, and ownership.",
    detail: "Best when the JD reads heavy on architecture, P99, and scale.",
  },
  {
    label: "Leadership",
    body: "For tech lead and staff roles. Foregrounds people impact, mentorship, scope.",
    detail: "Best when the JD asks for team leadership or cross-team work.",
  },
  {
    label: "Cross-functional",
    body: "For PM-adjacent roles. Highlights product partnership and shipped outcomes.",
    detail: "Best when the JD names design, product, or GTM collaboration.",
  },
  {
    label: "Specialist",
    body: "For domain roles (ML, infra, security). Leads with the depth match.",
    detail: "Best when the JD names a specific stack or sub-discipline.",
  },
];

export function TheFourAngles() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        <div className="mb-16 max-w-2xl">
          <h2 className="text-h1 text-[#1D1D1F]">
            Tailored four ways. Always.
          </h2>
          <p className="mt-4 text-[17px] leading-relaxed text-[#6E6E73]">
            We don&apos;t guess which version of you the recruiter wants. We
            generate four, score them, and let you pick.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {ANGLES.map((angle) => (
            <article
              key={angle.label}
              className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-card transition-shadow duration-300 hover:shadow-card-hover"
            >
              <div className="inline-flex w-fit items-center rounded-md bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.04em] text-[#3B82F6] ring-1 ring-[#D2D2D7]/60">
                {angle.label}
              </div>
              <p className="text-[15px] leading-relaxed text-[#1D1D1F]">
                {angle.body}
              </p>
              <p className="mt-auto text-[13px] leading-relaxed text-[#86868B]">
                {angle.detail}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
