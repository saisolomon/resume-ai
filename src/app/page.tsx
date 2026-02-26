import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <nav className="flex h-14 items-center border-b px-6">
        <span className="text-lg font-semibold tracking-tight">ResumeAI</span>
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
            to any job description, and download a polished .docx — all for
            free.
          </p>
        </div>

        <Link
          href="/builder"
          className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        >
          Start Building
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
              title: "Instant .docx",
              desc: "Download a polished Word document in one click",
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
