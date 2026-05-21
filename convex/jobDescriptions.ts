import { internalMutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getByCanonicalUrl = query({
  args: { canonicalUrl: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("jobDescriptions")
      .withIndex("by_canonical_url", (q) => q.eq("canonicalUrl", args.canonicalUrl))
      .unique();
  },
});

export const getById = query({
  args: { id: v.id("jobDescriptions") },
  handler: async (ctx, args) => await ctx.db.get(args.id),
});

export const insertJD = internalMutation({
  args: {
    sourceUrl: v.string(),
    canonicalUrl: v.string(),
    title: v.string(),
    company: v.string(),
    rawText: v.string(),
    parsed: v.any(),
    scraper: v.union(v.literal("firecrawl"), v.literal("apify"), v.literal("manual")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("jobDescriptions", {
      ...args,
      scrapedAt: Date.now(),
    });
  },
});
