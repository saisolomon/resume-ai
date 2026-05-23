// convex/retention.ts
import { internalAction, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

const RETENTION_MS = 30 * 24 * 60 * 60 * 1000;
// Max runs + resumes to delete per mutation invocation. Each run cascade
// touches ~5 docs (4 cards + the run row + 0 chatMessages today), so
// 500 runs ≈ 2,500 doc-ops per mutation — well below Convex's ~16k
// transaction ceiling. The action below loops until counts return zero
// so a backlog from a missed sweep still gets fully cleared.
const PER_INVOCATION_LIMIT = 500;

// Daily cron entry point. Drains expired anonymous data in capped
// batches so a single huge mutation can't bust the Convex transaction
// limit. Logs cumulative counts for ops visibility.
export const deleteExpiredAnonymousData = internalAction({
  args: {},
  handler: async (
    ctx,
  ): Promise<{ deletedRuns: number; deletedResumes: number }> => {
    const cutoff = Date.now() - RETENTION_MS;
    let deletedRuns = 0;
    let deletedResumes = 0;
    // Safety cap on the outer loop in case _deleteExpired ever returns
    // non-zero counts indefinitely (it shouldn't, but cron loops should
    // never be unbounded). 200 batches × 500 = 100k rows/sweep ceiling.
    for (let i = 0; i < 200; i++) {
      const r = await ctx.runMutation(internal.retention._deleteExpired, {
        cutoff,
        limit: PER_INVOCATION_LIMIT,
      });
      deletedRuns += r.deletedRuns;
      deletedResumes += r.deletedResumes;
      if (r.deletedRuns === 0 && r.deletedResumes === 0) break;
    }
    console.log(
      `retention sweep: deleted ${deletedRuns} runs, ${deletedResumes} resumes (cutoff ${new Date(cutoff).toISOString()})`,
    );
    return { deletedRuns, deletedResumes };
  },
});

// Internal: walk anonymous-only runs/resumes older than the cutoff and
// hard-delete them along with their cards + chatMessages + storage blobs.
// Bounded by `limit` so a single transaction can't exceed Convex's
// ~16k doc-op ceiling. Signed-in user data (userId set) is preserved
// indefinitely — only the 30-day-old anonymous-demo trail gets swept.
export const _deleteExpired = internalMutation({
  args: { cutoff: v.number(), limit: v.number() },
  handler: async (ctx, { cutoff, limit }) => {
    let deletedRuns = 0;
    let deletedResumes = 0;

    // Anonymous runs (no userId) older than cutoff. We filter rather than
    // index because Convex doesn't support a single index on
    // `(userId === undefined, _creationTime)` — and the by_fingerprint
    // index would require iterating per-fingerprint. `take(limit)` keeps
    // each mutation transaction bounded.
    const oldRuns = await ctx.db
      .query("runs")
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), undefined),
          q.lt(q.field("_creationTime"), cutoff),
        ),
      )
      .take(limit);
    for (const run of oldRuns) {
      // Cascade: chatMessages on each card, then cards, then run.
      // chatMessages.userId is required (signed-in only) so anonymous
      // runs have empty card.chatMessages today — kept defensive in
      // case that ever changes.
      const cards = await ctx.db
        .query("cards")
        .withIndex("by_run", (q) => q.eq("runId", run._id))
        .collect();
      for (const card of cards) {
        const msgs = await ctx.db
          .query("chatMessages")
          .withIndex("by_card", (q) => q.eq("cardId", card._id))
          .collect();
        for (const m of msgs) await ctx.db.delete(m._id);
        await ctx.db.delete(card._id);
      }
      await ctx.db.delete(run._id);
      deletedRuns++;
    }

    // Anonymous resumes (no userId) older than cutoff. Same userId filter.
    // Includes blob deletion when storageId is set.
    const oldResumes = await ctx.db
      .query("resumes")
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), undefined),
          q.lt(q.field("_creationTime"), cutoff),
        ),
      )
      .take(limit);
    for (const r of oldResumes) {
      if (r.storageId) await ctx.storage.delete(r.storageId);
      await ctx.db.delete(r._id);
      deletedResumes++;
    }

    return { deletedRuns, deletedResumes };
  },
});
