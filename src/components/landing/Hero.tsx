"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAction, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { getFingerprint } from "@/lib/fingerprint";
import { ResumeDropzone } from "@/components/upload/ResumeDropzone";

export function Hero() {
  const router = useRouter();
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

      const runId = await startRun({
        resumeId: resumeId as never,
        jdUrl,
        fingerprintHash,
      });

      router.push(`/try/${runId}`);
    } catch (err) {
      setError((err as Error).message);
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-xl w-full">
      <input
        type="url"
        required
        placeholder="https://jobs.lever.co/anthropic/swe"
        value={jdUrl}
        onChange={(e) => setJdUrl(e.target.value)}
        className="w-full rounded border border-neutral-700 bg-neutral-900 px-4 py-3 text-sm text-white placeholder:text-neutral-500"
      />
      <ResumeDropzone file={file} onFile={setFile} />
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={!jdUrl || !file || submitting}
        className="rounded bg-white text-black px-6 py-3 font-semibold disabled:opacity-50"
      >
        {submitting ? "Tailoring…" : "See my 4 designs →"}
      </button>
    </form>
  );
}
