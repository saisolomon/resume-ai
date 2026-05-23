import { query, internalMutation } from "./_generated/server";
import { v } from "convex/values";

// Daily $ cap. Anonymous flow gates on this; signed-in users (who have
// stricter rate limits + paid tiers) bypass it intentionally.
const DAILY_USD_CAP = 50;

// Approximate $/1M tokens. Kept in sync with Anthropic's published pricing
// (Sonnet 4.6: $3 in / $15 out; Haiku 4.5: $0.80 in / $4 out). These are
// estimates — actual invoice is the source of truth — but accurate enough
// to trip the breaker BEFORE we blow the day's budget.
const SONNET_IN_PER_M = 3;
const SONNET_OUT_PER_M = 15;
const HAIKU_IN_PER_M = 0.8;
const HAIKU_OUT_PER_M = 4;

// Pure helper — exported for unit testing.
export function approxCostUsd(args: {
  model: "sonnet" | "haiku";
  inputTokens: number;
  outputTokens: number;
}): number {
  const i = args.inputTokens / 1_000_000;
  const o = args.outputTokens / 1_000_000;
  if (args.model === "sonnet") return i * SONNET_IN_PER_M + o * SONNET_OUT_PER_M;
  return i * HAIKU_IN_PER_M + o * HAIKU_OUT_PER_M;
}

// Recorded after each Anthropic call so isCircuitOpen can sum the last
// 24h. Internal — only callable from server-side actions, not the client.
export const recordTokenSpend = internalMutation({
  args: {
    model: v.union(v.literal("sonnet"), v.literal("haiku")),
    inputTokens: v.number(),
    outputTokens: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("usageEvents", {
      type: "token_spend",
      metadata: {
        model: args.model,
        inputTokens: args.inputTokens,
        outputTokens: args.outputTokens,
        usd: approxCostUsd(args),
      },
    });
  },
});

// Returns the open/closed state of the breaker + current daily spend so
// the caller can include a user-friendly message. Uses the by_type index
// added in Phase G so the scan is scoped, not full-table.
export const isCircuitOpen = query({
  args: {},
  handler: async (ctx) => {
    const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const events = await ctx.db
      .query("usageEvents")
      .withIndex("by_type", (q) => q.eq("type", "token_spend"))
      .filter((q) => q.gte(q.field("_creationTime"), dayAgo))
      .collect();
    const total = events.reduce(
      (sum, e) => sum + (((e.metadata as { usd?: number })?.usd) ?? 0),
      0,
    );
    return { open: total >= DAILY_USD_CAP, todaysUsd: total, capUsd: DAILY_USD_CAP };
  },
});
