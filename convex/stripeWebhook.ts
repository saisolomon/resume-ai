// convex/stripeWebhook.ts
"use node";
import { httpAction } from "./_generated/server";
import Stripe from "stripe";

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

  // event handling added in next task
  return new Response("ok", { status: 200 });
});
