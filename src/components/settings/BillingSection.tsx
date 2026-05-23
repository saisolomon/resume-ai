"use client";
import { useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

const TIER_LABEL: Record<string, string> = {
  free: "Try",
  pro: "Apply",
  career: "Hunt",
};

export function BillingSection() {
  const sub = useQuery(api.stripe.getMySubscription, {});
  const user = useQuery(api.users.getCurrentUser, {});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // Avoid the "Current plan: Try / Upgrade" flicker for paid users by
  // rendering a skeleton until the user row resolves.
  if (user === undefined) {
    return (
      <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-6">
        <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
          Billing
        </div>
        <div className="mt-5 flex items-center justify-between">
          <div className="h-5 w-32 animate-pulse rounded bg-neutral-800" />
          <div className="h-10 w-40 animate-pulse rounded bg-neutral-800" />
        </div>
      </div>
    );
  }

  const tier = user?.tier ?? "free";
  const isFree = tier === "free";

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-6">
      <div className="flex items-baseline justify-between">
        <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
          Billing
        </div>
        {sub && (
          <div className="font-mono text-[11px] tabular-nums text-neutral-600">
            renews{" "}
            {new Date(sub.currentPeriodEnd).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
            {sub.cancelAtPeriodEnd && " · canceling"}
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs text-neutral-500">Current plan</div>
          <div className="mt-1 text-2xl font-semibold tracking-tight text-white">
            {TIER_LABEL[tier]}
          </div>
        </div>
        {!isFree ? (
          <button
            onClick={openPortal}
            disabled={loading}
            className="inline-flex h-10 items-center rounded-md bg-white px-5 text-sm font-semibold text-black transition-colors hover:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black disabled:opacity-60"
          >
            {loading ? "Loading…" : "Manage subscription"}
          </button>
        ) : (
          <Link
            href="/pricing"
            className="inline-flex h-10 items-center rounded-md bg-white px-5 text-sm font-semibold text-black transition-colors hover:bg-neutral-200"
          >
            Upgrade
          </Link>
        )}
      </div>
      {error && (
        <p role="alert" className="mt-3 text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}