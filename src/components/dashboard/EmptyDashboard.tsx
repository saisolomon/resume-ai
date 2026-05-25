"use client";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

/**
 * Empty dashboard state — Apple-light.
 *
 * Subtle bg-[#FAFAFA] tile with dashed hairline, mono "00" counter, and
 * a single pill CTA. No illustration. v4 credit-pack logic preserved:
 * if the user has 0 credits we route to /pricing instead of /.
 */
export function EmptyDashboard() {
  const balance = useQuery(api.users.getCreditBalance, {});
  // While the query is unresolved, default to "needs credits" — it's the
  // safer guess for new accounts (signups land with 0 credits).
  const needsCredits = balance === undefined ? true : balance === 0;

  return (
    <div className="rounded-2xl border border-dashed border-[#D2D2D7] bg-[#FAFAFA] p-10 sm:p-16">
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        <span className="font-mono text-[56px] font-semibold leading-none tabular-nums text-[#D2D2D7]">
          00
        </span>
        <span className="mt-3 text-[13px] font-medium text-[#86868B]">
          Runs to date
        </span>
        <h2 className="mt-8 text-h2 text-[#1D1D1F]">
          {needsCredits ? "Pick a pack to get started." : "No runs yet."}
        </h2>
        <p className="mt-3 text-[15px] leading-relaxed text-[#6E6E73]">
          {needsCredits
            ? "Every credit tailors 4 resume designs to one job posting, with an ATS deep-scan and unlimited fine-tune edits. Credits never expire."
            : "Drop a job posting URL and your resume. We'll tailor four versions and score them against the JD in under thirty seconds."}
        </p>
        <Link
          href={needsCredits ? "/pricing" : "/"}
          className="focus-ring mt-8 inline-flex h-12 items-center rounded-full bg-[#1D1D1F] px-6 text-[15px] font-medium text-white transition-colors duration-200 hover:bg-black"
        >
          {needsCredits ? "See pricing" : "Start your first run"}
        </Link>
      </div>
    </div>
  );
}
