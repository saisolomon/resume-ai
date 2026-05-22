"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { scrapeJD } from "./scrape/routing";
import { canonicalizeJobUrl } from "./scrape/canonicalize";

export const resolveJobDescription = action({
  args: { url: v.string() },
  handler: async (ctx, { url }): Promise<Id<"jobDescriptions">> => {
    const canonicalUrl = canonicalizeJobUrl(url);

    const existing = await ctx.runQuery(api.jobDescriptions.getByCanonicalUrl, {
      canonicalUrl,
    });
    if (existing) return existing._id;

    const scraped = await scrapeJD(url);
    // strip title/company from parsed — they're top-level schema fields, not nested
    const { title, company, ...parsedRest } = scraped.parsed;
    return await ctx.runMutation(internal.jobDescriptions.insertJD, {
      sourceUrl: scraped.sourceUrl,
      canonicalUrl: scraped.canonicalUrl,
      title,
      company,
      rawText: scraped.rawText,
      parsed: parsedRest,
      scraper: scraped.scraper,
    });
  },
});
