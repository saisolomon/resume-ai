import { Hero } from "@/components/landing/Hero";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <nav className="flex h-14 items-center justify-between border-b border-neutral-900 px-6">
        <span className="text-lg font-semibold tracking-tight">resume.ai</span>
        <div className="flex items-center gap-3 text-sm">
          <a href="/sign-in" className="text-neutral-400 hover:text-white">Sign in</a>
        </div>
      </nav>

      <section className="flex flex-col items-center justify-center px-6 py-24 text-center">
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-[1.05] max-w-3xl">
          Stop letting AI decide<br />your job for you.
        </h1>
        <p className="mt-6 text-lg text-neutral-400 max-w-xl">
          Paste a job. Drop your resume. See four ways to win it — with real ATS scores.
        </p>
        <div className="mt-10 w-full max-w-xl">
          <Hero />
        </div>
      </section>
    </main>
  );
}
