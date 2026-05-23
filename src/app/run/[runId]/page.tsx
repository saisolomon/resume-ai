"use client";
import { use, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { Trash2, Plus } from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { CardSkeleton } from "@/components/try/CardSkeleton";
import { CardTile } from "@/components/try/CardTile";
import { SiteNav, NavLink } from "@/components/layout/SiteNav";

export default function RunPage({
  params,
}: {
  params: Promise<{ runId: string }>;
}) {
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
    runId: runId as Id<"runs">,
  });
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
      <main className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F]">
        <SiteNav home="/dashboard" />
        <div className="mx-auto max-w-6xl px-6 py-16 text-[15px] text-[#6E6E73] sm:px-8">
          Loading.
        </div>
      </main>
    );
  }

  // Run no longer accessible: either deleted from another tab, or the caller
  // is signed in but doesn't own this run. Either way, send them home.
  if (run === null || cards === null) {
    return (
      <main className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F]">
        <SiteNav home="/dashboard" />
        <div className="mx-auto max-w-2xl px-6 py-24 text-center sm:px-8">
          <h1 className="text-h1 text-[#1D1D1F]">
            This run isn&apos;t available.
          </h1>
          <p className="mt-4 text-[17px] text-[#6E6E73]">
            It may have been deleted, or it belongs to a different account.
          </p>
          <Link
            href="/dashboard"
            className="focus-ring mt-8 inline-flex h-12 items-center rounded-full bg-[#1D1D1F] px-6 text-[15px] font-medium text-white transition-colors duration-200 hover:bg-black"
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
    <main className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F]">
      <SiteNav home="/dashboard">
        <NavLink href="/dashboard">Dashboard</NavLink>
      </SiteNav>

      <div className="mx-auto max-w-7xl px-6 py-12 sm:px-8 sm:py-16">
        {/* Header */}
        <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
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
                  All ready. Click any card to preview or edit.
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

          <div className="flex flex-wrap items-center gap-2 self-start">
            <Link
              href="/"
              className="focus-ring inline-flex h-10 items-center gap-2 rounded-full bg-[#1D1D1F] px-5 text-[15px] font-medium text-white transition-colors duration-200 hover:bg-black"
            >
              <Plus className="size-4" aria-hidden="true" />
              New run
            </Link>
            <button
              onClick={async () => {
                if (!confirm("Delete this run? This cannot be undone.")) return;
                await deleteRun({ runId: runId as Id<"runs"> });
                router.push("/dashboard");
              }}
              className="focus-ring inline-flex h-10 items-center gap-2 rounded-full border border-[#FCA5A5] bg-white px-5 text-[15px] font-medium text-[#B91C1C] transition-colors duration-200 hover:bg-[#FEF2F2] hover:border-[#B91C1C]"
            >
              <Trash2 className="size-4" aria-hidden="true" />
              Delete run
            </button>
          </div>
        </div>

        {/* Card grid */}
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
                href={`/run/${runId}/edit/${card._id}`}
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
