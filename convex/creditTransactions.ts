// convex/creditTransactions.ts
//
// v4 credit-pack model. The Stripe webhook handler (stripeActions.ts)
// calls `recordPurchase` on a `checkout.session.completed` event for a
// payment-mode session, which inserts a row here and increments the
// user's `credits` balance. The /settings page reads `myHistory` to show
// purchase history.
import { query, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";

// Public query — purchase history shown on /settings. Returns the rows
// newest-first. Returns [] when signed out so the caller can render
// nothing without an extra null-check.
export const myHistory = query({
  args: {},
  handler: async (ctx): Promise<Doc<"creditTransactions">[]> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return [];
    return await ctx.db
      .query("creditTransactions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

// Internal mutation called by the Stripe webhook handler when a
// `checkout.session.completed` event arrives for a one-time payment.
// Idempotent: a second call for the same `stripeSessionId` is a no-op,
// because Stripe may retry the webhook and we never want to double-grant
// credits. Resolves user by clerkId (mirrors stripe.ts upsertSubscription
// in inserting a placeholder if the row doesn't exist yet — defensive,
// shouldn't happen since checkout requires Clerk auth).
export const recordPurchase = internalMutation({
  args: {
    clerkId: v.string(),
    pack: v.union(
      v.literal("single"),
      v.literal("five_pack"),
      v.literal("twenty_pack"),
    ),
    creditsGranted: v.number(),
    amountUsd: v.number(),
    stripeSessionId: v.string(),
    stripePaymentIntentId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Idempotency: if a row exists for this session, skip.
    const existing = await ctx.db
      .query("creditTransactions")
      .withIndex("by_stripe_session", (q) =>
        q.eq("stripeSessionId", args.stripeSessionId),
      )
      .unique();
    if (existing) return;

    // Resolve user — same defensive pattern as stripe.ts.upsertSubscription:
    // create a placeholder row if the webhook beats `users.ensureUser`.
    let user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();
    if (!user) {
      const userId = await ctx.db.insert("users", {
        clerkId: args.clerkId,
        email: "",
        tier: "free",
      });
      user = await ctx.db.get(userId);
      if (!user) throw new Error("user_create_failed");
    }

    await ctx.db.insert("creditTransactions", {
      userId: user._id,
      pack: args.pack,
      creditsGranted: args.creditsGranted,
      amountUsd: args.amountUsd,
      stripeSessionId: args.stripeSessionId,
      stripePaymentIntentId: args.stripePaymentIntentId,
    });

    const current = user.credits ?? 0;
    await ctx.db.patch(user._id, { credits: current + args.creditsGranted });
  },
});
