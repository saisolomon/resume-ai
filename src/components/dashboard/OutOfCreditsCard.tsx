"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

/**
 * "Out of credits" nudge — surfaces on /dashboard when a user with
 * prior runs has spent all their credits. Replaces the "/" CTA that
 * would otherwise be a dead-end submit (Hero form would just throw
 * `no_credits`). Calm, brand-anchored — single white CTA, no urgency,
 * matches the Hormozi "calm upsell" rule.
 */
export function OutOfCreditsCard() {
  return (
    <div className="mb-6 rounded-xl border border-neutral-800 bg-neutral-950 p-6">
      <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
        Credits remaining
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="font-mono text-3xl font-bold tabular-nums leading-none text-red-400">
            0
          </span>
          <span className="ml-3 text-sm text-neutral-500">credits</span>
          <p className="mt-2 max-w-md text-sm text-neutral-400">
            You&apos;ve used all your credits. Buy a pack to tailor your next
            resume — credits never expire.
          </p>
        </div>
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
      </div>
    </div>
  );
}
