import Link from "next/link";
import { SiteNav } from "@/components/layout/SiteNav";
import { SiteFooter } from "@/components/layout/SiteFooter";

/**
 * Privacy policy — editorial article layout.
 *
 * Uses the prose-style spacing (h2 + paragraph + bulleted list) but the
 * surface itself is a hairline-bordered article column inside the
 * dark canvas. Section headers get tracking + tone consistent with
 * the rest of the site (no underlines, no nav-style large headings).
 */
export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <SiteNav home="/" />

      <article className="mx-auto max-w-2xl px-6 py-16">
        <header className="border-b border-neutral-900 pb-8">
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
            Legal
          </span>
          <h1 className="mt-3 text-h1 text-white">Privacy policy</h1>
          <p className="mt-2 font-mono text-xs tabular-nums text-neutral-500">
            Last updated · 2026-05-23
          </p>
        </header>

        <div className="mt-12 space-y-10 text-neutral-300">
          <section className="space-y-4">
            <h2 className="text-h2 text-white">What we collect</h2>
            <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-neutral-400">
              <li>
                <strong className="text-neutral-200">Anonymous users.</strong>{" "}
                A hashed browser fingerprint (no PII), the job URL you submit,
                and your uploaded resume content. We retain anonymous data for
                30 days, then hard-delete it.
              </li>
              <li>
                <strong className="text-neutral-200">Signed-in users.</strong>{" "}
                The above plus your email (via Clerk) and, if you subscribe,
                your Stripe customer ID. We retain this until you delete your
                account.
              </li>
              <li>
                <strong className="text-neutral-200">Job descriptions.</strong>{" "}
                We cache the scraped text by URL, shared across all users —
                they&apos;re public postings.
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-h2 text-white">What we share</h2>
            <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-neutral-400">
              <li>
                <strong className="text-neutral-200">Anthropic.</strong> Your
                resume + JD content is sent to Anthropic&apos;s Claude API to
                generate the tailored output. Anthropic does not retain or
                train on your data per their API terms.
              </li>
              <li>
                <strong className="text-neutral-200">Firecrawl.</strong> The
                job URL is sent to Firecrawl to scrape the JD.
              </li>
              <li>
                <strong className="text-neutral-200">Clerk.</strong> Handles
                authentication.
              </li>
              <li>
                <strong className="text-neutral-200">Stripe.</strong> Handles
                payment.
              </li>
              <li>
                <strong className="text-neutral-200">Convex / Vercel.</strong>{" "}
                Infrastructure providers (database, hosting).
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-h2 text-white">Your rights</h2>
            <p className="text-sm leading-relaxed text-neutral-400">
              Sign in and visit{" "}
              <Link
                href="/settings"
                className="text-white underline decoration-neutral-700 underline-offset-4 transition-colors hover:decoration-white"
              >
                Settings → Danger zone
              </Link>{" "}
              to permanently delete your account and all your data. The
              deletion cascades to Stripe (cancels any active subscription)
              and Convex (removes all runs, resumes, and chat history).
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-h2 text-white">Contact</h2>
            <p className="text-sm leading-relaxed text-neutral-400">
              Questions about this policy:{" "}
              <a
                href="mailto:hi@resume.ai"
                className="text-white underline decoration-neutral-700 underline-offset-4 transition-colors hover:decoration-white"
              >
                hi@resume.ai
              </a>
            </p>
          </section>
        </div>
      </article>

      <SiteFooter />
    </main>
  );
}