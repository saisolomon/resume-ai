"use client";
import { useState } from "react";
import type { TemplateSlug } from "@/components/try/ResumePreviewHtml";
import { ScoreBadge } from "@/components/try/ScoreBadge";
import { Download, Languages, MessageSquare } from "lucide-react";
import Link from "next/link";
import { LANGUAGES, type LanguageCode } from "@/lib/i18n/languages";
import { useLanguage } from "@/lib/i18n/useLanguage";

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
  // Translate handler — workspace passes a function that calls the
  // Convex translateMyCard action. Returns void; the workspace will
  // refresh its local copy from the Convex query after the action
  // settles. The panel just owns the dropdown UX + button state.
  onTranslate: (targetLanguage: string) => Promise<void>;
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
  onTranslate,
}: Props) {
  // Default the translate target to the user's preferred language from
  // the SiteNav switcher — so a Spanish-preferring user opens the
  // workspace and one click translates without further selection.
  const { language: preferred } = useLanguage();
  const [target, setTarget] = useState<LanguageCode>(preferred);
  const [translating, setTranslating] = useState(false);
  const [translateError, setTranslateError] = useState<string | null>(null);

  const handleTranslate = async () => {
    setTranslating(true);
    setTranslateError(null);
    try {
      const targetDef = LANGUAGES.find((l) => l.code === target);
      if (!targetDef) throw new Error("Unknown language");
      await onTranslate(targetDef.aiName);
    } catch (err) {
      setTranslateError((err as Error).message);
    } finally {
      setTranslating(false);
    }
  };

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

      {/* ── Translate ── */}
      <section>
        <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#86868B]">
          Translate
        </h3>
        <p className="mb-3 text-[12px] leading-relaxed text-[#86868B]">
          Translate the resume content. Names, employers, schools, and dates
          stay as written; titles, bullets, and section headings get
          natural target-language phrasing.
        </p>
        <div className="flex gap-2">
          <select
            value={target}
            onChange={(e) => setTarget(e.target.value as LanguageCode)}
            disabled={translating}
            aria-label="Translate resume into"
            className="focus-ring h-10 flex-1 rounded-full border border-[#D2D2D7] bg-white px-3 text-[14px] font-medium text-[#1D1D1F] transition-colors hover:border-[#86868B] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.nativeName}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleTranslate}
            disabled={translating}
            className="focus-ring inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border border-[#1D1D1F] bg-white px-3.5 text-[13px] font-medium text-[#1D1D1F] transition-colors hover:bg-[#F5F5F7] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Languages className="size-3.5" aria-hidden="true" />
            {translating ? "Translating." : "Translate"}
          </button>
        </div>
        {translateError && (
          <p
            role="alert"
            className="mt-2 text-[12px] leading-relaxed text-[#B91C1C]"
          >
            {translateError}
          </p>
        )}
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
