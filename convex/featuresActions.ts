"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

/**
 * Public wrappers for the three "bonus" deliverables that were
 * roadmapped in pricing — cover letters, outreach templates, LinkedIn
 * rewrite. Each wrapper does auth + owner gating, then dispatches to
 * the matching internal AI action.
 *
 * Cost model: each generation is one Sonnet call (~$0.05). We don't
 * charge a credit — these are workspace utilities on top of an
 * already-paid-for run. If usage gets heavy we'll add per-user daily
 * rate limits before introducing per-generation pricing.
 */

export const generateMyCoverLetters = action({
  args: { cardId: v.id("cards") },
  handler: async (ctx, { cardId }): Promise<{ ok: true }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("not_authenticated");
    const user = await ctx.runQuery(api.users.getCurrentUser, {});
    if (!user) throw new Error("user_row_missing");

    const card = await ctx.runQuery(api.cards._getCardById, { cardId });
    if (!card) throw new Error("card_not_found");
    const run = await ctx.runQuery(api.runs.getRun, { runId: card.runId });
    if (!run || run.userId !== user._id) throw new Error("forbidden");

    await ctx.runAction(
      internal.ai.generateCoverLetters.generateCoverLetters,
      { cardId },
    );
    return { ok: true };
  },
});

export const generateMyOutreach = action({
  args: { runId: v.id("runs") },
  handler: async (ctx, { runId }): Promise<{ ok: true }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("not_authenticated");
    const user = await ctx.runQuery(api.users.getCurrentUser, {});
    if (!user) throw new Error("user_row_missing");

    const run = await ctx.runQuery(api.runs.getRun, { runId });
    if (!run || run.userId !== user._id) throw new Error("forbidden");

    await ctx.runAction(
      internal.ai.generateOutreachTemplates.generateOutreachTemplates,
      { runId },
    );
    return { ok: true };
  },
});

export const generateMyLinkedinRewrite = action({
  args: {
    targetTitle: v.string(),
    currentHeadline: v.string(),
    currentAbout: v.string(),
    experiences: v.array(
      v.object({
        roleTitle: v.string(),
        company: v.string(),
        description: v.string(),
      }),
    ),
    jdContext: v.string(),
  },
  handler: async (ctx, args): Promise<{ id: Id<"linkedinRewrites"> }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("not_authenticated");
    const user = await ctx.runQuery(api.users.getCurrentUser, {});
    if (!user) throw new Error("user_row_missing");

    const id = (await ctx.runAction(
      internal.ai.generateLinkedinRewrite.generateLinkedinRewrite,
      {
        userId: user._id,
        targetTitle: args.targetTitle,
        currentHeadline: args.currentHeadline,
        currentAbout: args.currentAbout,
        experiences: args.experiences,
        jdContext: args.jdContext,
      },
    )) as Id<"linkedinRewrites">;

    return { id };
  },
});
