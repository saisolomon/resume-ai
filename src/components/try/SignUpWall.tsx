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
          // virtual routing keeps the widget in-place during OAuth and email
          // verification — without it, Clerk navigates to /sign-up/sso-callback
          // which 404s because this modal renders on /try/[runId]/cards/[cardId].
          routing="virtual"
          signInUrl="/sign-in"
          appearance={{
            elements: { rootBox: "w-full", card: "shadow-none border-0" },
          }}
        />
        <p className="text-xs text-neutral-500 mt-3">Your 4 designs are saved to this browser.</p>
      </div>
    </div>
  );
}
