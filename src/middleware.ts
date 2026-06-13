import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/run(.*)",
  "/settings(.*)",
  "/workspace(.*)",
  "/new(.*)",
  "/linkedin(.*)",
  "/compare(.*)",
  "/api/download(.*)",
  "/api/claim(.*)",
  "/api/account(.*)",
  "/api/stripe/checkout(.*)",
  "/api/stripe/portal(.*)",
]);

// Hosts that 308-redirect to the canonical apex. The old Vercel prod
// alias and the www subdomain both fold into jdresumes.com so there's
// a single canonical origin for SEO + share links. Per-deployment
// preview URLs (resume-<hash>-…vercel.app) are deliberately NOT matched
// — they must stay reachable for testing a specific build.
const REDIRECT_HOSTS = new Set([
  "resume-ai-kappa-rouge.vercel.app",
  "www.jdresumes.com",
]);

function canonicalRedirect(req: NextRequest): NextResponse | null {
  const host = req.headers.get("host");
  if (host && REDIRECT_HOSTS.has(host)) {
    const url = new URL(req.url);
    url.protocol = "https:";
    url.hostname = "jdresumes.com";
    url.port = "";
    return NextResponse.redirect(url, 308);
  }
  return null;
}

// Public routes for the v2 anonymous demo: /, /try/*, /sign-in, /sign-up
const handler = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  ? clerkMiddleware(async (auth, req) => {
      const redirect = canonicalRedirect(req);
      if (redirect) return redirect;
      if (isProtectedRoute(req)) {
        await auth.protect();
      }
    })
  : (req: NextRequest) => canonicalRedirect(req) ?? NextResponse.next();

export default handler;

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
