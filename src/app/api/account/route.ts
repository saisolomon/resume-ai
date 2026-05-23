import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import Stripe from "stripe";
import { api } from "../../../../convex/_generated/api";

export async function DELETE(_req: NextRequest) {
  const { userId, getToken } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const token = await getToken({ template: "convex" });
  const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
  if (token) convex.setAuth(token);

  // Cancel any active Stripe subscription BEFORE wiping Convex — otherwise
  // we lose the stripeSubscriptionId and the user keeps getting billed for
  // a product they can no longer access.
  try {
    const sub = await convex.query(api.stripe.getMySubscription, {});
    if (sub && sub.status !== "canceled" && sub.stripeSubscriptionId) {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
        apiVersion: "2026-02-25.clover",
      });
      await stripe.subscriptions.cancel(sub.stripeSubscriptionId);
    }
  } catch (err) {
    // Stripe cancel is best-effort. If it fails (network, already canceled
    // upstream), log loudly but still proceed with Convex+Clerk delete —
    // the alternative (blocking account delete on Stripe being up) is
    // worse UX. The webhook will reconcile if Stripe eventually cancels.
    console.error("stripe cancel during account delete failed", err);
  }

  try {
    await convex.mutation(api.cleanup.deleteCurrentUser, {});
  } catch (err) {
    console.error("convex delete failed", err);
    return NextResponse.json({ error: "convex_delete_failed" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
