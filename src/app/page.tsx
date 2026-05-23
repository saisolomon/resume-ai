"use client";
import Link from "next/link";
import { useUser, UserButton } from "@clerk/nextjs";
import { Hero } from "@/components/landing/Hero";
import { SiteFooter } from "@/components/layout/SiteFooter";

export default function Home() {
  const { isSignedIn, isLoaded } = useUser();

  return (
    <main className="min-h-screen bg-black text-white">
      <nav className="flex h-14 items-center justify-between border-b border-neutral-900 px-6">
        <span className="text-lg font-semibold tracking-tight">resume.ai</span>
        <div className="flex items-center gap-3 text-sm">
          <Link href="/pricing" className="text-neutral-400 hover:text-white">
            Pricing
          </Link>
          {!isLoaded ? (
            <span className="h-6 w-16" aria-hidden="true" />
          ) : isSignedIn ? (
            <>
              <Link href="/dashboard" className="text-neutral-400 hover:text-white">
                Dashboard
              </Link>
              <UserButton afterSignOutUrl="/" />
            </>
          ) : (
            <Link href="/sign-in" className="text-neutral-400 hover:text-white">
              Sign in
            </Link>
          )}
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

      <SiteFooter />
    </main>
  );
}
