import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <nav className="flex h-14 items-center border-b border-neutral-900 px-6">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          resume.ai
        </Link>
      </nav>
      <article className="max-w-2xl mx-auto px-6 py-12 text-neutral-300 space-y-6">
        <header>
          <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
          <p className="text-sm text-neutral-500 mt-1">Last updated: 2026-05-23</p>
        </header>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">What we collect</h2>
          <ul className="list-disc pl-5 space-y-2 text-sm">
            <li>
              <strong>Anonymous users:</strong> a hashed browser fingerprint (no PII), the job URL you submit, and your uploaded resume content. We retain anonymous data for 30 days, then hard-delete it.
            </li>
            <li>
              <strong>Signed-in users:</strong> the above plus your email (via Clerk) and, if you subscribe, your Stripe customer ID. We retain this until you delete your account.
            </li>
            <li>
              <strong>Job descriptions:</strong> we cache the scraped text by URL, shared across all users &mdash; they&apos;re public postings.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">What we share</h2>
          <ul className="list-disc pl-5 space-y-2 text-sm">
            <li>
              <strong>Anthropic:</strong> your resume + JD content is sent to Anthropic&apos;s Claude API to generate the tailored output. Anthropic does not retain or train on your data per their API terms.
            </li>
            <li>
              <strong>Firecrawl:</strong> the job URL is sent to Firecrawl to scrape the JD.
            </li>
            <li>
              <strong>Clerk:</strong> handles authentication.
            </li>
            <li>
              <strong>Stripe:</strong> handles payment.
            </li>
            <li>
              <strong>Convex / Vercel:</strong> infrastructure providers (database, hosting).
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">Your rights</h2>
          <p className="text-sm">
            Sign in and visit{" "}
            <Link href="/settings" className="underline hover:text-white">
              Settings &rarr; Danger zone
            </Link>{" "}
            to permanently delete your account and all your data. The deletion cascades to Stripe (cancels any active subscription) and Convex (removes all runs, resumes, and chat history).
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">Contact</h2>
          <p className="text-sm">
            Questions about this policy:{" "}
            <a href="mailto:hi@resume.ai" className="underline hover:text-white">
              hi@resume.ai
            </a>
          </p>
        </section>
      </article>
    </main>
  );
}
