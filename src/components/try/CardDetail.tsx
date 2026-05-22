"use client";
import { ResumePreviewHtml, TemplateSlug } from "./ResumePreviewHtml";
import { ScoreBreakdown } from "./ScoreBreakdown";
import { DownloadButton } from "./DownloadButton";
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
      <nav className="border-b border-neutral-900 px-6 h-14 flex items-center justify-between">
        <a href="/" className="text-lg font-semibold tracking-tight">resume.ai</a>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            history.back();
          }}
          className="text-sm text-neutral-400 hover:text-white"
        >
          ← Back to gallery
        </a>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="text-xs uppercase tracking-wider text-blue-400 font-semibold mb-1">
          {angleLabel} · {templateSlug}
        </div>
        <h1 className="text-2xl font-semibold mb-6">Preview</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
          <div className="rounded border border-neutral-800 overflow-hidden bg-white max-h-[80vh] overflow-y-auto">
            <ResumePreviewHtml data={content} template={templateSlug as TemplateSlug} />
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
