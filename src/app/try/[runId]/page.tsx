"use client";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { CardSkeleton } from "@/components/try/CardSkeleton";
import { CardTile } from "@/components/try/CardTile";
import { SiteNav } from "@/components/layout/SiteNav";
import { use } from "react";

export default function TryRunPage({ params }: { params: Promise<{ runId: string }> }) {
  const { runId } = use(params);
  const cards = useQuery(api.cards.byRun, { runId: runId as Id<"runs"> });
  const run = useQuery(api.runs.getRun, { runId: runId as Id<"runs"> });

  if (cards === undefined) {
    return (
      <main className="min-h-screen bg-black text-white">
        <SiteNav home="/" />
        <div className="mx-auto max-w-6xl px-6 py-16 text-sm text-neutral-500">
          Loading…
        </div>
      </main>
    );
  }
  if (cards.length === 0 && run?.status === "scraping") {
    return (
      <main className="min-h-screen bg-black text-white">
        <SiteNav home="/" />
        <div className="mx-auto max-w-6xl px-6 py-16">
          <p className="flex items-center gap-2 text-sm text-neutral-400">
            <span className="size-1.5 animate-pulse rounded-full bg-neutral-400" aria-hidden="true" />
            Scraping the job posting…
          </p>
        </div>
      </main>
    );
  }

  const readyCount = cards.filter((c) => c.status === "ready").length;
  const totalCount = cards.length || 4;
  const allReady = readyCount === totalCount;

  return (
    <main className="min-h-screen bg-black text-white">
      <SiteNav home="/" />

      <div className="mx-auto max-w-7xl px-6 py-10 sm:py-12">
        <div className="mb-10">
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
                All ready. Click any card to preview and download.
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