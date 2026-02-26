import Link from "next/link";
import { auth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { userId } = await auth();
  const ctaHref = userId ? "/dashboard" : "/builder";
  const ctaLabel = userId ? "Go to Dashboard" : "Start Building";

  return (
    <div className="flex min-h-screen flex-col">
      <nav className="flex h-14 items-center justify-between border-b px-6">
        <span className="text-lg font-semibold tracking-tight">ResumeAI</span>
        <div className="flex items-center gap-3">
          {userId ? (
            <Link
              href="/dashboard"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>

      <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 text-center">
        <div className="max-w-2xl space-y-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Build a professional resume
            <br />
            <span className="text-muted-foreground">in minutes, not hours</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Chat with AI to craft ATS-friendly bullet points, tailor your resume
            to any job description, and download a polished document — all
            powered by Claude.
          </p>
        </div>

        <Link
          href={ctaHref}
          className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        >
          {ctaLabel}
        </Link>

        <div className="grid max-w-3xl grid-cols-1 gap-6 pt-8 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: "AI-Powered",
              desc: "Claude writes strong, quantified bullet points for you",
            },
            {
              title: "ATS-Friendly",
              desc: "Formatting that passes applicant tracking systems",
            },
            {
              title: "Instant Export",
              desc: "Download a polished .docx or PDF in one click",
            },
            {
              title: "Job Tailoring",
              desc: "Paste a job description to optimize your resume",
            },
          ].map((f) => (
            <div key={f.title} className="space-y-1">
              <h3 className="font-semibold">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
