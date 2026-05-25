"use client";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowLeft, ArrowRight, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { ResumePreviewHtml, TemplateSlug } from "@/components/try/ResumePreviewHtml";
import { ScoreBadge } from "@/components/try/ScoreBadge";
import { ScoreBreakdown } from "@/components/try/ScoreBreakdown";
import { SiteNav } from "@/components/layout/SiteNav";

/**
 * Side-by-side run comparison.
 *
 * The user picks two of their runs from dropdowns; the page renders
 * each run's highest-scoring ready card side by side. ATS deltas
 * surface above the panels so the better-performing run is obvious
 * at a glance.
 *
 * Why per-run rather than per-card: a run is the meaningful
 * comparison unit — one JD, one tailoring session, four angles —
 * and "the best of those four" is the candidate's actual portfolio
 * piece. If a user wants to compare two specific angles within or
 * across runs, the workspace still lets them dig in one card at a
 * time.
 *
 * URL state: ?a=runId&b=runId so a comparison can be linked /
 * bookmarked / shared internally. Falling back to the dropdowns when
 * no params or invalid params are present.
 */
export default function CompareRunsPage() {
  return (
    // useSearchParams() inside the client component requires a
    // Suspense boundary at the route level per the Next 16 contract.
    <Suspense fallback={<CompareSkeleton />}>
      <CompareRunsClient />
    </Suspense>
  );
}

