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
    <section className="border-t border-neutral-900 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-10 flex items-end justify-between gap-6">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
              Sample output
            </span>
            <h2 className="mt-3 text-h1 text-white">
              Eight angles from one JD.
            </h2>
            <p className="mt-3 max-w-xl text-sm text-neutral-400">
              Same person. Same resume. Four angles × four templates — eight
              real designs, every one ATS-scored against the job posting.
            </p>
          </div>
          <span className="hidden font-mono text-[11px] tabular-nums text-neutral-600 sm:inline">
            {String(samples.length).padStart(2, "0")} / samples
          </span>
        </div>

        {/* Horizontal scroll-rail. mask-image edges fade the rail in/out so
            the affordance is implicit without a gradient overlay element. */}
        <div
          className="relative -mx-6 overflow-x-auto px-6 [mask-image:linear-gradient(to_right,transparent,black_2rem,black_calc(100%-2rem),transparent)]"
          role="region"
          aria-label="Template gallery"
        >
          <ul className="flex snap-x snap-mandatory gap-4 pb-4">
            {samples.map((tile, i) => (
              <li
                key={i}
                className="w-48 shrink-0 snap-start"
              >
                <div className="relative aspect-[3/4] overflow-hidden rounded-lg border border-neutral-800 bg-white transition-colors hover:border-neutral-700">
                  <div className="absolute left-2 top-2 z-10 rounded-md bg-white/95 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.08em] text-blue-700 shadow-sm">
                    {tile.angleLabel}
                  </div>
                  <div className="absolute right-2 top-2 z-10">
                    <ScoreBadge score={tile.score} size="sm" />
                  </div>
                  {/* Scale so the full letter-paper proportions render in
                      a 192px-wide tile. Numbers picked so body text stays
                      legible even at this scale. */}
                  <div
                    className="absolute inset-0 origin-top-left"
                    style={{ transform: "scale(0.27)", width: "370.4%", height: "370.4%" }}
                    aria-hidden="true"
                  >
                    <ResumePreviewHtml
                      data={tile.data}
                      template={tile.templateSlug}
                    />
                  </div>
                </div>
                <p className="mt-2 text-center text-[11px] uppercase tracking-[0.08em] text-neutral-400">
                  {tile.angleLabel} · <span className="font-mono tabular-nums">{tile.score}</span>
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
