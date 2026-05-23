"use client";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";

export type TierName = "free" | "pro" | "career";

// Stash chosen tier on signed-out CTA click so the user lands back on
// /pricing post-signup and the tier card auto-resumes checkout — keeps the
// highest-intent moment from costing an extra click.
const PENDING_TIER_KEY = "resumeai:pendingTier";

export function TierCard({
  name,
  display,
  tagline,
  priceMonthly,
  priceYearly,
  bullets,
  annual,
  mostPopular,
  ctaLabel,
}: {
  name: TierName;
  display: string;
  tagline: string;
  priceMonthly: number;
  priceYearly: number;
  bullets: string[];
  annual: boolean;
  mostPopular?: boolean;
  ctaLabel: string;
}) {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // For annual view, show the effective monthly price ($12 for Apply, $28 for Hunt).
  const effectiveMonthly = annual
    ? Math.round((priceYearly / 12) * 100) / 100
    : priceMonthly;

  async function startCheckout() {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier: name,
          // Honor the annual toggle so users billed yearly are actually
          // charged the yearly price, not 12× monthly.
          interval: annual ? "yearly" : "monthly",
        }),
      });
      if (!resp.ok) {
        const body = await resp.text().catch(() => "");
        console.error("checkout failed", { status: resp.status, body });
        setError("Couldn't start checkout — try again or contact support.");
        setLoading(false);
        return;
      }
      const data = (await resp.json()) as { url?: string };
      if (!data.url) {
        console.error("checkout response missing url", data);
        setError("Couldn't start checkout — try again or contact support.");
        setLoading(false);
        return;
      }
      window.location.href = data.url;
    } catch (err) {
      console.error("checkout threw", err);
      setError("Couldn't start checkout — try again or contact support.");
      setLoading(false);
    }
  }

  // Resume checkout after sign-up. If the user picked this tier while
  // signed out and just came back signed in, fire checkout automatically.
  useEffect(() => {
    if (!isLoaded || !isSignedIn || name === "free") return;
    const pending =
      typeof window !== "undefined"
        ? window.sessionStorage.getItem(PENDING_TIER_KEY)
        : null;
    if (pending === name) {
      window.sessionStorage.removeItem(PENDING_TIER_KEY);
      void startCheckout();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, isSignedIn, name]);

  async function pick() {
    // Wait for Clerk to hydrate before routing — otherwise a fast click
    // during initial paint can send a signed-in user to /sign-up.
    if (!isLoaded) return;
    if (!isSignedIn) {
      if (name !== "free" && typeof window !== "undefined") {
        window.sessionStorage.setItem(PENDING_TIER_KEY, name);
      }
      router.push(`/sign-up?redirect_url=/pricing`);
      return;
    }
    if (name === "free") {
      router.push("/dashboard");
      return;
    }
    await startCheckout();
  }

  const isFree = name === "free";

  return (
    <div
      aria-label={`${display} plan`}
      className={`relative flex h-full flex-col rounded-2xl border p-7 transition-colors ${
        mostPopular
          ? "border-white bg-neutral-950 shadow-[0_0_0_1px_rgba(255,255,255,0.4)] md:scale-105"
          : "border-neutral-800 bg-neutral-950 hover:border-neutral-700"
      }`}
    >
      {mostPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-black">
          Most popular
        </div>
      )}

      {/* Tier name — display label. */}
      <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-400">
        {display}
      </div>
      <p className="mt-3 min-h-[2.75rem] text-sm leading-relaxed text-neutral-500">
        {tagline}
      </p>

      {/* Price block — display weight, mono cents-aligned. */}
      <div className="mt-7 border-t border-neutral-900 pt-6">
        <div className="flex items-baseline gap-1.5">
          <span className="text-5xl font-bold tracking-tight text-white tabular-nums">
            ${isFree ? 0 : effectiveMonthly}
          </span>
          {!isFree && (
            <span className="text-sm text-neutral-500">/mo</span>
          )}
        </div>
        <div className="mt-2 text-xs text-neutral-500">
          {isFree
            ? "Free forever. No card."
            : annual
              ? `$${priceYearly} billed yearly`
              : `$${priceYearly}/yr on annual (20% off)`}
        </div>
      </div>

      {/* Feature list. */}
      <ul className="mt-7 flex-1 space-y-3 text-sm text-neutral-300">
        {bullets.map((b, i) => (
          <li key={i} className="flex gap-2.5">
            <Check
              className={`size-4 shrink-0 translate-y-[3px] ${
                mostPopular ? "text-white" : "text-neutral-400"
              }`}
              aria-hidden="true"
            />
            <span>{b}</span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={pick}
        disabled={loading || !isLoaded}
        aria-label={`${ctaLabel} — ${display} plan`}
        className={`mt-8 inline-flex h-11 items-center justify-center rounded-md px-5 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black disabled:opacity-60 ${
          mostPopular
            ? "bg-white text-black hover:bg-neutral-200"
            : "bg-neutral-900 text-white border border-neutral-800 hover:bg-neutral-800 hover:border-neutral-700"
        }`}
      >
        {loading ? "Loading…" : ctaLabel}
      </button>
      {error && (
        <p role="alert" className="mt-2 text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}