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

    // scrapeJD records Haiku tokens via the callback IMMEDIATELY after
    // the extract Anthropic call returns — so even a malformed-JSON
    // response still counts against the daily breaker. Best-effort: never
    // break the scrape if accounting has a transient failure.
    const scraped = await scrapeJD(url, async (tokens) => {
      try {
        await ctx.runMutation(internal.costGuard.recordTokenSpend, {
          model: "haiku",
          inputTokens: tokens.input,
          outputTokens: tokens.output,
        });
      } catch (logErr) {
        console.error("recordTokenSpend failed (jd extract)", logErr);
      }
    });
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
