import Link from "next/link";
import { SiteNav } from "@/components/layout/SiteNav";
import { SiteFooter } from "@/components/layout/SiteFooter";

/**
 * Privacy policy — Apple-light editorial article.
 *
 * Calm prose on the mist canvas. Generous line-height, near-black body,
 * Apple-blue inline links. Hairline divider below the header.
 */
export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F]">
      <SiteNav home="/" />

      <article className="mx-auto max-w-2xl px-6 py-16 sm:px-8 sm:py-24">
        <header className="border-b border-[#D2D2D7]/70 pb-8">
          <h1 className="text-h1 text-[#1D1D1F]">Privacy policy</h1>
          <p className="mt-3 font-mono text-[13px] tabular-nums text-[#86868B]">
            Last updated · 2026-05-23
          </p>
        </header>

        <div className="mt-12 space-y-12 text-[17px] leading-relaxed text-[#1D1D1F]">
          <section className="space-y-4">
            <h2 className="text-h2 text-[#1D1D1F]">What we collect</h2>
            <ul className="space-y-3 text-[16px] leading-relaxed text-[#1D1D1F]">
              <li>
                <strong>Anonymous users.</strong>{" "}
                <span className="text-[#6E6E73]">
                  A hashed browser fingerprint (no PII), the job URL you submit,
                  and your uploaded resume content. We retain anonymous data
                  for 30 days, then hard-delete it.
                </span>
              </li>
              <li>
                <strong>Signed-in users.</strong>{" "}
                <span className="text-[#6E6E73]">
                  The above plus your email (via Clerk) and, if you subscribe,
                  your Stripe customer ID. We retain this until you delete your
                  account.
                </span>
              </li>
              <li>
                <strong>Job descriptions.</strong>{" "}
                <span className="text-[#6E6E73]">
                  We cache the scraped text by URL, shared across all users —
                  they&apos;re public postings.
                </span>
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-h2 text-[#1D1D1F]">What we share</h2>
            <ul className="space-y-3 text-[16px] leading-relaxed text-[#1D1D1F]">
              <li>
                <strong>Anthropic.</strong>{" "}
                <span className="text-[#6E6E73]">
                  Your resume and JD content is sent to Anthropic&apos;s Claude
                  API to generate the tailored output. Anthropic does not
                  retain or train on your data per their API terms.
                </span>
              </li>
              <li>
                <strong>Firecrawl.</strong>{" "}
                <span className="text-[#6E6E73]">
                  The job URL is sent to Firecrawl to scrape the JD.
                </span>
              </li>
              <li>
                <strong>Clerk.</strong>{" "}
                <span className="text-[#6E6E73]">Handles authentication.</span>
              </li>
              <li>
                <strong>Stripe.</strong>{" "}
                <span className="text-[#6E6E73]">Handles payment.</span>
              </li>
              <li>
                <strong>Convex / Vercel.</strong>{" "}
                <span className="text-[#6E6E73]">
                  Infrastructure providers (database, hosting).
                </span>
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-h2 text-[#1D1D1F]">Your rights</h2>
            <p className="text-[16px] leading-relaxed text-[#6E6E73]">
              Sign in and visit{" "}
              <Link
                href="/settings"
                className="text-[#0071E3] underline-offset-4 hover:underline"
              >
                Settings → Danger zone
              </Link>{" "}
              to permanently delete your account and all your data. The
              deletion cascades to Stripe (cancels any active subscription) and
              Convex (removes all runs, resumes, and chat history).
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-h2 text-[#1D1D1F]">Contact</h2>
            <p className="text-[16px] leading-relaxed text-[#6E6E73]">
              Questions about this policy:{" "}
              <a
                href="mailto:saisolomon45@gmail.com"
                className="text-[#0071E3] underline-offset-4 hover:underline"
              >
                saisolomon45@gmail.com
              </a>
              .
            </p>
          </section>
        </div>
      </article>

      <SiteFooter />
    </main>
  );
}
