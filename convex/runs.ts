import { internalMutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getRun = query({
  args: { runId: v.id("runs") },
  handler: async (ctx, args) => await ctx.db.get(args.runId),
});

export const insertRun = internalMutation({
  args: {
    fingerprintHash: v.string(),
    resumeId: v.id("resumes"),
    jobDescriptionId: v.id("jobDescriptions"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("runs", {
      fingerprintHash: args.fingerprintHash,
      resumeId: args.resumeId,
      jobDescriptionId: args.jobDescriptionId,
      status: "generating",
    });
  },
});

export const patchRun = internalMutation({
  args: {
    runId: v.id("runs"),
    patch: v.object({
      status: v.optional(
        v.union(
          v.literal("scraping"),
          v.literal("generating"),
          v.literal("ready"),
          v.literal("failed"),
        ),
      ),
      failureReason: v.optional(v.string()),
      completedAt: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args) => await ctx.db.patch(args.runId, args.patch),
});

export const insertInitialCards = internalMutation({
  args: { runId: v.id("runs") },
  handler: async (ctx, args) => {
    const angles = [
      { slug: "eng_depth", label: "Engineering depth", template: "classic" },
      { slug: "leadership", label: "Leadership", template: "modern" },
      { slug: "cross_functional", label: "Cross-functional", template: "creative" },
      { slug: "specialist", label: "Specialist", template: "minimal" },
    ] as const;

    const ids: string[] = [];
    for (const a of angles) {
      const id = await ctx.db.insert("cards", {
        runId: args.runId,
        angle: a.slug,
        angleLabel: a.label,
        templateSlug: a.template,
        status: "pending",
      });
      ids.push(id);
    }
    return ids;
  },
});
