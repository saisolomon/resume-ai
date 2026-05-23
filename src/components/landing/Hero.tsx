"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAction, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "../../../convex/_generated/api";
import { getFingerprint } from "@/lib/fingerprint";
import { ResumeDropzone } from "@/components/upload/ResumeDropzone";

/**
 * Landing hero form — Apple-light.
 *
 * Pill primary CTA, sentence-case labels (NOT uppercase eyebrows), light
 * inputs with hairline borders and the Apple-blue focus ring at 20% opacity.
 * Sits in a narrow column below the TemplateBrowser hero centerpiece.
 *
 * Behavior is unchanged from v4: parse → store → start run, with the
 * anonymous/signed-in branch + the full error-marker matcher preserved.
 * Visual restyle only.
 */
export function Hero() {
  const router = useRouter();
  const { isSignedIn } = useUser();
  const startRun = useAction(api.runsActions.startRun);
  const parseAndStoreResume = useAction(api.resumesActions.parseAndStoreResume);
  const generateUploadUrl = useMutation(api.resumes.generateUploadUrl);

  const [jdUrl, setJdUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!jdUrl || !file) return;
    setSubmitting(true);
    setError(null);

    try {
      const fingerprintHash = await getFingerprint();
      const ext = file.name.split(".").pop()?.toLowerCase();
      const source = ext === "pdf" ? "pdf" : ext === "docx" ? "docx" : null;
      if (!source) throw new Error("Upload a .pdf or .docx file");

      const uploadUrl = await generateUploadUrl({});
      const putResp = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!putResp.ok) throw new Error("upload_failed");
      const { storageId } = (await putResp.json()) as { storageId: string };

      const { resumeId } = await parseAndStoreResume({
        storageId: storageId as never,
        fingerprintHash,
        filename: file.name,
        source: source as "pdf" | "docx",
      });

      // Signed-in users call Convex directly. Anonymous users go through
      // the Next.js /api/anonymous-run-start route which adds an IP
      // velocity guard.
      let runId: string;
      if (isSignedIn) {
        runId = await startRun({
          resumeId: resumeId as never,
          jdUrl,
          fingerprintHash,
        });
      } else {
        const resp = await fetch("/api/anonymous-run-start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resumeId, jdUrl, fingerprintHash }),
        });
        if (!resp.ok) {
          const data = (await resp.json()) as { error?: string };
          throw new Error(data.error ?? "start_run_failed");
        }
        const data = (await resp.json()) as { runId: string };
        runId = data.runId;
      }

      router.push(isSignedIn ? `/run/${runId}` : `/try/${runId}`);
    } catch (err) {
      const raw = (err as Error).message;
      // Error-marker matcher preserved verbatim from v4.
      if (raw.includes("no_credits")) {
        setError("You're out of credits. Pick a pack to start a new run.");
      } else if (raw.includes("run_limit:")) {
        setError(
          "You've hit your weekly run limit. Buy a pack for unlimited runs.",
        );
      } else if (raw.includes("rate_limit_exceeded")) {
        setError(
          "You've used your free anonymous runs. Sign up to keep going.",
        );
      } else if (raw.includes("ip_velocity_exceeded")) {
        setError(
          "Too many submissions from your network. Sign up to keep going.",
        );
      } else if (raw.includes("circuit_open")) {
        setError(
          "We're experiencing unusually high demand. Sign up for guaranteed access, or try again in a moment.",
        );
      } else if (raw === "start_run_failed" || raw === "bad_request") {
        setError("Something went wrong. Try again.");
      } else {
        setError(raw);
      }
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto flex w-full max-w-xl flex-col gap-5"
      aria-label="Start a tailored resume run"
    >
      <div>
        <label
          htmlFor="jdUrl"
          className="mb-2 block text-[15px] font-medium text-[#1D1D1F]"
        >
          Job posting URL
        </label>
        <input
          id="jdUrl"
          type="url"
          required
          placeholder="https://jobs.lever.co/anthropic/swe"
          value={jdUrl}
          onChange={(e) => setJdUrl(e.target.value)}
          className="focus-ring h-12 w-full rounded-xl border border-[#D2D2D7] bg-white px-4 text-[17px] text-[#1D1D1F] placeholder:text-[#A1A1A6] transition-colors duration-150 focus:border-[#86868B] focus:outline-none"
        />
      </div>

      <div>
        <label
          htmlFor="resume"
          className="mb-2 block text-[15px] font-medium text-[#1D1D1F]"
        >
          Your resume
        </label>
        <ResumeDropzone file={file} onFile={setFile} />
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-xl border border-[#FCA5A5] bg-[#FEF2F2] px-4 py-3 text-[15px] text-[#B91C1C]"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={!jdUrl || !file || submitting}
        className="focus-ring inline-flex h-14 items-center justify-center rounded-full bg-[#1D1D1F] px-8 text-[17px] font-medium text-white transition-colors duration-150 hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? "Tailoring." : "Tailor my resume"}
      </button>

      <p className="text-center text-[15px] text-[#6E6E73]">
        $9 · No subscription · Credits never expire.
      </p>
    </form>
  );
}
