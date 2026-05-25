"use client";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

/**
 * Settings — Credit balance card, Apple-light.
 *
 * Reads the live balance from `api.users.getCreditBalance`. Mono numeral,
 * big. CTA is contextual:
 *
 *   balance > 0  → "Buy more credits" secondary pill
 *   balance = 0  → "Buy 5-pack — $29" primary pill + the numeral flips
 *                  to score-red so the empty state reads as a state.
 *
 * Credits never expire — we say that under the numeral.
 */
export function CreditBalanceCard() {
  const balance = useQuery(api.users.getCreditBalance, {});

  if (balance === undefined) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-card sm:p-8">
        <div className="text-[13px] font-medium text-[#86868B]">
          Credits remaining
        </div>
        <div className="mt-4 flex items-center justify-between gap-6">
          <div className="h-12 w-20 animate-pulse rounded bg-[#F5F5F7]" />
          <div className="h-11 w-32 animate-pulse rounded-full bg-[#F5F5F7]" />
        </div>
        <div className="mt-3 h-4 w-72 animate-pulse rounded bg-[#F5F5F7]" />
      </div>
    );
  }

  const isEmpty = balance === 0;

  return (
    <div className="rounded-2xl bg-white p-6 shadow-card sm:p-8">
      <div className="text-[13px] font-medium text-[#86868B]">
        Credits remaining
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
        <div>
          <span
            className={`font-mono text-[44px] font-semibold leading-none tabular-nums ${
              isEmpty ? "text-[#B91C1C]" : "text-[#1D1D1F]"
            }`}
          >
            {balance}
          </span>
          <span className="ml-3 text-[15px] text-[#6E6E73]">
            credit{balance === 1 ? "" : "s"}
          </span>
        </div>

        {isEmpty ? (
          <Link
            href="/pricing"
            className="focus-ring inline-flex h-11 items-center rounded-full bg-[#1D1D1F] px-5 text-[15px] font-medium text-white transition-colors duration-200 hover:bg-black"
          >
            Buy 5-pack — $29
          </Link>
        ) : (
          <Link
            href="/pricing"
            className="focus-ring inline-flex h-11 items-center rounded-full border border-[#D2D2D7] bg-white px-5 text-[15px] font-medium text-[#1D1D1F] transition-colors duration-200 hover:border-[#86868B] hover:bg-[#F5F5F7]"
          >
            Buy more credits
          </Link>
        )}
      </div>

      <p className="mt-4 text-[15px] leading-relaxed text-[#6E6E73]">
        {isEmpty
          ? "Out of credits. Buy a pack to start a new run."
          : "Each credit generates 4 resume designs and 3 cover letter variants. Credits never expire."}
      </p>
    </div>
  );
}
