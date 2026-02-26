"use client";

import { useResume } from "@/lib/resume/context";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { ResumeHeader } from "./ResumeHeader";
import {
  EducationSection,
  ExperienceSectionBlock,
  AdditionalInfoSection,
} from "./ResumeSection";

function MatchScoreOverlay() {
  const { matchScore, keywords } = useResume();

  if (matchScore === null) return null;

  const scoreColor =
    matchScore >= 80
      ? "bg-emerald-600"
      : matchScore >= 60
        ? "bg-amber-500"
        : "bg-red-500";

  return (
    <div className="absolute right-4 top-4 z-10 flex max-w-[220px] flex-col items-end gap-2">
      <div
        className={`${scoreColor} flex items-center gap-1.5 rounded-full px-3 py-1 font-sans text-xs font-semibold text-white shadow-md`}
      >
        <span>Match</span>
        <span className="tabular-nums">{matchScore}%</span>
      </div>
      {keywords && (
        <div className="flex flex-wrap justify-end gap-1">
          {keywords.found.map((kw) => (
            <Badge
              key={kw}
              variant="secondary"
              className="border border-emerald-200 bg-emerald-50 text-emerald-700"
            >
              {kw}
            </Badge>
          ))}
          {keywords.missing.map((kw) => (
            <Badge
              key={kw}
              variant="secondary"
              className="border border-red-200 bg-red-50 text-red-600"
            >
              {kw}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-8 text-center font-sans">
      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-muted-foreground"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      </div>
      <p className="text-sm font-medium text-muted-foreground">
        Your resume will appear here as you chat.
      </p>
    </div>
  );
}

function ResumePaper() {
  const { resume } = useResume();
  if (!resume) return null;

  return (
    <div
      className="mx-auto w-full text-black"
      style={{
        fontFamily: "'Times New Roman', Times, serif",
        padding: "48px",
        maxWidth: "8.5in",
      }}
    >
      <ResumeHeader
        name={resume.name}
        contactLine1={resume.contactLine1}
        contactLine2={resume.contactLine2}
      />
      <EducationSection education={resume.education} />
      {resume.experienceSections.map((section, i) => (
        <ExperienceSectionBlock key={i} section={section} />
      ))}
      {resume.additionalInfo.length > 0 && (
        <AdditionalInfoSection items={resume.additionalInfo} />
      )}
    </div>
  );
}

export function ResumePreview() {
  const { resume } = useResume();

  if (!resume) {
    return <EmptyState />;
  }

  return (
    <div
      className="relative flex h-full flex-col"
      style={{ background: "#ededed" }}
    >
      <MatchScoreOverlay />
      <ScrollArea className="h-full">
        <div className="flex justify-center px-4 py-6 sm:px-6 sm:py-8">
          <div
            className="w-full rounded-sm bg-white shadow-[0_1px_3px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.08)]"
            style={{
              maxWidth: "8.5in",
              minHeight: "11in",
            }}
          >
            <ResumePaper />
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
