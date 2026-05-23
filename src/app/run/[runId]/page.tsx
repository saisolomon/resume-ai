"use client";
import { use, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { useUser, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { CardSkeleton } from "@/components/try/CardSkeleton";
import { CardTile } from "@/components/try/CardTile";

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
    return <div className="p-12 text-center text-neutral-400">Loading…</div>;
  }

  // Run no longer accessible: either deleted from another tab, or the caller
  // is signed in but doesn't own this run. Either way, send them home.
  if (run === null || cards === null) {
    return (
      <div className="p-12 text-center text-neutral-400">
        This run isn&apos;t available.{" "}
        <Link href="/dashboard" className="text-white underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  const readyCount = cards.filter((c) => c.status === "ready").length;
  const totalCount = cards.length || 4;
  const allReady = cards.length > 0 && readyCount === totalCount;

  return (
    <main className="min-h-screen bg-black text-white">
      <nav className="flex h-14 items-center justify-between border-b border-neutral-900 px-6">
        <Link href="/dashboard" className="text-lg font-semibold tracking-tight">resume.ai</Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/dashboard" className="text-neutral-400 hover:text-white">Dashboard</Link>
          <UserButton afterSignOutUrl="/" />
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Your 4 designs</h1>
            <p className="text-sm text-neutral-400 mt-1">
              {allReady ? "Click any card to preview or edit." : `Tailoring… ${readyCount} / ${totalCount} ready`}
            </p>
          </div>
          <button
            onClick={async () => {
              if (!confirm("Delete this run? This cannot be undone.")) return;
              await deleteRun({ runId: runId as Id<"runs"> });
              router.push("/dashboard");
            }}
            className="text-sm text-red-500 hover:text-red-400"
          >
            Delete run
          </button>
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
                href={`/run/${runId}/edit/${card._id}`}
              />
            ) : card.status === "failed" ? (
              <div key={card._id} className="rounded border border-red-900 bg-red-950 p-4 aspect-[3/4] flex flex-col">
                <div className="text-[10px] uppercase tracking-wider text-red-400 font-semibold mb-2">{card.angleLabel}</div>
                <div className="flex-1 text-xs text-red-300">{card.failureReason}</div>
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
