// convex/cleanup.ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const deleteRun = mutation({
  args: { runId: v.id("runs") },
  handler: async (ctx, { runId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("not_authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("user_not_found");

    // Collapse "missing" and "not owner" into one error so the runId space
    // can't double as an existence oracle.
    const run = await ctx.db.get(runId);
    if (!run || run.userId !== user._id) throw new Error("not_found");

    // cascade: delete chatMessages → cards → run
    const cards = await ctx.db
      .query("cards")
      .withIndex("by_run", (q) => q.eq("runId", runId))
      .collect();
    for (const card of cards) {
      const msgs = await ctx.db
        .query("chatMessages")
        .withIndex("by_card", (q) => q.eq("cardId", card._id))
        .collect();
      for (const m of msgs) await ctx.db.delete(m._id);
      await ctx.db.delete(card._id);
    }
    await ctx.db.delete(runId);
  },
});

export const deleteCurrentUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("not_authenticated");
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return;

    const runs = await ctx.db.query("runs").withIndex("by_user", (q) => q.eq("userId", user._id)).collect();
    for (const r of runs) {
      const cards = await ctx.db.query("cards").withIndex("by_run", (q) => q.eq("runId", r._id)).collect();
      for (const c of cards) {
        const msgs = await ctx.db.query("chatMessages").withIndex("by_card", (q) => q.eq("cardId", c._id)).collect();
        for (const m of msgs) await ctx.db.delete(m._id);
        await ctx.db.delete(c._id);
      }
      await ctx.db.delete(r._id);
    }
    const resumes = await ctx.db.query("resumes").withIndex("by_user", (q) => q.eq("userId", user._id)).collect();
    for (const r of resumes) await ctx.db.delete(r._id);
    const subs = await ctx.db.query("subscriptions").withIndex("by_user", (q) => q.eq("userId", user._id)).collect();
    for (const s of subs) await ctx.db.delete(s._id);
    await ctx.db.delete(user._id);
  },
});
