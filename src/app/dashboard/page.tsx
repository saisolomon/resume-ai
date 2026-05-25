// src/app/dashboard/page.tsx
"use client";
import { Suspense } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import { Plus } from "lucide-react";
import { RunListItem } from "@/components/dashboard/RunListItem";
import { EmptyDashboard } from "@/components/dashboard/EmptyDashboard";
import { OutOfCreditsCard } from "@/components/dashboard/OutOfCreditsCard";
import { CreditedBanner } from "@/components/dashboard/CreditedBanner";
import { SiteNav, NavLink } from "@/components/layout/SiteNav";

export default function DashboardPage() {
  const runs = useQuery(api.dashboard.listMyRuns, {});
  const balance = useQuery(api.users.getCreditBalance, {});

  // Show the inline out-of-credits card when the user has existing runs
  // but no credits left.
  const showOutOfCredits =
    runs !== undefined && runs.length > 0 && balance === 0;

  return (
    <main className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F]">
      <SiteNav home="/dashboard">
        <NavLink href="/pricing">Pricing</NavLink>
        <NavLink href="/settings">Settings</NavLink>
      </SiteNav>

      <div className="mx-auto max-w-3xl px-6 py-16 sm:px-8 sm:py-20">
        {/* useSearchParams() requires a Suspense boundary in Next 16. */}
        <Suspense fallback={null}>
          <CreditedBanner />
        </Suspense>

        {/* Header — four secondary CTAs + the primary "New run". Compare
            is only meaningful with ≥2 runs but we always show it; the
            page itself handles the "need two runs" empty state. */}
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <h1 className="text-h1 text-[#1D1D1F]">Your runs</h1>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/compare"
              className="focus-ring inline-flex h-11 items-center gap-2 rounded-full border border-[#D2D2D7] bg-white px-5 text-[15px] font-medium text-[#1D1D1F] transition-colors duration-200 hover:border-[#86868B] hover:bg-[#F5F5F7]"
            >
              Compare runs
            </Link>
            <Link
              href="/linkedin"
              className="focus-ring inline-flex h-11 items-center gap-2 rounded-full border border-[#D2D2D7] bg-white px-5 text-[15px] font-medium text-[#1D1D1F] transition-colors duration-200 hover:border-[#86868B] hover:bg-[#F5F5F7]"
            >
              LinkedIn rewrite
            </Link>
            <Link
              href="/new"
              className="focus-ring inline-flex h-11 items-center gap-2 rounded-full border border-[#D2D2D7] bg-white px-5 text-[15px] font-medium text-[#1D1D1F] transition-colors duration-200 hover:border-[#86868B] hover:bg-[#F5F5F7]"
            >
              Start from a JD
            </Link>
            <Link
              href="/"
              className="focus-ring inline-flex h-11 items-center gap-2 rounded-full bg-[#1D1D1F] px-5 text-[15px] font-medium text-white transition-colors duration-200 hover:bg-black"
            >
              <Plus className="size-4" aria-hidden="true" />
              New run
            </Link>
          </div>
        </div>

        {showOutOfCredits && <OutOfCreditsCard />}

        {runs === undefined ? (
          <div className="space-y-3" aria-label="Loading runs">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-2xl bg-white shadow-card"
              />
            ))}
          </div>
        ) : runs.length === 0 ? (
          <EmptyDashboard />
        ) : (
          <>
            {/* meta row above the list — gives the list a header */}
            <div className="mb-3 flex items-baseline justify-between px-1 text-[13px] text-[#86868B]">
              <span>
                {runs.length} {runs.length === 1 ? "run" : "runs"}
              </span>
              <span className="font-mono tabular-nums">most recent first</span>
            </div>
            <div className="space-y-3">
              {runs.map((r) => (
                <RunListItem
                  key={r._id}
                  runId={r._id}
                  jdTitle={r.jdTitle}
                  jdCompany={r.jdCompany}
                  topScore={r.topScore}
                  readyCount={r.readyCount}
                  cardCount={r.cardCount}
                  createdAt={r._creationTime}
                  status={r.status}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
