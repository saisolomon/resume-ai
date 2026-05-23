"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Download, ArrowRight } from "lucide-react";
import { getFingerprint } from "@/lib/fingerprint";

// Stash the card the user wanted to download before sign-up so we can
// resume the chain (claim runs -> download) once they land back here.
const PENDING_DOWNLOAD_KEY = "resumeai:pendingDownload";

export function DownloadButton({ cardId }: { cardId: string }) {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function triggerDownload() {
    setDownloading(true);
    setError(null);
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
    } catch {
      setError("Download failed. Try again in a moment.");
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
    <div>
      <button
        onClick={handleClick}
        disabled={downloading || !isLoaded}
        className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-white px-6 text-sm font-semibold text-black transition-colors hover:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50"
      >
        {downloading ? (
          "Downloading…"
        ) : isSignedIn ? (
          <>
            <Download className="size-4" aria-hidden="true" />
            Download DOCX
          </>
        ) : (
          <>
            Sign up to download
            <ArrowRight
              className="size-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </>
        )}
      </button>
      {error && (
        <p role="alert" className="mt-2 text-xs text-red-400">
          {error}
        </p>
      )}
      {!isSignedIn && isLoaded && (
        <p className="mt-2 text-[11px] text-neutral-500">
          Free. Your runs get saved to your account.
        </p>
      )}
    </div>
  );
}