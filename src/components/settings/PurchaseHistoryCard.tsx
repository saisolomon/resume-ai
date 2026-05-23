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
 * Settings — purchase history, Apple-light.
 *
 * Reads `api.creditTransactions.myHistory` (returns rows newest-first).
 * Empty state: "No purchases yet." Calm — doesn't nudge to /pricing here
 * since the Credit Balance card already handles that.
 */
export function PurchaseHistoryCard() {
  const rows = useQuery(api.creditTransactions.myHistory, {});

  if (rows === undefined) {
    return (
      <div className="rounded-2xl bg-white shadow-card">
        <div className="border-b border-[#D2D2D7]/70 px-6 py-4">
          <div className="text-[15px] font-medium text-[#1D1D1F]">
            Purchase history
          </div>
        </div>
        <div className="space-y-3 p-6">
          <div className="h-4 w-full animate-pulse rounded bg-[#F5F5F7]" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-[#F5F5F7]" />
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-card">
      <div className="border-b border-[#D2D2D7]/70 px-6 py-4">
        <div className="text-[15px] font-medium text-[#1D1D1F]">
          Purchase history
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="px-6 py-8 text-[15px] text-[#86868B]">
          No purchases yet.
        </div>
      ) : (
        <>
          <div
            className="hidden grid-cols-[1fr_auto_auto_auto] gap-4 border-b border-[#D2D2D7]/70 px-6 py-3 text-[12px] font-medium text-[#86868B] sm:grid"
            aria-hidden="true"
          >
            <span>Date</span>
            <span>Pack</span>
            <span className="text-right">Credits</span>
            <span className="text-right">Amount</span>
          </div>

          <ul className="divide-y divide-[#D2D2D7]/60">
            {rows.map((row) => {
              const date = new Date(row._creationTime).toLocaleDateString(
                undefined,
                { month: "short", day: "numeric", year: "numeric" },
              );
              return (
                <li
                  key={row._id}
                  className="grid grid-cols-2 items-center gap-x-4 gap-y-1 px-6 py-4 sm:grid-cols-[1fr_auto_auto_auto] sm:gap-4"
                >
                  <span className="font-mono text-[14px] tabular-nums text-[#6E6E73]">
                    {date}
                  </span>
                  <span className="text-[15px] font-medium text-[#1D1D1F] sm:text-left">
                    {PACK_LABEL[row.pack] ?? row.pack}
                  </span>
                  <span className="font-mono text-[14px] tabular-nums text-[#6E6E73] sm:text-right">
                    +{row.creditsGranted}
                  </span>
                  <span className="font-mono text-[15px] font-medium tabular-nums text-[#1D1D1F] sm:text-right">
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
