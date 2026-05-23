import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    return user;
  },
});

export const ensureUser = mutation({
  args: { email: v.string(), name: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("not_authenticated");

    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (existing) {
      // Backfill identity fields if a prior write (e.g. Stripe webhook) created
      // the row without them. Never overwrite non-empty existing values.
      const patch: { email?: string; name?: string } = {};
      if (!existing.email && args.email) patch.email = args.email;
      if (!existing.name && args.name) patch.name = args.name;
      if (Object.keys(patch).length > 0) await ctx.db.patch(existing._id, patch);
      return existing._id;
    }

    return await ctx.db.insert("users", {
      clerkId: identity.subject,
      email: args.email,
      name: args.name,
      tier: "free",
    });
  },
});

// v4 credit-pack model. Used by the settings page balance pill and by
// any client-side gating that wants to know "can this user start a run?".
// Returns 0 when the user is signed out or the row doesn't exist yet.
export const getCreditBalance = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return 0;
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    return user?.credits ?? 0;
  },
});

// Internal-only. Called from runsActions.startRun once we've verified
// the user has at least 1 credit and successfully inserted the run row.
// Throws if the balance has dropped to 0 between the gate check and
// here — defensive against concurrent startRun calls from the same user.
export const consumeCredit = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("user_not_found");
    const current = user.credits ?? 0;
    if (current <= 0) throw new Error("insufficient_credits");
    await ctx.db.patch(userId, { credits: current - 1 });
    return current - 1;
  },
});
