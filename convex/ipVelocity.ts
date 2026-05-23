import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const HOUR = 60 * 60 * 1000;
const MAX_DISTINCT_FPS = 5;

// hashIp lives in src/lib/ipHash.ts (Node `crypto` isn't available in
// Convex's default V8 isolate, and the Next.js API route is the only
// place that needs to hash an IP — Convex only ever sees the hash).

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
    // Use the by_type index to scope the scan to only anonymous_ip_seen
    // events, then filter by _creationTime. We still post-filter by
    // ipHash (no index on metadata.ipHash) but the scan is bounded by
    // the recent window of one event type — should stay sub-1k docs
    // even under abuse load.
    const events = await ctx.db
      .query("usageEvents")
      .withIndex("by_type", (q) => q.eq("type", "anonymous_ip_seen"))
      .filter((q) => q.gte(q.field("_creationTime"), cutoff))
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
