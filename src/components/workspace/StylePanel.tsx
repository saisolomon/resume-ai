"use client";
import type { TemplateSlug } from "@/components/try/ResumePreviewHtml";
import { ScoreBadge } from "@/components/try/ScoreBadge";
import { Download, MessageSquare } from "lucide-react";
import Link from "next/link";

/**
 * Right-side workspace panel. Holds: card metadata strip (angle, score,
 * save status), template picker, and quick actions (download, chat
 * fine-tune). Kept lightweight on purpose — we'll grow this as the
 * workspace matures.
 */

const TEMPLATES: { slug: TemplateSlug; label: string; hint: string }[] = [
  { slug: "classic", label: "Classic", hint: "Serif, centered name" },
  { slug: "modern", label: "Modern", hint: "Sans, editorial blue" },
  { slug: "creative", label: "Creative", hint: "Sans, purple accent" },
  { slug: "minimal", label: "Minimal", hint: "Sans, generous space" },
];

type Props = {
  angleLabel: string;
  templateSlug: TemplateSlug;
  onTemplateChange: (slug: TemplateSlug) => void;
  atsTotal: number | null;
  saveStatus: "idle" | "saving" | "saved" | "error";
  downloadHref: string;
  chatHref: string;
};

const SAVE_LABEL: Record<Props["saveStatus"], string> = {
  idle: "All changes saved",
  saving: "Saving…",
  saved: "Saved",
  error: "Save failed — retry coming",
};

const SAVE_DOT: Record<Props["saveStatus"], string> = {
  idle: "bg-[#D2D2D7]",
  saving: "bg-[#F59E0B] animate-pulse",
  saved: "bg-[#16A34A]",
  error: "bg-[#B91C1C]",
};

export function StylePanel({
  angleLabel,
  templateSlug,
  onTemplateChange,
  atsTotal,
  saveStatus,
  downloadHref,
  chatHref,
}: Props) {
  return (
    <aside className="flex h-full flex-col gap-6 overflow-y-auto bg-white p-5 shadow-card">
      {/* ── Card meta + save status ── */}
      <section>
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center rounded-md bg-[#EFF6FF] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.04em] text-[#3B82F6]">
            {angleLabel}
          </span>
          {atsTotal !== null && <ScoreBadge score={atsTotal} size="sm" />}
        </div>
        <div className="mt-3 flex items-center gap-2 text-[12px] text-[#6E6E73]">
          <span
            aria-hidden="true"
            className={`size-1.5 rounded-full ${SAVE_DOT[saveStatus]}`}
          />
          <span aria-live="polite">{SAVE_LABEL[saveStatus]}</span>
        </div>
      </section>

      <hr className="border-[#D2D2D7]/60" />

      {/* ── Template picker ── */}
      <section>
        <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#86868B]">
          Template
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {TEMPLATES.map((t) => {
            const isActive = t.slug === templateSlug;
            return (
              <button
                key={t.slug}
                type="button"
                onClick={() => onTemplateChange(t.slug)}
                aria-pressed={isActive}
                className={`flex flex-col items-start gap-0.5 rounded-lg border px-3 py-2 text-left text-[13px] transition-colors ${
                  isActive
                    ? "border-[#1D1D1F] bg-[#1D1D1F] text-white"
                    : "border-[#D2D2D7] bg-white text-[#1D1D1F] hover:border-[#86868B]"
                }`}
              >
                <span className="font-medium">{t.label}</span>
                <span
                  className={`text-[11px] ${
                    isActive ? "text-white/70" : "text-[#86868B]"
                  }`}
                >
                  {t.hint}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <hr className="border-[#D2D2D7]/60" />

      {/* ── Quick actions ── */}
      <section className="flex flex-col gap-2">
        <h3 className="mb-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#86868B]">
          Actions
        </h3>
        <a
          href={downloadHref}
          className="focus-ring inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[#1D1D1F] text-[14px] font-medium text-white transition-colors hover:bg-black"
        >
          <Download className="size-4" aria-hidden="true" />
          Download PDF
        </a>
        <Link
          href={chatHref}
          className="focus-ring inline-flex h-10 items-center justify-center gap-2 rounded-full border border-[#D2D2D7] bg-white text-[14px] font-medium text-[#1D1D1F] transition-colors hover:border-[#86868B] hover:bg-[#F5F5F7]"
        >
          <MessageSquare className="size-4" aria-hidden="true" />
          Chat fine-tune
        </Link>
      </section>

      <p className="mt-auto text-[11px] leading-relaxed text-[#86868B]">
        Click any text to edit. Drag bullets to reorder. Switch templates
        any time — your content stays.
      </p>
    </aside>
  );
}
