"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { TheFourAngles } from "@/components/landing/TheFourAngles";
import { AtsHonestySection } from "@/components/landing/AtsHonestySection";
import { DarkPatternCompare } from "@/components/landing/DarkPatternCompare";
import { Manifesto } from "@/components/landing/Manifesto";
import { ClosingCTA } from "@/components/landing/ClosingCTA";
import { SiteFooter } from "@/components/layout/SiteFooter";
import {
  SiteNav,
  NavLink,
  AuthAwareNavLink,
} from "@/components/layout/SiteNav";

// LiveTailorDemo drives the page's most expensive animation work — typewriter,
// score counter, chip stagger. SSR isn't useful for an interactive demo and
// dynamic import keeps the initial bundle lean for the form-submission path.
const LiveTailorDemo = dynamic(
  () =>
    import("@/components/landing/LiveTailorDemo").then((m) => ({
      default: m.LiveTailorDemo,
    })),
  { ssr: false, loading: () => <LiveTailorDemoPlaceholder /> },
);

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <SiteNav home="/">
        <NavLink href="/pricing">Pricing</NavLink>
        <AuthAwareNavLink href="/dashboard" when="signed-in">
          Dashboard
        </AuthAwareNavLink>
      </SiteNav>

      {/* ─── Hero ─────────────────────────────────────────────────────────
          The visitor sees the *product* first, then the form. The Live
          Tailor demo runs an 8-second scripted animation across four
          angles so the visitor knows exactly what they're paying for
          before any form lands. The headline sits above. The form sits
          below — narrower, anchored on a hairline panel.
      */}
      <section
        id="start"
        className="border-b border-neutral-900"
        aria-label="Start a tailored resume run"
      >
        <div className="mx-auto max-w-6xl px-6 pt-16 pb-12 lg:pt-20 lg:pb-16">
          {/* Eyebrow strip — same construction as the old hero but tightened. */}
          <div className="mx-auto mb-6 flex max-w-2xl items-center justify-center">
            <div className="inline-flex items-center gap-3 rounded-full border border-neutral-800 bg-neutral-950 px-3 py-1">
              <span className="size-1.5 rounded-full bg-green-500" aria-hidden="true" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-400">
                For engineers, PMs, and data scientists
              </span>
            </div>
          </div>

          <h1 className="mx-auto max-w-3xl text-center text-display-xl text-white">
            Stop letting AI decide your job for you.
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-center text-body-l text-neutral-400">
            One JD. Four tailored angles. Real ATS scores. Watch the demo write
            itself — then run it on the job you actually want.
          </p>
        </div>

        {/* Live Tailor demo — full-width within the page max, dark-canvas
            framed. This is the centerpiece. */}
        <div className="mx-auto max-w-6xl px-6 pb-12">
          <LiveTailorDemo />
        </div>

        {/* The form sits below the demo on a hairline panel. Visitor has
            now seen what they're getting — the form is the commit. */}
        <div className="mx-auto max-w-6xl border-t border-neutral-900 px-6 pt-12 pb-16 lg:pt-16 lg:pb-20">
          <div className="mx-auto grid max-w-5xl items-start gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
                Your turn
              </span>
              <h2 className="mt-3 text-h1 text-white">
                Now run it on a real JD.
              </h2>
              <p className="mt-4 max-w-md text-sm text-neutral-400">
                Paste the URL. Drop your resume. We&apos;ll show you four ways
                to tell your story for this job in under thirty seconds.
              </p>
              <ul className="mt-6 flex flex-col gap-2 font-mono text-[11px] text-neutral-500">
                <li>
                  <span className="text-neutral-700">·</span>{" "}
                  <span className="text-neutral-400">Lever / Greenhouse / Ashby</span>{" "}
                  / company careers page — all parsed.
                </li>
                <li>
                  <span className="text-neutral-700">·</span>{" "}
                  Resume stays on your account. Never sold. Never trained on.
                </li>
                <li>
                  <span className="text-neutral-700">·</span>{" "}
                  <span className="text-neutral-400">No card required</span> for the
                  preview. Pay only when you download.
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-5 sm:p-6">
              <Hero />
              <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-neutral-900 pt-4 text-[11px] text-neutral-500">
                <span>No subscription.</span>
                <span aria-hidden="true" className="text-neutral-700">·</span>
                <span>No auto-renew.</span>
                <span aria-hidden="true" className="text-neutral-700">·</span>
                <span>Credits never expire.</span>
                <span aria-hidden="true" className="text-neutral-700">·</span>
                <Link
                  href="/privacy"
                  className="underline decoration-neutral-700 underline-offset-4 transition-colors hover:text-white hover:decoration-white"
                >
                  Privacy
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Below the fold ─────────────────────────────────────────────── */}
      <HowItWorks />
      <TheFourAngles />
      <AtsHonestySection />
      <Manifesto />
      <ClosingCTA />
      <DarkPatternCompare />
      <SiteFooter />
    </main>
  );
}

/**
 * SSR placeholder for the LiveTailorDemo. Renders a frame of the same
 * approximate height so the page doesn't shift when the demo hydrates.
 */
function LiveTailorDemoPlaceholder() {
  return (
    <div
      aria-hidden="true"
      className="h-[460px] w-full rounded-2xl border border-neutral-800 bg-neutral-950 sm:h-[520px]"
    />
  );
}
