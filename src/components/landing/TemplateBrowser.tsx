"use client";
import { useState } from "react";
import { ResumePreviewHtml, TemplateSlug } from "@/components/try/ResumePreviewHtml";
import { ScoreBadge } from "@/components/try/ScoreBadge";
import type { ResumeData } from "@/lib/resume/types";

/**
 * TemplateBrowser — the landing hero centerpiece.
 *
 * Replaces v5's LiveTailorDemo, which let the visitor pick from three
 * famous JDs and watched a typewriter animation. The pivot: visitors care
 * about *what their resume looks like*, not *which JD they're tailoring
 * for*. Now they pick from the four templates the product actually ships
 * (Classic / Modern / Creative / Minimal) and see a single sample resume
 * rendered in each one.
 *
 * Visual: Apple-grade. White card on the mist canvas, soft xl shadow, pill
 * tab strip above, white-paper preview area below at ~52% scale, calm
 * crossfade between tabs (Apple decel ease, 350ms). No typewriter, no
 * counter, no chip-light-up — those animations read as marketing pyrotechnics
 * against an Apple-quiet canvas. The tab change IS the animation.
 *
 * The angle stays "Engineering depth" across all four templates because the
 * point we're making is template difference, not angle difference (that's
 * what TheFourAngles section below the hero is for).
 */

type Template = {
  slug: TemplateSlug;
  label: string;
  /** Plain-language one-liner shown under the preview to disambiguate the
   *  template's intent without resorting to marketing fluff. */
  caption: string;
};

const TEMPLATES: Template[] = [
  {
    slug: "classic",
    label: "Classic",
    caption: "Serif body, centered name. Reads as a traditional CV — what most ATS bots prefer.",
  },
  {
    slug: "modern",
    label: "Modern",
    caption: "Sans-serif, blue section headers. Tech-forward but still ATS-clean.",
  },
  {
    slug: "creative",
    label: "Creative",
    caption: "Sans-serif with editorial accent. For design-adjacent and product roles.",
  },
  {
    slug: "minimal",
    label: "Minimal",
    caption: "Generous whitespace, light weights. For senior ICs who want the words to speak.",
  },
];

// Frozen sample — the same "Ria Patel · Stripe" candidate used elsewhere on
// the landing page so the visitor recognizes a coherent example across the
// hero, the gallery, and the before/after. Engineering-depth angle.
const SAMPLE_DATA: ResumeData = {
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
                "Mentored four eng hires through the on-call ramp; cut median first-page time from 14m to 6m.",
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
                "Built the cross-region metric replication pipeline that backs the platform's HA story.",
                "Reduced agent CPU by 30% — measured across a 200k+ host fleet.",
              ],
            },
          ],
        },
      ],
    },
  ],
  additionalInfo: ["Go, Rust, TypeScript, AWS, Kubernetes, Postgres, distributed systems"],
};

const SAMPLE_SCORE = 91;
const SAMPLE_ANGLE = "Engineering depth";

export function TemplateBrowser() {
  const [activeSlug, setActiveSlug] = useState<TemplateSlug>("classic");
  const active = TEMPLATES.find((t) => t.slug === activeSlug) ?? TEMPLATES[0];

  return (
    <section
      aria-label="Template browser — see the four resume templates"
      className="mx-auto w-full max-w-5xl"
    >
      <div className="rounded-[28px] bg-white shadow-card-xl p-6 sm:p-10">
        {/* ─── Pill tab strip ─── */}
        <div
          role="tablist"
          aria-label="Resume templates"
          className="flex flex-wrap items-center justify-center gap-2"
        >
          {TEMPLATES.map((tpl) => {
            const isActive = tpl.slug === activeSlug;
            return (
              <button
                key={tpl.slug}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`template-panel-${tpl.slug}`}
                onClick={() => setActiveSlug(tpl.slug)}
                className={`focus-ring h-10 rounded-full px-5 text-[15px] font-medium transition-colors duration-200 ${
                  isActive
                    ? "bg-[#1D1D1F] text-white"
                    : "bg-[#F5F5F7] text-[#1D1D1F] hover:bg-[#EDEDED]"
                }`}
              >
                {tpl.label}
              </button>
            );
          })}
        </div>

        {/* ─── Preview area ─── */}
        <div
          role="tabpanel"
          id={`template-panel-${activeSlug}`}
          aria-label={`${active.label} template preview`}
          className="mt-8"
        >
          <div className="relative mx-auto aspect-[5/7] w-full max-w-2xl overflow-hidden rounded-2xl border border-[#D2D2D7]/40 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            {/* Angle chip — editorial blue, the lone chromatic moment. */}
            <div className="absolute left-4 top-4 z-10 inline-flex items-center rounded-md bg-white/95 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.04em] text-[#3B82F6] shadow-sm">
              {SAMPLE_ANGLE}
            </div>
            {/* Score badge */}
            <div className="absolute right-4 top-4 z-10">
              <ScoreBadge score={SAMPLE_SCORE} size="md" />
            </div>

            {/* Scaled resume preview. Each template re-renders on slug change;
                the key ensures React mounts a fresh tree so transitions
                inside the preview (if any) restart cleanly. */}
            <div
              key={activeSlug}
              className="absolute inset-0 origin-top-left animate-in fade-in duration-350"
              style={{ transform: "scale(0.52)", width: "192.3%", height: "192.3%" }}
              aria-hidden="true"
            >
              <ResumePreviewHtml data={SAMPLE_DATA} template={activeSlug} />
            </div>
          </div>

          {/* Caption */}
          <p className="mx-auto mt-5 max-w-xl text-center text-[15px] text-[#6E6E73]">
            {active.caption}
          </p>
        </div>

        {/* ─── Trust line below ─── */}
        <div className="mt-8 text-center">
          <p className="text-[13px] text-[#86868B]">
            Example output. Generate yours below.
          </p>
        </div>
      </div>
    </section>
  );
}
