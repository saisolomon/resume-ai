"use client";
import { useState } from "react";
import { ResumePreviewHtml, TemplateSlug } from "@/components/try/ResumePreviewHtml";
import { ScoreBadge } from "@/components/try/ScoreBadge";
import type { ResumeData } from "@/lib/resume/types";

/**
 * @deprecated — not imported by the landing page in v6 (Apple-light).
 *
 * The angle-tab preview pattern was superseded by:
 *   - `TemplateBrowser` (hero centerpiece — picks template, not angle)
 *   - `TemplateGallery` (horizontal scroll-rail of 8 samples)
 *
 * Keep the file for a release in case we want the "tab through four
 * angles" affordance back on a future surface. If we ship a follow-up
 * page that needs it, restyle for the light brand (white card, soft
 * shadow, sentence-case tabs) before importing it.
 *
 * Hero-side product preview. Shows what resume.ai ships — one of four
 * angles at a time. Data is hardcoded — this is a presentational element.
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

const TOP_ATS = Math.max(...SAMPLE.map((t) => t.score));

export function HeroPreview() {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = SAMPLE[activeIndex];

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
          <span className="text-neutral-500">
            <span className="tabular-nums text-neutral-300">{activeIndex + 1}</span>
            <span className="text-neutral-600"> / </span>
            <span className="tabular-nums text-neutral-300">{SAMPLE.length}</span>
            <span> ready</span>
          </span>
        </span>
      </div>

      {/* Tab strip — one button per angle. */}
      <div
        role="tablist"
        aria-label="Sample resume angles"
        className="flex items-stretch border-b border-neutral-900"
      >
        {SAMPLE.map((tile, i) => {
          const isActive = i === activeIndex;
          return (
            <button
              key={tile.angleLabel}
              role="tab"
              aria-selected={isActive}
              aria-controls={`hero-preview-panel-${i}`}
              id={`hero-preview-tab-${i}`}
              onClick={() => setActiveIndex(i)}
              className={`relative flex-1 px-3 py-3 text-[10px] font-semibold uppercase tracking-[0.08em] transition-colors focus:outline-none focus-visible:bg-neutral-900/60 ${
                isActive
                  ? "text-white"
                  : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              {tile.angleLabel}
              {isActive && (
                <span
                  className="absolute inset-x-3 -bottom-px h-px bg-white"
                  aria-hidden="true"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Single preview tile. Aspect ratio is taller than wide (letter
          paper proportions) so the full resume reads without clipping. */}
      <div
        role="tabpanel"
        id={`hero-preview-panel-${activeIndex}`}
        aria-labelledby={`hero-preview-tab-${activeIndex}`}
        className="p-3"
      >
        <div className="relative aspect-[5/7] overflow-hidden rounded-lg border border-neutral-800 bg-white">
          <div className="absolute left-3 top-3 z-10 rounded-md bg-white/95 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-blue-700 shadow-sm">
            {active.angleLabel}
          </div>
          <div className="absolute right-3 top-3 z-10">
            <ScoreBadge score={active.score} size="md" />
          </div>
          {/*
            Scale the rendered preview to fit. The previewer outputs at
            near-letter dimensions; ~52% reads as a recognisable doc
            page while keeping the body text legible.
          */}
          <div
            className="absolute inset-0 origin-top-left"
            style={{ transform: "scale(0.52)", width: "192.3%", height: "192.3%" }}
            aria-hidden="true"
          >
            <ResumePreviewHtml data={active.data} template={active.templateSlug} />
          </div>
        </div>

        {/* Pager hint — keeps the click affordance obvious without
            adding visual weight. */}
        <div className="mt-3 flex items-center justify-between font-mono text-[11px] text-neutral-500">
          <button
            type="button"
            onClick={() =>
              setActiveIndex((i) => (i - 1 + SAMPLE.length) % SAMPLE.length)
            }
            className="rounded px-2 py-1 text-neutral-400 transition-colors hover:bg-neutral-900 hover:text-white focus:outline-none focus-visible:bg-neutral-900"
            aria-label="Previous angle"
          >
            ← prev
          </button>
          <span className="tabular-nums">
            <span className="text-neutral-300">
              {String(activeIndex + 1).padStart(2, "0")}
            </span>
            <span className="text-neutral-600"> / </span>
            <span className="text-neutral-500">
              {String(SAMPLE.length).padStart(2, "0")}
            </span>
          </span>
          <button
            type="button"
            onClick={() => setActiveIndex((i) => (i + 1) % SAMPLE.length)}
            className="rounded px-2 py-1 text-neutral-400 transition-colors hover:bg-neutral-900 hover:text-white focus:outline-none focus-visible:bg-neutral-900"
            aria-label="Next angle"
          >
            next →
          </button>
        </div>
      </div>

      {/* Status row — three monospaced metrics. */}
      <div className="grid grid-cols-3 divide-x divide-neutral-900 border-t border-neutral-900 text-center font-mono text-[11px]">
        <div className="px-3 py-2.5">
          <div className="text-neutral-600">angles</div>
          <div className="mt-0.5 tabular-nums text-white">
            {String(SAMPLE.length).padStart(2, "0")}
          </div>
        </div>
        <div className="px-3 py-2.5">
          <div className="text-neutral-600">top ATS</div>
          <div className="mt-0.5 tabular-nums text-green-400">{TOP_ATS}</div>
        </div>
        <div className="px-3 py-2.5">
          <div className="text-neutral-600">templates</div>
          <div className="mt-0.5 tabular-nums text-white">
            {String(SAMPLE.length).padStart(2, "0")}
          </div>
        </div>
      </div>
    </div>
  );
}
