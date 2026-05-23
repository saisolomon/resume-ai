"use client";
import { use, useEffect } from "react";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useUser, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { ResumePreviewHtml, TemplateSlug } from "@/components/try/ResumePreviewHtml";
import { ScoreBreakdown } from "@/components/try/ScoreBreakdown";
import { ChatPanel } from "@/components/editor/ChatPanel";

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
  if (card === undefined) return <div className="p-12 text-neutral-400 text-center">Loading…</div>;
  if (!card || !card.content || !card.atsScore) {
    return <div className="p-12 text-neutral-400 text-center">Card not ready.</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <nav className="flex h-14 items-center justify-between border-b border-neutral-900 px-6">
        <Link href="/dashboard" className="text-lg font-semibold tracking-tight">resume.ai</Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href={`/run/${runId}`} className="text-neutral-400 hover:text-white">← Back to gallery</Link>
          <UserButton afterSignOutUrl="/" />
        </div>
      </nav>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-4 p-4 overflow-hidden">
        <div className="flex flex-col gap-4 overflow-hidden">
          <div className="text-xs uppercase tracking-wider text-blue-400 font-semibold">
            {card.angleLabel} · {card.templateSlug}
          </div>
          <div className="flex-1 overflow-y-auto rounded border border-neutral-800 bg-white">
            <ResumePreviewHtml data={card.content} template={card.templateSlug as TemplateSlug} />
          </div>
          <ScoreBreakdown score={card.atsScore} />
        </div>
        <ChatPanel cardId={cardId} />
      </div>
    </div>
  );
}
