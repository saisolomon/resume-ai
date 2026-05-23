import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { hashIp, todayUTC } from "@/lib/ipHash";

function clientIp(req: NextRequest): string {
  // Vercel and most proxies set x-forwarded-for as a comma-separated list
  // where the left-most entry is the original client IP.
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}

export async function POST(req: NextRequest) {
  let body: { resumeId: string; jdUrl: string; fingerprintHash: string };
  try {
    body = await req.json();
    if (
      typeof body.resumeId !== "string" ||
      typeof body.jdUrl !== "string" ||
      typeof body.fingerprintHash !== "string"
    ) {
      throw new Error("missing required field");
    }
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const salt = process.env.FINGERPRINT_SALT;
  if (!salt) {
    return NextResponse.json({ error: "server_misconfigured" }, { status: 500 });
  }

  const ipHash = hashIp(clientIp(req), todayUTC(), salt);

  const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

  // IP velocity gate (anonymous only — sign-in skips this path entirely).
  // Throttles >5 distinct fingerprints/hour/IP to defeat trivial
  // fingerprint-rotation attacks against the per-fingerprint rate limit.
  const velocity = await convex.query(api.ipVelocity.checkIpVelocity, {
    ipHash,
    fingerprintHash: body.fingerprintHash,
  });
  if (velocity.isOverIpVelocity) {
    return NextResponse.json(
      {
        error:
          "ip_velocity_exceeded: Too many submissions from your network. Sign up for guaranteed access.",
      },
      { status: 429 },
    );
  }

  // Record BEFORE kicking off the run so the next request from this IP
  // sees the updated count even if startRun is slow.
  await convex.mutation(api.ipVelocity.recordIpSeen, {
    ipHash,
    fingerprintHash: body.fingerprintHash,
  });

  // Defer to existing startRun (which itself enforces the fingerprint
  // rate limit + circuit breaker).
  try {
    const runId = await convex.action(api.runsActions.startRun, {
      resumeId: body.resumeId as Id<"resumes">,
      jdUrl: body.jdUrl,
      fingerprintHash: body.fingerprintHash,
    });
    return NextResponse.json({ runId });
  } catch (err) {
    const msg = (err as Error).message;
    // Map server-thrown error markers to clean 429 responses. circuit_open
    // is added by Phase H — the daily $50 breaker rejects anonymous traffic
    // once the cap is hit. ip_velocity_exceeded is also a 429 surface, but
    // it short-circuits earlier in this route — see the velocity check above.
    const knownMarkers = ["rate_limit_exceeded", "circuit_open"];
    const matched = knownMarkers.find((m) => msg.includes(m));
    if (matched) return NextResponse.json({ error: msg }, { status: 429 });
    return NextResponse.json({ error: "start_run_failed", detail: msg }, { status: 500 });
  }
}
