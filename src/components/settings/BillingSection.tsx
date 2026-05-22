"use client";
import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

const TIER_LABEL: Record<string, string> = { free: "Try", pro: "Apply", career: "Hunt" };

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

  const tier = user?.tier ?? "free";

  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-5">
      <h3 className="font-semibold mb-3">Billing</h3>
      <div className="flex items-center justify-between text-sm">
        <div>
          <div>Current plan: <span className="font-semibold">{TIER_LABEL[tier]}</span></div>
          {sub && (
            <div className="text-xs text-neutral-500 mt-1">
              Renews {new Date(sub.currentPeriodEnd).toLocaleDateString()}
              {sub.cancelAtPeriodEnd && " — canceling at period end"}
            </div>
          )}
        </div>
        {tier !== "free" ? (
          <button
            onClick={openPortal}
            disabled={loading}
            className="rounded bg-white text-black px-4 py-2 font-semibold disabled:opacity-60"
          >
            {loading ? "…" : "Manage subscription"}
          </button>
        ) : (
          <a href="/pricing" className="rounded bg-white text-black px-4 py-2 font-semibold">
            Upgrade
          </a>
        )}
      </div>
      {error && <p role="alert" className="mt-2 text-xs text-red-400">{error}</p>}
    </div>
  );
}
