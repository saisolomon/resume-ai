import { internalMutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getRun = query({
  args: { runId: v.id("runs") },
  handler: async (ctx, args) => await ctx.db.get(args.runId),
});

// Result cache lookup for the anonymous flow. Same fingerprint asking for
// the same (resume, JD) triple — return the existing run instead of paying
// for another full Sonnet × 4 + Haiku × 4 generation. Uses by_fingerprint
// to scope the scan; per-fingerprint history is small.
export const findByFingerprintAndIds = query({
  args: {
    fingerprintHash: v.string(),
    resumeId: v.id("resumes"),
    jobDescriptionId: v.id("jobDescriptions"),
  },
  handler: async (ctx, args) => {
    const runs = await ctx.db
      .query("runs")
      .withIndex("by_fingerprint", (q) => q.eq("fingerprintHash", args.fingerprintHash))
      .collect();
    // Exclude failed runs — a transient Anthropic/Firecrawl failure would
    // otherwise poison this (resume, JD) triple until the user's rate-limit
    // window resets. In-flight runs (status "scraping" / "generating") ARE
    // returned: that's the "user double-submitted, dedupe" case the cache
    // is designed for.
    return (
      runs.find(
        (r) =>
          r.resumeId === args.resumeId &&
          r.jobDescriptionId === args.jobDescriptionId &&
          r.status !== "failed",
      ) ?? null
    );
  },
});

// Dedicated count query for the free-tier weekly limit check. Replaces the
// previous use of listMyRuns (which fans out to JD + cards reads per run)
// inside runsActions.startRun. Uses .take(limit + 1) so the worst case is
// `limit + 1` doc reads regardless of how many runs the user has.
export const countRecentRunsForLimit = query({
  args: { sinceMs: v.number(), takeLimit: v.number() },
  handler: async (ctx, { sinceMs, takeLimit }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return 0;
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return 0;
    const recent = await ctx.db
      .query("runs")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(takeLimit);
    return recent.filter((r) => r._creationTime >= sinceMs).length;
  },
});

export const insertRun = internalMutation({
  args: {
    // For signed-in users, set userId — runs appear in dashboard immediately.
    // For anonymous /try users, set fingerprintHash — claim flow attaches
    // userId at sign-up. At least one must be present.
    userId: v.optional(v.id("users")),
    fingerprintHash: v.optional(v.string()),
    resumeId: v.id("resumes"),
    jobDescriptionId: v.id("jobDescriptions"),
  },
  handler: async (ctx, args) => {
    if (!args.userId && !args.fingerprintHash) {
      throw new Error("insertRun_requires_userId_or_fingerprintHash");
    }
    return await ctx.db.insert("runs", {
      userId: args.userId,
      fingerprintHash: args.fingerprintHash,
      resumeId: args.resumeId,
      jobDescriptionId: args.jobDescriptionId,
      status: "generating",
    });
  },
});

export const patchRun = internalMutation({
  args: {
    runId: v.id("runs"),
    patch: v.object({
      status: v.optional(
        v.union(
          v.literal("scraping"),
          v.literal("generating"),
          v.literal("ready"),
          v.literal("failed"),
        ),
      ),
      failureReason: v.optional(v.string()),
      completedAt: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args) => await ctx.db.patch(args.runId, args.patch),
});

export const insertInitialCards = internalMutation({
  args: { runId: v.id("runs") },
  handler: async (ctx, args) => {
    const angles = [
      { slug: "eng_depth", label: "Engineering depth", template: "classic" },
      { slug: "leadership", label: "Leadership", template: "modern" },
      { slug: "cross_functional", label: "Cross-functional", template: "creative" },
      { slug: "specialist", label: "Specialist", template: "minimal" },
    ] as const;

    const ids: string[] = [];
    for (const a of angles) {
      const id = await ctx.db.insert("cards", {
        runId: args.runId,
        angle: a.slug,
        angleLabel: a.label,
        templateSlug: a.template,
        status: "pending",
      });
      ids.push(id);
    }
    return ids;
  },
});

// JD-only flow inserts ONE card (not 4). Without a real candidate
// resume to tailor, generating four angles is wasted spend — the four
// would all read the same. Defaults to Engineering depth + Classic
// since that's the most-conservative starting point; users switch
// templates from the workspace style panel anyway.
export const insertSingleStarterCard = internalMutation({
  args: { runId: v.id("runs") },
  handler: async (ctx, args) => {
    return await ctx.db.insert("cards", {
      runId: args.runId,
      angle: "eng_depth",
      angleLabel: "Starter draft",
      templateSlug: "classic",
      status: "pending",
    });
  },
});
