"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

export const startRun = action({
  args: {
    resumeId: v.id("resumes"),
    jdUrl: v.string(),
    fingerprintHash: v.string(),
  },
  handler: async (ctx, args): Promise<Id<"runs">> => {
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
