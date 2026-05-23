"use client";
import Link from "next/link";
import { useQuery } from "convex/react";
import { ArrowRight } from "lucide-react";
import { api } from "../../../convex/_generated/api";

/**
 * Empty dashboard state.
 *
 * The page's first impression for new accounts — needs to feel like a
 * tool, not a marketing page. Hairline-bordered tile with a mono "00"
 * run counter, the next-step CTA, and a quick "what you'll see" hint.
 * No illustration.
 *
 * v4 credit-pack note: A signed-in user with 0 credits would just bounce
 * off the Hero form with a `no_credits` error. So when the balance is 0
 * we route to /pricing instead, and reframe the CTA. When the user has
 * credits already (e.g., they bought a pack but haven't started a run),
 * we keep the original "start your first run" path to /.
 */
export function EmptyDashboard() {
  const balance = useQuery(api.users.getCreditBalance, {});
  // While the query is unresolved, default to "needs credits" — it's the
  // safer guess for new accounts (signups land with 0 credits).
  const needsCredits = balance === undefined ? true : balance === 0;

  return (
    <div className="rounded-xl border border-dashed border-neutral-800 bg-neutral-950/40 p-10 sm:p-16">
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        <span className="font-mono text-5xl font-semibold tabular-nums text-neutral-700">
          00
        </span>
        <span className="mt-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
          Runs to date
        </span>
        <h2 className="mt-8 text-h2 text-white">
          {needsCredits ? "Pick a pack to get started." : "No runs yet."}
        </h2>
        <p className="mt-3 text-sm text-neutral-400">
          {needsCredits
            ? "Every credit tailors 4 resume designs + 3 cover letter variants to one job posting. Credits never expire."
            : "Drop a job posting URL and your resume. We'll tailor four versions and score them against the JD in under thirty seconds."}
        </p>
        <Link
          href={needsCredits ? "/pricing" : "/"}
          className="group mt-8 inline-flex h-11 items-center gap-2 rounded-md bg-white px-5 text-sm font-semibold text-black transition-colors hover:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
        >
          {needsCredits ? "See pricing" : "Start your first run"}
          <ArrowRight
            className="size-4 transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </Link>
      </div>
    </div>
  );
}