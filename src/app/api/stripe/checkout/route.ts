// src/app/api/stripe/checkout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import Stripe from "stripe";

// Resolve `tier` + `interval` to a Stripe price ID. Falls back to monthly
// if interval isn't specified so older clients keep working.
function priceFor(tier: string, interval: "monthly" | "yearly"): string | undefined {
  if (tier === "pro") {
    return interval === "yearly"
      ? process.env.STRIPE_PRO_YEARLY_PRICE_ID
      : process.env.STRIPE_PRO_PRICE_ID;
  }
  if (tier === "career") {
    return interval === "yearly"
      ? process.env.STRIPE_CAREER_YEARLY_PRICE_ID
      : process.env.STRIPE_CAREER_PRICE_ID;
  }
  return undefined;
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { tier, interval } = (await req.json()) as {
    tier: "pro" | "career";
    interval?: "monthly" | "yearly";
  };
  const priceId = priceFor(tier, interval ?? "monthly");
  if (!priceId)
    return NextResponse.json({ error: "unknown_tier" }, { status: 400 });

  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress;

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-02-25.clover",
  });
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    customer_email: email,
    client_reference_id: userId,
    subscription_data: { metadata: { clerkId: userId } },
    success_url: `${req.nextUrl.origin}/dashboard?upgraded=1`,
    cancel_url: `${req.nextUrl.origin}/pricing?canceled=1`,
  });
  return NextResponse.json({ url: session.url });
}
