"use client";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { CardSkeleton } from "@/components/try/CardSkeleton";
import { CardTile } from "@/components/try/CardTile";
import { use } from "react";

export default function TryRunPage({ params }: { params: Promise<{ runId: string }> }) {
  const { runId } = use(params);
  const cards = useQuery(api.cards.byRun, { runId: runId as Id<"runs"> });
  const run = useQuery(api.runs.getRun, { runId: runId as Id<"runs"> });

  if (cards === undefined) {
    return <div className="p-12 text-center text-neutral-400">Loading…</div>;
  }
  if (cards.length === 0 && run?.status === "scraping") {
    return <div className="p-12 text-center text-neutral-400">Scraping the job posting…</div>;
  }

  const readyCount = cards.filter((c) => c.status === "ready").length;
  const totalCount = cards.length || 4;
  const allReady = readyCount === totalCount;

  return (
    <main className="min-h-screen bg-black text-white">
      <nav className="border-b border-neutral-900 px-6 h-14 flex items-center">
        <a href="/" className="text-lg font-semibold tracking-tight">resume.ai</a>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold">Your 4 designs</h1>
          <p className="text-sm text-neutral-400 mt-1">
            {allReady ? "Ready — click any to preview." : `Tailoring… ${readyCount} / ${totalCount} ready`}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
              <div key={card._id} className="rounded border border-red-900 bg-red-950 p-4 aspect-[3/4] flex flex-col">
                <div className="text-[10px] uppercase tracking-wider text-red-400 font-semibold mb-2">
                  {card.angleLabel}
                </div>
                <div className="flex-1 text-xs text-red-300">{card.failureReason}</div>
                <div className="text-xs text-red-400 text-center">Failed</div>
              </div>
            ) : (
              <CardSkeleton key={card._id} angleLabel={card.angleLabel} templateSlug={card.templateSlug} />
            ),
          )}
        </div>
      </div>
    </main>
  );
}
