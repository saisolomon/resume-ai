"use client";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { PackCard } from "@/components/pricing/PackCard";
import { ValueStack } from "@/components/pricing/ValueStack";
import { PricingFAQ } from "@/components/pricing/PricingFAQ";
import { SiteFooter } from "@/components/layout/SiteFooter";
import {
  SiteNav,
  NavLink,
  AuthAwareNavLink,
} from "@/components/layout/SiteNav";

// Per Design.md, every credit = 4 tailored resume designs + ATS deep-scan
// + unlimited fine-tune edits. The 5-pack and 20-pack add bonuses on top —
// they're not larger versions of the same thing, they're "everything in
// Single, × N, + the implied-value stack".
//
// `comingSoon: true` is the honest-pricing flag — these items are on the
// roadmap and surface in the value stack so a buyer can see the trajectory,
// but they render with a muted clock icon + a "Coming soon" pill so we're
// never telling someone they get something they don't.

const SINGLE_BULLETS = [
  { text: "4 tailored resume designs (one JD)" },
  { text: "3 cover letter variants" },
  { text: "ATS deep-scan with per-bullet impact" },
  { text: "PDF + DOCX downloads" },
  { text: "Unlimited chat fine-tune edits" },
];

const FIVE_PACK_BULLETS = [
  { text: "5 × everything in Single" },
  { text: "LinkedIn profile rewrite (1× included)" },
  { text: "Save your runs in your dashboard" },
  { text: "Side-by-side compare any 2 runs", comingSoon: true },
  { text: "Credits never expire" },
];

const TWENTY_PACK_BULLETS = [
  { text: "20 × everything in 5-pack" },
  { text: "Cover letters in English + Spanish" },
  { text: "Outreach templates for hiring managers" },
  { text: "Interview prep — 10 sessions", comingSoon: true },
  { text: "1 × human review by a certified recruiter", comingSoon: true },
  { text: "Credits never expire" },
];

export default function PricingPage() {
  const { isSignedIn, isLoaded } = useUser();

  return (
    <main className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F]">
      <SiteNav home="/">
        <NavLink href="/">Home</NavLink>
        <AuthAwareNavLink href="/dashboard" when="signed-in">
          Dashboard
        </AuthAwareNavLink>
      </SiteNav>

      {/* Hero */}
      <section className="mx-auto max-w-3xl px-6 pt-24 pb-12 text-center sm:px-8 sm:pt-32">
        <h1 className="text-display text-[#1D1D1F]">
          Pay per resume. No subscription.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-body-l text-[#6E6E73]">
          Every credit ships 4 tailored resume designs, 3 cover letter variants,
          an ATS deep-scan, and unlimited chat fine-tune edits. Credits never
          expire.
        </p>
      </section>

      {/* Pack cards — 5-pack anchored center on desktop. On mobile we lead
          with 5-pack so the anchored pack is what the visitor sees first;
          Single and 20-pack follow. */}
      <section className="mx-auto max-w-6xl px-6 pb-16 sm:px-8">
        <div className="grid gap-6 md:grid-cols-3 md:items-stretch md:gap-8">
          {/* Single — left */}
          <div className="order-2 md:order-1">
            <PackCard
              pack="single"
              name="Single"
              tagline="Tailored for one job. One purchase. Done."
              price={9}
              credits={1}
              perUnit="$9.00 per resume"
              bullets={SINGLE_BULLETS}
              voiceLine="One job? One purchase. Done."
              ctaLabel="Buy 1 resume — $9"
            />
          </div>

          {/* 5-pack — center, anchored */}
          <div className="order-1 md:order-2">
            <PackCard
              pack="5pack"
              name="5-pack"
              tagline="For the active job hunt."
              price={29}
              credits={5}
              perUnit="$5.80 per resume"
              bullets={FIVE_PACK_BULLETS}
              voiceLine="For the active job hunt."
              ctaLabel="Buy 5-pack — $29"
              anchored
            />
          </div>

          {/* 20-pack — right */}
          <div className="order-3 md:order-3">
            <PackCard
              pack="20pack"
              name="20-pack"
              tagline="The full job hunt, ammunition included."
              price={79}
              credits={20}
              perUnit="$3.95 per resume"
              bullets={TWENTY_PACK_BULLETS}
              voiceLine="The full job hunt, ammunition included."
              ctaLabel="Buy 20-pack — $79"
            />
          </div>
        </div>

        <p className="mt-10 text-center text-[13px] text-[#86868B]">
          No subscription. No auto-renew. Credits never expire.
        </p>
      </section>

      {/* Value stack — 20-pack implied value */}
      <ValueStack />

      {/* FAQ */}
      <PricingFAQ />

      {/* Footer CTA */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-2xl px-6 text-center sm:px-8">
          <h2 className="text-h1 text-[#1D1D1F]">
            Stop tweaking resumes by hand.
          </h2>
          <p className="mt-4 text-[17px] text-[#6E6E73]">
            Drop a JD, get four designs, ship the one that gets the call.
          </p>
          <div className="mt-10">
            {/* Wait for Clerk hydration so signed-in users don't flash a
                "Start free" link when they should see "Go to dashboard". */}
            {isLoaded && (
              <Link
                href={isSignedIn ? "/dashboard" : "/"}
                className="focus-ring inline-flex h-14 items-center rounded-full bg-[#1D1D1F] px-8 text-[17px] font-medium text-white transition-colors duration-200 hover:bg-black"
              >
                {isSignedIn ? "Go to dashboard" : "Start tailoring"}
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <SiteFooter />
    </main>
  );
}
