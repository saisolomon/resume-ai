// src/app/dashboard/page.tsx
"use client";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { RunListItem } from "@/components/dashboard/RunListItem";
import { EmptyDashboard } from "@/components/dashboard/EmptyDashboard";

export default function DashboardPage() {
  const runs = useQuery(api.dashboard.listMyRuns, {});

  return (
    <main className="min-h-screen bg-black text-white">
      <nav className="flex h-14 items-center justify-between border-b border-neutral-900 px-6">
        <Link href="/" className="text-lg font-semibold tracking-tight">resume.ai</Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/" className="text-neutral-400 hover:text-white">New run</Link>
          <Link href="/settings" className="text-neutral-400 hover:text-white">Settings</Link>
          <UserButton afterSignOutUrl="/" />
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-semibold mb-6">Your runs</h1>

        {runs === undefined ? (
          <div className="text-neutral-500">Loading…</div>
        ) : runs.length === 0 ? (
          <EmptyDashboard />
        ) : (
          <div className="space-y-2">
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
        )}
      </div>
    </main>
  );
}
