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
    <section className="border-t border-neutral-900 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-10 max-w-xl">
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
            Before / after
          </span>
          <h2 className="mt-3 text-h1 text-white">
            Same person. 27 points of ATS headroom.
          </h2>
          <p className="mt-3 text-sm text-neutral-400">
            One JD, one resume, one credit. The left side is what most engineers
            send. The right side is what resume.ai ships in under thirty seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Before */}
          <figure className="flex flex-col">
            <div className="relative aspect-[5/7] overflow-hidden rounded-lg border border-neutral-800 bg-white">
              <div className="absolute left-3 top-3 z-10 rounded-md bg-red-950 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-red-400">
                Before — template resume
              </div>
              <div className="absolute right-3 top-3 z-10">
                <ScoreBadge score={64} size="md" />
              </div>
              <div
                className="absolute inset-0 origin-top-left"
                style={{ transform: "scale(0.52)", width: "192.3%", height: "192.3%" }}
                aria-hidden="true"
              >
                <ResumePreviewHtml data={beforeResume} template="classic" />
              </div>
            </div>
            <figcaption className="mt-4 text-sm text-neutral-400">
              Generic bullets, no JD keywords, no quantified results. Reads
              like a hundred others in the pile.
            </figcaption>
          </figure>

          {/* After */}
          <figure className="flex flex-col">
            <div className="relative aspect-[5/7] overflow-hidden rounded-lg border border-neutral-800 bg-white">
              <div className="absolute left-3 top-3 z-10 rounded-md bg-green-950 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-green-400">
                After — tailored to {TARGET_JD_TITLE}
              </div>
              <div className="absolute right-3 top-3 z-10">
                <ScoreBadge score={91} size="md" />
              </div>
              <div
                className="absolute inset-0 origin-top-left"
                style={{ transform: "scale(0.52)", width: "192.3%", height: "192.3%" }}
                aria-hidden="true"
              >
                <ResumePreviewHtml data={afterResume} template="classic" />
              </div>
            </div>
            <figcaption className="mt-4 text-sm text-neutral-400">
              JD keywords lifted in, bullets quantified (47%, 9 services, 200k
              fleet), seniority surfaced. Same person, four seconds longer to
              read.
            </figcaption>
          </figure>
        </div>

        <p className="mx-auto mt-10 max-w-2xl text-center text-sm italic text-neutral-500">
          Same person. Same resume. Same job. 27 points of ATS headroom from
          one credit.
        </p>
      </div>
    </section>
  );
}
