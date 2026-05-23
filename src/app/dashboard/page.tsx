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
  // but no credits left. New users (no runs) hit the existing
  // EmptyDashboard, which now self-routes to /pricing when credits=0.
  const showOutOfCredits =
    runs !== undefined && runs.length > 0 && balance === 0;

  return (
    <main className="min-h-screen bg-black text-white">
      <SiteNav home="/dashboard">
        <NavLink href="/pricing">Pricing</NavLink>
        <NavLink href="/settings">Settings</NavLink>
      </SiteNav>

      <div className="mx-auto max-w-3xl px-6 py-12 sm:py-16">
        {/* useSearchParams() requires a Suspense boundary in Next 16. */}
        <Suspense fallback={null}>
          <CreditedBanner />
        </Suspense>

        {/* Header */}
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
              Dashboard
            </span>
            <h1 className="mt-3 text-h1 text-white">Your runs</h1>
          </div>
          <Link
            href="/"
            className="inline-flex h-10 items-center gap-2 rounded-md bg-white px-4 text-sm font-semibold text-black transition-colors hover:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
          >
            <Plus className="size-4" aria-hidden="true" />
            New run
          </Link>
        </div>

        {showOutOfCredits && <OutOfCreditsCard />}

        {runs === undefined ? (
          <div className="space-y-3" aria-label="Loading runs">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-xl border border-neutral-900 bg-neutral-950"
              />
            ))}
          </div>
        ) : runs.length === 0 ? (
          <EmptyDashboard />
        ) : (
          <>
            {/* meta row above the list — gives the list a header */}
            <div className="mb-3 flex items-baseline justify-between px-1 text-xs text-neutral-500">
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
