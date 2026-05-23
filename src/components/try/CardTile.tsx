import Link from "next/link";
import { ScoreBadge } from "./ScoreBadge";
import { ResumePreviewHtml, TemplateSlug } from "./ResumePreviewHtml";
import type { ResumeData } from "@/lib/resume/types";

export function CardTile({
  runId,
  cardId,
  angleLabel,
  templateSlug,
  content,
  totalScore,
  href,
}: {
  runId: string;
  cardId: string;
  angleLabel: string;
  templateSlug: string;
  content: ResumeData;
  totalScore: number;
  href?: string;
}) {
  const linkHref = href ?? `/try/${runId}/cards/${cardId}`;
  return (
    <Link
      href={linkHref}
      className="block rounded-lg border border-neutral-800 bg-white hover:border-neutral-500 overflow-hidden relative aspect-[3/4]"
    >
      <div className="absolute top-2 right-2 z-10">
        <ScoreBadge score={totalScore} size="sm" />
      </div>
      <div className="absolute top-2 left-2 z-10 text-[10px] uppercase tracking-wider text-blue-700 bg-white/90 px-2 py-0.5 rounded font-semibold">
        {angleLabel}
      </div>
      <div className="absolute inset-0 overflow-hidden transform scale-[0.4] origin-top-left w-[250%] h-[250%]">
        <ResumePreviewHtml data={content} template={templateSlug as TemplateSlug} />
      </div>
    </Link>
  );
}
