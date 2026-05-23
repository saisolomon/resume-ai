import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { createHash } from "crypto";

const HOUR = 60 * 60 * 1000;
const MAX_DISTINCT_FPS = 5;

// Daily-rotating IP hash. The salt is (FINGERPRINT_SALT + YYYY-MM-DD)
// so the hash changes daily — limits long-term ability to track IPs but
// preserves correlation within a single day for abuse detection.
export function hashIp(ip: string, dateUTC: string, salt: string): string {
  return createHash("sha256").update(`${salt}:${dateUTC}:${ip}`).digest("hex");
}

// Pure helper — exported for unit testing. Returns true if accepting one
// more fingerprint from this IP would exceed MAX_DISTINCT_FPS distinct
// fingerprints in the rolling window.
export function isOverIpVelocity(
  recentFingerprintsForIp: string[],
  currentFingerprintHash: string,
): boolean {
  const distinct = new Set(recentFingerprintsForIp);
  distinct.add(currentFingerprintHash);
  return distinct.size > MAX_DISTINCT_FPS;
}

export const checkIpVelocity = query({
  args: { ipHash: v.string(), fingerprintHash: v.string() },
  handler: async (ctx, { ipHash, fingerprintHash }) => {
    const cutoff = Date.now() - HOUR;
    // We can't index by ipHash without adding to usageEvents schema.
    // Workaround: filter all anonymous_ip_seen events from the last hour
    // and count distinct fps for matching ipHash. For v1 abuse loads this
    // is fine; a dedicated index can come in a perf pass.
    const events = await ctx.db
      .query("usageEvents")
      .filter((q) =>
        q.and(
          q.eq(q.field("type"), "anonymous_ip_seen"),
          q.gte(q.field("_creationTime"), cutoff),
        ),
      )
      .collect();
    const matching = events.filter(
      (e) => (e.metadata as { ipHash?: string } | undefined)?.ipHash === ipHash,
    );
    const recentFps = matching
      .map((e) => (e.metadata as { fingerprintHash?: string } | undefined)?.fingerprintHash)
      .filter((x): x is string => !!x);
    return { isOverIpVelocity: isOverIpVelocity(recentFps, fingerprintHash) };
  },
});

// Public mutation — must be callable from the /api/anonymous-run-start
// Next.js route via ConvexHttpClient (which can only call `api.*`, not
// `internal.*`). Args are validated, so direct browser calls can't sneak
// in malformed payloads.
export const recordIpSeen = mutation({
  args: { ipHash: v.string(), fingerprintHash: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.insert("usageEvents", {
      fingerprintHash: args.fingerprintHash,
      type: "anonymous_ip_seen",
      metadata: { ipHash: args.ipHash, fingerprintHash: args.fingerprintHash },
    });
  },
});
