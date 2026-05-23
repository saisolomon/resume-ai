"use client";
import { SignUp, useUser } from "@clerk/nextjs";
import { useEffect } from "react";

export function SignUpWall({ onClose, onSignedUp }: { onClose: () => void; onSignedUp: () => void }) {
  const { isSignedIn } = useUser();
  useEffect(() => {
    if (isSignedIn) onSignedUp();
  }, [isSignedIn, onSignedUp]);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-white mb-2">One more step</h3>
        <p className="text-sm text-neutral-400 mb-4">Save your run. Download the PDF. Free forever.</p>
        <SignUp
          // virtual routing keeps in-component state out of the URL, but the
          // OAuth callback URL is computed from `signUpUrl` (not the current
          // page). Without `signUpUrl`, Clerk falls back to <current-page>/
          // sso-callback — on /try/[runId]/cards/[cardId] this becomes
          // /try/.../sso-callback which 404s. Pinning signUpUrl="/sign-up"
          // makes Clerk return to /sign-up/sso-callback, which our catch-all
          // route at src/app/(auth)/sign-up/[[...sign-up]]/page.tsx handles.
          routing="virtual"
          signUpUrl="/sign-up"
          signInUrl="/sign-in"
          // After sign-up completes (OAuth or email), come back here so the
          // DownloadButton's onSignedUp -> claim -> download flow can run.
          fallbackRedirectUrl={typeof window !== "undefined" ? window.location.pathname : "/dashboard"}
          appearance={{
            elements: { rootBox: "w-full", card: "shadow-none border-0" },
          }}
        />
        <p className="text-xs text-neutral-500 mt-3">Your 4 designs are saved to this browser.</p>
      </div>
    </div>
  );
}
