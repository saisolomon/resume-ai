// convex/dashboard.ts
import { query } from "./_generated/server";

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
