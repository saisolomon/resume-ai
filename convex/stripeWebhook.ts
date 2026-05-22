// convex/stripeWebhook.ts
"use node";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import Stripe from "stripe";

// 8 statuses the Stripe SDK can emit for a subscription. Must match
// convex/schema.ts subscriptions.status and convex/stripe.ts validator.
type SubStatus =
  | "active"
  | "canceled"
  | "incomplete"
  | "incomplete_expired"
  | "past_due"
  | "paused"
  | "trialing"
  | "unpaid";

const ALL_SUB_STATUSES: ReadonlySet<string> = new Set<SubStatus>([
  "active",
  "canceled",
  "incomplete",
  "incomplete_expired",
  "past_due",
  "paused",
  "trialing",
  "unpaid",
]);

function buildPriceTierMap(): Record<string, "pro" | "career"> {
  const pro = process.env.STRIPE_PRO_PRICE_ID;
  const career = process.env.STRIPE_CAREER_PRICE_ID;
  if (!pro)
    throw new Error("STRIPE_PRO_PRICE_ID is required for webhook handler");
  if (!career)
    throw new Error("STRIPE_CAREER_PRICE_ID is required for webhook handler");
  return { [pro]: "pro", [career]: "career" };
}

function priceToTier(
  priceMap: Record<string, "pro" | "career">,
  priceId: string | null | undefined,
): "free" | "pro" | "career" {
  if (!priceId) return "free";
  return priceMap[priceId] ?? "free";
}

function normalizeStatus(raw: string): SubStatus | null {
  return ALL_SUB_STATUSES.has(raw) ? (raw as SubStatus) : null;
}

export const stripeWebhook = httpAction(async (ctx, request) => {
  const sig = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !secret) {
    return new Response("missing signature or secret", { status: 400 });
  }

  const body = await request.text();
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-02-25.clover",
  });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (err) {
    console.error("stripe signature verification failed", err);
    return new Response("signature_invalid", { status: 400 });
  }

  const RELEVANT = new Set([
    "customer.subscription.created",
    "customer.subscription.updated",
    "customer.subscription.deleted",
    "checkout.session.completed",
  ]);

  if (!RELEVANT.has(event.type)) {
    return new Response("ignored", { status: 200 });
  }

  const priceMap = buildPriceTierMap();

  // Helper: deterministic-failure short-circuit. Returning 200 prevents
  // Stripe from retrying things that will never succeed (validator failures,
  // missing data we cannot synthesize). We log loudly so Convex logs / Sentry
  // surface the issue.
  function deadLetter(reason: string, detail?: unknown): Response {
    console.error("stripe webhook dead-letter", { reason, eventType: event.type, detail });
    return new Response(`ignored: ${reason}`, { status: 200 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const clerkId = session.client_reference_id ?? session.metadata?.clerkId;
      if (!clerkId) return deadLetter("no clerkId on checkout session");
      if (!session.subscription)
        return new Response("no subscription", { status: 200 });
      const sub = await stripe.subscriptions.retrieve(
        session.subscription as string,
      );
      const item = sub.items.data[0];
      if (!item) return deadLetter("subscription has zero items");
      const status = normalizeStatus(sub.status);
      if (!status) return deadLetter(`unknown status ${sub.status}`);
      await ctx.runMutation(internal.stripe.upsertSubscription, {
        clerkId,
        stripeCustomerId: sub.customer as string,
        stripeSubscriptionId: sub.id,
        stripePriceId: item.price.id,
        tier: priceToTier(priceMap, item.price.id),
        status,
        currentPeriodStart: item.current_period_start * 1000,
        currentPeriodEnd: item.current_period_end * 1000,
        cancelAtPeriodEnd: sub.cancel_at_period_end,
        trialEnd: sub.trial_end ? sub.trial_end * 1000 : undefined,
      });
    } else {
      const sub = event.data.object as Stripe.Subscription;
      const clerkId = (sub.metadata?.clerkId as string | undefined) ?? "";
      if (!clerkId) return deadLetter("no clerkId in subscription metadata");
      const item = sub.items.data[0];
      if (!item) return deadLetter("subscription has zero items");
      const status = normalizeStatus(sub.status);
      if (!status) return deadLetter(`unknown status ${sub.status}`);
      await ctx.runMutation(internal.stripe.upsertSubscription, {
        clerkId,
        stripeCustomerId: sub.customer as string,
        stripeSubscriptionId: sub.id,
        stripePriceId: item.price.id,
        tier:
          event.type === "customer.subscription.deleted"
            ? "free"
            : priceToTier(priceMap, item.price.id),
        status,
        currentPeriodStart: item.current_period_start * 1000,
        currentPeriodEnd: item.current_period_end * 1000,
        cancelAtPeriodEnd: sub.cancel_at_period_end,
        trialEnd: sub.trial_end ? sub.trial_end * 1000 : undefined,
      });
    }
  } catch (err) {
    // Reaches here only on unexpected errors (network blip talking to Stripe,
    // Convex transient failure). 5xx tells Stripe to retry on its backoff.
    console.error("stripe event handler failed", err);
    return new Response("handler_error", { status: 500 });
  }

  return new Response("ok", { status: 200 });
});
