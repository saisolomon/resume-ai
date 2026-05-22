// src/app/api/stripe/checkout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import Stripe from "stripe";

const TIER_PRICE: Record<string, string | undefined> = {
  pro: process.env.STRIPE_PRO_PRICE_ID,
  career: process.env.STRIPE_CAREER_PRICE_ID,
};

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { tier } = (await req.json()) as { tier: "pro" | "career" };
  const priceId = TIER_PRICE[tier];
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
