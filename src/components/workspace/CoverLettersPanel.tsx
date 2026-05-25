"use client";
import { useState } from "react";
import { useAction } from "convex/react";
import { Check, Copy, Mail, Sparkles } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

/**
 * Cover letters panel — sits below the resume preview in the workspace.
 *
 * Three states:
 *  - Empty (no coverLetters on the card) → CTA to generate.
 *  - Generating → spinner state with explanation copy.
 *  - Ready (coverLetters array of 3 strings) → three labeled variant
 *    cards with copy + per-variant select via tabs.
 *
 * Translation: the workspace's existing translateMyCard action operates
 * on the whole card (resume + cover letters together), so once
 * generated, cover letters get translated alongside the resume when the
 * user picks a language in the Translate section. No separate UI here.
 */

const VARIANT_LABELS = ["Direct", "Story", "Concise"] as const;
const VARIANT_DESCRIPTIONS = [
  "Confident, results-led. Three short paragraphs.",
  "Warmer voice. Opens with a moment of fit.",
  "≤ 180 words. For senior-skim readers.",
];

type Props = {
  cardId: Id<"cards">;
  coverLetters: string[] | undefined;
};

export function CoverLettersPanel({ cardId, coverLetters }: Props) {
  const generate = useAction(api.featuresActions.generateMyCoverLetters);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeVariant, setActiveVariant] = useState(0);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    try {
      await generate({ cardId });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!coverLetters?.[activeVariant]) return;
    await navigator.clipboard.writeText(coverLetters[activeVariant]);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // ── Empty state ────────────────────────────────────────────────────
  if (!coverLetters || coverLetters.length === 0) {
    return (
      <section
        aria-label="Cover letters"
        className="rounded-2xl border border-dashed border-[#D2D2D7] bg-white/40 p-6 sm:p-8"
      >
        <div className="flex items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#F5F5F7]">
            <Mail className="size-5 text-[#1D1D1F]" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <h3 className="text-[17px] font-semibold text-[#1D1D1F]">
              Cover letters
            </h3>
            <p className="mt-1 text-[14px] leading-relaxed text-[#6E6E73]">
              Generate three tailored variants — direct, story, and concise.
              Translates automatically when you change the resume language.
            </p>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating}
              className="focus-ring mt-4 inline-flex h-10 items-center gap-1.5 rounded-full bg-[#1D1D1F] px-4 text-[14px] font-medium text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Sparkles className="size-3.5" aria-hidden="true" />
              {generating ? "Generating." : "Generate cover letters"}
            </button>
            {error && (
              <p
                role="alert"
                className="mt-3 text-[13px] leading-relaxed text-[#B91C1C]"
              >
                {error}
              </p>
            )}
          </div>
        </div>
      </section>
    );
  }

  // ── Ready state ────────────────────────────────────────────────────
  return (
    <section
      aria-label="Cover letters"
      className="rounded-2xl bg-white p-6 shadow-card sm:p-8"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Mail className="size-5 text-[#1D1D1F]" aria-hidden="true" />
          <h3 className="text-[17px] font-semibold text-[#1D1D1F]">
            Cover letters
          </h3>
        </div>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={generating}
          aria-label="Regenerate cover letters"
          className="focus-ring inline-flex h-8 items-center gap-1.5 rounded-full border border-[#D2D2D7] bg-white px-3 text-[12px] font-medium text-[#1D1D1F] transition-colors hover:border-[#86868B] hover:bg-[#F5F5F7] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Sparkles className="size-3" aria-hidden="true" />
          {generating ? "Regenerating." : "Regenerate"}
        </button>
      </div>

      {/* Variant tabs */}
      <div
        role="tablist"
        aria-label="Cover letter variants"
        className="mb-4 flex gap-2"
      >
        {VARIANT_LABELS.map((label, i) => {
          const isActive = i === activeVariant;
          return (
            <button
              key={label}
              role="tab"
              aria-selected={isActive}
              onClick={() => {
                setActiveVariant(i);
                setCopied(false);
              }}
              className={`inline-flex flex-col items-start rounded-xl border px-3 py-2 text-left text-[13px] transition-colors ${
                isActive
                  ? "border-[#1D1D1F] bg-[#1D1D1F] text-white"
                  : "border-[#D2D2D7] bg-white text-[#1D1D1F] hover:border-[#86868B]"
              }`}
            >
              <span className="font-medium">{label}</span>
              <span
                className={`text-[11px] leading-tight ${
                  isActive ? "text-white/70" : "text-[#86868B]"
                }`}
              >
                {VARIANT_DESCRIPTIONS[i]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Variant body */}
      <div className="rounded-xl bg-[#F9F9FB] p-5">
        <pre className="whitespace-pre-wrap font-sans text-[15px] leading-relaxed text-[#1D1D1F]">
          {coverLetters[activeVariant]}
        </pre>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-[12px] text-[#86868B]">
          Translates with the resume — change language in the right panel.
        </p>
        <button
          type="button"
          onClick={handleCopy}
          className="focus-ring inline-flex h-9 items-center gap-1.5 rounded-full border border-[#D2D2D7] bg-white px-3.5 text-[13px] font-medium text-[#1D1D1F] transition-colors hover:border-[#86868B] hover:bg-[#F5F5F7]"
        >
          {copied ? (
            <>
              <Check className="size-3.5 text-[#16A34A]" aria-hidden="true" />
              Copied
            </>
          ) : (
            <>
              <Copy className="size-3.5" aria-hidden="true" />
              Copy
            </>
          )}
        </button>
      </div>

      {error && (
        <p
          role="alert"
          className="mt-3 text-[13px] leading-relaxed text-[#B91C1C]"
        >
          {error}
        </p>
      )}
    </section>
  );
}
