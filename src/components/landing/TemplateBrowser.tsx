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
 * tab strip above, white-paper preview area below at ~52% scale. Tab swaps
 * are a TRUE crossfade — two persistent slots (A + B) render as absolute-
 * positioned siblings and swap roles on each click. The outgoing fades 1→0
 * while the incoming fades 0→1 in lockstep over 450ms, both running Apple's
 * signature decel ease cubic-bezier(0.16, 1, 0.3, 1). No flash of empty
 * surface, no DOM-pop unmount, no mount-transition workaround — both nodes
 * exist from first paint so the browser actually transitions the opacity.
 * No typewriter, no counter, no chip-light-up — those animations read as
 * marketing pyrotechnics against an Apple-quiet canvas. The tab change IS
 * the animation.
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

/** Crossfade duration in ms. Matches the inline style transition below and
 *  Design.md's modal-open / card-hover band (Apple's 250–400ms range).
 *  We sit at the upper edge — 450ms — because crossfading a content-rich
 *  surface needs a beat longer to feel intentional rather than abrupt. */
const CROSSFADE_MS = 450;
const CROSSFADE_EASE = "cubic-bezier(0.16, 1, 0.3, 1)"; // Apple decel

export function TemplateBrowser() {
  const [activeSlug, setActiveSlug] = useState<TemplateSlug>("classic");
  /** The slot architecture: two persistent panels (A + B) that swap roles
   *  on each tab click. Whichever holds the active slug is opacity-1;
   *  the other holds the previous slug at opacity-0 (fading out from
   *  whatever it was showing). On the very first render both slots show
   *  the initial slug and `slotB.slug` matches A — no crossfade yet. */
  const [slotA, setSlotA] = useState<{ slug: TemplateSlug; visible: boolean }>(
    { slug: "classic", visible: true },
  );
  const [slotB, setSlotB] = useState<{ slug: TemplateSlug; visible: boolean }>(
    { slug: "classic", visible: false },
  );
  /** Which slot holds the currently active slug. Flips on every swap so
   *  the slots crossfade without the freshly-mounted DOM mount-transition
   *  problem — both nodes exist from first paint. */
  const [activeSlot, setActiveSlot] = useState<"A" | "B">("A");

  const active = TEMPLATES.find((t) => t.slug === activeSlug) ?? TEMPLATES[0];

  function handleSelect(next: TemplateSlug) {
    if (next === activeSlug) return;
    setActiveSlug(next);
    if (activeSlot === "A") {
      // Promote B to active with the new slug; A becomes the outgoing fader.
      setSlotB({ slug: next, visible: true });
      setSlotA((prev) => ({ ...prev, visible: false }));
      setActiveSlot("B");
    } else {
      setSlotA({ slug: next, visible: true });
      setSlotB((prev) => ({ ...prev, visible: false }));
      setActiveSlot("A");
    }
  }

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
                onClick={() => handleSelect(tpl.slug)}
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
          {/* Header strip — angle chip + score live ABOVE the white tile
              so they don't sit on top of the candidate's name + contact
              line that the rendered resume draws in its own header. */}
          <div className="mx-auto mb-3 flex w-full max-w-2xl items-center justify-between">
            <span className="inline-flex items-center rounded-md bg-[#EFF6FF] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.04em] text-[#3B82F6]">
              {SAMPLE_ANGLE}
            </span>
            <ScoreBadge score={SAMPLE_SCORE} size="md" />
          </div>
          <div className="relative mx-auto aspect-[5/7] w-full max-w-2xl overflow-hidden rounded-2xl border border-[#D2D2D7]/40 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            {/* ─── Crossfade slots ───
                Two persistent panels (A + B) render as absolute-positioned
                siblings. Both nodes exist from first paint, so the CSS
                opacity transition has a real previous value to transition
                from — no mount-transition workaround required. On each
                tab click the slots swap roles: the previously-active fades
                from 1 → 0 while the other holds the new slug and fades
                from 0 → 1. Both run the same Apple decel ease in lockstep. */}

            <div
              key="slot-A"
              className="absolute inset-0 origin-top-left pointer-events-none"
              style={{
                transform: "scale(0.52)",
                width: "192.3%",
                height: "192.3%",
                opacity: slotA.visible ? 1 : 0,
                transition: `opacity ${CROSSFADE_MS}ms ${CROSSFADE_EASE}`,
              }}
              aria-hidden="true"
            >
              <ResumePreviewHtml data={SAMPLE_DATA} template={slotA.slug} />
            </div>

            <div
              key="slot-B"
              className="absolute inset-0 origin-top-left pointer-events-none"
              style={{
                transform: "scale(0.52)",
                width: "192.3%",
                height: "192.3%",
                opacity: slotB.visible ? 1 : 0,
                transition: `opacity ${CROSSFADE_MS}ms ${CROSSFADE_EASE}`,
              }}
              aria-hidden="true"
            >
              <ResumePreviewHtml data={SAMPLE_DATA} template={slotB.slug} />
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
