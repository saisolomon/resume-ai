// convex/retention.ts
import { internalAction, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

const RETENTION_MS = 30 * 24 * 60 * 60 * 1000;

// Daily cron entry point. Triggers _deleteExpired with the cutoff
// timestamp. Logs result counts for ops visibility.
export const deleteExpiredAnonymousData = internalAction({
  args: {},
  handler: async (
    ctx,
  ): Promise<{ deletedRuns: number; deletedResumes: number }> => {
    const cutoff = Date.now() - RETENTION_MS;
    const result = await ctx.runMutation(internal.retention._deleteExpired, {
      cutoff,
    });
    console.log(
      `retention sweep: deleted ${result.deletedRuns} runs, ${result.deletedResumes} resumes (cutoff ${new Date(cutoff).toISOString()})`,
    );
    return result;
  },
});

// Internal: walk anonymous-only runs/resumes older than the cutoff and
// hard-delete them along with their cards + chatMessages + storage blobs.
// Signed-in user data (userId set) is preserved indefinitely — only the
// 30-day-old anonymous-demo trail gets swept.
export const _deleteExpired = internalMutation({
  args: { cutoff: v.number() },
  handler: async (ctx, { cutoff }) => {
    let deletedRuns = 0;
    let deletedResumes = 0;

    // Anonymous runs (no userId) older than cutoff. We filter rather than
    // index because Convex doesn't support a single index on
    // `(userId === undefined, _creationTime)` — and the by_fingerprint
    // index would require iterating per-fingerprint. For v1 retention
    // volume this scan is acceptable.
    const oldRuns = await ctx.db
      .query("runs")
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), undefined),
          q.lt(q.field("_creationTime"), cutoff),
        ),
      )
      .collect();
    for (const run of oldRuns) {
      // Cascade: chatMessages on each card, then cards, then run.
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
      .collect();
    for (const r of oldResumes) {
      if (r.storageId) await ctx.storage.delete(r.storageId);
      await ctx.db.delete(r._id);
      deletedResumes++;
    }

    return { deletedRuns, deletedResumes };
  },
});
