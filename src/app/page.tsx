"use client";
import Link from "next/link";
import { Hero } from "@/components/landing/Hero";
import { HeroPreview } from "@/components/landing/HeroPreview";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { TheFourAngles } from "@/components/landing/TheFourAngles";
import { TemplateGallery } from "@/components/landing/TemplateGallery";
import { BeforeAfter } from "@/components/landing/BeforeAfter";
import { Manifesto } from "@/components/landing/Manifesto";
import { ClosingCTA } from "@/components/landing/ClosingCTA";
import { SiteFooter } from "@/components/layout/SiteFooter";
import {
  SiteNav,
  NavLink,
  AuthAwareNavLink,
} from "@/components/layout/SiteNav";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <SiteNav home="/">
        <NavLink href="/pricing">Pricing</NavLink>
        <AuthAwareNavLink href="/dashboard" when="signed-in">
          Dashboard
        </AuthAwareNavLink>
      </SiteNav>

      {/* Hero — two-column editorial layout. Form on the left, sample
          output on the right. The output panel does the heavy lifting:
          it is the product, not a screenshot of it. */}
      <section
        id="start"
        className="border-b border-neutral-900"
        aria-label="Start a tailored resume run"
      >
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:py-24">
          <div>
            <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-neutral-800 bg-neutral-950 px-3 py-1">
              <span className="size-1.5 rounded-full bg-green-500" aria-hidden="true" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-400">
                For engineers, PMs, and data scientists
              </span>
            </div>

            <h1 className="text-display-xl text-white">
              Stop letting AI<br />
              decide your job<br />
              for you.
            </h1>

            <p className="mt-6 max-w-md text-body-l text-neutral-400">
              Paste a job posting. Drop your resume. See four ATS-scored
              designs in under thirty seconds.
            </p>

            <div className="mt-10 rounded-xl border border-neutral-800 bg-neutral-950 p-5 sm:p-6">
              <Hero />
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-neutral-500">
              <span>No card required.</span>
              <span aria-hidden="true" className="text-neutral-700">·</span>
              <span>Hashed fingerprint, never sold.</span>
              <span aria-hidden="true" className="text-neutral-700">·</span>
              <Link
                href="/privacy"
                className="underline decoration-neutral-700 underline-offset-4 transition-colors hover:text-white hover:decoration-white"
              >
                Privacy
              </Link>
            </div>
          </div>

          <div className="relative">
            <HeroPreview />
          </div>
        </div>
      </section>

      <HowItWorks />
      <TheFourAngles />
      <TemplateGallery />
      <BeforeAfter />
      <Manifesto />
      <ClosingCTA />
      <SiteFooter />
    </main>
  );
}
