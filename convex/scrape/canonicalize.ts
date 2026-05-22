const TRACKING_PARAMS = new Set([
  "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content",
  "ref", "referrer", "fbclid", "gclid", "msclkid",
  "source", "src",
]);

export function canonicalizeJobUrl(input: string): string {
  const url = new URL(input);
  url.hostname = url.hostname.toLowerCase();
  url.hash = "";

  const kept = new URLSearchParams();
  for (const [k, val] of url.searchParams) {
    if (!TRACKING_PARAMS.has(k.toLowerCase())) kept.set(k, val);
  }
  url.search = kept.toString();

  let str = url.toString();
  if (str.endsWith("/") && url.pathname !== "/") str = str.slice(0, -1);
  return str;
}
