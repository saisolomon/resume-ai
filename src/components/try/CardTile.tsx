import Link from "next/link";
import { ScoreBadge } from "./ScoreBadge";
import { ResumePreviewHtml, TemplateSlug } from "./ResumePreviewHtml";
import type { ResumeData } from "@/lib/resume/types";

/**
 * Resume card tile.
 *
 * Visual contract:
 *  - 3:4 aspect, hairline border that shifts on hover (neutral-700)
 *  - editorial-blue angle chip top-left (the ONE chromatic on the canvas)
 *  - ScoreBadge top-right
 *  - rendered resume preview at 0.4 scale, clipped within the tile
 *
 * No shadow, no scale on hover — Design.md is explicit. The border-shade
 * shift + the inner preview moving from `opacity-95` → `opacity-100` is
 * the entire hover signal.
 */
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
      aria-label={`Open ${angleLabel} card`}
      className="focus-ring group relative block aspect-[3/4] overflow-hidden rounded-2xl bg-white shadow-card transition-shadow duration-300 hover:shadow-card-hover"
    >
      {/* Angle chip — the editorial-blue moment per Design.md. */}
      <div className="absolute left-3 top-3 z-10 inline-flex items-center rounded-md bg-white/95 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.04em] text-[#3B82F6] shadow-sm">
        {angleLabel}
      </div>
      <div className="absolute right-3 top-3 z-10">
        <ScoreBadge score={totalScore} size="sm" />
      </div>
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 origin-top-left scale-[0.4]"
          style={{ width: "250%", height: "250%" }}
        >
          <ResumePreviewHtml
            data={content}
            template={templateSlug as TemplateSlug}
          />
        </div>
      </div>

      {/* Bottom "Open card" affordance — appears on hover. Soft white
          gradient on the bottom so the label reads against the rendered
          resume below it. */}
      <div className="absolute inset-x-0 bottom-0 z-10 translate-y-full bg-gradient-to-t from-white/95 via-white/70 to-transparent px-3 py-3 text-center text-[13px] font-medium text-[#1D1D1F] opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
        Open card
      </div>
    </Link>
  );
}