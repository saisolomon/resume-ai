import { internalMutation, query } from "./_generated/server";
import { v } from "convex/values";

export const byRun = query({
  args: { runId: v.id("runs") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("cards")
      .withIndex("by_run", (q) => q.eq("runId", args.runId))
      .collect();
  },
});

export const _getCardById = query({
  args: { cardId: v.id("cards") },
  handler: async (ctx, args) => await ctx.db.get(args.cardId),
});

export const patchCard = internalMutation({
  args: {
    cardId: v.id("cards"),
    patch: v.object({
      status: v.optional(
        v.union(
          v.literal("pending"),
          v.literal("generating"),
          v.literal("ready"),
          v.literal("failed"),
        ),
      ),
      content: v.optional(v.any()),
      atsScore: v.optional(v.any()),
      failureReason: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.cardId, args.patch);
  },
});
