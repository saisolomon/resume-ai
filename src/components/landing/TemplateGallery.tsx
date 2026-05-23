"use client";
import { ResumePreviewHtml, TemplateSlug } from "@/components/try/ResumePreviewHtml";
import { ScoreBadge } from "@/components/try/ScoreBadge";
import type { ResumeData } from "@/lib/resume/types";

/**
 * Template gallery — horizontal scroll-rail of mini ResumePreviewHtml tiles.
 *
 * Per Design.md (Template Gallery pattern), this is real rendered output, not
 * stock images. Each tile uses the same component the product ships with —
 * angle chip + score badge in the corners, scaled to fit a 192px-wide tile.
 *
 * Eight believable samples — same fictional candidate as HeroPreview ("Ria
 * Patel"), eight permutations of angle × template. Frozen data lives in
 * this file because (a) it's presentational, (b) we want the same set on
 * every page load (not random), and (c) the SAMPLE inside HeroPreview is
 * scoped to that component's tab logic. Could be unified later if a third
 * surface needs them.
 *
 * Edges fade via `mask-image` so the scroll affordance reads without a
 * gradient overlay element. Snap-x snap-mandatory keeps the rail
 * presentational on desktop while staying scrollable on mobile.
 */

type Tile = {
  angleLabel: string;
  templateSlug: TemplateSlug;
  score: number;
  data: ResumeData;
};

const baseRiaContact = {
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
};

const samples: Tile[] = [
  {
    angleLabel: "Engineering depth",
    templateSlug: "classic",
    score: 91,
    data: {
      name: "Ria Patel",
      ...baseRiaContact,
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
                    "Cut P99 charge-API latency 47% by sharding the ledger.",
                    "Owned the 2024 dispute-handler rewrite — 9 services.",
                    "Mentored four eng hires through on-call ramp.",
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
    angleLabel: "Engineering depth",
    templateSlug: "modern",
    score: 89,
    data: {
      name: "Ria Patel",
      ...baseRiaContact,
      experienceSections: [
        {
          heading: "Experience",
          entries: [
            {
              company: "Datadog",
              location: "New York, NY",
              roles: [
                {
                  title: "Software Engineer II, Platform",
                  date: "2018 — 2022",
                  bullets: [
                    "Built the cross-region metric replication pipeline.",
                    "Reduced agent CPU by 30% across a 200k host fleet.",
                  ],
                },
              ],
            },
          ],
        },
      ],
      additionalInfo: ["Distributed systems, Kafka, Prometheus, Go"],
    },
  },
  {
    angleLabel: "Leadership",
    templateSlug: "modern",
    score: 88,
    data: {
      name: "Ria Patel",
      ...baseRiaContact,
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
                    "Led 9-engineer team across two timezones; shipped on schedule.",
                    "Wrote the team's on-call charter — adopted by 3 sister teams.",
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
    angleLabel: "Leadership",
    templateSlug: "minimal",
    score: 86,
    data: {
      name: "Ria Patel",
      ...baseRiaContact,
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
                    "Set the team's quarterly OKRs; hit 8 of 9 in 2024.",
                    "Ran the architecture review process across 4 quarters.",
                  ],
                },
              ],
            },
          ],
        },
      ],
      additionalInfo: ["People management, hiring, RFC authorship"],
    },
  },
  {
    angleLabel: "Cross-functional",
    templateSlug: "minimal",
    score: 84,
    data: {
      name: "Ria Patel",
      ...baseRiaContact,
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
                    "Partnered with product and risk to ship a faster dispute path.",
                    "Drove a four-team RFC on idempotency keys.",
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
    angleLabel: "Cross-functional",
    templateSlug: "classic",
    score: 82,
    data: {
      name: "Ria Patel",
      ...baseRiaContact,
      experienceSections: [
        {
          heading: "Experience",
          entries: [
            {
              company: "Datadog",
              location: "New York, NY",
              roles: [
                {
                  title: "Software Engineer II",
                  date: "2020 — 2022",
                  bullets: [
                    "Co-led the agent v7 launch with PM + customer success.",
                    "Authored a customer-facing migration guide read by 1.2k accounts.",
                  ],
                },
              ],
            },
          ],
        },
      ],
      additionalInfo: ["Customer comms, product launch coordination"],
    },
  },
  {
    angleLabel: "Specialist",
    templateSlug: "creative",
    score: 79,
    data: {
      name: "Ria Patel",
      ...baseRiaContact,
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
                    "Wrote three internal papers on consensus failure modes.",
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
  {
    angleLabel: "Specialist",
    templateSlug: "modern",
    score: 77,
    data: {
      name: "Ria Patel",
      ...baseRiaContact,
      experienceSections: [
        {
          heading: "Platform Engineering",
          entries: [
            {
              company: "Datadog",
              location: "New York, NY",
              roles: [
                {
                  title: "Platform Engineer",
                  date: "2018 — 2022",
                  bullets: [
                    "Built the multi-region storage tier replicating 12B metrics/day.",
                    "Wrote the platform's chaos-testing harness.",
                  ],
                },
              ],
            },
          ],
        },
      ],
      additionalInfo: ["Kafka, Cassandra, K8s, chaos engineering"],
    },
  },
];

export function TemplateGallery() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        <div className="mb-14 max-w-2xl">
          <h2 className="text-h1 text-[#1D1D1F]">Eight samples.</h2>
          <p className="mt-4 text-[17px] leading-relaxed text-[#6E6E73]">
            Real output. Real JDs. Same person, four angles, four templates —
            every one ATS-scored against the job posting.
          </p>
        </div>

        {/* Horizontal scroll-rail with mask-image edges that fade to the page
            background so the affordance is implicit without an overlay. */}
        <div
          className="relative -mx-6 overflow-x-auto px-6 [mask-image:linear-gradient(to_right,transparent,black_2rem,black_calc(100%-2rem),transparent)] sm:-mx-8 sm:px-8"
          role="region"
          aria-label="Template gallery"
        >
          <ul className="flex snap-x snap-mandatory gap-6 pb-8 pt-2">
            {samples.map((tile, i) => (
              <li key={i} className="w-[280px] shrink-0 snap-start">
                <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-white shadow-card transition-shadow duration-300 hover:shadow-card-hover">
                  {/* Angle + score chrome lives in the caption below the
                      tile (next sibling) — keeping the tile itself clean
                      so it doesn't overlap the rendered resume header. */}
                  {/* Scale so the letter-paper proportions render in a
                      280px-wide tile while keeping body text legible. */}
                  <div
                    className="absolute inset-0 origin-top-left"
                    style={{ transform: "scale(0.36)", width: "277.8%", height: "277.8%" }}
                    aria-hidden="true"
                  >
                    <ResumePreviewHtml
                      data={tile.data}
                      template={tile.templateSlug}
                    />
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between gap-2 px-1">
                  <span className="text-[15px] font-medium text-[#1D1D1F]">
                    {tile.angleLabel}
                  </span>
                  <ScoreBadge score={tile.score} size="sm" />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
