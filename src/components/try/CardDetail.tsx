"use client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ResumePreviewHtml, TemplateSlug } from "./ResumePreviewHtml";
import { ScoreBreakdown } from "./ScoreBreakdown";
import { DownloadButton } from "./DownloadButton";
import { SiteNav } from "@/components/layout/SiteNav";
import type { ResumeData } from "@/lib/resume/types";

interface AtsScore {
  total: number;
  keywordMatch: number;
  formatSafety: number;
  narrativeFit: number;
  breakdown: {
    keywordsFound: string[];
    keywordsMissing: string[];
    formatIssues: string[];
    narrativeRationale: string;
  };
}

/**
 * Anonymous-flow card detail (/try/[runId]/cards/[cardId]).
 *
 * Read-only — the chat editor is gated to Apply+, so the /try page only
 * needs to show the preview, the score breakdown, and the download CTA
 * (which doubles as the sign-up gate for anonymous users).
 */
export function CardDetail({
  cardId,
  angleLabel,
  templateSlug,
  content,
  atsScore,
}: {
  cardId: string;
  angleLabel: string;
  templateSlug: string;
  content: ResumeData;
  atsScore: AtsScore;
}) {
  return (
    <div className="min-h-screen bg-black text-white">
      <SiteNav home="/">
        <button
          type="button"
          onClick={() => history.back()}
          className="inline-flex items-center gap-1.5 text-sm text-neutral-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back
        </button>
      </SiteNav>

      {/* Card header strip — angle chip + template + score. */}
      <div className="border-b border-neutral-900">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-6 py-3">
          <div className="inline-flex items-center rounded-md bg-white/95 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-blue-700">
            {angleLabel}
          </div>
          <span aria-hidden="true" className="text-neutral-700">·</span>
          <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-neutral-500">
            {templateSlug}
          </span>
          <span aria-hidden="true" className="text-neutral-700">·</span>
          <span className="font-mono text-[11px] tabular-nums text-neutral-500">
            ATS{" "}
            <span className="font-semibold text-white">{atsScore.total}</span>
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6 flex items-baseline justify-between">
          <h1 className="text-h1 text-white">Preview</h1>
          <Link
            href="/"
            className="text-sm text-neutral-400 underline decoration-neutral-700 underline-offset-4 transition-colors hover:text-white hover:decoration-white"
          >
            Run another
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="max-h-[80vh] overflow-y-auto rounded-xl border border-neutral-800 bg-white">
            <ResumePreviewHtml
              data={content}
              template={templateSlug as TemplateSlug}
            />
          </div>
          <div className="space-y-4">
            <ScoreBreakdown score={atsScore} />
            <DownloadButton cardId={cardId} />
          </div>
        </div>
      </div>
    </div>
  );
}