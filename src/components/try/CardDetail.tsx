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
 * Anonymous-flow card detail (/try/[runId]/cards/[cardId]) — Apple-light.
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
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F]">
      <SiteNav home="/">
        <button
          type="button"
          onClick={() => history.back()}
          className="inline-flex items-center gap-1.5 text-[15px] font-medium text-[#1D1D1F] transition-colors hover:text-[#6E6E73]"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back
        </button>
      </SiteNav>

      {/* Card header strip — angle chip + template + score. */}
      <div className="border-b border-[#D2D2D7]/60 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-6 py-3 sm:px-8">
          <div className="inline-flex items-center rounded-md bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.04em] text-[#3B82F6] ring-1 ring-[#D2D2D7]/60">
            {angleLabel}
          </div>
          <span aria-hidden="true" className="text-[#D2D2D7]">
            ·
          </span>
          <span className="text-[13px] capitalize text-[#6E6E73]">
            {templateSlug}
          </span>
          <span aria-hidden="true" className="text-[#D2D2D7]">
            ·
          </span>
          <span className="font-mono text-[13px] tabular-nums text-[#6E6E73]">
            ATS{" "}
            <span className="font-semibold text-[#1D1D1F]">
              {atsScore.total}
            </span>
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-10 sm:px-8 sm:py-12">
        <div className="mb-6 flex items-baseline justify-between">
          <h1 className="text-h1 text-[#1D1D1F]">Preview</h1>
          <Link
            href="/"
            className="text-[15px] font-medium text-[#0071E3] underline-offset-4 hover:underline"
          >
            Run another
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="max-h-[80vh] overflow-y-auto rounded-2xl bg-white shadow-card">
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
