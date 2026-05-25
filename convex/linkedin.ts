import { internalMutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * LinkedIn rewrites — one row per generation per user. We keep
 * history (don't overwrite) so the user can revisit prior rewrites
 * from the /linkedin page if they realize a previous draft was
 * closer to what they wanted.
 */

const EXPERIENCE_REWRITE_VALIDATOR = v.object({
  roleTitle: v.string(),
  company: v.string(),
  rewrite: v.string(),
});

export const insertRewrite = internalMutation({
  args: {
    userId: v.id("users"),
    targetTitle: v.string(),
    headline: v.string(),
    about: v.string(),
    experienceRewrites: v.array(EXPERIENCE_REWRITE_VALIDATOR),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("linkedinRewrites", args);
  },
});

// Owner-gated list for /linkedin — returns the user's rewrite history,
// most recent first. Returns null on unauth so the page can route to
// /sign-in cleanly.
export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return null;
    return await ctx.db
      .query("linkedinRewrites")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});
