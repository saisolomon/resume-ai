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
      className={`relative flex h-full min-h-[500px] flex-col gap-5 rounded-[20px] bg-white p-8 transition-shadow duration-300 ${
        anchored
          ? "shadow-card-xl md:scale-[1.02]"
          : "shadow-card hover:shadow-card-hover"
      }`}
    >
      {anchored && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#1D1D1F] px-3 py-1 text-[12px] font-medium text-white">
          Most popular
        </div>
      )}

      {/* Pack name — sentence case, slate secondary */}
      <div className="text-[15px] font-semibold text-[#6E6E73]">{name}</div>
      <p className="min-h-[2.5rem] text-[17px] leading-snug text-[#1D1D1F]">
        {tagline}
      </p>

      {/* Price block — large display weight, per-unit math below */}
      <div>
        <div className="flex items-baseline gap-2">
          <span className="text-[64px] font-semibold leading-none tracking-tight tabular-nums text-[#1D1D1F]">
            ${price}
          </span>
          <span className="text-[19px] text-[#6E6E73]">/ pack</span>
        </div>
        <div className="mt-3 text-[15px] text-[#6E6E73] tabular-nums">
          {credits} credit{credits === 1 ? "" : "s"} · {perUnit}
        </div>
      </div>

      {/* Hairline divider above the bullets */}
      <div className="my-2 h-px bg-[#D2D2D7]" aria-hidden="true" />

      {/* Feature list */}
      <ul className="flex-1 space-y-3 text-[15px]">
        {bullets.map((b, i) => (
          <li key={i} className="flex items-start gap-3">
            <Check
              className={`mt-0.5 size-5 shrink-0 ${
                anchored ? "text-[#1A7F45]" : "text-[#6E6E73]"
              }`}
              aria-hidden="true"
            />
            <span className="text-[#1D1D1F]">{b}</span>
          </li>
        ))}
      </ul>

      {/* Brand voice line — quiet caption */}
      <p className="text-[13px] text-[#86868B]">{voiceLine}</p>

      <button
        type="button"
        onClick={pick}
        disabled={loading || !isLoaded}
        aria-label={`${ctaLabel} — ${name}`}
        className={`focus-ring inline-flex h-12 w-full items-center justify-center rounded-full px-6 text-[17px] font-medium transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${
          anchored
            ? "bg-[#1D1D1F] text-white hover:bg-black"
            : "border border-[#D2D2D7] bg-white text-[#1D1D1F] hover:border-[#86868B] hover:bg-[#F5F5F7]"
        }`}
      >
        {loading ? "Loading." : ctaLabel}
      </button>
      {error && (
        <p role="alert" className="text-[13px] text-[#B91C1C]">
          {error}
        </p>
      )}
    </div>
  );
}
