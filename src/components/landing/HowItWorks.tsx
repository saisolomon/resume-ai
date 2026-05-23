/**
 * HowItWorks — three-step strip, Apple-light.
 *
 * Three white cards on the mist canvas, generous gutters, monospaced step
 * numerals to carry rhythm. No dividers, no card borders — soft shadows do
 * the work. Sentence-case throughout.
 */
const STEPS: { n: string; title: string; body: string }[] = [
  {
    n: "01",
    title: "Paste a job posting URL.",
    body: "Lever, Greenhouse, Ashby, company careers page — we parse it.",
  },
  {
    n: "02",
    title: "Drop your resume.",
    body: "PDF or DOCX. Stays on your account. Never trained on. Never shared.",
  },
  {
    n: "03",
    title: "Ship the one that scores highest.",
    body: "Four angles, four templates, ATS-scored. Download the winner.",
  },
];

export function HowItWorks() {
  return (
    <section className="bg-[#FAFAFA] py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        <div className="mb-16 text-center">
          <h2 className="text-h1 text-[#1D1D1F]">How it works.</h2>
          <p className="mx-auto mt-4 max-w-xl text-[17px] leading-relaxed text-[#6E6E73]">
            Thirty seconds, three steps. No card required for the preview.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3 sm:gap-8">
          {STEPS.map((step) => (
            <div
              key={step.n}
              className="flex flex-col gap-4 rounded-2xl bg-white p-8 shadow-card transition-shadow duration-300 hover:shadow-card-hover"
            >
              <span className="font-mono text-[13px] tabular-nums text-[#86868B]">
                {step.n}
              </span>
              <h3 className="text-h3 text-[#1D1D1F]">{step.title}</h3>
              <p className="text-[15px] leading-relaxed text-[#6E6E73]">
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
