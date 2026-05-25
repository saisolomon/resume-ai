"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

/**
 * Public translation entry point — called from the workspace's
 * "Translate resume" action. Auth-gated, owner-gated, then dispatches
 * the synchronous internal translation.
 *
 * Why synchronous (await runAction) rather than scheduler.runAfter:
 * the workspace UI needs to know when the translated content lands so
 * it can refresh its local working copy. A scheduled action would
 * fire-and-forget; awaiting it lets the client show "Translating..."
 * spinner and flip to "Done" deterministically.
 *
 * Cost: one Sonnet call (~$0.05). We don't charge a credit for
 * translation today — it's a workspace utility on an already-paid-
 * for card. If translation usage gets heavy we'll add per-card or
 * per-day rate limits before introducing per-translation pricing.
 */
export const translateMyCard = action({
  args: {
    cardId: v.id("cards"),
    targetLanguage: v.string(),
  },
  handler: async (ctx, { cardId, targetLanguage }): Promise<{ ok: true }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("not_authenticated");
    const user = await ctx.runQuery(api.users.getCurrentUser, {});
    if (!user) throw new Error("user_row_missing");

    // Owner check — internalAction patches the card directly, so we
    // need to gate here at the public boundary.
    const card = await ctx.runQuery(api.cards._getCardById, { cardId });
    if (!card) throw new Error("card_not_found");
    const run = await ctx.runQuery(api.runs.getRun, { runId: card.runId });
    if (!run || run.userId !== user._id) throw new Error("forbidden");

    await ctx.runAction(internal.ai.translateCard.translateCard, {
      cardId,
      targetLanguage,
    });

    return { ok: true };
  },
});
