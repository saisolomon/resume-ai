"use client";
import Link from "next/link";

/**
 * "Out of credits" nudge — Apple-light.
 *
 * Surfaces on /dashboard when a user with prior runs has spent all
 * their credits. Light card on the mist canvas with a calm, declarative
 * voice and one pill CTA.
 */
export function OutOfCreditsCard() {
  return (
    <div className="mb-6 rounded-2xl bg-white p-6 shadow-card sm:p-8">
      <div className="text-[13px] font-medium text-[#86868B]">
        Credits remaining
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="font-mono text-[44px] font-semibold leading-none tabular-nums text-[#B91C1C]">
            0
          </span>
          <span className="ml-3 text-[15px] text-[#6E6E73]">credits</span>
          <p className="mt-3 max-w-md text-[15px] leading-relaxed text-[#6E6E73]">
            You&apos;ve used all your credits. Pick a pack to tailor your next
            resume — credits never expire.
          </p>
        </div>
        <Link
          href="/pricing"
          className="focus-ring inline-flex h-11 items-center rounded-full bg-[#1D1D1F] px-5 text-[15px] font-medium text-white transition-colors duration-200 hover:bg-black"
        >
          Buy 5-pack — $29
        </Link>
      </div>
    </div>
  );
}
