import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/settings(.*)",
  "/templates(.*)",
  "/api/resumes(.*)",
  "/api/upload(.*)",
  "/api/generate-pdf(.*)",
  "/api/download(.*)",
  "/api/claim(.*)",
  "/api/stripe/checkout(.*)",
  "/api/stripe/portal(.*)",
  "/api/usage(.*)",
]);

// Public routes for the v2 anonymous demo: /, /try/*, /sign-in, /sign-up
const handler = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  ? clerkMiddleware(async (auth, req) => {
      if (isProtectedRoute(req)) {
        await auth.protect();
      }
    })
  : () => NextResponse.next();

export default handler;

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
