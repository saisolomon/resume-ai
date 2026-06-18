"use client";
import Link from "next/link";
import { Lock } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { PackCard } from "@/components/pricing/PackCard";
import { ValueStack } from "@/components/pricing/ValueStack";
import { PricingFAQ } from "@/components/pricing/PricingFAQ";
import { SocialProof } from "@/components/pricing/SocialProof";
import { FeatureCompare } from "@/components/pricing/FeatureCompare";
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
  { text: "Side-by-side compare any 2 runs" },
  { text: "Credits never expire" },
];

const TWENTY_PACK_BULLETS = [
  { text: "Everything in the 5-pack, ×4" },
  { text: "Cover letters in English + Spanish" },
  { text: "Outreach templates for hiring managers" },
  { text: "Interview prep — 10 sessions", comingSoon: true },
  { text: "1 × human review by a certified recruiter", comingSoon: true },
  { text: "Credits never expire" },
];

// Loss-aversion rows (principle 5) — the headline features a buyer gives up
// by sizing down. Kept to the two that matter most per tier so the cards
// stay scannable; the full delta lives in <FeatureCompare />. The 20-pack
// has everything, so it passes none.
const SINGLE_NOT_INCLUDED = [
  "LinkedIn profile rewrite",
  "Saved dashboard + side-by-side compare",
];

const FIVE_PACK_NOT_INCLUDED = [
  "Outreach templates for hiring managers",
  "Cover letters in English + Spanish",
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
        {/* ROI reframe (principle 6) — price next to the value it replaces. */}
        <p className="mx-auto mt-4 max-w-lg text-[15px] text-[#86868B]">
          $9 and 30 seconds beats an evening of hand-editing — and you get four
          angles, not one.
        </p>
      </section>

      {/* Free-tier trust strip (principle 7 + 11) — remove the risk before
          the price. The real anonymous limit is 1 run/day, 3/week, no signup,
          no card (enforced in convex/rateLimit.ts), so the copy promises
          exactly that and nothing more. */}
      <section className="mx-auto max-w-6xl px-6 sm:px-8">
        <div className="mx-auto mb-10 flex max-w-xl flex-col items-center gap-3 rounded-2xl border border-[#D2D2D7] bg-white px-6 py-5 text-center sm:flex-row sm:justify-center sm:gap-4">
          <span className="text-[15px] text-[#1D1D1F]">
            <span className="font-medium">Try it free first.</span>{" "}
            <span className="text-[#6E6E73]">
              No account, no card — 1 tailored run a day, 3 a week.
            </span>
          </span>
          <Link
            href="/"
            className="focus-ring inline-flex h-10 shrink-0 items-center rounded-full border border-[#D2D2D7] bg-white px-5 text-[15px] font-medium text-[#1D1D1F] transition-colors duration-200 hover:border-[#86868B] hover:bg-[#F5F5F7]"
          >
            Start free →
          </Link>
        </div>
      </section>

      {/* Pack cards — anchored high (principle 1): 20-pack first so every
          tier reads as a deal against the $79 anchor. The 5-pack stays the
          highlighted default in the center (principle 3), with Single as the
          decoy on the right (principle 2). DOM order = visual order, so on
          mobile the cards stack high → low and the anchor is seen first. */}
      <section className="mx-auto max-w-6xl px-6 pb-16 sm:px-8">
        <div className="grid gap-6 md:grid-cols-3 md:items-stretch md:gap-8">
          {/* 20-pack — left, the high anchor */}
          <PackCard
            pack="20pack"
            name="20-pack"
            tagline="The full job hunt, ammunition included."
            price={79}
            credits={20}
            perUnit="$3.95 per resume"
            saveBadge="Best value · save 56% per resume"
            bullets={TWENTY_PACK_BULLETS}
            voiceLine="Stocked for the whole search."
            ctaLabel="Buy 20-pack — $79"
          />

          {/* 5-pack — center, anchored default */}
          <PackCard
            pack="5pack"
            name="5-pack"
            tagline="For the active job hunt."
            price={29}
            credits={5}
            perUnit="$5.80 per resume"
            saveBadge="Save 36% per resume vs Single"
            bullets={FIVE_PACK_BULLETS}
            notIncluded={FIVE_PACK_NOT_INCLUDED}
            voiceLine="Five applications, fully loaded."
            ctaLabel="Buy 5-pack — $29"
            anchored
          />

          {/* Single — right, the decoy that makes the 5-pack feel like value */}
          <PackCard
            pack="single"
            name="Single"
            tagline="Tailored for one job. One purchase. Done."
            price={9}
            credits={1}
            perUnit="$9.00 per resume"
            bullets={SINGLE_BULLETS}
            notIncluded={SINGLE_NOT_INCLUDED}
            voiceLine="One job? One purchase. Done."
            ctaLabel="Buy 1 resume — $9"
          />
        </div>

        {/* Payment-friction reduction (principle 11) — name the secure,
            low-effort path right under the buy buttons. */}
        <div className="mt-10 flex flex-col items-center gap-3 text-center">
          <p className="text-[13px] text-[#86868B]">
            No subscription. No auto-renew. Credits never expire.
          </p>
          <p className="inline-flex items-center gap-2 text-[13px] text-[#86868B]">
            <Lock className="size-4 shrink-0" aria-hidden="true" />
            Secure checkout by Stripe · Apple Pay &amp; cards · No account needed
            to try
          </p>
        </div>
      </section>

      {/* Social proof at the decision point (principle 9) — directly below
          the table, where it converts highest. */}
      <SocialProof />

      {/* Full feature matrix, collapsed by default (principle 10) */}
      <FeatureCompare />

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
