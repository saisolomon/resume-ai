"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { weeklyRunLimit } from "../src/lib/tier";

export const startRun = action({
  args: {
    resumeId: v.id("resumes"),
    jdUrl: v.string(),
    fingerprintHash: v.string(),
  },
  handler: async (ctx, args): Promise<Id<"runs">> => {
    const identity = await ctx.auth.getUserIdentity();
    // Resolve the signed-in user (if any) once — used both for the
    // free-tier weekly limit check AND to set run.userId so the run
    // shows up in /dashboard immediately. Without this, signed-in users'
    // runs were created with only fingerprintHash, so listMyRuns (which
    // filters by_user) never returned them — runs were reachable only
    // via the /try URL.
    const user = identity
      ? await ctx.runQuery(api.users.getCurrentUser, {})
      : null;

    // Only free tier has a weekly limit. Skip the (potentially large)
    // listMyRuns scan entirely for pro/career — `>= Infinity` is always
    // false but the query would still pay the fan-out cost.
    if (user && user.tier === "free") {
      const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const recentRuns = await ctx.runQuery(api.dashboard.listMyRuns, {});
      const recentCount = recentRuns.filter((r) => r._creationTime >= oneWeekAgo).length;
      const limit = weeklyRunLimit(user.tier);
      if (recentCount >= limit) {
        throw new Error(`run_limit: Try tier is ${limit} runs/week. Upgrade to Apply for unlimited.`);
      }
    }

    const jdId = (await ctx.runAction(api.jobDescriptionsActions.resolveJobDescription, {
      url: args.jdUrl,
    })) as Id<"jobDescriptions">;

    const runId = (await ctx.runMutation(internal.runs.insertRun, {
      // Attach userId for signed-in callers; fall back to fingerprintHash
      // for anonymous demo users so the claim flow can later migrate them.
      userId: user?._id,
      fingerprintHash: user ? undefined : args.fingerprintHash,
      resumeId: args.resumeId,
      jobDescriptionId: jdId,
    })) as Id<"runs">;

    const cardIds = (await ctx.runMutation(internal.runs.insertInitialCards, {
      runId,
    })) as Id<"cards">[];

    for (const cardId of cardIds) {
      await ctx.scheduler.runAfter(0, internal.ai.runAngle.runAngle, { cardId });
    }

    return runId;
  },
});
