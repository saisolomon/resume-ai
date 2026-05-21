"use node";
import { firecrawlScrape } from "./firecrawl";
import { canonicalizeJobUrl } from "./canonicalize";
import { extractJDFields, ExtractedJD } from "./extract";

export interface ScrapeResult {
  sourceUrl: string;
  canonicalUrl: string;
  rawText: string;
  parsed: ExtractedJD;
  scraper: "firecrawl";
}

const MIN_CONTENT_LEN = 400;

export async function scrapeJD(url: string): Promise<ScrapeResult> {
  const canonicalUrl = canonicalizeJobUrl(url);

  const result = await firecrawlScrape(canonicalUrl);

  if (result.text.length < MIN_CONTENT_LEN) {
    throw new Error(
      `scrape_failed: insufficient content from Firecrawl (${result.text.length} chars)`,
    );
  }

  const parsed = await extractJDFields(result.text);
  return {
    sourceUrl: url,
    canonicalUrl,
    rawText: result.text,
    parsed,
    scraper: "firecrawl",
  };
}
