"use client";
import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

// Pre-pivot subscription tier → display label.
const TIER_LABEL: Record<string, string> = {
  free: "Try",
  pro: "Apply",
  career: "Hunt",
};

/**
 * Settings — legacy subscription card.
 *
 * v4 pivoted to one-time credit packs, but a small population of v3
 * subscribers exists. For them we keep the Stripe Customer Portal link
 * around so they can still cancel/update. New users should never see this
 * card — gated on `sub !== null`, which means an actual `subscriptions`
 * row exists.
 */
export function LegacySubscriptionCard() {
  const sub = useQuery(api.stripe.getMySubscription, {});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pre-resolution: render nothing. We don't want a skeleton flash for
  // 99% of users who don't have a subscription.
  if (sub === undefined) return null;
  if (!sub) return null;

  async function openPortal() {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch("/api/stripe/portal", { method: "POST" });
      if (!resp.ok) {
        console.error("portal failed", { status: resp.status });
        setError("Couldn't open billing portal. Try again.");
        setLoading(false);
        return;
      }
      const data = (await resp.json()) as { url?: string };
      if (!data.url) {
        setError("Couldn't open billing portal. Try again.");
        setLoading(false);
        return;
      }
      window.location.href = data.url;
    } catch (err) {
      console.error("portal threw", err);
      setError("Couldn't open billing portal. Try again.");
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-6">
      <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
        Legacy subscription
      </div>
      <p className="mt-3 max-w-md text-sm text-neutral-400">
        You have an active{" "}
        <span className="font-medium text-white">{TIER_LABEL[sub.tier]}</span>{" "}
        subscription from before we moved to per-resume pricing. You can keep
        it, or cancel any time from the Stripe portal.
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
        <div className="font-mono text-[11px] tabular-nums text-neutral-500">
          renews{" "}
          {new Date(sub.currentPeriodEnd).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
          {sub.cancelAtPeriodEnd && " · canceling"}
        </div>
        <button
          onClick={openPortal}
          disabled={loading}
          className="inline-flex h-10 items-center rounded-md border border-neutral-800 bg-neutral-900 px-5 text-sm font-semibold text-white transition-colors hover:border-neutral-700 hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-white/40 disabled:opacity-60"
        >
          {loading ? "Loading…" : "Manage subscription"}
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-3 text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
