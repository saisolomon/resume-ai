import type { MetadataRoute } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://jdresumes.com";

/**
 * robots.txt — public marketing routes are crawlable; auth-gated and
 * API surfaces stay out of the index. Sitemap pointer lives here so
 * Google / Bing pick it up without a Search Console submission.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/dashboard",
          "/dashboard/",
          "/run/",
          "/try/",
          "/settings",
          "/sign-in",
          "/sign-up",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
