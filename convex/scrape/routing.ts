"use node";
import { firecrawlScrape } from "./firecrawl";
import { apifyScrape } from "./apify";
import { canonicalizeJobUrl } from "./canonicalize";
import { extractJDFields, ExtractedJD } from "./extract";

const HOSTILE_HOSTS = ["linkedin.com", "workday.com", "myworkdayjobs.com", "indeed.com"];

function isHostile(host: string): boolean {
  const h = host.toLowerCase();
  return HOSTILE_HOSTS.some((d) => h === d || h.endsWith("." + d));
}

export interface ScrapeResult {
  sourceUrl: string;
  canonicalUrl: string;
  rawText: string;
  parsed: ExtractedJD;
  scraper: "firecrawl" | "apify";
}

const MIN_CONTENT_LEN = 800;

export async function scrapeJD(url: string): Promise<ScrapeResult> {
  const canonicalUrl = canonicalizeJobUrl(url);
  const host = new URL(canonicalUrl).host;

  let result: { text: string; scraper: "firecrawl" | "apify" };

  if (isHostile(host)) {
    const r = await apifyScrape(canonicalUrl);
    result = { text: r.text, scraper: "apify" };
  } else {
    try {
      const r = await firecrawlScrape(canonicalUrl);
      if (r.text.length < MIN_CONTENT_LEN) {
        const fallback = await apifyScrape(canonicalUrl);
        result = { text: fallback.text, scraper: "apify" };
      } else {
        result = { text: r.text, scraper: "firecrawl" };
      }
    } catch {
      const fallback = await apifyScrape(canonicalUrl);
      result = { text: fallback.text, scraper: "apify" };
    }
  }

  if (result.text.length < 400) {
    throw new Error("scrape_failed: insufficient content from both scrapers");
  }

  const parsed = await extractJDFields(result.text);
  return {
    sourceUrl: url,
    canonicalUrl,
    rawText: result.text,
    parsed,
    scraper: result.scraper,
  };
}
