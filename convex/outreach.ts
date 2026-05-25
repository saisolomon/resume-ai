import { internalMutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Outreach templates — one row per run, upserted by generation.
 * Owner-gated read via `getMyByRun`; internal upsert via `insertOrReplace`.
 */

const TEMPLATE_VALIDATOR = v.object({
  kind: v.union(
    v.literal("cold_recruiter"),
    v.literal("referral_ask"),
    v.literal("hiring_manager"),
  ),
  subject: v.string(),
  body: v.string(),
});

export const insertOrReplace = internalMutation({
  args: {
    runId: v.id("runs"),
    userId: v.id("users"),
    templates: v.array(TEMPLATE_VALIDATOR),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("outreachTemplates")
      .withIndex("by_run", (q) => q.eq("runId", args.runId))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, {
        userId: args.userId,
        templates: args.templates,
      });
      return existing._id;
    }
    return await ctx.db.insert("outreachTemplates", args);
  },
});

// Owner-gated read for the /run/[runId] page. Returns null on unauth /
// non-owner so the UI can distinguish "loading" / "not generated" /
// "forbidden" cleanly.
export const getMyByRun = query({
  args: { runId: v.id("runs") },
  handler: async (ctx, { runId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return null;
    const run = await ctx.db.get(runId);
    if (!run || run.userId !== user._id) return null;
    return await ctx.db
      .query("outreachTemplates")
      .withIndex("by_run", (q) => q.eq("runId", runId))
      .unique();
  },
});
