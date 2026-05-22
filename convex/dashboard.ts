// convex/dashboard.ts
import { query } from "./_generated/server";
import { v } from "convex/values";

export const listMyRuns = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return [];

    const runs = await ctx.db
      .query("runs")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    return await Promise.all(
      runs.map(async (run) => {
        const jd = await ctx.db.get(run.jobDescriptionId);
        const cards = await ctx.db
          .query("cards")
          .withIndex("by_run", (q) => q.eq("runId", run._id))
          .collect();
        const ready = cards.filter((c) => c.status === "ready" && c.atsScore);
        const topScore = ready.length > 0 ? Math.max(...ready.map((c) => c.atsScore!.total)) : null;
        return {
          _id: run._id,
          _creationTime: run._creationTime,
          status: run.status,
          jdTitle: jd?.title ?? "(unknown)",
          jdCompany: jd?.company ?? "",
          topScore,
          cardCount: cards.length,
          readyCount: ready.length,
        };
      }),
    );
  },
});

// Owner-gated single-run lookup for the signed-in /run/[runId] page.
// Returns null on: unauth, missing user row, missing run, OR non-owner. We
// collapse "missing" and "non-owner" into the same null so the URL doesn't
// double as an existence oracle.
export const getMyRun = query({
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
    return run;
  },
});

// Owner-gated cards-for-run lookup. Returns null (not []) when the user
// is not the run's owner so the UI can distinguish "loading" / "empty" /
// "forbidden" cleanly.
export const cardsByMyRun = query({
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
      .query("cards")
      .withIndex("by_run", (q) => q.eq("runId", runId))
      .collect();
  },
});
