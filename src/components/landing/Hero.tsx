"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAction, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { ArrowRight } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { getFingerprint } from "@/lib/fingerprint";
import { ResumeDropzone } from "@/components/upload/ResumeDropzone";

/**
 * Landing hero form.
 *
 * Renders inside a hairline-bordered card on the landing page; the layout
 * gives it a "panel" feel rather than a marketing form floating in space.
 *
 * Behavior is the same as v2: parse → store → start run, with the
 * anonymous/signed-in branch + the error-marker matcher preserved. Visual
 * changes only.
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
      // velocity guard (server can read the request IP; Convex actions
      // called from the browser can't).
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

      // Signed-in users own the run — land them on the signed-in gallery.
      // Anonymous users go to /try and can later claim the run via sign-up.
      router.push(isSignedIn ? `/run/${runId}` : `/try/${runId}`);
    } catch (err) {
      const raw = (err as Error).message;
      // Server-thrown `run_limit:` errors get wrapped by Convex in a noisy
      // `[CONVEX A(runsActions:startRun)] ...` envelope. Detect the marker
      // and surface a clean user-facing message instead.
      if (raw.includes("run_limit:")) {
        setError(
          "You've hit the Try tier's weekly run limit (3 / week). Upgrade to Apply for unlimited runs.",
        );
      } else if (raw.includes("rate_limit_exceeded")) {
        setError(
          "You've used your free anonymous runs. Sign up free for unlimited.",
        );
      } else if (raw.includes("ip_velocity_exceeded")) {
        setError(
          "Too many submissions from your network. Sign up for guaranteed access.",
        );
      } else if (raw.includes("circuit_open")) {
        setError(
          "We're experiencing unusually high demand right now. Sign up for guaranteed access, or try again later.",
        );
      } else if (raw === "start_run_failed" || raw === "bad_request") {
        setError("Something went wrong starting your run. Please try again.");
      } else {
        setError(raw);
      }
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full flex-col gap-3"
      aria-label="Start a tailored resume run"
    >
      <div>
        <label
          htmlFor="jdUrl"
          className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-400"
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
          className="w-full rounded-md border border-neutral-800 bg-neutral-900 px-4 py-3 text-sm text-white placeholder:text-neutral-600 transition-colors focus:border-white focus:outline-none focus:ring-2 focus:ring-white/20"
        />
      </div>

      <div>
        <label
          htmlFor="resume"
          className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-400"
        >
          Your resume
        </label>
        <ResumeDropzone file={file} onFile={setFile} />
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-md border border-red-900 bg-red-950/30 px-3 py-2 text-sm text-red-400"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={!jdUrl || !file || submitting}
        className="group mt-1 inline-flex h-12 items-center justify-center gap-2 rounded-md bg-white px-6 text-sm font-semibold text-black transition-all hover:bg-neutral-200 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? (
          <>Tailoring<span className="inline-block w-3 text-left">…</span></>
        ) : (
          <>
            See my 4 designs
            <ArrowRight
              className="size-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </>
        )}
      </button>

      <p className="text-xs text-neutral-500">
        No card. 4 angles. Real ATS. Sub-30s.
      </p>
    </form>
  );
}
