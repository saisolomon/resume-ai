"use client";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";

export type TierName = "free" | "pro" | "career";

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
  const { isSignedIn } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // For annual view, show the effective monthly price ($12 for Apply, $28 for Hunt).
  const effectiveMonthly = annual
    ? Math.round((priceYearly / 12) * 100) / 100
    : priceMonthly;

  async function pick() {
    if (!isSignedIn) {
      router.push(`/sign-up?redirect=/pricing`);
      return;
    }
    if (name === "free") {
      router.push("/dashboard");
      return;
    }
    setLoading(true);
    try {
      const resp = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: name }),
      });
      if (!resp.ok) {
        alert("Couldn't start checkout — try again or contact support.");
        setLoading(false);
        return;
      }
      const data = (await resp.json()) as { url?: string };
      if (!data.url) {
        alert("Couldn't start checkout — try again or contact support.");
        setLoading(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      alert("Couldn't start checkout — try again or contact support.");
      setLoading(false);
    }
  }

  const isFree = name === "free";

  return (
    <div
      aria-label={`${display} plan`}
      className={`relative flex flex-col rounded-2xl border p-7 transition-colors ${
        mostPopular
          ? "border-white bg-neutral-950 md:scale-105 shadow-[0_0_0_1px_rgba(255,255,255,0.4)]"
          : "border-neutral-800 bg-neutral-950 hover:border-neutral-700"
      }`}
    >
      {mostPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-black">
          Most popular
        </div>
      )}

      <div className="text-sm font-semibold uppercase tracking-wider text-neutral-400">
        {display}
      </div>
      <p className="mt-2 text-sm text-neutral-500">{tagline}</p>

      <div className="mt-6 flex items-baseline gap-1">
        <span className="text-4xl font-bold tracking-tight text-white">
          ${isFree ? 0 : effectiveMonthly}
        </span>
        {!isFree && (
          <span className="text-sm text-neutral-500">/mo</span>
        )}
      </div>
      <div className="mt-1 text-xs text-neutral-500">
        {isFree
          ? "Free forever. No card."
          : annual
            ? `$${priceYearly} billed yearly`
            : `$${priceYearly}/yr if annual (20% off)`}
      </div>

      <ul className="mt-6 space-y-2.5 text-sm text-neutral-300 flex-1">
        {bullets.map((b, i) => (
          <li key={i} className="flex gap-2">
            <Check
              className={`size-4 shrink-0 mt-0.5 ${mostPopular ? "text-white" : "text-neutral-400"}`}
              aria-hidden="true"
            />
            <span>{b}</span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={pick}
        disabled={loading}
        aria-label={`${ctaLabel} — ${display} plan`}
        className={`mt-7 rounded-md px-4 py-2.5 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black disabled:opacity-60 ${
          mostPopular
            ? "bg-white text-black hover:bg-neutral-200"
            : "bg-neutral-800 text-white hover:bg-neutral-700"
        }`}
      >
        {loading ? "Loading…" : ctaLabel}
      </button>
    </div>
  );
}
