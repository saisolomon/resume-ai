// convex/stripeActions.ts
"use node";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
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

// Called by the httpAction in convex/stripeWebhook.ts. Returns a
// `{ status, body }` envelope so the http layer can shape the Response
// without needing to load the Stripe SDK or `"use node"` itself.
export const processStripeEvent = internalAction({
  args: { body: v.string(), signature: v.string() },
  handler: async (ctx, { body, signature }): Promise<{ status: number; body: string }> => {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) return { status: 400, body: "missing webhook secret" };

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-02-25.clover",
    });

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, secret);
    } catch (err) {
      console.error("stripe signature verification failed", err);
      return { status: 400, body: "signature_invalid" };
    }

    const RELEVANT = new Set([
      "customer.subscription.created",
      "customer.subscription.updated",
      "customer.subscription.deleted",
      "checkout.session.completed",
    ]);
    if (!RELEVANT.has(event.type)) {
      return { status: 200, body: "ignored" };
    }

    const priceMap = buildPriceTierMap();

    // Deterministic-failure short-circuit. Returning 200 prevents Stripe
    // from retrying things that will never succeed (validator failures,
    // missing data we cannot synthesize). Log loudly so Convex logs surface
    // the issue.
    const deadLetter = (reason: string, detail?: unknown) => {
      console.error("stripe webhook dead-letter", {
        reason,
        eventType: event.type,
        detail,
      });
      return { status: 200, body: `ignored: ${reason}` };
    };

    try {
      if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        const clerkId = session.client_reference_id ?? session.metadata?.clerkId;
        if (!clerkId) return deadLetter("no clerkId on checkout session");
        if (!session.subscription) return { status: 200, body: "no subscription" };
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
      // Reaches here only on unexpected errors (network blip talking to
      // Stripe, Convex transient failure). 5xx tells Stripe to retry on
      // its backoff.
      console.error("stripe event handler failed", err);
      return { status: 500, body: "handler_error" };
    }

    return { status: 200, body: "ok" };
  },
});
