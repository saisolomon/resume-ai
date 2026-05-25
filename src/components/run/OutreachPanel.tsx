"use client";
import { useState } from "react";
import { useAction, useQuery } from "convex/react";
import { Check, Copy, MessageSquareShare, Sparkles } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

/**
 * Outreach templates — sits on /run/[runId] under the cards gallery.
 *
 * Three templates per run, generated on demand from the JD + the
 * first ready card's resume. Each template is shown as a labeled
 * card with subject, body, and a copy button.
 *
 * Lives at the run level (not per-card) because outreach is keyed to
 * the company / JD, not the specific angle.
 */

const TEMPLATE_LABELS: Record<
  "cold_recruiter" | "referral_ask" | "hiring_manager",
  { title: string; description: string }
> = {
  cold_recruiter: {
    title: "Cold to recruiter",
    description:
      "Direct email to a recruiter at the company. Asks for a 15-minute intro call.",
  },
  referral_ask: {
    title: "Referral ask",
    description:
      "Casual ask to a connection at the company. Asks them to forward your resume internally.",
  },
  hiring_manager: {
    title: "Hiring manager intro",
    description:
      "Direct intro to the hiring manager. Demonstrates JD-specific understanding.",
  },
};

export function OutreachPanel({ runId }: { runId: Id<"runs"> }) {
  const outreach = useQuery(api.outreach.getMyByRun, { runId });
  const generate = useAction(api.featuresActions.generateMyOutreach);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    try {
      await generate({ runId });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setGenerating(false);
    }
  };

  const copy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  // Loading from server (Convex query in flight). Don't show empty CTA
  // yet — would flash before the real data lands.
  if (outreach === undefined) {
    return (
      <section
        aria-label="Outreach templates"
        className="rounded-2xl bg-white p-6 shadow-card sm:p-8"
      >
        <div className="h-20 animate-pulse rounded-xl bg-[#F5F5F7]" />
      </section>
    );
  }

  // Empty state — never generated for this run.
  if (outreach === null) {
    return (
      <section
        aria-label="Outreach templates"
        className="rounded-2xl border border-dashed border-[#D2D2D7] bg-white/40 p-6 sm:p-8"
      >
        <div className="flex items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#F5F5F7]">
            <MessageSquareShare
              className="size-5 text-[#1D1D1F]"
              aria-hidden="true"
            />
          </div>
          <div className="flex-1">
            <h3 className="text-[17px] font-semibold text-[#1D1D1F]">
              Outreach templates
            </h3>
            <p className="mt-1 text-[14px] leading-relaxed text-[#6E6E73]">
              Generate three outreach emails for this job — cold to a
              recruiter, a referral ask to a connection, and a direct
              intro to the hiring manager.
            </p>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating}
              className="focus-ring mt-4 inline-flex h-10 items-center gap-1.5 rounded-full bg-[#1D1D1F] px-4 text-[14px] font-medium text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Sparkles className="size-3.5" aria-hidden="true" />
              {generating ? "Generating." : "Generate outreach"}
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

  // Ready state.
  return (
    <section
      aria-label="Outreach templates"
      className="space-y-3"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <MessageSquareShare
            className="size-5 text-[#1D1D1F]"
            aria-hidden="true"
          />
          <h3 className="text-[17px] font-semibold text-[#1D1D1F]">
            Outreach templates
          </h3>
        </div>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={generating}
          aria-label="Regenerate outreach"
          className="focus-ring inline-flex h-8 items-center gap-1.5 rounded-full border border-[#D2D2D7] bg-white px-3 text-[12px] font-medium text-[#1D1D1F] transition-colors hover:border-[#86868B] hover:bg-[#F5F5F7] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Sparkles className="size-3" aria-hidden="true" />
          {generating ? "Regenerating." : "Regenerate"}
        </button>
      </div>

      {outreach.templates.map((t, i) => {
        const meta = TEMPLATE_LABELS[t.kind];
        return (
          <div
            key={i}
            className="rounded-2xl bg-white p-5 shadow-card sm:p-6"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h4 className="text-[15px] font-semibold text-[#1D1D1F]">
                  {meta.title}
                </h4>
                <p className="mt-0.5 text-[12px] leading-relaxed text-[#86868B]">
                  {meta.description}
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  copy(
                    `Subject: ${t.subject}\n\n${t.body}`,
                    `tpl-${i}`,
                  )
                }
                className="focus-ring inline-flex h-8 items-center gap-1.5 rounded-full border border-[#D2D2D7] bg-white px-3 text-[12px] font-medium text-[#1D1D1F] transition-colors hover:border-[#86868B] hover:bg-[#F5F5F7]"
              >
                {copiedKey === `tpl-${i}` ? (
                  <>
                    <Check
                      className="size-3 text-[#16A34A]"
                      aria-hidden="true"
                    />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="size-3" aria-hidden="true" />
                    Copy
                  </>
                )}
              </button>
            </div>

            <div className="mt-4 rounded-xl bg-[#F9F9FB] p-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#86868B]">
                Subject
              </div>
              <p className="mt-1 text-[14px] text-[#1D1D1F]">{t.subject}</p>
              <div className="mt-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#86868B]">
                Body
              </div>
              <pre className="mt-1 whitespace-pre-wrap font-sans text-[14px] leading-relaxed text-[#1D1D1F]">
                {t.body}
              </pre>
            </div>
          </div>
        );
      })}

      {error && (
        <p
          role="alert"
          className="text-[13px] leading-relaxed text-[#B91C1C]"
        >
          {error}
        </p>
      )}
    </section>
  );
}
