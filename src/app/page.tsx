import Link from "next/link";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { TheFourAngles } from "@/components/landing/TheFourAngles";
import { TemplateBrowser } from "@/components/landing/TemplateBrowser";
import { TemplateGallery } from "@/components/landing/TemplateGallery";
import { BeforeAfter } from "@/components/landing/BeforeAfter";
import { AtsHonestySection } from "@/components/landing/AtsHonestySection";
import { Manifesto } from "@/components/landing/Manifesto";
import { ClosingCTA } from "@/components/landing/ClosingCTA";
import { WhatWeDontDo } from "@/components/landing/DarkPatternCompare";
import { SiteFooter } from "@/components/layout/SiteFooter";
import {
  SiteNav,
  NavLink,
  AuthAwareNavLink,
} from "@/components/layout/SiteNav";

/**
 * Landing page — Apple-light brand.
 *
 * Layout (top → bottom), per Design.md "Landing hero" example:
 *
 *   SiteNav            — sticky h-16, backdrop blur, lowercase wordmark
 *   Hero               — Display XL center, TemplateBrowser, form, trust line
 *   HowItWorks         — three light cards on alt canvas
 *   TheFourAngles      — four light cards w/ editorial-blue chips
 *   TemplateGallery    — horizontal scroll-rail of 8 samples
 *   BeforeAfter        — two-column 64 vs 91 ATS comparison
 *   AtsHonestySection  — "Floor / Ceiling / What ATS isn't" on alt canvas
 *   Manifesto          — calm statement of purpose
 *   ClosingCTA         — pricing trio + 30-day guarantee + pill CTAs
 *   WhatWeDontDo       — category practices vs how resume.ai works
 *   SiteFooter         — hairline divider, three inline links
 *
 * HeroPreview is intentionally omitted: TemplateBrowser already plays the
 * "see a sample resume" hero role, and TemplateGallery handles the "see
 * eight more" follow-up below the fold. A third scaled-tile pattern would
 * over-rotate the page on the same visual idea.
 */
export default function Home() {
  return (
    <main className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F]">
      <SiteNav home="/">
        <NavLink href="/pricing">Pricing</NavLink>
        <AuthAwareNavLink href="/dashboard" when="signed-in">
          Dashboard
        </AuthAwareNavLink>
      </SiteNav>

      {/* ─── Hero ────────────────────────────────────────────────────────── */}
      <section
        id="start"
        aria-label="Start a tailored resume run"
        className="pt-24 pb-24 sm:pt-32 sm:pb-32"
      >
        <div className="mx-auto max-w-6xl px-6 sm:px-8">
          {/* Display headline + Body L subhead, both center-aligned. */}
          <h1 className="mx-auto max-w-4xl text-center text-display-xl">
            Four resumes.
            <br />
            One application.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-center text-body-l text-[#6E6E73]">
            One job. Four angles. Thirty seconds. We tailor your resume four
            ways so you can pick the one that lands.
          </p>

          {/* TemplateBrowser — hero centerpiece. */}
          <div className="mt-16 sm:mt-20">
            <TemplateBrowser />
          </div>

          {/* Form sits below the demo in a narrow white card. The card
              wrapper visually closes the loop with the TemplateBrowser
              card above — both white surfaces elevated off the mist
              canvas, both Apple-style soft-shadow rectangles. Flat-on-
              canvas read as disconnected against the white card above.
              The Hero form already renders its own trust line; the
              privacy link below sits outside the card so it reads as a
              footer to the form unit, not in-form copy. */}
          <div className="mx-auto mt-16 max-w-xl rounded-2xl bg-white shadow-card p-8 sm:mt-20">
            <Hero />
          </div>
          <p className="mx-auto mt-4 max-w-xl text-center text-[13px] text-[#86868B]">
            We never sell your resume or train on it.{" "}
            <Link
              href="/privacy"
              className="text-[#0071E3] underline-offset-4 hover:underline"
            >
              Privacy
            </Link>
          </p>
        </div>
      </section>

      {/* ─── Below the fold ─────────────────────────────────────────────── */}
      <HowItWorks />
      <TheFourAngles />
      <TemplateGallery />
      <BeforeAfter />
      <AtsHonestySection />
      <Manifesto />
      <ClosingCTA />
      <WhatWeDontDo />
      <SiteFooter />
    </main>
  );
}
