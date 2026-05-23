"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { getFingerprint } from "@/lib/fingerprint";

// Stash the card the user wanted to download before sign-up so we can
// resume the chain (claim runs -> download) once they land back here.
const PENDING_DOWNLOAD_KEY = "resumeai:pendingDownload";

export function DownloadButton({ cardId }: { cardId: string }) {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();
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

  async function claimAndDownload() {
    const fp = await getFingerprint();
    await fetch("/api/claim", {
      method: "POST",
      body: JSON.stringify({ fingerprintHash: fp }),
      headers: { "Content-Type": "application/json" },
    });
    await triggerDownload();
  }

  // Resume the download flow when the user comes back from sign-up. We do
  // NOT use an embedded <SignUp/> modal anymore — Clerk's OAuth callback URL
  // is derived from the current page path, which 404s on /try/[runId]/
  // cards/[cardId]/sso-callback. A round-trip through the dedicated
  // /sign-up route (which has the catch-all) sidesteps that.
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    const pending =
      typeof window !== "undefined"
        ? window.sessionStorage.getItem(PENDING_DOWNLOAD_KEY)
        : null;
    if (pending === cardId) {
      window.sessionStorage.removeItem(PENDING_DOWNLOAD_KEY);
      void claimAndDownload();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, isSignedIn, cardId]);

  function handleClick() {
    if (!isLoaded) return;
    if (isSignedIn) {
      void triggerDownload();
      return;
    }
    // Save the cardId so we can finish the download after Clerk round-trip,
    // then send the user to the canonical /sign-up route with redirect_url
    // pointing back here. The auth page honors redirect_url via
    // fallbackRedirectUrl.
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(PENDING_DOWNLOAD_KEY, cardId);
      const path = window.location.pathname;
      router.push(`/sign-up?redirect_url=${encodeURIComponent(path)}`);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={downloading || !isLoaded}
      className="w-full rounded bg-white text-black px-6 py-3 font-semibold disabled:opacity-50"
    >
      {downloading ? "Downloading…" : "Download DOCX →"}
    </button>
  );
}
