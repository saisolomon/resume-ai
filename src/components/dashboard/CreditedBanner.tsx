"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Check, X } from "lucide-react";

/**
 * Post-checkout confirmation banner — Apple-light.
 *
 * Stripe Checkout redirects to /dashboard?credited=1 on success. We
 * render a calm, dismissible banner once and strip the query param so
 * a refresh doesn't re-show it. Mint-wash surface with the green
 * checkmark — no confetti, no animation.
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
      className="mb-6 flex items-start gap-3 rounded-2xl bg-[#F0FDF4] px-5 py-4"
    >
      <Check
        className="mt-0.5 size-5 shrink-0 text-[#1A7F45]"
        aria-hidden="true"
      />
      <div className="flex-1">
        <p className="text-[15px] font-medium text-[#1D1D1F]">Credits added.</p>
        <p className="mt-0.5 text-[15px] text-[#6E6E73]">
          Ready to run. Drop a JD on the home page to tailor your next resume.
        </p>
      </div>
      <button
        type="button"
        onClick={() => setVisible(false)}
        aria-label="Dismiss"
        className="focus-ring shrink-0 rounded-full p-1 text-[#86868B] transition-colors hover:bg-white hover:text-[#1D1D1F]"
      >
        <X className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}
