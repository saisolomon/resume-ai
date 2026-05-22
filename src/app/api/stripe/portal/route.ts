// src/app/api/stripe/portal/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import Stripe from "stripe";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";

export async function POST(req: NextRequest) {
  const { userId, getToken } = await auth();
  if (!userId)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const token = await getToken({ template: "convex" });
  const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
  if (token) convex.setAuth(token);

  const sub = await convex.query(api.stripe.getMySubscription, {});
  if (!sub)
    return NextResponse.json({ error: "no_subscription" }, { status: 404 });

  const user = await convex.query(api.users.getCurrentUser, {});
  if (!user?.stripeCustomerId) {
    return NextResponse.json({ error: "no_customer_id" }, { status: 404 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-02-25.clover",
  });
  const portal = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${req.nextUrl.origin}/settings`,
  });
  return NextResponse.json({ url: portal.url });
}
