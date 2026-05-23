"use client";
import { useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { ArrowRight } from "lucide-react";
import { TierCard } from "@/components/pricing/TierCard";
import { ValueStack } from "@/components/pricing/ValueStack";
import { GuaranteeBlock } from "@/components/pricing/GuaranteeBlock";
import { PricingFAQ } from "@/components/pricing/PricingFAQ";
import { SiteFooter } from "@/components/layout/SiteFooter";
import {
  SiteNav,
  NavLink,
  AuthAwareNavLink,
} from "@/components/layout/SiteNav";

const tryBullets = [
  "3 runs / week, last 3 saved",
  "All 4 templates, all 4 angles",
  "PDF + DOCX export",
  "Standard ATS scoring",
];

const applyBullets = [
  "Unlimited runs, unlimited history",
  "Chat fine-tune editor",
  "Custom angles (your own prompt)",
  "ATS deep-scan — per-bullet impact",
  "Side-by-side compare any 2 runs",
  "Priority queue (sub-10s)",
  "JD watchlist (weekly rescore)",
];

const huntBullets = [
  "Everything in Apply",
  "Cover letter generator (3 variants per JD)",
  "LinkedIn profile rewrite (quarterly)",
  "Interview prep — questions + practice",
  "Outreach templates for hiring managers",
  "1 human review credit / month",
];

export default function PricingPage() {
  const { isSignedIn, isLoaded } = useUser();
  const [annual, setAnnual] = useState(false);

  return (
    <main className="min-h-screen bg-black text-white">
      <SiteNav home="/">
        <NavLink href="/">Home</NavLink>
        <AuthAwareNavLink href="/dashboard" when="signed-in">
          Dashboard
        </AuthAwareNavLink>
      </SiteNav>

      {/* Hero */}
      <section className="mx-auto max-w-3xl px-6 pt-20 pb-12 text-center sm:pt-24">
        <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
          Pricing
        </span>
        <h1 className="mt-5 text-display text-white">
          One price. The whole job hunt.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-body-l text-neutral-400">
          Tailored resumes, cover letters, ATS scoring, outreach, interview
          prep. Pick the tier that matches how serious you are.
        </p>

        {/* Annual toggle */}
        <div className="mt-10 inline-flex items-center gap-1 rounded-full border border-neutral-800 bg-neutral-950 p-1">
          <button
            type="button"
            onClick={() => setAnnual(false)}
            aria-pressed={!annual}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-white/40 ${
              !annual
                ? "bg-white text-black"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setAnnual(true)}
            aria-pressed={annual}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-white/40 ${
              annual
                ? "bg-white text-black"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Annual <span className="text-xs opacity-70">(-20%)</span>
          </button>
        </div>
      </section>

      {/* Tier cards — Hunt centered + scaled.
          Order on desktop: Apply, Hunt, Try
          On mobile: Hunt first (most popular), then Apply, then Try */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="grid gap-6 md:grid-cols-3 md:items-stretch md:gap-5">
          {/* Apply — left */}
          <div className="order-2 md:order-1">
            <TierCard
              name="pro"
              display="Apply"
              tagline="Unlimited runs + the tools to dial them in."
              priceMonthly={15}
              priceYearly={144}
              bullets={applyBullets}
              annual={annual}
              ctaLabel="Get Apply"
            />
          </div>

          {/* Hunt — center, anchored */}
          <div className="order-1 md:order-2">
            <TierCard
              name="career"
              display="Hunt"
              tagline="The full pipeline. Resume → outreach → interview."
              priceMonthly={35}
              priceYearly={336}
              bullets={huntBullets}
              annual={annual}
              mostPopular
              ctaLabel="Get Hunt"
            />
          </div>

          {/* Try — right */}
          <div className="order-3 md:order-3">
            <TierCard
              name="free"
              display="Try"
              tagline="Kick the tires. No card."
              priceMonthly={0}
              priceYearly={0}
              bullets={tryBullets}
              annual={annual}
              ctaLabel="Start free"
            />
          </div>
        </div>

        <p className="mt-10 text-center text-xs text-neutral-500">
          All plans include the 30-day guarantee. Cancel anytime from Settings.
        </p>
      </section>

      {/* Value stack */}
      <ValueStack />

      {/* Guarantee */}
      <GuaranteeBlock />

      {/* FAQ */}
      <PricingFAQ />

      {/* Footer CTA */}
      <section className="border-t border-neutral-900 bg-neutral-950/60 py-20">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="text-h1 text-white">
            Stop tweaking resumes by hand.
          </h2>
          <p className="mt-4 text-sm text-neutral-400">
            Drop a JD, get four designs, ship the one that gets the call.
          </p>
          <div className="mt-8">
            {/* Wait for Clerk hydration so signed-in users don't flash a
                "Start free →" sign-up link. */}
            {isLoaded && (
              <Link
                href={isSignedIn ? "/dashboard" : "/sign-up?redirect_url=/pricing"}
                className="group inline-flex h-12 items-center gap-2 rounded-md bg-white px-7 text-sm font-semibold text-black transition-colors hover:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
              >
                {isSignedIn ? "Go to dashboard" : "Start free"}
                <ArrowRight
                  className="size-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
            )}
          </div>
          <p className="mt-4 text-xs text-neutral-500">
            No card for Try. Cancel paid plans anytime.
          </p>
        </div>
      </section>

      {/* Footer */}
      <SiteFooter />
    </main>
  );
}