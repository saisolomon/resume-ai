"use client";
import { use, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { CardSkeleton } from "@/components/try/CardSkeleton";
import { CardTile } from "@/components/try/CardTile";
import { SiteNav, NavLink } from "@/components/layout/SiteNav";

export default function RunPage({ params }: { params: Promise<{ runId: string }> }) {
  const { runId } = use(params);
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();
  // Owner-gated queries — return null if the caller isn't the owner of this
  // run. Public `api.runs.getRun` / `api.cards.byRun` are reserved for the
  // anonymous /try flow where the URL itself is the access token.
  const cards = useQuery(api.dashboard.cardsByMyRun, {
    runId: runId as Id<"runs">,
  });
  const run = useQuery(api.dashboard.getMyRun, {
    runId: runId as Id<"runs"> });
  const deleteRun = useMutation(api.cleanup.deleteRun);

  // Redirect unauthenticated visitors. Use useEffect so the navigation
  // happens as a side effect, not during render.
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace(`/sign-in?redirect_url=/run/${runId}`);
    }
  }, [isLoaded, isSignedIn, runId, router]);

  if (isLoaded && !isSignedIn) return null;

  if (cards === undefined || run === undefined) {
    return (
      <main className="min-h-screen bg-black text-white">
        <SiteNav home="/dashboard" />
        <div className="mx-auto max-w-6xl px-6 py-16 text-sm text-neutral-500">
          Loading…
        </div>
      </main>
    );
  }

  // Run no longer accessible: either deleted from another tab, or the caller
  // is signed in but doesn't own this run. Either way, send them home.
  if (run === null || cards === null) {
    return (
      <main className="min-h-screen bg-black text-white">
        <SiteNav home="/dashboard" />
        <div className="mx-auto max-w-2xl px-6 py-24 text-center">
          <h1 className="text-h1 text-white">This run isn&apos;t available.</h1>
          <p className="mt-4 text-sm text-neutral-400">
            It may have been deleted, or it belongs to a different account.
          </p>
          <Link
            href="/dashboard"
            className="mt-6 inline-flex h-10 items-center rounded-md bg-white px-5 text-sm font-semibold text-black transition-colors hover:bg-neutral-200"
          >
            Back to dashboard
          </Link>
        </div>
      </main>
    );
  }

  const readyCount = cards.filter((c) => c.status === "ready").length;
  const totalCount = cards.length || 4;
  const allReady = cards.length > 0 && readyCount === totalCount;

  return (
    <main className="min-h-screen bg-black text-white">
      <SiteNav home="/dashboard">
        <NavLink href="/dashboard">Dashboard</NavLink>
      </SiteNav>

      <div className="mx-auto max-w-7xl px-6 py-10 sm:py-12">
        {/* Header */}
        <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
                Run
              </span>
              <span className="font-mono text-[11px] tabular-nums text-neutral-600">
                {runId.slice(0, 8)}
              </span>
            </div>
            <h1 className="mt-3 text-h1 text-white">Your 4 designs</h1>
            <p className="mt-3 flex items-center gap-2 text-sm text-neutral-500">
              {allReady ? (
                <>
                  <span className="size-1.5 rounded-full bg-green-500" aria-hidden="true" />
                  All ready. Click any card to preview or edit.
                </>
              ) : (
                <>
                  <span className="size-1.5 animate-pulse rounded-full bg-neutral-400" aria-hidden="true" />
                  <span>
                    Tailoring —{" "}
                    <span className="font-mono tabular-nums text-neutral-300">
                      {readyCount.toString().padStart(2, "0")}/{totalCount.toString().padStart(2, "0")}
                    </span>{" "}
                    ready
                  </span>
                </>
              )}
            </p>
          </div>

          <button
            onClick={async () => {
              if (!confirm("Delete this run? This cannot be undone.")) return;
              await deleteRun({ runId: runId as Id<"runs"> });
              router.push("/dashboard");
            }}
            className="inline-flex h-10 items-center gap-2 self-start rounded-md border border-red-900 bg-transparent px-4 text-sm font-semibold text-red-400 transition-colors hover:border-red-800 hover:bg-red-950/30 focus:outline-none focus:ring-2 focus:ring-red-900/50"
          >
            <Trash2 className="size-4" aria-hidden="true" />
            Delete run
          </button>
        </div>

        {/* Card grid */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {cards.map((card) =>
            card.status === "ready" && card.content && card.atsScore ? (
              <CardTile
                key={card._id}
                runId={runId}
                cardId={card._id}
                angleLabel={card.angleLabel}
                templateSlug={card.templateSlug}
                content={card.content}
                totalScore={card.atsScore.total}
                href={`/run/${runId}/edit/${card._id}`}
              />
            ) : card.status === "failed" ? (
              <div
                key={card._id}
                className="flex aspect-[3/4] flex-col rounded-lg border border-red-900 bg-red-950/30 p-4"
              >
                <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-red-400">
                  {card.angleLabel}
                </div>
                <div className="flex-1 text-xs text-red-300">
                  {card.failureReason}
                </div>
                <div className="mt-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-red-500">
                  Failed
                </div>
              </div>
            ) : (
              <CardSkeleton
                key={card._id}
                angleLabel={card.angleLabel}
                templateSlug={card.templateSlug}
              />
            ),
          )}
        </div>
      </div>
    </main>
  );
}