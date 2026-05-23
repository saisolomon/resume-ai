import { NextResponse } from "next/server";

// Lightweight health probe for uptime monitoring + smoke tests. No auth,
// no Convex round-trip — just confirms the Next.js process is alive and
// echoes the configured Convex URL so monitoring can verify the deploy
// is pointed at the right backend.
export async function GET() {
  return NextResponse.json({
    ok: true,
    convex: process.env.NEXT_PUBLIC_CONVEX_URL ?? null,
    env: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "development",
    commit: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
}