function CompareRunsClient() {
  const router = useRouter();
  const search = useSearchParams();
  const { isSignedIn, isLoaded } = useUser();

  const runs = useQuery(
    api.dashboard.listMyRuns,
    isSignedIn === true ? {} : "skip",
  );

  // Selected runs — driven by URL params first, fall back to the two
  // most recent runs if available.
  const initialA = search.get("a");
  const initialB = search.get("b");
  const [runIdA, setRunIdA] = useState<string | null>(initialA);
  const [runIdB, setRunIdB] = useState<string | null>(initialB);

  useEffect(() => {
    if (!runs || runs.length === 0) return;
    setRunIdA((prev) => prev ?? runs[0]._id);
    setRunIdB((prev) => prev ?? runs[1]?._id ?? null);
  }, [runs]);

  // Sync URL when selection changes so the comparison stays linkable.
  useEffect(() => {
    if (!runIdA && !runIdB) return;
    const params = new URLSearchParams();
    if (runIdA) params.set("a", runIdA);
    if (runIdB) params.set("b", runIdB);
    router.replace(`/compare?${params.toString()}`, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runIdA, runIdB]);

  // Auth guard.
  if (isLoaded && !isSignedIn) {
    router.replace("/sign-in?redirect_url=/compare");
    return null;
  }

  if (runs === undefined) return <CompareSkeleton />;

  if (runs.length < 2) {
    return (
      <main className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F]">
        <SiteNav home="/dashboard">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-[15px] font-medium text-[#1D1D1F] transition-colors hover:text-[#6E6E73]"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Dashboard
          </Link>
        </SiteNav>
        <section className="mx-auto max-w-2xl px-6 py-24 text-center sm:px-8">
          <h1 className="text-h1 text-[#1D1D1F]">Need two runs to compare.</h1>
          <p className="mt-3 text-[15px] text-[#6E6E73]">
            You&apos;ve got {runs.length} run{runs.length === 1 ? "" : "s"} so
            far. Tailor at least one more, then come back here to put them
            side by side.
          </p>
          <Link
            href="/"
            className="focus-ring mt-8 inline-flex h-12 items-center rounded-full bg-[#1D1D1F] px-6 text-[15px] font-medium text-white transition-colors duration-200 hover:bg-black"
          >
            Start a new run
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F]">
      <SiteNav home="/dashboard">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-[15px] font-medium text-[#1D1D1F] transition-colors hover:text-[#6E6E73]"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Dashboard
        </Link>
      </SiteNav>

      <section className="mx-auto max-w-7xl px-6 pt-12 pb-24 sm:px-8 sm:pt-16">
        <div className="mb-10 max-w-3xl">
          <h1 className="text-h1 text-[#1D1D1F]">Compare runs.</h1>
          <p className="mt-3 text-[17px] leading-relaxed text-[#6E6E73]">
            Pick any two of your runs. We&apos;ll show the highest-scoring
            angle from each, side by side, with ATS deltas so you can see
            which JD performed better.
          </p>
        </div>

        {/* Selector row — two dropdowns + a live score delta between
            them so users see the headline number before scrolling. */}
        <div className="mb-8 grid items-end gap-4 md:grid-cols-[1fr_auto_1fr]">
          <RunSelector
            label="Run A"
            value={runIdA}
            onChange={setRunIdA}
            runs={runs}
            disabledId={runIdB}
          />
          <ScoreDelta runIdA={runIdA} runIdB={runIdB} runs={runs} />
          <RunSelector
            label="Run B"
            value={runIdB}
            onChange={setRunIdB}
            runs={runs}
            disabledId={runIdA}
          />
        </div>

        {/* Side-by-side panels */}
        <div className="grid gap-6 md:grid-cols-2 md:gap-8">
          <RunPanel runId={runIdA} side="A" />
          <RunPanel runId={runIdB} side="B" />
        </div>
      </section>
    </main>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────

type RunListItem = {
  _id: string;
  jdTitle: string;
  jdCompany: string;
  topScore: number | null;
  _creationTime: number;
};

function ScoreDelta({
  runIdA,
  runIdB,
  runs,
}: {
  runIdA: string | null;
  runIdB: string | null;
  runs: RunListItem[];
}) {
  const runA = runs.find((r) => r._id === runIdA);
  const runB = runs.find((r) => r._id === runIdB);
  const scoreA = runA?.topScore;
  const scoreB = runB?.topScore;

  if (scoreA == null || scoreB == null) {
    return (
      <div className="hidden md:flex md:h-12 md:items-center md:justify-center">
        <ArrowRight
          className="size-5 text-[#86868B]"
          aria-hidden="true"
        />
      </div>
    );
  }

  const delta = scoreB - scoreA;
  const sign = delta === 0 ? "tie" : delta > 0 ? "b" : "a";
  const Icon = delta === 0 ? Minus : delta > 0 ? TrendingUp : TrendingDown;
  const tone =
    delta === 0
      ? "text-[#86868B] bg-[#F5F5F7]"
      : delta > 0
        ? "text-[#1A7F45] bg-[#F0FDF4]"
        : "text-[#B45309] bg-[#FEF3C7]";

  return (
    <div className="md:h-12 md:self-center">
      <div
        className={`flex h-12 items-center justify-center gap-1.5 rounded-full px-4 ${tone}`}
        aria-label={
          delta === 0
            ? "Tied ATS score"
            : `Run ${sign === "b" ? "B" : "A"} is ${Math.abs(delta)} points higher`
        }
      >
        <Icon className="size-4" aria-hidden="true" />
        <span className="font-mono text-[14px] font-semibold tabular-nums">
          {delta === 0 ? "tied" : `${delta > 0 ? "+" : ""}${delta}`}
        </span>
      </div>
    </div>
  );
}

function RunSelector({
  label,
  value,
  onChange,
  runs,
  disabledId,
}: {
  label: string;
  value: string | null;
  onChange: (id: string) => void;
  runs: RunListItem[];
  disabledId: string | null;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.06em] text-[#86868B]">
        {label}
      </span>
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="focus-ring h-12 w-full rounded-xl border border-[#D2D2D7] bg-white px-3 text-[15px] font-medium text-[#1D1D1F] transition-colors hover:border-[#86868B]"
      >
        {runs.map((r) => (
          <option key={r._id} value={r._id} disabled={r._id === disabledId}>
            {r.jdTitle}
            {r.jdCompany ? ` · ${r.jdCompany}` : ""}
            {r.topScore !== null ? `  (ATS ${r.topScore})` : ""}
          </option>
        ))}
      </select>
    </label>
  );
}

function RunPanel({
  runId,
  side,
}: {
  runId: string | null;
  side: "A" | "B";
}) {
  const cards = useQuery(
    api.dashboard.cardsByMyRun,
    runId ? { runId: runId as Id<"runs"> } : "skip",
  );

  // Pick the highest-scoring ready card.
  const bestCard = useMemo(() => {
    if (!cards) return null;
    const ready = cards.filter(
      (c) => c.status === "ready" && c.content && c.atsScore,
    );
    if (ready.length === 0) return null;
    return ready.reduce((best, c) =>
      (c.atsScore?.total ?? 0) > (best.atsScore?.total ?? 0) ? c : best,
    );
  }, [cards]);

  if (!runId) {
    return (
      <div className="rounded-2xl border border-dashed border-[#D2D2D7] bg-white/40 p-8 text-center text-[15px] text-[#86868B]">
        Pick a run for side {side}.
      </div>
    );
  }
  if (cards === undefined) {
    return (
      <div
        className="h-96 animate-pulse rounded-2xl bg-white shadow-card"
        aria-label="Loading run"
      />
    );
  }
  if (!bestCard || !bestCard.content || !bestCard.atsScore) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow-card">
        <p className="text-[15px] text-[#86868B]">
          No ready cards in this run yet.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header strip — angle chip + template + ATS at a glance */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-md bg-[#EFF6FF] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.04em] text-[#3B82F6]">
            {bestCard.angleLabel}
          </span>
          <span className="text-[12px] capitalize text-[#6E6E73]">
            {bestCard.templateSlug}
          </span>
        </div>
        <ScoreBadge score={bestCard.atsScore.total} size="md" />
      </div>

      {/* Resume preview — scaled into the card */}
      <div className="relative aspect-[5/7] overflow-hidden rounded-2xl bg-white shadow-card">
        <div
          className="absolute inset-0 origin-top-left"
          style={{ transform: "scale(0.52)", width: "192.3%", height: "192.3%" }}
          aria-hidden="true"
        >
          <ResumePreviewHtml
            data={bestCard.content}
            template={bestCard.templateSlug as TemplateSlug}
          />
        </div>
      </div>

      <ScoreBreakdown score={bestCard.atsScore} />

      <Link
        href={`/workspace/${bestCard._id}`}
        className="focus-ring inline-flex h-10 items-center justify-center gap-1.5 rounded-full border border-[#D2D2D7] bg-white text-[14px] font-medium text-[#1D1D1F] transition-colors hover:border-[#86868B] hover:bg-[#F5F5F7]"
      >
        Open in workspace
      </Link>
    </div>
  );
}

function CompareSkeleton() {
  return (
    <main className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F]">
      <SiteNav home="/dashboard" />
      <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8">
        <div className="h-10 w-64 animate-pulse rounded bg-white" />
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="h-96 animate-pulse rounded-2xl bg-white" />
          <div className="h-96 animate-pulse rounded-2xl bg-white" />
        </div>
      </div>
    </main>
  );
}

