"use client";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { CardSkeleton } from "@/components/try/CardSkeleton";
import { CardTile } from "@/components/try/CardTile";
import { SiteNav } from "@/components/layout/SiteNav";
import { use } from "react";

export default function TryRunPage({
  params,
}: {
  params: Promise<{ runId: string }>;
}) {
  const { runId } = use(params);
  const cards = useQuery(api.cards.byRun, { runId: runId as Id<"runs"> });
  const run = useQuery(api.runs.getRun, { runId: runId as Id<"runs"> });

  if (cards === undefined) {
    return (
      <main className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F]">
        <SiteNav home="/" />
        <div className="mx-auto max-w-6xl px-6 py-16 text-[15px] text-[#6E6E73] sm:px-8">
          Loading.
        </div>
      </main>
    );
  }
  if (cards.length === 0 && run?.status === "scraping") {
    return (
      <main className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F]">
        <SiteNav home="/" />
        <div className="mx-auto max-w-6xl px-6 py-16 sm:px-8">
          <p className="flex items-center gap-2 text-[15px] text-[#6E6E73]">
            <span
              className="size-1.5 animate-pulse rounded-full bg-[#86868B]"
              aria-hidden="true"
            />
            Scraping the job posting.
          </p>
        </div>
      </main>
    );
  }

  const readyCount = cards.filter((c) => c.status === "ready").length;
  const totalCount = cards.length || 4;
  const allReady = readyCount === totalCount;

  return (
    <main className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F]">
      <SiteNav home="/" />

      <div className="mx-auto max-w-7xl px-6 py-12 sm:px-8 sm:py-16">
        <div className="mb-10">
          <span className="text-[13px] font-medium text-[#86868B]">
            Run · <span className="font-mono tabular-nums">{runId.slice(0, 8)}</span>
          </span>
          <h1 className="mt-3 text-h1 text-[#1D1D1F]">Your 4 designs</h1>
          <p className="mt-3 flex items-center gap-2 text-[15px] text-[#6E6E73]">
            {allReady ? (
              <>
                <span
                  className="size-1.5 rounded-full bg-[#1A7F45]"
                  aria-hidden="true"
                />
                All ready. Click any card to preview and download.
              </>
            ) : (
              <>
                <span
                  className="size-1.5 animate-pulse rounded-full bg-[#86868B]"
                  aria-hidden="true"
                />
                <span>
                  Tailoring —{" "}
                  <span className="font-mono tabular-nums text-[#1D1D1F]">
                    {readyCount.toString().padStart(2, "0")}/
                    {totalCount.toString().padStart(2, "0")}
                  </span>{" "}
                  ready
                </span>
              </>
            )}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
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
                className="flex aspect-[3/4] flex-col rounded-2xl border border-[#FCA5A5] bg-[#FEF2F2] p-5"
              >
                <div className="mb-2 inline-flex w-fit items-center rounded-md bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.04em] text-[#B91C1C]">
                  {card.angleLabel}
                </div>
                <div className="flex-1 text-[13px] leading-relaxed text-[#1D1D1F]">
                  {card.failureReason}
                </div>
                <div className="mt-2 text-[12px] font-medium text-[#B91C1C]">
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
