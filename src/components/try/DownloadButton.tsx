"use client";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { getFingerprint } from "@/lib/fingerprint";
import { SignUpWall } from "./SignUpWall";

export function DownloadButton({ cardId }: { cardId: string }) {
  const { isSignedIn, isLoaded } = useUser();
  const [showWall, setShowWall] = useState(false);
  const [downloading, setDownloading] = useState(false);

  async function triggerDownload() {
    setDownloading(true);
    try {
      const resp = await fetch(`/api/download/${cardId}?format=docx`);
      if (!resp.ok) throw new Error(`download_failed_${resp.status}`);
      const blob = await resp.blob();
      const filename = resp.headers.get("X-Filename") ?? "resume.docx";
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }

  async function handleClick() {
    if (!isLoaded) return;
    if (isSignedIn) {
      await triggerDownload();
      return;
    }
    setShowWall(true);
  }

  async function handleSignedUp() {
    setShowWall(false);
    const fp = await getFingerprint();
    await fetch("/api/claim", {
      method: "POST",
      body: JSON.stringify({ fingerprintHash: fp }),
      headers: { "Content-Type": "application/json" },
    });
    await triggerDownload();
  }

  return (
    <>
      <button
        onClick={handleClick}
        disabled={downloading}
        className="w-full rounded bg-white text-black px-6 py-3 font-semibold disabled:opacity-50"
      >
        {downloading ? "Downloading…" : "Download DOCX →"}
      </button>
      {showWall && <SignUpWall onClose={() => setShowWall(false)} onSignedUp={handleSignedUp} />}
    </>
  );
}
