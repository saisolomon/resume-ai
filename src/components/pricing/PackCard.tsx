"use client";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";

// v4 credit-pack model. The pricing page lives on `{ pack }` semantics —
// the checkout API rejects anything else with `unknown_pack`.
export type Pack = "single" | "5pack" | "20pack";

// If a signed-out visitor hits a paid CTA, stash the chosen pack so when
// they bounce back from /sign-up we auto-resume checkout. Mirrors the v2
// TierCard ergonomic so the highest-intent moment doesn't cost a second
// click. Key is namespaced under v4 so it doesn't collide with stale v2
// tier values lingering in sessionStorage.
const PENDING_PACK_KEY = "resumeai:pendingPack";

export function PackCard({
  pack,
  name,
  tagline,
  price,
  credits,
  perUnit,
  bullets,
  voiceLine,
  ctaLabel,
  anchored,
}: {
  pack: Pack;
  /** "Single" | "5-pack" | "20-pack" — display label. */
  name: string;
  tagline: string;
  /** Whole-dollar price ($9 / $29 / $79). Rendered with the dollar sign. */
  price: number;
  credits: number;
  /** "$9.00 per resume" / "$5.80 per resume" / "$3.95 per resume". */
  perUnit: string;
  bullets: string[];
  /** Italic 1-liner under the bullets, voice-of-brand. */
  voiceLine: string;
  ctaLabel: string;
  /** Center card — scale up, white border ring, "Most popular" pill. */
  anchored?: boolean;
}) {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startCheckout() {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pack }),
      });
      if (!resp.ok) {
        const body = await resp.text().catch(() => "");
        console.error("checkout failed", { status: resp.status, body });
        setError("Couldn't start checkout — try again or contact support.");
        setLoading(false);
        return;
      }
      const data = (await resp.json()) as { url?: string };
      if (!data.url) {
        console.error("checkout response missing url", data);
        setError("Couldn't start checkout — try again or contact support.");
        setLoading(false);
        return;
      }
      window.location.href = data.url;
    } catch (err) {
      console.error("checkout threw", err);
      setError("Couldn't start checkout — try again or contact support.");
      setLoading(false);
    }
  }

  // Resume checkout after sign-up. If the user picked this pack while
  // signed out and just came back signed in, fire checkout automatically.
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    const pending =
      typeof window !== "undefined"
        ? window.sessionStorage.getItem(PENDING_PACK_KEY)
        : null;
    if (pending === pack) {
      window.sessionStorage.removeItem(PENDING_PACK_KEY);
      void startCheckout();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, isSignedIn, pack]);

  async function pick() {
    // Wait for Clerk to hydrate — otherwise a fast click during initial
    // paint can send a signed-in user to /sign-up.
    if (!isLoaded) return;
    if (!isSignedIn) {
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(PENDING_PACK_KEY, pack);
      }
      router.push(`/sign-up?redirect_url=/pricing`);
      return;
    }
    await startCheckout();
  }

  return (
    <div
      aria-label={`${name} — $${price}`}
      className={`relative flex h-full flex-col rounded-xl border p-7 transition-colors ${
        anchored
          ? "border-white bg-neutral-950 shadow-[0_0_0_1px_rgba(255,255,255,0.4)] md:rounded-2xl md:scale-105"
          : "border-neutral-800 bg-neutral-950 hover:border-neutral-700"
      }`}
    >
      {anchored && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-black">
          Most popular
        </div>
      )}

      {/* Pack name — uppercase label */}
      <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-400">
        {name}
      </div>
      <p className="mt-3 min-h-[2.5rem] text-sm leading-relaxed text-neutral-500">
        {tagline}
      </p>

      {/* Price block — display weight, mono per-unit math below */}
      <div className="mt-7">
        <div className="flex items-baseline gap-1.5">
          <span className="text-5xl font-bold tracking-tight text-white tabular-nums">
            ${price}
          </span>
          <span className="text-sm text-neutral-500 tabular-nums">
            · {credits} credit{credits === 1 ? "" : "s"}
          </span>
        </div>
        <div className="mt-2 font-mono text-xs text-neutral-500 tabular-nums">
          {perUnit}
        </div>
      </div>

      {/* Hairline divider above the bullets — visual rhythm break */}
      <div className="mt-6 h-px bg-neutral-900" aria-hidden="true" />

      {/* Feature list */}
      <ul className="mt-6 flex-1 space-y-3 text-sm">
        {bullets.map((b, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <Check
              className={`size-4 shrink-0 translate-y-[3px] ${
                anchored ? "text-white" : "text-neutral-500"
              }`}
              aria-hidden="true"
            />
            <span className={anchored ? "text-white" : "text-neutral-300"}>
              {b}
            </span>
          </li>
        ))}
      </ul>

      {/* Brand voice line — italic, low-key */}
      <p className="mt-6 text-xs italic text-neutral-500">{voiceLine}</p>

      <button
        type="button"
        onClick={pick}
        disabled={loading || !isLoaded}
        aria-label={`${ctaLabel} — ${name}`}
        className={`mt-6 inline-flex h-11 w-full items-center justify-center rounded-md px-5 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black disabled:opacity-60 ${
          anchored
            ? "bg-white text-black hover:bg-neutral-200"
            : "border border-neutral-800 bg-neutral-900 text-white hover:border-neutral-700 hover:bg-neutral-800"
        }`}
      >
        {loading ? "Loading…" : ctaLabel}
      </button>
      {error && (
        <p role="alert" className="mt-2 text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
