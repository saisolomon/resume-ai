// src/app/api/stripe/checkout/route.ts
//
// v4 credit-pack checkout. The /pricing page POSTs `{ pack }` with one of
// "single" / "5pack" / "20pack" (or the underscore-style aliases used in
// the Convex schema, "five_pack" / "twenty_pack" — both accepted for
// frontend flexibility). Returns the Stripe-hosted checkout URL the
// client should redirect to.
//
// Mode is `payment` (one-time), not `subscription`. The webhook handler
// in convex/stripeActions.ts watches for `checkout.session.completed`
// events with `mode === "payment"` and credits the user accordingly.
import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import Stripe from "stripe";

function priceForPack(pack: string): string | undefined {
  if (pack === "single") return process.env.STRIPE_SINGLE_PRICE_ID;
  if (pack === "5pack" || pack === "five_pack")
    return process.env.STRIPE_5PACK_PRICE_ID;
  if (pack === "20pack" || pack === "twenty_pack")
    return process.env.STRIPE_20PACK_PRICE_ID;
  return undefined;
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = (await req.json()) as { pack?: string };
  const priceId = priceForPack(body.pack ?? "");
  if (!priceId)
    return NextResponse.json({ error: "unknown_pack" }, { status: 400 });

  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress;

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-02-25.clover",
  });

  const session = await stripe.checkout.sessions.create({
    mode: "payment", // one-time, not subscription
    line_items: [{ price: priceId, quantity: 1 }],
    customer_email: email,
    client_reference_id: userId,
    // Mirror clerkId into payment_intent metadata so refund tooling /
    // Stripe Sigma queries can find the originating user without joining
    // back through the Checkout session.
    payment_intent_data: { metadata: { clerkId: userId } },
    success_url: `${req.nextUrl.origin}/dashboard?credited=1`,
    cancel_url: `${req.nextUrl.origin}/pricing?canceled=1`,
    // Allow promo codes via Stripe's hosted checkout — useful for any
    // launch-day discount we run.
    allow_promotion_codes: true,
  });
  return NextResponse.json({ url: session.url });
}
