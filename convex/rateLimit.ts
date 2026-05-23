import { query, internalMutation } from "./_generated/server";
import { v } from "convex/values";

const DAY = 24 * 60 * 60 * 1000;
const WEEK = 7 * DAY;
const DAILY_LIMIT = 1;
const WEEKLY_LIMIT = 3;

// Pure helper — exported for unit testing. Given a list of past run
// timestamps and "now", returns true if creating a new run would exceed
// either the daily or weekly limit for anonymous users.
export function isOverLimit(timestamps: number[], now: number): boolean {
  const last24h = timestamps.filter((t) => now - t < DAY).length;
  const last7d = timestamps.filter((t) => now - t < WEEK).length;
  return last24h >= DAILY_LIMIT || last7d >= WEEKLY_LIMIT;
}

export const checkFingerprintLimit = query({
  args: { fingerprintHash: v.string() },
  handler: async (ctx, { fingerprintHash }) => {
    const events = await ctx.db
      .query("usageEvents")
      .withIndex("by_fingerprint_type", (q) =>
        q.eq("fingerprintHash", fingerprintHash).eq("type", "anonymous_run_started"),
      )
      .collect();
    const timestamps = events.map((e) => e._creationTime);
    return { isOverLimit: isOverLimit(timestamps, Date.now()) };
  },
});

export const recordAnonymousRun = internalMutation({
  args: { fingerprintHash: v.string(), runId: v.id("runs") },
  handler: async (ctx, args) => {
    await ctx.db.insert("usageEvents", {
      fingerprintHash: args.fingerprintHash,
      type: "anonymous_run_started",
      runId: args.runId,
    });
  },
});
