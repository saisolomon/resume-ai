"use node";

// Lightweight HTML→text extractor for server-rendered job pages.
// Works for Greenhouse, Lever, Ashby, Workable, most company career pages.
// Will return insufficient content for JS-rendered sites (LinkedIn, Workday) —
// the routing layer falls back to Firecrawl in that case.

const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/120.0 Safari/537.36";

function stripChrome(html: string): string {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[\s\S]*?<\/style>/gi, "")
    .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, "")
    .replace(/<nav\b[\s\S]*?<\/nav>/gi, "")
    .replace(/<header\b[\s\S]*?<\/header>/gi, "")
    .replace(/<footer\b[\s\S]*?<\/footer>/gi, "")
    .replace(/<aside\b[\s\S]*?<\/aside>/gi, "")
    .replace(/<form\b[\s\S]*?<\/form>/gi, "");
}

function htmlToText(html: string): string {
  return stripChrome(html)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h[1-6])>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/[ \t]+/g, " ")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function extractMain(html: string): string {
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
  if (main) return htmlToText(main[1]);

  const article = html.match(/<article\b[^>]*>([\s\S]*?)<\/article>/i);
  if (article) return htmlToText(article[1]);

  // common job-board content class hints
  const ASHBY_RE = /<div[^>]*data-ashby-section[^>]*>([\s\S]*?)<\/div>/i;
  const ashby = html.match(ASHBY_RE);
  if (ashby) return htmlToText(ashby[1]);

  return htmlToText(html);
}

export interface DirectScrapeResult {
  text: string;
  contentType?: string;
}

export async function directScrape(url: string): Promise<DirectScrapeResult> {
  const resp = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT,
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5",
    },
    redirect: "follow",
  });

  if (!resp.ok) {
    throw new Error(`direct_fetch_http_${resp.status}`);
  }
  const contentType = resp.headers.get("content-type") ?? undefined;
  if (contentType && !contentType.toLowerCase().includes("html")) {
    throw new Error(`direct_fetch_non_html: ${contentType}`);
  }

  const html = await resp.text();
  const text = extractMain(html);
  return { text, contentType };
}
