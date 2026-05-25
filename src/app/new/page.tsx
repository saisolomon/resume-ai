"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAction, useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { SiteNav } from "@/components/layout/SiteNav";

/**
 * JD-only resume creation entry point.
 *
 * Signed-in only — anonymous users still go through the upload flow on
 * the landing Hero (which has the IP velocity + rate-limit guards
 * already wired). The form here collects the minimum input needed for
 * the AI to produce a useful starter draft: identity, education,
 * current role, target title, years of experience, plus the JD.
 *
 * Submit creates a synthetic resume + run + single card, then routes
 * the user straight into the workspace. The card may still be in the
 * "generating" state when the workspace mounts; the workspace renders
 * a "Card not ready" panel and the user reloads when generation
 * completes (60s or so).
 */
export default function NewResumePage() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();
  const startRunFromForm = useAction(api.runsActions.startRunFromForm);
  const me = useQuery(
    api.users.getCurrentUser,
    isSignedIn === true ? {} : "skip",
  );

  const [form, setForm] = useState({
    name: "",
    contactLine: "",
    eduInstitution: "",
    eduDegree: "",
    eduDate: "",
    currentRole: "",
    currentCompany: "",
    targetTitle: "",
    yearsExp: "",
    jdUrl: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auth gate — redirect to sign-in with redirect_url back to /new.
  if (isLoaded && !isSignedIn) {
    router.replace("/sign-in?redirect_url=/new");
    return null;
  }

  const update = (
    field: keyof typeof form,
  ): React.ChangeEventHandler<HTMLInputElement> =>
    (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const canSubmit =
    form.name.trim() &&
    form.contactLine.trim() &&
    form.eduInstitution.trim() &&
    form.eduDegree.trim() &&
    form.eduDate.trim() &&
    form.currentRole.trim() &&
    form.targetTitle.trim() &&
    form.yearsExp.trim() &&
    form.jdUrl.trim() &&
    !submitting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);

    try {
      const { runId, cardId } = await startRunFromForm({
        jdUrl: form.jdUrl,
        formData: {
          name: form.name,
          contactLine: form.contactLine,
          eduInstitution: form.eduInstitution,
          eduDegree: form.eduDegree,
          eduDate: form.eduDate,
          currentRole: form.currentRole,
          currentCompany: form.currentCompany || undefined,
          targetTitle: form.targetTitle,
          yearsExp: form.yearsExp,
        },
      });
      // Route to the run gallery so the user can see the card
      // generate live. Once it lands, clicking the tile opens the
      // workspace. We deliberately don't push to /workspace
      // immediately because the card is still in "generating" state —
      // /run/[runId] handles that state gracefully; /workspace shows
      // "Card not ready."
      router.push(`/run/${runId}?card=${cardId}`);
    } catch (err) {
      const raw = (err as Error).message;
      if (raw.includes("no_credits")) {
        setError("You're out of credits. Pick a pack to start a new run.");
      } else if (raw === "not_authenticated") {
        setError("Sign in to start a new run.");
      } else {
        setError(raw);
      }
      setSubmitting(false);
    }
  }

  const credits = me?.credits ?? 0;

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

      <section className="mx-auto max-w-2xl px-6 pb-24 pt-12 sm:px-8 sm:pt-20">
        <h1 className="text-h1 text-[#1D1D1F]">Start from a JD.</h1>
        <p className="mt-3 text-[17px] leading-relaxed text-[#6E6E73]">
          No resume yet? Tell us a few things about you and the role
          you&apos;re targeting. We&apos;ll draft a starter resume tailored to the
          job — you&apos;ll refine it in the workspace.
        </p>
        {isSignedIn && (
          <p className="mt-2 font-mono text-[13px] text-[#86868B]">
            Credits: <span className="text-[#1D1D1F]">{credits}</span>
          </p>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-10 rounded-2xl bg-white p-6 shadow-card sm:p-8"
          aria-label="JD-only resume creation form"
        >
          {/* Identity */}
          <fieldset className="space-y-4">
            <legend className="mb-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#86868B]">
              About you
            </legend>
            <Field label="Full name" required>
              <input
                type="text"
                value={form.name}
                onChange={update("name")}
                placeholder="Jane Patel"
                className={INPUT_CLS}
                required
              />
            </Field>
            <Field
              label="Contact line"
              hint="Email · LinkedIn · GitHub — comma- or dot-separated, however you'd format on a resume."
              required
            >
              <input
                type="text"
                value={form.contactLine}
                onChange={update("contactLine")}
                placeholder="jane@gmail.com · linkedin.com/in/janepatel · NYC"
                className={INPUT_CLS}
                required
              />
            </Field>
          </fieldset>

          {/* Education */}
          <fieldset className="mt-8 space-y-4">
            <legend className="mb-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#86868B]">
              Education
            </legend>
            <Field label="Institution" required>
              <input
                type="text"
                value={form.eduInstitution}
                onChange={update("eduInstitution")}
                placeholder="Carnegie Mellon University"
                className={INPUT_CLS}
                required
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Degree" required>
                <input
                  type="text"
                  value={form.eduDegree}
                  onChange={update("eduDegree")}
                  placeholder="B.S. Computer Science"
                  className={INPUT_CLS}
                  required
                />
              </Field>
              <Field label="Grad year (or expected)" required>
                <input
                  type="text"
                  value={form.eduDate}
                  onChange={update("eduDate")}
                  placeholder="2026"
                  className={INPUT_CLS}
                  required
                />
              </Field>
            </div>
          </fieldset>

          {/* Role */}
          <fieldset className="mt-8 space-y-4">
            <legend className="mb-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#86868B]">
              Your role
            </legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Current role / title" required>
                <input
                  type="text"
                  value={form.currentRole}
                  onChange={update("currentRole")}
                  placeholder="Software Engineer"
                  className={INPUT_CLS}
                  required
                />
              </Field>
              <Field label="Current company (optional)">
                <input
                  type="text"
                  value={form.currentCompany}
                  onChange={update("currentCompany")}
                  placeholder="Stripe"
                  className={INPUT_CLS}
                />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Target title" required>
                <input
                  type="text"
                  value={form.targetTitle}
                  onChange={update("targetTitle")}
                  placeholder="Senior Backend Engineer"
                  className={INPUT_CLS}
                  required
                />
              </Field>
              <Field label="Years of experience" required>
                <input
                  type="text"
                  value={form.yearsExp}
                  onChange={update("yearsExp")}
                  placeholder="4"
                  className={INPUT_CLS}
                  required
                />
              </Field>
            </div>
          </fieldset>

          {/* JD */}
          <fieldset className="mt-8 space-y-4">
            <legend className="mb-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#86868B]">
              The job
            </legend>
            <Field label="Job posting URL" required>
              <input
                type="url"
                value={form.jdUrl}
                onChange={update("jdUrl")}
                placeholder="https://jobs.lever.co/anthropic/swe"
                className={INPUT_CLS}
                required
              />
            </Field>
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
            className="focus-ring mt-8 inline-flex h-12 w-full items-center justify-center rounded-full bg-[#1D1D1F] text-[15px] font-medium text-white transition-colors duration-150 hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Drafting." : "Draft my starter resume"}
          </button>
          <p className="mt-3 text-center text-[13px] text-[#86868B]">
            1 credit · Starter draft + ATS score in ~60s
          </p>
        </form>
      </section>
    </main>
  );
}

// ─── Form primitives — local, tight ────────────────────────────────────

const INPUT_CLS =
  "focus-ring h-11 w-full rounded-lg border border-[#D2D2D7] bg-white px-3 text-[15px] text-[#1D1D1F] placeholder:text-[#A1A1A6] transition-colors duration-150 focus:border-[#86868B] focus:outline-none";

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
