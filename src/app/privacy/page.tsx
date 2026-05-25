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
            Last updated · 2026-05-25
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
                  The above plus your email address and, if you purchase, a
                  billing identifier from our payment processor. We retain
                  this until you delete your account.
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
            <h2 className="text-h2 text-[#1D1D1F]">How your data is processed</h2>
            <p className="text-[16px] leading-relaxed text-[#6E6E73]">
              To operate the product we work with a small number of service
              providers, each scoped to a single function. Each receives only
              the data needed to perform their function, governed by their
              own privacy commitments.
            </p>
            <ul className="space-y-3 text-[16px] leading-relaxed text-[#1D1D1F]">
              <li>
                <strong>Tailored generation.</strong>{" "}
                <span className="text-[#6E6E73]">
                  Your resume and job description content is processed by a
                  third-party language-model provider to produce the tailored
                  output. The provider operates under enterprise terms that
                  prohibit retention of your inputs and prohibit using your
                  content to train any model.
                </span>
              </li>
              <li>
                <strong>Job posting retrieval.</strong>{" "}
                <span className="text-[#6E6E73]">
                  The URL you submit is fetched by a web-scraping service so
                  we can extract the JD text. Only the URL is sent.
                </span>
              </li>
              <li>
                <strong>Authentication.</strong>{" "}
                <span className="text-[#6E6E73]">
                  Account credentials are managed by a third-party identity
                  provider so we never store your password.
                </span>
              </li>
              <li>
                <strong>Payments.</strong>{" "}
                <span className="text-[#6E6E73]">
                  Billing details are handled by a PCI-compliant payment
                  processor. Card numbers never touch our systems.
                </span>
              </li>
              <li>
                <strong>Infrastructure.</strong>{" "}
                <span className="text-[#6E6E73]">
                  Database, hosting, and content delivery are provided by
                  industry-standard cloud infrastructure vendors.
                </span>
              </li>
            </ul>
            <p className="text-[16px] leading-relaxed text-[#6E6E73]">
              We don&apos;t sell your data. We don&apos;t share it with
              advertisers. We don&apos;t use your resume content to train
              language models or improve any third party&apos;s product.
            </p>
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
              to permanently delete your account and all your data. Deletion
              cascades across all systems — any active billing arrangement is
              cancelled and every run, resume, and chat history is removed.
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
