// convex/stripeWebhook.ts
// HTTP entry point only — Convex disallows `"use node"` on httpActions, so
// the Stripe SDK work (signature verify, retrieve, etc.) lives in an
// internal Node action and we forward to it from here.
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

export const stripeWebhook = httpAction(async (ctx, request) => {
  const sig = request.headers.get("stripe-signature");
  if (!sig) {
    return new Response("missing signature", { status: 400 });
  }

  const body = await request.text();
  const result = await ctx.runAction(internal.stripeActions.processStripeEvent, {
    body,
    signature: sig,
  });
  return new Response(result.body, { status: result.status });
});
