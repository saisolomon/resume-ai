"use node";
import { firecrawlScrape } from "./firecrawl";
import { directScrape } from "./direct";
import { canonicalizeJobUrl } from "./canonicalize";
import { extractJDFields, ExtractedJD, RecordTokens } from "./extract";

export interface ScrapeResult {
  sourceUrl: string;
  canonicalUrl: string;
  rawText: string;
  parsed: ExtractedJD;
  scraper: "firecrawl" | "direct";
}

// Threshold below which we consider direct fetch's output insufficient
// (likely a JS-rendered site that needs a real browser) and fall back to Firecrawl.
const DIRECT_OK_LEN = 800;
const FINAL_MIN_LEN = 400;

export async function scrapeJD(
  url: string,
  recordTokens?: RecordTokens,
): Promise<ScrapeResult> {
  const canonicalUrl = canonicalizeJobUrl(url);

  let text: string;
  let scraper: "firecrawl" | "direct";

  try {
    const direct = await directScrape(canonicalUrl);
    if (direct.text.length >= DIRECT_OK_LEN) {
      text = direct.text;
      scraper = "direct";
    } else {
      // direct returned but content is thin — JS-rendered? fall back to firecrawl
      const fc = await firecrawlScrape(canonicalUrl);
      text = fc.text;
      scraper = "firecrawl";
    }
  } catch {
    // direct fetch failed (network, blocked UA, non-html, etc.) — fall back to firecrawl
    const fc = await firecrawlScrape(canonicalUrl);
    text = fc.text;
    scraper = "firecrawl";
  }

  if (text.length < FINAL_MIN_LEN) {
    throw new Error(`scrape_failed: insufficient content (${text.length} chars)`);
  }

  // extractJDFields records the Haiku tokens via recordTokens immediately
  // after the Anthropic response — covers parse-throws.
  const parsed = await extractJDFields(text, recordTokens);
  return {
    sourceUrl: url,
    canonicalUrl,
    rawText: text,
    parsed,
    scraper,
  };
}
