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
    if (identity) {
      const user = await ctx.runQuery(api.users.getCurrentUser, {});
      if (user) {
        const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        const recentRuns = await ctx.runQuery(api.dashboard.listMyRuns, {});
        const recentCount = recentRuns.filter((r) => r._creationTime >= oneWeekAgo).length;
        const limit = weeklyRunLimit(user.tier);
        if (recentCount >= limit) {
          throw new Error(`run_limit: Try tier is ${limit} runs/week. Upgrade to Apply for unlimited.`);
        }
      }
    }

    const jdId = (await ctx.runAction(api.jobDescriptionsActions.resolveJobDescription, {
      url: args.jdUrl,
    })) as Id<"jobDescriptions">;

    const runId = (await ctx.runMutation(internal.runs.insertRun, {
      fingerprintHash: args.fingerprintHash,
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
