"use node";

export interface FirecrawlResult {
  text: string;
  title?: string;
  company?: string;
  raw: unknown;
}

export async function firecrawlScrape(url: string): Promise<FirecrawlResult> {
  const key = process.env.FIRECRAWL_API_KEY;
  if (!key) throw new Error("FIRECRAWL_API_KEY not set");

  const resp = await fetch("https://api.firecrawl.dev/v1/scrape", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url,
      formats: ["markdown"],
      onlyMainContent: true,
      timeout: 25000,
    }),
  });

  if (!resp.ok) {
    throw new Error(`Firecrawl HTTP ${resp.status}: ${await resp.text()}`);
  }
  const json = (await resp.json()) as {
    success: boolean;
    data?: {
      markdown?: string;
      metadata?: { title?: string; ogSiteName?: string };
    };
    error?: string;
  };
  if (!json.success || !json.data?.markdown) {
    throw new Error(`Firecrawl failed: ${json.error ?? "no markdown returned"}`);
  }
  return {
    text: json.data.markdown,
    title: json.data.metadata?.title,
    company: json.data.metadata?.ogSiteName,
    raw: json,
  };
}
