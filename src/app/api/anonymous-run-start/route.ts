import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { createHash } from "crypto";
import type { FunctionReference } from "convex/server";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";

// Local references to new convex modules (ipVelocity) that are NOT yet in
// the committed `_generated/api.d.ts`. The runtime `api` export is
// `anyApi`, so these dispatch fine — we only need types here. After
// Phase M moves _generated/ to gitignore and CI regenerates, these can be
// removed in favor of the regenerated typed references.
const ipVelocityApi = {
  checkIpVelocity: (api as unknown as {
    ipVelocity: {
      checkIpVelocity: FunctionReference<
        "query",
        "public",
        { ipHash: string; fingerprintHash: string },
        { isOverIpVelocity: boolean }
      >;
    };
  }).ipVelocity.checkIpVelocity,
  recordIpSeen: (api as unknown as {
    ipVelocity: {
      recordIpSeen: FunctionReference<
        "mutation",
        "public",
        { ipHash: string; fingerprintHash: string },
        null
      >;
    };
  }).ipVelocity.recordIpSeen,
};

function todayUTC(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(
    d.getUTCDate(),
  ).padStart(2, "0")}`;
}

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
  const body = (await req.json()) as {
    resumeId: string;
    jdUrl: string;
    fingerprintHash: string;
  };

  const salt = process.env.FINGERPRINT_SALT;
  if (!salt) {
    return NextResponse.json({ error: "server_misconfigured" }, { status: 500 });
  }

  const ipHash = createHash("sha256")
    .update(`${salt}:${todayUTC()}:${clientIp(req)}`)
    .digest("hex");

  const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

  // IP velocity gate (anonymous only — sign-in skips this path entirely).
  // Throttles >5 distinct fingerprints/hour/IP to defeat trivial
  // fingerprint-rotation attacks against the per-fingerprint rate limit.
  const velocity = await convex.query(ipVelocityApi.checkIpVelocity, {
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
  await convex.mutation(ipVelocityApi.recordIpSeen, {
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
    // Map server-thrown error markers to clean responses.
    if (msg.includes("rate_limit_exceeded")) {
      return NextResponse.json({ error: msg }, { status: 429 });
    }
    return NextResponse.json({ error: "start_run_failed", detail: msg }, { status: 500 });
  }
}
