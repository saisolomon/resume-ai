"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Check, X } from "lucide-react";

/**
 * Post-checkout confirmation banner.
 *
 * Stripe Checkout redirects to /dashboard?credited=1 on success. We
 * render a calm, dismissible banner once and strip the query param so
 * a refresh doesn't re-show it. The banner is the dashboard's only
 * "celebration" — kept understated (hairline-bordered green tone, no
 * confetti) to match the brand's developer-tool restraint.
 */
export function CreditedBanner() {
  const params = useSearchParams();
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (params?.get("credited") === "1") {
      setVisible(true);
      // Strip the query param so a refresh doesn't re-flash the banner.
      router.replace("/dashboard", { scroll: false });
    }
  }, [params, router]);

  if (!visible) return null;

  return (
    <div
      role="status"
      className="mb-6 flex items-start gap-3 rounded-lg border border-green-900 bg-green-950/30 px-4 py-3"
    >
      <Check className="size-4 shrink-0 translate-y-0.5 text-green-400" aria-hidden="true" />
      <div className="flex-1">
        <p className="text-sm font-medium text-white">Credits added.</p>
        <p className="mt-0.5 text-sm text-neutral-400">
          Ready to run. Drop a JD on the home page to tailor your next resume.
        </p>
      </div>
      <button
        type="button"
        onClick={() => setVisible(false)}
        aria-label="Dismiss"
        className="shrink-0 rounded p-1 text-neutral-500 transition-colors hover:bg-neutral-900 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/40"
      >
        <X className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}
