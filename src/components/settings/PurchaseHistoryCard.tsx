"use client";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

// Map the snake-case Convex enum to the customer-facing label.
const PACK_LABEL: Record<string, string> = {
  single: "Single",
  five_pack: "5-pack",
  twenty_pack: "20-pack",
};

/**
 * Settings — purchase history.
 *
 * Reads `api.creditTransactions.myHistory` (returns rows newest-first).
 * The Stripe-hosted invoice PDF is reachable from the Customer Portal but
 * we don't yet have a one-click deep-link to it from a session ID — so
 * the receipt column is plain text for v1. (The session ID lives on each
 * row if/when we wire the /api/stripe/invoice helper.)
 *
 * Empty state: "No purchases yet." — calm, doesn't nudge to /pricing here
 * since the Credit Balance card already handles that.
 */
export function PurchaseHistoryCard() {
  const rows = useQuery(api.creditTransactions.myHistory, {});

  // Skeleton on first paint.
  if (rows === undefined) {
    return (
      <div className="rounded-xl border border-neutral-800 bg-neutral-950">
        <div className="border-b border-neutral-900 px-5 py-3">
          <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
            Purchase history
          </div>
        </div>
        <div className="space-y-px p-5">
          <div className="h-4 w-full animate-pulse rounded bg-neutral-900" />
          <div className="mt-3 h-4 w-3/4 animate-pulse rounded bg-neutral-900" />
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950">
      {/* Section header — same uppercase label style as the rest of /settings */}
      <div className="border-b border-neutral-900 px-5 py-3">
        <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
          Purchase history
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="px-5 py-6 text-sm text-neutral-500">
          No purchases yet.
        </div>
      ) : (
        <>
          {/* Column header — desktop-only; on mobile we use a stacked
              layout that doesn't need the labels. */}
          <div
            className="hidden grid-cols-[1fr_auto_auto_auto] gap-4 border-b border-neutral-900 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500 sm:grid"
            aria-hidden="true"
          >
            <span>Date</span>
            <span>Pack</span>
            <span className="text-right">Credits</span>
            <span className="text-right">Amount</span>
          </div>

          <ul className="divide-y divide-neutral-900">
            {rows.map((row) => {
              const date = new Date(row._creationTime).toLocaleDateString(
                undefined,
                { month: "short", day: "numeric", year: "numeric" },
              );
              return (
                <li
                  key={row._id}
                  className="grid grid-cols-2 items-center gap-x-4 gap-y-1 px-5 py-3 sm:grid-cols-[1fr_auto_auto_auto] sm:gap-4"
                >
                  <span className="font-mono text-sm tabular-nums text-neutral-300">
                    {date}
                  </span>
                  <span className="text-sm font-medium text-white sm:text-left">
                    {PACK_LABEL[row.pack] ?? row.pack}
                  </span>
                  <span className="font-mono text-sm tabular-nums text-neutral-400 sm:text-right">
                    +{row.creditsGranted}
                  </span>
                  <span className="font-mono text-sm font-medium tabular-nums text-white sm:text-right">
                    ${row.amountUsd.toFixed(2)}
                  </span>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
