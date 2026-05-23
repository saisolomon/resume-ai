import Link from "next/link";
import { ArrowRight } from "lucide-react";

/**
 * Empty dashboard state.
 *
 * The page's first impression for new accounts — needs to feel like a
 * tool, not a marketing page. Hairline-bordered tile with a mono "00"
 * run counter, the next-step CTA, and a quick "what you'll see" hint.
 * No illustration.
 */
export function EmptyDashboard() {
  return (
    <div className="rounded-xl border border-dashed border-neutral-800 bg-neutral-950/40 p-10 sm:p-16">
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        <span className="font-mono text-5xl font-semibold tabular-nums text-neutral-700">
          00
        </span>
        <span className="mt-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
          Runs to date
        </span>
        <h2 className="mt-8 text-h2 text-white">No runs yet.</h2>
        <p className="mt-3 text-sm text-neutral-400">
          Drop a job posting URL and your resume. We&apos;ll tailor four
          versions and score them against the JD in under thirty seconds.
        </p>
        <Link
          href="/"
          className="group mt-8 inline-flex h-11 items-center gap-2 rounded-md bg-white px-5 text-sm font-semibold text-black transition-colors hover:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
        >
          Start your first run
          <ArrowRight
            className="size-4 transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </Link>
      </div>
    </div>
  );
}