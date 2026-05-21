"use node";

export interface ApifyResult {
  text: string;
  title?: string;
  company?: string;
  raw: unknown;
}

const ACTOR_BY_DOMAIN: Record<string, string> = {
  "linkedin.com": "bebity~linkedin-jobs-scraper",
  "workday.com": "apify/workday-scraper",
  "myworkdayjobs.com": "apify/workday-scraper",
  "indeed.com": "misceres/indeed-scraper",
};

const DEFAULT_ACTOR = "apify/web-scraper";

export function actorForDomain(host: string): string {
  for (const [k, actor] of Object.entries(ACTOR_BY_DOMAIN)) {
    if (host === k || host.endsWith("." + k)) return actor;
  }
  return DEFAULT_ACTOR;
}

export async function apifyScrape(url: string): Promise<ApifyResult> {
  const token = process.env.APIFY_API_TOKEN;
  if (!token) throw new Error("APIFY_API_TOKEN not set");

  const host = new URL(url).host.toLowerCase();
  const actor = actorForDomain(host);
  const startInput =
    actor === DEFAULT_ACTOR
      ? {
          startUrls: [{ url }],
          pageFunction:
            "async ({ request, $ }) => ({ url: request.url, text: $('body').text() })",
        }
      : { startUrls: [{ url }] };

  const runResp = await fetch(
    `https://api.apify.com/v2/acts/${encodeURIComponent(actor)}/run-sync-get-dataset-items?token=${token}&timeout=180`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(startInput),
    },
  );

  if (!runResp.ok) {
    throw new Error(`Apify HTTP ${runResp.status}: ${await runResp.text()}`);
  }
  const items = (await runResp.json()) as Array<Record<string, unknown>>;
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Apify returned no dataset items");
  }
  const first = items[0];
  const text =
    (first.description as string | undefined) ??
    (first.fullText as string | undefined) ??
    (first.text as string | undefined) ??
    JSON.stringify(first);

  return {
    text,
    title: first.title as string | undefined,
    company: (first.companyName ?? first.company) as string | undefined,
    raw: items,
  };
}
