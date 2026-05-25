// convex/dashboard.ts
import { mutation, query } from "./_generated/server";
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

// Owner-gated single-card lookup for the signed-in edit page. Public
// api.cards._getCardById would leak card content / ATS score / failure
// reason to anyone with a guessed card ID. Returns null on: unauth, missing
// user row, missing card, missing run, OR non-owner.
export const getMyCard = query({
  args: { cardId: v.id("cards") },
  handler: async (ctx, { cardId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return null;
    const card = await ctx.db.get(cardId);
    if (!card) return null;
    const run = await ctx.db.get(card.runId);
    if (!run || run.userId !== user._id) return null;
    return card;
  },
});

// Owner-gated card content / template update for the /workspace editor.
// Direct-manipulation edits (name, bullets, reorders, template switch)
// route through here. internalMutation patchCard is reserved for AI /
// system writes; this mutation is the only client-facing write path.
//
// Throws on auth failures so the client can surface a clear error (vs.
// silent no-op). Validation is intentionally light at the boundary —
// the editor is the only caller and shapes the payload itself; if a
// malformed `content` lands in storage the render-time defensive coding
// in ResumePreviewHtml handles it.
export const updateMyCardContent = mutation({
  args: {
    cardId: v.id("cards"),
    content: v.optional(v.any()),
    templateSlug: v.optional(
      v.union(
        v.literal("classic"),
        v.literal("modern"),
        v.literal("creative"),
        v.literal("minimal"),
      ),
    ),
  },
  handler: async (ctx, { cardId, content, templateSlug }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("not authenticated");
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("user row missing");
    const card = await ctx.db.get(cardId);
    if (!card) throw new Error("card not found");
    const run = await ctx.db.get(card.runId);
    if (!run || run.userId !== user._id) throw new Error("forbidden");
    // Build the patch from only the keys actually provided so callers
    // can update content alone, template alone, or both.
    const patch: { content?: unknown; templateSlug?: typeof templateSlug } = {};
    if (content !== undefined) patch.content = content;
    if (templateSlug !== undefined) patch.templateSlug = templateSlug;
    if (Object.keys(patch).length === 0) return;
    await ctx.db.patch(cardId, patch);
  },
});
