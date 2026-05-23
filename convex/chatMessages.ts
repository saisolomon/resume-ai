// convex/chatMessages.ts
import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";

// Owner-gated chat history lookup. Returns [] for unauth or non-owner callers
// so the URL / cardId can't be used as a chat-content oracle. Mirrors the
// pattern in convex/dashboard.ts (cardsByMyRun): we collapse "missing" /
// "non-owner" / "unauth" into the same empty result.
export const byCard = query({
  args: { cardId: v.id("cards") },
  handler: async (ctx, { cardId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return [];

    const card = await ctx.db.get(cardId);
    if (!card) return [];
    const run = await ctx.db.get(card.runId);
    if (!run || run.userId !== user._id) return [];

    return await ctx.db
      .query("chatMessages")
      .withIndex("by_card", (q) => q.eq("cardId", cardId))
      .order("asc")
      .collect();
  },
});

export const sendUserMessage = mutation({
  args: { cardId: v.id("cards"), content: v.string() },
  handler: async (ctx, { cardId, content }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("not_authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("user_not_found");

    const card = await ctx.db.get(cardId);
    if (!card) throw new Error("card_not_found");
    const run = await ctx.db.get(card.runId);
    if (!run || run.userId !== user._id) throw new Error("not_owner");

    return await ctx.db.insert("chatMessages", {
      cardId,
      userId: user._id,
      role: "user",
      content,
    });
  },
});

export const _appendAssistantMessage = internalMutation({
  args: { cardId: v.id("cards"), userId: v.id("users"), content: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.insert("chatMessages", {
      cardId: args.cardId,
      userId: args.userId,
      role: "assistant",
      content: args.content,
    });
  },
});
