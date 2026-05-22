import { query, mutation } from "./_generated/server";
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
