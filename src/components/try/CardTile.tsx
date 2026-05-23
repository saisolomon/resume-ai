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
      className="group relative block aspect-[3/4] overflow-hidden rounded-lg border border-neutral-800 bg-white transition-colors hover:border-neutral-500 focus:outline-none focus:ring-2 focus:ring-white/60 focus:ring-offset-2 focus:ring-offset-black"
    >
      {/* Angle chip — the editorial-blue moment per Design.md. */}
      <div className="absolute left-2 top-2 z-10 inline-flex items-center rounded-md bg-white/95 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-blue-700 shadow-sm">
        {angleLabel}
      </div>
      <div className="absolute right-2 top-2 z-10">
        <ScoreBadge score={totalScore} size="sm" />
      </div>
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 origin-top-left scale-[0.4]" style={{ width: "250%", height: "250%" }}>
          <ResumePreviewHtml data={content} template={templateSlug as TemplateSlug} />
        </div>
      </div>

      {/* Bottom edit affordance — appears on hover. Keeps the tile clean
          at rest but signals interactivity for the few seconds a new
          user spends scanning the gallery. */}
      <div className="absolute inset-x-0 bottom-0 z-10 translate-y-full bg-gradient-to-t from-black/80 to-transparent px-3 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.08em] text-white opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
        Open card →
      </div>
    </Link>
  );
}