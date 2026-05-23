import { ResumePreviewHtml, TemplateSlug } from "@/components/try/ResumePreviewHtml";
import { ScoreBadge } from "@/components/try/ScoreBadge";
import type { ResumeData } from "@/lib/resume/types";

/**
 * Static hero-side preview: shows what the product ships, not a screenshot
 * or a render of "your future resume". Four real-looking resumes scaled
 * down, each labelled with its angle chip and ATS score. The whole panel
 * sits inside a hairline-bordered card so it reads as product chrome, not
 * marketing decoration.
 *
 * The data is hardcoded (not API'd in) — this is a presentational hero
 * element, not live data. The names + bullets are deliberately
 * believable-engineer ("Ria Patel", AWS / Stripe stack) so the preview
 * doesn't read as lorem.
 */

type Tile = {
  angleLabel: string;
  templateSlug: TemplateSlug;
  score: number;
  data: ResumeData;
};

const SAMPLE: Tile[] = [
  {
    angleLabel: "Engineering depth",
    templateSlug: "classic",
    score: 91,
    data: {
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
                    "Mentored four eng hires through the on-call ramp.",
                  ],
                },
              ],
            },
            {
              company: "Datadog",
              location: "New York, NY",
              roles: [
                {
                  title: "Software Engineer II",
                  date: "2018 — 2022",
                  bullets: [
                    "Built the cross-region metric replication pipeline that backs the platform's HA story.",
                    "Reduced agent CPU by 30% — measured across 200k+ host fleet.",
                  ],
                },
              ],
            },
          ],
        },
      ],
      additionalInfo: ["Go, Rust, TypeScript, AWS, Kubernetes, Postgres"],
    },
  },
  {
    angleLabel: "Leadership",
    templateSlug: "modern",
    score: 88,
    data: {
      name: "Ria Patel",
      contactLine1: "ria.patel@gmail.com · linkedin.com/in/riapatel",
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
                  title: "Tech Lead, Payments Reliability",
                  date: "2023 — Present",
                  bullets: [
                    "Led 9-engineer team across two timezones; shipped the 2024 dispute-handler rewrite on schedule.",
                    "Wrote the team's on-call charter — adopted by 3 sister teams the following quarter.",
                    "Promoted two engineers from L4 → L5 in 18 months.",
                  ],
                },
              ],
            },
          ],
        },
      ],
      additionalInfo: ["Distributed systems, team leadership, technical writing"],
    },
  },
  {
    angleLabel: "Cross-functional",
    templateSlug: "minimal",
    score: 84,
    data: {
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
                  title: "Senior Engineer · Payments Reliability",
                  date: "2022 — Present",
                  bullets: [
                    "Partnered with product and risk to ship a faster dispute path — cut merchant complaints 22%.",
                    "Drove a four-team RFC on idempotency keys that ended a quarter of recurring incidents.",
                  ],
                },
              ],
            },
          ],
        },
      ],
      additionalInfo: ["PM partnership, RFCs, exec comms"],
    },
  },
  {
    angleLabel: "Specialist",
    templateSlug: "creative",
    score: 79,
    data: {
      name: "Ria Patel",
      contactLine1: "ria.patel@gmail.com · github.com/rpatel",
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
          heading: "Distributed Systems",
          entries: [
            {
              company: "Stripe",
              location: "New York, NY",
              roles: [
                {
                  title: "Distributed Systems Engineer",
                  date: "2022 — Present",
                  bullets: [
                    "Designed the per-account sharding scheme behind the global ledger.",
                    "Wrote three internal papers on consensus failure modes during the 2023 AZ outage.",
                  ],
                },
              ],
            },
          ],
        },
      ],
      additionalInfo: ["Raft, Paxos, Postgres internals, FoundationDB"],
    },
  },
];

export function HeroPreview() {
  return (
    <div
      className="relative isolate w-full overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950"
      aria-label="Sample output — four tailored resumes generated from one job posting"
    >
      {/* Meta strip — mono, mimics a dev-tool console heading. */}
      <div className="flex items-center justify-between border-b border-neutral-900 px-4 py-2.5 text-[11px] uppercase tracking-[0.08em] text-neutral-500">
        <span className="font-mono normal-case tracking-normal text-neutral-400">
          run / sample-output
        </span>
        <span className="flex items-center gap-2 font-mono normal-case tracking-normal">
          <span className="size-1.5 rounded-full bg-green-500" aria-hidden="true" />
          <span className="tabular-nums text-neutral-300">27.4s</span>
          <span className="text-neutral-600">·</span>
          <span className="text-neutral-500">4 / 4 ready</span>
        </span>
      </div>

      {/* 4-tile grid */}
      <div className="grid grid-cols-2 gap-3 p-3">
        {SAMPLE.map((tile, i) => (
          <div
            key={i}
            className="relative aspect-[3/4] overflow-hidden rounded-lg border border-neutral-800 bg-white"
          >
            <div className="absolute left-2 top-2 z-10 rounded-md bg-white/95 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.08em] text-blue-700 shadow-sm">
              {tile.angleLabel}
            </div>
            <div className="absolute right-2 top-2 z-10">
              <ScoreBadge score={tile.score} size="sm" />
            </div>
            {/*
              Scale the rendered preview down to fit. The previewer outputs
              at near-letter dimensions; scaling to ~30% reads as a
              recognisable doc thumbnail without bleeding into the chip.
            */}
            <div
              className="absolute inset-0 origin-top-left"
              style={{ transform: "scale(0.32)", width: "312.5%", height: "312.5%" }}
              aria-hidden="true"
            >
              <ResumePreviewHtml data={tile.data} template={tile.templateSlug} />
            </div>
          </div>
        ))}
      </div>

      {/* Status row — three monospaced metrics. */}
      <div className="grid grid-cols-3 divide-x divide-neutral-900 border-t border-neutral-900 text-center font-mono text-[11px]">
        <div className="px-3 py-2.5">
          <div className="text-neutral-600">angles</div>
          <div className="mt-0.5 tabular-nums text-white">04</div>
        </div>
        <div className="px-3 py-2.5">
          <div className="text-neutral-600">top ATS</div>
          <div className="mt-0.5 tabular-nums text-green-400">91</div>
        </div>
        <div className="px-3 py-2.5">
          <div className="text-neutral-600">templates</div>
          <div className="mt-0.5 tabular-nums text-white">04</div>
        </div>
      </div>
    </div>
  );
}
