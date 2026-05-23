"use client";
import { use, useEffect } from "react";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import {
  ResumePreviewHtml,
  TemplateSlug,
} from "@/components/try/ResumePreviewHtml";
import { ScoreBreakdown } from "@/components/try/ScoreBreakdown";
import { ChatPanel } from "@/components/editor/ChatPanel";
import { SiteNav } from "@/components/layout/SiteNav";

export default function EditCardPage({
  params,
}: {
  params: Promise<{ runId: string; cardId: string }>;
}) {
  const { runId, cardId } = use(params);
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();
  // Owner-gated card lookup — public api.cards._getCardById leaks card
  // content/score to anyone with a guessed ID, so we use the dashboard
  // wrapper that verifies the caller owns the card's run.
  const card = useQuery(api.dashboard.getMyCard, { cardId: cardId as Id<"cards"> });

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace(`/sign-in?redirect_url=/run/${runId}/edit/${cardId}`);
    }
  }, [isLoaded, isSignedIn, runId, cardId, router]);

  if (isLoaded && !isSignedIn) return null;
  if (card === undefined) {
    return (
      <div className="min-h-screen bg-black text-white">
        <SiteNav home="/dashboard" />
        <div className="mx-auto max-w-2xl px-6 py-16 text-sm text-neutral-500">
          Loading…
        </div>
      </div>
    );
  }
  if (!card || !card.content || !card.atsScore) {
    return (
      <div className="min-h-screen bg-black text-white">
        <SiteNav home="/dashboard" />
        <div className="mx-auto max-w-2xl px-6 py-16 text-center">
          <h1 className="text-h1 text-white">Card not ready.</h1>
          <p className="mt-3 text-sm text-neutral-400">
            Either this card is still generating, or it failed during the run.
          </p>
          <Link
            href={`/run/${runId}`}
            className="mt-6 inline-flex h-10 items-center rounded-md bg-white px-5 text-sm font-semibold text-black hover:bg-neutral-200"
          >
            Back to gallery
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <SiteNav home="/dashboard">
        <Link
          href={`/run/${runId}`}
          className="inline-flex items-center gap-1.5 text-sm text-neutral-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to gallery
        </Link>
      </SiteNav>

      {/* Card header strip — angle chip + template + ATS score at-a-glance.
          Stays above the split so users always know which card they're
          editing without scrolling. */}
      <div className="border-b border-neutral-900">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-6 py-3">
          <div className="inline-flex items-center rounded-md bg-white/95 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-blue-700">
            {card.angleLabel}
          </div>
          <span aria-hidden="true" className="text-neutral-700">·</span>
          <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-neutral-500">
            {card.templateSlug}
          </span>
          <span aria-hidden="true" className="text-neutral-700">·</span>
          <span className="font-mono text-[11px] tabular-nums text-neutral-500">
            ATS{" "}
            <span className="font-semibold text-white">{card.atsScore.total}</span>
          </span>
        </div>
      </div>

      {/* Split layout. The preview gets the bigger column; the chat panel
          is a fixed-width 400px on desktop. On mobile, chat goes below. */}
      <div className="grid flex-1 grid-cols-1 gap-4 overflow-hidden p-4 lg:grid-cols-[1fr_400px]">
        <div className="flex min-h-0 flex-col gap-4">
          <div className="flex-1 overflow-y-auto rounded-xl border border-neutral-800 bg-white">
            <ResumePreviewHtml
              data={card.content}
              template={card.templateSlug as TemplateSlug}
            />
          </div>
          <ScoreBreakdown score={card.atsScore} />
        </div>
        <ChatPanel cardId={cardId} />
      </div>
    </div>
  );
}