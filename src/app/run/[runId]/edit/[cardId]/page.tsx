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
  const card = useQuery(api.dashboard.getMyCard, {
    cardId: cardId as Id<"cards">,
  });

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace(`/sign-in?redirect_url=/run/${runId}/edit/${cardId}`);
    }
  }, [isLoaded, isSignedIn, runId, cardId, router]);

  if (isLoaded && !isSignedIn) return null;
  if (card === undefined) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F]">
        <SiteNav home="/dashboard" />
        <div className="mx-auto max-w-2xl px-6 py-16 text-[15px] text-[#6E6E73] sm:px-8">
          Loading.
        </div>
      </div>
    );
  }
  if (!card || !card.content || !card.atsScore) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F]">
        <SiteNav home="/dashboard" />
        <div className="mx-auto max-w-2xl px-6 py-24 text-center sm:px-8">
          <h1 className="text-h1 text-[#1D1D1F]">Card not ready.</h1>
          <p className="mt-3 text-[15px] text-[#6E6E73]">
            Either this card is still generating, or it failed during the run.
          </p>
          <Link
            href={`/run/${runId}`}
            className="focus-ring mt-8 inline-flex h-12 items-center rounded-full bg-[#1D1D1F] px-6 text-[15px] font-medium text-white transition-colors duration-200 hover:bg-black"
          >
            Back to gallery
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F5F5F7] text-[#1D1D1F]">
      <SiteNav home="/dashboard">
        <Link
          href={`/run/${runId}`}
          className="inline-flex items-center gap-1.5 text-[15px] font-medium text-[#1D1D1F] transition-colors hover:text-[#6E6E73]"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to gallery
        </Link>
      </SiteNav>

      {/* Card header strip — angle chip + template + ATS score at a glance.
          Stays above the split so users always know which card they're
          editing without scrolling. */}
      <div className="border-b border-[#D2D2D7]/60 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-6 py-3 sm:px-8">
          <div className="inline-flex items-center rounded-md bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.04em] text-[#3B82F6] ring-1 ring-[#D2D2D7]/60">
            {card.angleLabel}
          </div>
          <span aria-hidden="true" className="text-[#D2D2D7]">
            ·
          </span>
          <span className="text-[13px] capitalize text-[#6E6E73]">
            {card.templateSlug}
          </span>
          <span aria-hidden="true" className="text-[#D2D2D7]">
            ·
          </span>
          <span className="font-mono text-[13px] tabular-nums text-[#6E6E73]">
            ATS{" "}
            <span className="font-semibold text-[#1D1D1F]">
              {card.atsScore.total}
            </span>
          </span>
        </div>
      </div>

      {/* Split layout. The preview gets the bigger column; the chat panel
          is a fixed-width 400px on desktop. On mobile, chat goes below. */}
      <div className="grid flex-1 grid-cols-1 gap-4 overflow-hidden p-4 sm:p-6 lg:grid-cols-[1fr_400px]">
        <div className="flex min-h-0 flex-col gap-4">
          <div className="flex-1 overflow-y-auto rounded-2xl bg-white shadow-card">
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
