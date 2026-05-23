"use client";
import Link from "next/link";
import { useQuery } from "convex/react";
import { ArrowRight } from "lucide-react";
import { api } from "../../../convex/_generated/api";

/**
 * Settings — Credit balance card.
 *
 * Reads the live balance from `api.users.getCreditBalance` (returns 0 if
 * signed out or no user row yet). Mono numeral, big — the page's "what
 * have I got left" answer at a glance. CTA is contextual:
 *
 *  - balance > 0: "Buy more credits →" → /pricing, calm secondary tone
 *  - balance = 0: "Get 5-pack — $29" → /pricing, anchored brand CTA
 *    + the balance numeral flips to red-400 so the empty state reads
 *    as a state, not a value
 *
 * Per Design.md, credits never expire — we say that under the numeral.
 */
export function CreditBalanceCard() {
  const balance = useQuery(api.users.getCreditBalance, {});

  // Skeleton while Convex resolves so we don't flash "0 credits remaining"
  // for the half-second between hydration and first query response.
  if (balance === undefined) {
    return (
      <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-6">
        <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
          Credits remaining
        </div>
        <div className="mt-4 flex items-center justify-between gap-6">
          <div className="h-12 w-20 animate-pulse rounded bg-neutral-900" />
          <div className="h-10 w-32 animate-pulse rounded bg-neutral-900" />
        </div>
        <div className="mt-3 h-4 w-72 animate-pulse rounded bg-neutral-900" />
      </div>
    );
  }

  const isEmpty = balance === 0;

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-6">
      <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
        Credits remaining
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
        {/* Left — big mono numeral. */}
        <div>
          <span
            className={`font-mono text-5xl font-bold tabular-nums leading-none ${
              isEmpty ? "text-red-400" : "text-white"
            }`}
          >
            {balance}
          </span>
          <span className="ml-3 text-sm text-neutral-500">
            credit{balance === 1 ? "" : "s"}
          </span>
        </div>

        {/* Right — contextual CTA. */}
        {isEmpty ? (
          <Link
            href="/pricing"
            className="group inline-flex h-10 items-center gap-2 rounded-md bg-white px-5 text-sm font-semibold text-black transition-colors hover:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
          >
            Get 5-pack — $29
            <ArrowRight
              className="size-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        ) : (
          <Link
            href="/pricing"
            className="group inline-flex h-10 items-center gap-2 rounded-md border border-neutral-800 bg-neutral-900 px-5 text-sm font-semibold text-white transition-colors hover:border-neutral-700 hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-white/40"
          >
            Buy more
            <ArrowRight
              className="size-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        )}
      </div>

      <p className="mt-4 text-sm text-neutral-400">
        {isEmpty
          ? "Out of credits. Buy a pack to start a new run."
          : "Each credit generates 4 resume designs + 3 cover letter variants. Credits never expire."}
      </p>
    </div>
  );
}
