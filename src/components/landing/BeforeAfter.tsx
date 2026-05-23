"use client";
import { ResumePreviewHtml } from "@/components/try/ResumePreviewHtml";
import { ScoreBadge } from "@/components/try/ScoreBadge";
import type { ResumeData } from "@/lib/resume/types";

/**
 * Before / After — two-column side-by-side comparison.
 *
 * Per Design.md (Before/After Comparison pattern), this is the implicit-
 * value sell. Left: a template-resume version of the candidate (generic
 * bullets, no JD-aware language, low ATS score). Right: the resume.ai
 * output for a specific JD (quantified bullets, JD keywords, high ATS
 * score). Same person, same role, same employer — the only thing that
 * changes is the tailoring.
 *
 * Data is frozen (presentational). We deliberately exaggerate neither
 * side — the "before" is what a careful engineer would write without a
 * JD in front of them; the "after" is what 30 seconds of tailoring
 * produces. The score delta (64 → 91 = +27) is the math the user does
 * for themselves.
 */

const TARGET_JD_TITLE = "Senior Backend Engineer, Payments";

const beforeResume: ResumeData = {
  name: "Ria Patel",
  contactLine1: "ria.patel@gmail.com",
  contactLine2: "Brooklyn, NY",
  education: [
    {
      institution: "Carnegie Mellon University",
      location: "Pittsburgh, PA",
      degree: "B.S. Computer Science",
      date: "2018",
    },
  ],
  experienceSections: [
    {
      heading: "Experience",
      entries: [
        {
          company: "Stripe",
          location: "New York, NY",
          roles: [
            {
              title: "Software Engineer",
              date: "2022 — Present",
              bullets: [
                "Worked on the payments team building backend services.",
                "Improved system performance and reliability.",
                "Mentored junior engineers and helped with onboarding.",
                "Collaborated cross-functionally with product and design.",
              ],
            },
          ],
        },
        {
          company: "Datadog",
          location: "New York, NY",
          roles: [
            {
              title: "Software Engineer",
              date: "2018 — 2022",
              bullets: [
                "Built features for the monitoring platform.",
                "Helped optimize the agent for better performance.",
              ],
            },
          ],
        },
      ],
    },
  ],
  additionalInfo: ["Programming languages: Python, JavaScript, Go"],
};

const afterResume: ResumeData = {
  name: "Ria Patel",
  contactLine1: "ria.patel@gmail.com · github.com/rpatel · linkedin.com/in/riapatel",
  contactLine2: "Brooklyn, NY",
  education: [
    {
      institution: "Carnegie Mellon University",
      location: "Pittsburgh, PA",
      degree: "B.S. Computer Science",
      date: "2018",
      gpa: "3.8",
    },
  ],
  experienceSections: [
    {
      heading: "Experience",
      entries: [
        {
          company: "Stripe",
          location: "New York, NY",
          roles: [
            {
              title: "Senior Software Engineer, Payments Reliability",
              date: "2022 — Present",
              bullets: [
                "Cut P99 charge-API latency 47% by sharding the ledger and pre-warming downstream caches.",
                "Owned the 2024 dispute-handler rewrite — 9 services, zero customer-visible regressions.",
                "Designed the per-account idempotency-key scheme behind the global ledger (RFC adopted by 4 teams).",
                "Mentored four eng hires through on-call ramp; cut median first-page time from 14m to 6m.",
              ],
            },
          ],
        },
        {
          company: "Datadog",
          location: "New York, NY",
          roles: [
            {
              title: "Software Engineer II, Platform",
              date: "2018 — 2022",
              bullets: [
                "Built the cross-region metric replication pipeline backing the platform's HA story.",
                "Reduced agent CPU by 30% measured across a 200k+ host fleet.",
              ],
            },
          ],
        },
      ],
    },
  ],
  additionalInfo: ["Go, Rust, TypeScript, AWS, Kubernetes, Postgres, distributed systems"],
};

export function BeforeAfter() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        <div className="mb-14 max-w-2xl">
          <h2 className="text-h1 text-[#1D1D1F]">
            What &lsquo;tailored&rsquo; actually means.
          </h2>
          <p className="mt-4 text-[17px] leading-relaxed text-[#6E6E73]">
            One JD, one credit, one minute. The left side is what most
            engineers send. The right side is what resume.ai ships.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-10">
          {/* Before */}
          <figure className="flex flex-col">
            {/* Label strip lives ABOVE the white tile so it doesn't cover
                the candidate's name in the rendered resume header. */}
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="inline-flex items-center rounded-md bg-[#FEF2F2] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.04em] text-[#B91C1C]">
                Before · generic
              </span>
              <ScoreBadge score={64} size="md" />
            </div>
            <div className="relative aspect-[5/7] overflow-hidden rounded-2xl bg-white shadow-card">
              <div
                className="absolute inset-0 origin-top-left"
                style={{ transform: "scale(0.52)", width: "192.3%", height: "192.3%" }}
                aria-hidden="true"
              >
                <ResumePreviewHtml data={beforeResume} template="classic" />
              </div>
            </div>
            <figcaption className="mt-5 text-[15px] leading-relaxed text-[#6E6E73]">
              Generic bullets, no JD keywords, no quantified results. Reads
              like a hundred others in the pile.
            </figcaption>
          </figure>

          {/* After */}
          <figure className="flex flex-col">
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="inline-flex items-center truncate rounded-md bg-[#F0FDF4] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.04em] text-[#1A7F45]">
                After · tailored to {TARGET_JD_TITLE}
              </span>
              <ScoreBadge score={91} size="md" />
            </div>
            <div className="relative aspect-[5/7] overflow-hidden rounded-2xl bg-white shadow-card">
              <div
                className="absolute inset-0 origin-top-left"
                style={{ transform: "scale(0.52)", width: "192.3%", height: "192.3%" }}
                aria-hidden="true"
              >
                <ResumePreviewHtml data={afterResume} template="classic" />
              </div>
            </div>
            <figcaption className="mt-5 text-[15px] leading-relaxed text-[#6E6E73]">
              JD keywords lifted in, bullets quantified (47%, 9 services, 200k
              fleet), seniority surfaced. Same person, four seconds longer to
              read.
            </figcaption>
          </figure>
        </div>

        <p className="mx-auto mt-12 max-w-2xl text-center text-[17px] leading-relaxed text-[#1D1D1F]">
          Same person. Same resume. Same job.{" "}
          <span className="font-medium">27 points of ATS headroom</span>{" "}
          from one credit.
        </p>
      </div>
    </section>
  );
}
