// convex/stripeWebhook.ts
"use node";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import Stripe from "stripe";

const PRICE_TIER_MAP: Record<string, "pro" | "career"> = {
  [process.env.STRIPE_PRO_PRICE_ID!]: "pro",
  [process.env.STRIPE_CAREER_PRICE_ID!]: "career",
};

function priceToTier(
  priceId: string | null | undefined,
): "free" | "pro" | "career" {
  if (!priceId) return "free";
  return PRICE_TIER_MAP[priceId] ?? "free";
}

export const stripeWebhook = httpAction(async (ctx, request) => {
  const sig = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !secret) {
    return new Response("missing signature or secret", { status: 400 });
  }

  const body = await request.text();
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-09-30.clover",
  });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (err) {
    return new Response(`signature_invalid: ${(err as Error).message}`, {
      status: 400,
    });
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

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const clerkId = session.client_reference_id ?? session.metadata?.clerkId;
      if (!clerkId) return new Response("no clerkId", { status: 400 });
      if (!session.subscription)
        return new Response("no subscription", { status: 200 });
      const sub = await stripe.subscriptions.retrieve(
        session.subscription as string,
      );
      await ctx.runMutation(internal.stripe.upsertSubscription, {
        clerkId,
        stripeCustomerId: sub.customer as string,
        stripeSubscriptionId: sub.id,
        stripePriceId: sub.items.data[0].price.id,
        tier: priceToTier(sub.items.data[0].price.id),
        status: sub.status as never,
        currentPeriodStart: sub.current_period_start * 1000,
        currentPeriodEnd: sub.current_period_end * 1000,
        cancelAtPeriodEnd: sub.cancel_at_period_end,
        trialEnd: sub.trial_end ? sub.trial_end * 1000 : undefined,
      });
    } else {
      const sub = event.data.object as Stripe.Subscription;
      const clerkId = (sub.metadata?.clerkId as string | undefined) ?? "";
      if (!clerkId)
        return new Response("no clerkId in metadata", { status: 400 });
      await ctx.runMutation(internal.stripe.upsertSubscription, {
        clerkId,
        stripeCustomerId: sub.customer as string,
        stripeSubscriptionId: sub.id,
        stripePriceId: sub.items.data[0].price.id,
        tier:
          event.type === "customer.subscription.deleted"
            ? "free"
            : priceToTier(sub.items.data[0].price.id),
        status: sub.status as never,
        currentPeriodStart: sub.current_period_start * 1000,
        currentPeriodEnd: sub.current_period_end * 1000,
        cancelAtPeriodEnd: sub.cancel_at_period_end,
        trialEnd: sub.trial_end ? sub.trial_end * 1000 : undefined,
      });
    }
  } catch (err) {
    console.error("stripe event handler failed", err);
    return new Response(`handler_error: ${(err as Error).message}`, {
      status: 500,
    });
  }

  return new Response("ok", { status: 200 });
});
