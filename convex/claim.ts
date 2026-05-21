import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const claimAnonymousRuns = mutation({
  args: { fingerprintHash: v.string(), email: v.string(), name: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("not_authenticated");

    let user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) {
      const userId = await ctx.db.insert("users", {
        clerkId: identity.subject,
        email: args.email,
        name: args.name,
        tier: "free",
      });
      user = await ctx.db.get(userId);
    }
    if (!user) throw new Error("user_create_failed");

    const resumes = await ctx.db
      .query("resumes")
      .withIndex("by_fingerprint", (q) => q.eq("fingerprintHash", args.fingerprintHash))
      .collect();
    for (const r of resumes) {
      await ctx.db.patch(r._id, { userId: user._id, fingerprintHash: undefined });
    }

    const runs = await ctx.db
      .query("runs")
      .withIndex("by_fingerprint", (q) => q.eq("fingerprintHash", args.fingerprintHash))
      .collect();
    for (const r of runs) {
      await ctx.db.patch(r._id, { userId: user._id, fingerprintHash: undefined });
    }

    return { userId: user._id, claimed: { resumes: resumes.length, runs: runs.length } };
  },
});
