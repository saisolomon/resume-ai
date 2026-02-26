import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe/client";
import { getUserByClerkId } from "@/lib/db/user";
import { prisma } from "@/lib/db/prisma";
import { PRICE_IDS } from "@/lib/stripe/prices";

export async function POST(req: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await getUserByClerkId(clerkId);
  if (!user)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  const body = await req.json();
  const tier = body.tier as "PRO" | "CAREER";
  const priceId = PRICE_IDS[tier];
  if (!priceId)
    return NextResponse.json({ error: "Invalid tier" }, { status: 400 });

  // Get or create Stripe customer
  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await getStripe().customers.create({
      email: user.email,
      name: user.name ?? undefined,
      metadata: { userId: user.id },
    });
    customerId = customer.id;
    await prisma.user.update({
      where: { id: user.id },
      data: { stripeCustomerId: customerId },
    });
  }

  const session = await getStripe().checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${req.headers.get("origin")}/dashboard?upgraded=true`,
    cancel_url: `${req.headers.get("origin")}/pricing`,
    subscription_data: {
      trial_period_days: 7,
      metadata: { userId: user.id },
    },
    metadata: { userId: user.id },
  });

  return NextResponse.json({ url: session.url });
}
