/**
 * Three-step "how it works" strip.
 *
 * Editorial numbered list, not a stack of icon cards. Monospaced numerals
 * + hairline column dividers do the visual work; the copy stays specific
 * (the *what* of each step, in tool-language). No CTA inside this block —
 * the page already has one above.
 */
const STEPS: { n: string; title: string; body: string }[] = [
  {
    n: "01",
    title: "Paste a JD URL.",
    body: "Lever, Greenhouse, Ashby, company careers page — we scrape it.",
  },
  {
    n: "02",
    title: "Drop your resume.",
    body: "PDF or DOCX. Stays on your account, never trained on, never shared.",
  },
  {
    n: "03",
    title: "Ship the one that scores highest.",
    body: "Four angles, four templates, ATS-scored. Download the winner.",
  },
];

export function HowItWorks() {
  return (
    <section className="border-t border-neutral-900 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-10 flex items-baseline justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
            How it works
          </span>
          <span className="font-mono text-[11px] tabular-nums text-neutral-600">
            03 / steps
          </span>
        </div>
        <div className="grid gap-px overflow-hidden rounded-xl border border-neutral-800 bg-neutral-800 sm:grid-cols-3">
          {STEPS.map((step) => (
            <div
              key={step.n}
              className="flex flex-col gap-3 bg-black p-6 sm:p-8"
            >
              <span className="font-mono text-sm tabular-nums text-neutral-500">
                {step.n}
              </span>
              <div className="text-h3 text-white">{step.title}</div>
              <p className="text-sm text-neutral-400">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
