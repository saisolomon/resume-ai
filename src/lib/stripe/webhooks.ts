import type Stripe from "stripe";
import type { SubscriptionStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { tierFromPriceId } from "./prices";

/**
 * Compute the current billing period boundaries from the Stripe subscription.
 * In API version 2026-02-25.clover, `current_period_start` and
 * `current_period_end` were removed. We approximate using `start_date`,
 * `billing_cycle_anchor`, and `cancel_at` / `trial_end`.
 */
function billingPeriod(sub: Stripe.Subscription) {
  const start = new Date(sub.start_date * 1000);
  // Best-effort end: use cancel_at if set, otherwise project +30d from anchor
  const endTs = sub.cancel_at ?? sub.billing_cycle_anchor + 30 * 86400;
  const end = new Date(endTs * 1000);
  return { start, end };
}

export async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const subscriptionId = session.subscription as string;
  if (!userId || !subscriptionId) return;

  const { getStripe } = await import("./client");
  const subscription = await getStripe().subscriptions.retrieve(subscriptionId);
  const priceId = subscription.items.data[0]?.price?.id;
  const tier = priceId ? tierFromPriceId(priceId) : null;

  if (!tier) return;

  const { start, end } = billingPeriod(subscription);

  await prisma.subscription.upsert({
    where: { userId },
    update: {
      stripeSubscriptionId: subscriptionId,
      stripePriceId: priceId!,
      tier,
      status: "ACTIVE",
      currentPeriodStart: start,
      currentPeriodEnd: end,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
    },
    create: {
      userId,
      stripeSubscriptionId: subscriptionId,
      stripePriceId: priceId!,
      tier,
      status: subscription.status === "trialing" ? "TRIALING" : "ACTIVE",
      currentPeriodStart: start,
      currentPeriodEnd: end,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
    },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { tier },
  });
}

export async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const priceId = subscription.items.data[0]?.price?.id;
  const tier = priceId ? tierFromPriceId(priceId) : null;

  const dbSub = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: subscription.id },
  });
  if (!dbSub) return;

  const statusMap: Record<string, string> = {
    active: "ACTIVE",
    trialing: "TRIALING",
    canceled: "CANCELED",
    past_due: "PAST_DUE",
    unpaid: "UNPAID",
  };

  const { start, end } = billingPeriod(subscription);

  await prisma.subscription.update({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status: (statusMap[subscription.status] ?? "ACTIVE") as SubscriptionStatus,
      tier: tier ?? dbSub.tier,
      stripePriceId: priceId ?? dbSub.stripePriceId,
      currentPeriodStart: start,
      currentPeriodEnd: end,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
    },
  });

  if (tier) {
    await prisma.user.update({
      where: { id: dbSub.userId },
      data: { tier },
    });
  }
}

export async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const dbSub = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: subscription.id },
  });
  if (!dbSub) return;

  await prisma.subscription.update({
    where: { stripeSubscriptionId: subscription.id },
    data: { status: "CANCELED" },
  });

  await prisma.user.update({
    where: { id: dbSub.userId },
    data: { tier: "FREE" },
  });
}

export async function handlePaymentFailed(invoice: Stripe.Invoice) {
  // In API version 2026-02-25.clover, `invoice.subscription` was removed.
  // The subscription ID is now under `invoice.parent.subscription_details`.
  const subDetails = invoice.parent?.subscription_details;
  const subscriptionId =
    typeof subDetails?.subscription === "string"
      ? subDetails.subscription
      : subDetails?.subscription?.id;
  if (!subscriptionId) return;

  await prisma.subscription.updateMany({
    where: { stripeSubscriptionId: subscriptionId },
    data: { status: "PAST_DUE" },
  });
}
