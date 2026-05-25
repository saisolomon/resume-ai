"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAction, useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowLeft, Check, Copy, Plus, Sparkles, Trash2 } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { SiteNav } from "@/components/layout/SiteNav";

/**
 * LinkedIn rewrite tool — a standalone surface separate from the
 * resume run pipeline.
 *
 * The user pastes their current LinkedIn (Headline / About / one or
 * more experience entries), names their target title (or pastes some
 * JD context), and we return rewritten sections that read like a
 * person — not a resume re-formatted for LinkedIn.
 *
 * Signed-in only. We persist each rewrite in `linkedinRewrites` so
 * the user can come back later without re-paying a Sonnet call.
 */

type ExperienceInput = {
  roleTitle: string;
  company: string;
  description: string;
};

const EMPTY_EXPERIENCE: ExperienceInput = {
  roleTitle: "",
  company: "",
  description: "",
};

export default function LinkedinRewritePage() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();
  const generate = useAction(api.featuresActions.generateMyLinkedinRewrite);
  const history = useQuery(
    api.linkedin.listMine,
    isSignedIn === true ? {} : "skip",
  );

  const [form, setForm] = useState({
    targetTitle: "",
    currentHeadline: "",
    currentAbout: "",
    jdContext: "",
  });
  const [experiences, setExperiences] = useState<ExperienceInput[]>([
    { ...EMPTY_EXPERIENCE },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (isLoaded && !isSignedIn) {
    router.replace("/sign-in?redirect_url=/linkedin");
    return null;
  }

  const updateForm = (
    field: keyof typeof form,
  ): React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> =>
    (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const updateExperience = (
    idx: number,
    field: keyof ExperienceInput,
    value: string,
  ) => {
    setExperiences((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  const addExperience = () =>
    setExperiences((prev) => [...prev, { ...EMPTY_EXPERIENCE }]);

  const removeExperience = (idx: number) =>
    setExperiences((prev) => prev.filter((_, i) => i !== idx));

  const canSubmit =
    form.targetTitle.trim() &&
    experiences.some(
      (e) => e.roleTitle.trim() && e.company.trim() && e.description.trim(),
    ) &&
    !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      await generate({
        targetTitle: form.targetTitle,
        currentHeadline: form.currentHeadline,
        currentAbout: form.currentAbout,
        jdContext: form.jdContext,
        experiences: experiences.filter(
          (e) => e.roleTitle.trim() && e.company.trim(),
        ),
      });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const copy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const latestRewrite = history && history.length > 0 ? history[0] : null;

  return (
    <main className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F]">
      <SiteNav home="/dashboard">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-[15px] font-medium text-[#1D1D1F] transition-colors hover:text-[#6E6E73]"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Dashboard
        </Link>
      </SiteNav>

      <section className="mx-auto max-w-3xl px-6 pt-12 pb-24 sm:px-8 sm:pt-20">
        <h1 className="text-h1 text-[#1D1D1F]">LinkedIn rewrite.</h1>
        <p className="mt-3 max-w-2xl text-[17px] leading-relaxed text-[#6E6E73]">
          Paste what you have. We&apos;ll rewrite your Headline, About, and
          experience entries to position you for your target title — in
          first-person LinkedIn voice, not resume voice.
        </p>

        {/* ── Form ── */}
        <form
          onSubmit={handleSubmit}
          className="mt-10 rounded-2xl bg-white p-6 shadow-card sm:p-8"
          aria-label="LinkedIn rewrite form"
        >
          <fieldset className="space-y-4">
            <legend className="mb-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#86868B]">
              Target
            </legend>
            <Field label="Target title or role" required>
              <input
                type="text"
                value={form.targetTitle}
                onChange={updateForm("targetTitle")}
                placeholder="Senior Backend Engineer, Payments"
                className={INPUT_CLS}
                required
              />
            </Field>
            <Field
              label="JD context (optional)"
              hint="Paste a few requirements / responsibilities if you have a specific JD. We'll mirror those keywords where truthful."
            >
              <textarea
                value={form.jdContext}
                onChange={updateForm("jdContext")}
                rows={3}
                placeholder="Top requirements, key responsibilities, the tech stack mentioned in the JD."
                className={TEXTAREA_CLS}
              />
            </Field>
          </fieldset>

          <fieldset className="mt-8 space-y-4">
            <legend className="mb-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#86868B]">
              Your current LinkedIn
            </legend>
            <Field label="Current headline (optional)">
              <input
                type="text"
                value={form.currentHeadline}
                onChange={updateForm("currentHeadline")}
                placeholder="Software Engineer at Stripe"
                className={INPUT_CLS}
              />
            </Field>
            <Field
              label="Current About (optional)"
              hint="Paste what's there now — we'll rewrite it, not start from scratch."
            >
              <textarea
                value={form.currentAbout}
                onChange={updateForm("currentAbout")}
                rows={5}
                placeholder="Paste your existing About section here."
                className={TEXTAREA_CLS}
              />
            </Field>
          </fieldset>

          <fieldset className="mt-8 space-y-4">
            <div className="flex items-center justify-between">
              <legend className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#86868B]">
                Experience to rewrite
              </legend>
              <button
                type="button"
                onClick={addExperience}
                className="focus-ring inline-flex h-8 items-center gap-1 rounded-full border border-[#D2D2D7] bg-white px-3 text-[12px] font-medium text-[#1D1D1F] transition-colors hover:border-[#86868B]"
              >
                <Plus className="size-3" aria-hidden="true" />
                Add role
              </button>
            </div>

            {experiences.map((exp, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-[#D2D2D7]/70 p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[12px] font-medium text-[#86868B]">
                    Role {idx + 1}
                  </span>
                  {experiences.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeExperience(idx)}
                      aria-label="Remove this role"
                      className="text-[#86868B] hover:text-[#B91C1C]"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  )}
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <input
                    type="text"
                    value={exp.roleTitle}
                    onChange={(e) =>
                      updateExperience(idx, "roleTitle", e.target.value)
                    }
                    placeholder="Role title"
                    className={INPUT_CLS}
                  />
                  <input
                    type="text"
                    value={exp.company}
                    onChange={(e) =>
                      updateExperience(idx, "company", e.target.value)
                    }
                    placeholder="Company"
                    className={INPUT_CLS}
                  />
                </div>
                <textarea
                  value={exp.description}
                  onChange={(e) =>
                    updateExperience(idx, "description", e.target.value)
                  }
                  rows={4}
                  placeholder="What you did in this role — paste bullets, prose, whatever you have."
                  className={`${TEXTAREA_CLS} mt-3`}
                />
              </div>
            ))}
          </fieldset>

          {error && (
            <p
              role="alert"
              className="mt-6 rounded-xl border border-[#FCA5A5] bg-[#FEF2F2] px-4 py-3 text-[15px] text-[#B91C1C]"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className="focus-ring mt-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#1D1D1F] text-[15px] font-medium text-white transition-colors duration-150 hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Sparkles className="size-4" aria-hidden="true" />
            {submitting ? "Rewriting." : "Rewrite my LinkedIn"}
          </button>
          <p className="mt-3 text-center text-[13px] text-[#86868B]">
            Free for now while in beta · No credit charged
          </p>
        </form>

        {/* ── Result ── */}
        {latestRewrite && (
          <section
            aria-label="Latest rewrite"
            className="mt-10 rounded-2xl bg-white p-6 shadow-card sm:p-8"
          >
            <h2 className="text-h2 text-[#1D1D1F]">Latest rewrite</h2>
            <p className="mt-1 text-[13px] text-[#86868B]">
              For target title:{" "}
              <span className="text-[#1D1D1F]">{latestRewrite.targetTitle}</span>
            </p>

            <ResultBlock
              label="Headline"
              value={latestRewrite.headline}
              copyKey="headline"
              copiedKey={copiedKey}
              onCopy={copy}
            />
            <ResultBlock
              label="About"
              value={latestRewrite.about}
              copyKey="about"
              copiedKey={copiedKey}
              onCopy={copy}
              multiline
            />

            {latestRewrite.experienceRewrites.map((er, i) => (
              <ResultBlock
                key={i}
                label={`${er.roleTitle} · ${er.company}`}
                value={er.rewrite}
                copyKey={`exp-${i}`}
                copiedKey={copiedKey}
                onCopy={copy}
                multiline
              />
            ))}
          </section>
        )}
      </section>
    </main>
  );
}

// ─── Form primitives + result block ────────────────────────────────────

const INPUT_CLS =
  "focus-ring h-11 w-full rounded-lg border border-[#D2D2D7] bg-white px-3 text-[15px] text-[#1D1D1F] placeholder:text-[#A1A1A6] transition-colors duration-150 focus:border-[#86868B] focus:outline-none";

const TEXTAREA_CLS =
  "focus-ring w-full rounded-lg border border-[#D2D2D7] bg-white px-3 py-2 text-[15px] leading-relaxed text-[#1D1D1F] placeholder:text-[#A1A1A6] transition-colors duration-150 focus:border-[#86868B] focus:outline-none";

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium text-[#1D1D1F]">
        {label}
        {required && <span className="ml-0.5 text-[#86868B]">*</span>}
      </span>
      {children}
      {hint && (
        <span className="mt-1 block text-[12px] leading-relaxed text-[#86868B]">
          {hint}
        </span>
      )}
    </label>
  );
}

function ResultBlock({
  label,
  value,
  copyKey,
  copiedKey,
  onCopy,
  multiline,
}: {
  label: string;
  value: string;
  copyKey: string;
  copiedKey: string | null;
  onCopy: (text: string, key: string) => void;
  multiline?: boolean;
}) {
  const isCopied = copiedKey === copyKey;
  return (
    <div className="mt-6 rounded-xl bg-[#F9F9FB] p-5">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#86868B]">
          {label}
        </span>
        <button
          type="button"
          onClick={() => onCopy(value, copyKey)}
          className="focus-ring inline-flex h-8 items-center gap-1.5 rounded-full border border-[#D2D2D7] bg-white px-3 text-[12px] font-medium text-[#1D1D1F] transition-colors hover:border-[#86868B]"
        >
          {isCopied ? (
            <>
              <Check className="size-3 text-[#16A34A]" aria-hidden="true" />
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
      {multiline ? (
        <pre className="whitespace-pre-wrap font-sans text-[15px] leading-relaxed text-[#1D1D1F]">
          {value}
        </pre>
      ) : (
        <p className="text-[15px] leading-relaxed text-[#1D1D1F]">{value}</p>
      )}
    </div>
  );
}
