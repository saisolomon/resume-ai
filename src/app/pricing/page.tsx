"use client";
import { useState } from "react";
import Link from "next/link";
import { useUser, UserButton } from "@clerk/nextjs";
import { TierCard } from "@/components/pricing/TierCard";
import { ValueStack } from "@/components/pricing/ValueStack";
import { GuaranteeBlock } from "@/components/pricing/GuaranteeBlock";
import { PricingFAQ } from "@/components/pricing/PricingFAQ";

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
      {/* Nav */}
      <nav className="flex h-14 items-center justify-between border-b border-neutral-900 px-6">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          resume.ai
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/" className="text-neutral-400 hover:text-white">
            Home
          </Link>
          {!isLoaded ? (
            // Render nothing auth-shaped until Clerk hydrates — avoids the
            // signed-in flash of "Sign in" link on first paint.
            <span className="h-6 w-16" aria-hidden="true" />
          ) : isSignedIn ? (
            <>
              <Link
                href="/dashboard"
                className="text-neutral-400 hover:text-white"
              >
                Dashboard
              </Link>
              <UserButton afterSignOutUrl="/" />
            </>
          ) : (
            <Link
              href="/sign-in"
              className="text-neutral-400 hover:text-white"
            >
              Sign in
            </Link>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-3xl px-6 pt-20 pb-12 text-center sm:pt-24">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          One price. The whole job hunt.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base text-neutral-400 sm:text-lg">
          Tailored resumes, cover letters, ATS scoring, outreach, interview
          prep. Pick the tier that matches how serious you are.
        </p>

        {/* Annual toggle */}
        <div className="mt-10 inline-flex items-center gap-3 rounded-full border border-neutral-800 bg-neutral-950 p-1">
          <button
            type="button"
            onClick={() => setAnnual(false)}
            aria-pressed={!annual}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
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
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
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
        <div className="grid gap-6 md:grid-cols-3 md:items-stretch">
          {/* Apply — left */}
          <div className="md:order-1 order-2">
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
          <div className="md:order-2 order-1">
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
          <div className="md:order-3 order-3">
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
          <h2 className="text-2xl font-semibold sm:text-3xl text-white">
            Stop tweaking resumes by hand.
          </h2>
          <p className="mt-3 text-sm text-neutral-400">
            Drop a JD, get four designs, ship the one that gets you the call.
          </p>
          <div className="mt-8">
            {/* Wait for Clerk hydration so signed-in users don't flash a
                "Start free →" sign-up link. */}
            {isLoaded && (
              <Link
                href={isSignedIn ? "/dashboard" : "/sign-up?redirect=/pricing"}
                className="inline-flex h-11 items-center justify-center rounded-md bg-white px-8 text-sm font-semibold text-black hover:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
              >
                {isSignedIn ? "Go to dashboard" : "Start free →"}
              </Link>
            )}
          </div>
          <p className="mt-4 text-xs text-neutral-500">
            No card for Try. Cancel paid plans anytime.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-900 py-8">
        <div className="mx-auto max-w-6xl px-6 text-center text-xs text-neutral-500">
          &copy; {new Date().getFullYear()} resume.ai. All rights reserved.
        </div>
      </footer>
    </main>
  );
}
