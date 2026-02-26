"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Check, X, Loader2, Sparkles } from "lucide-react";

const tiers = [
  {
    name: "Job Seeker",
    tier: "FREE" as const,
    price: 0,
    anchor: null,
    description: "Get started with AI-powered resume building",
    cta: "Start Free",
    highlighted: false,
    features: [
      { name: "1 AI-powered resume", included: true },
      { name: "10 AI chat messages / day", included: true },
      { name: "3 DOCX downloads / day", included: true },
      { name: "Classic template", included: true },
      { name: "PDF export", included: false },
      { name: "Job description tailoring", included: false },
      { name: "Resume file upload & parsing", included: false },
      { name: "Premium templates", included: false },
      { name: "AI cover letters", included: false },
      { name: "Priority support", included: false },
    ],
  },
  {
    name: "Career Accelerator",
    tier: "PRO" as const,
    price: 15,
    anchor: 49,
    description: "Everything you need to land more interviews",
    cta: "Start 7-Day Free Trial",
    highlighted: true,
    features: [
      { name: "Unlimited AI resumes", included: true },
      { name: "Unlimited AI chat messages", included: true },
      { name: "Unlimited DOCX downloads", included: true },
      { name: "All 4 premium templates", included: true },
      { name: "PDF export", included: true },
      { name: "Job description tailoring", included: true },
      { name: "Resume file upload & parsing", included: true },
      { name: "Premium templates", included: true },
      { name: "AI cover letters", included: false },
      { name: "Priority support", included: false },
    ],
  },
  {
    name: "Career Dominator",
    tier: "CAREER" as const,
    price: 35,
    anchor: 99,
    description: "The complete toolkit to dominate your job search",
    cta: "Start 7-Day Free Trial",
    highlighted: false,
    features: [
      { name: "Unlimited AI resumes", included: true },
      { name: "Unlimited AI chat messages", included: true },
      { name: "Unlimited DOCX downloads", included: true },
      { name: "All 4 premium templates", included: true },
      { name: "PDF export", included: true },
      { name: "Job description tailoring", included: true },
      { name: "Resume file upload & parsing", included: true },
      { name: "Premium templates", included: true },
      { name: "AI cover letters", included: true },
      { name: "Priority support", included: true },
    ],
  },
] as const;

export function PricingTable() {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);

  async function handleCheckout(tier: "FREE" | "PRO" | "CAREER") {
    if (tier === "FREE") {
      router.push(isSignedIn ? "/dashboard" : "/sign-up");
      return;
    }

    if (!isSignedIn) {
      router.push("/sign-up");
      return;
    }

    setLoadingTier(tier);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.assign(data.url);
      }
    } catch {
      setLoadingTier(null);
    }
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 lg:grid-cols-3">
      {tiers.map((tier) => (
        <div
          key={tier.tier}
          className={`relative flex flex-col rounded-2xl border p-8 ${
            tier.highlighted
              ? "border-primary bg-primary/[0.02] shadow-lg shadow-primary/10 ring-1 ring-primary/20"
              : "border-border bg-card"
          }`}
        >
          {/* Popular badge */}
          {tier.highlighted && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground">
                <Sparkles className="size-3.5" />
                Most Popular
              </span>
            </div>
          )}

          {/* Tier header */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold">{tier.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {tier.description}
            </p>
          </div>

          {/* Price */}
          <div className="mb-6">
            {tier.anchor && (
              <p className="text-sm text-muted-foreground">
                <span className="line-through">${tier.anchor}/mo</span>
              </p>
            )}
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold tracking-tight">
                {tier.price === 0 ? "Free" : `$${tier.price}`}
              </span>
              {tier.price > 0 && (
                <span className="text-sm text-muted-foreground">/month</span>
              )}
            </div>
            {tier.price > 0 && (
              <p className="mt-1 text-xs text-muted-foreground">
                7-day free trial. Cancel anytime.
              </p>
            )}
          </div>

          {/* CTA Button */}
          <Button
            onClick={() => handleCheckout(tier.tier)}
            disabled={loadingTier !== null}
            className={`mb-8 w-full ${
              tier.highlighted
                ? "h-11 text-base font-semibold"
                : "h-10"
            }`}
            variant={tier.highlighted ? "default" : "outline"}
            size="lg"
          >
            {loadingTier === tier.tier ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              tier.cta
            )}
          </Button>

          {/* Feature list */}
          <ul className="flex flex-col gap-3">
            {tier.features.map((feature) => (
              <li key={feature.name} className="flex items-start gap-3">
                {feature.included ? (
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                ) : (
                  <X className="mt-0.5 size-4 shrink-0 text-muted-foreground/40" />
                )}
                <span
                  className={`text-sm ${
                    feature.included
                      ? "text-foreground"
                      : "text-muted-foreground/60"
                  }`}
                >
                  {feature.name}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
