// convex/stripe.ts
import { internalMutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";

export const upsertSubscription = internalMutation({
  args: {
    clerkId: v.string(),
    stripeCustomerId: v.string(),
    stripeSubscriptionId: v.string(),
    stripePriceId: v.string(),
    tier: v.union(v.literal("free"), v.literal("pro"), v.literal("career")),
    status: v.union(
      v.literal("active"),
      v.literal("canceled"),
      v.literal("past_due"),
      v.literal("trialing"),
      v.literal("unpaid"),
    ),
    currentPeriodStart: v.number(),
    currentPeriodEnd: v.number(),
    cancelAtPeriodEnd: v.boolean(),
    trialEnd: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();
    if (!user) {
      const userId = await ctx.db.insert("users", {
        clerkId: args.clerkId,
        email: "", // filled by ensureUser later
        stripeCustomerId: args.stripeCustomerId,
        tier: args.tier,
      });
      user = await ctx.db.get(userId);
    } else {
      await ctx.db.patch(user._id, {
        tier: args.tier,
        stripeCustomerId: args.stripeCustomerId,
      });
    }
    if (!user) throw new Error("user_resolve_failed");

    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_stripe_subscription", (q) =>
        q.eq("stripeSubscriptionId", args.stripeSubscriptionId),
      )
      .unique();

    const payload = {
      userId: user._id,
      stripeSubscriptionId: args.stripeSubscriptionId,
      stripePriceId: args.stripePriceId,
      tier: args.tier,
      status: args.status,
      currentPeriodStart: args.currentPeriodStart,
      currentPeriodEnd: args.currentPeriodEnd,
      cancelAtPeriodEnd: args.cancelAtPeriodEnd,
      trialEnd: args.trialEnd,
    };

    if (existing) await ctx.db.patch(existing._id, payload);
    else await ctx.db.insert("subscriptions", payload);
  },
});

export const getMySubscription = query({
  args: {},
  handler: async (ctx): Promise<Doc<"subscriptions"> | null> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return null;
    return await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();
  },
});
