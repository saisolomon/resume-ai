# Launch Hardening Implementation Plan (Plan 3 of 3)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

> **Note:** Tasks 1-9 below are specified in full detail. Tasks 10-15 are scoped at the wave/task-list level and should be expanded into full TDD steps right before execution, since their implementation depends on Plan 2's final state (which files exist, exact env var names, etc.).

**Goal:** Make the v2 product production-grade: abuse protection, cost circuit breaker, anonymous data retention, privacy policy, sample-run demo strip, and a clean Convex deploy-key build. After this plan, the product is launch-ready.

**Architecture:** Add five layers of anonymous-flow defense (fingerprint rate limit, IP velocity guard, captcha, result cache, global circuit breaker) without touching the happy path. Schedule a daily Convex cron to hard-delete anonymous data older than 30 days. Replace the committed `convex/_generated` shortcut with the canonical `npx convex deploy --cmd "next build"` Vercel build. Ship the long-tail polish (privacy policy, ToS, sample-run on landing) for launch.

**Tech Stack:** Convex (scheduled functions, rate-limit table, HTTP actions), Cloudflare Turnstile (captcha), Next.js, vitest.

**Spec:** [docs/superpowers/specs/2026-05-21-resume-ai-redesign-design.md](../specs/2026-05-21-resume-ai-redesign-design.md) — Section 6

**Predecessors:** [Plan 1](2026-05-21-anonymous-demo-mvp.md) (merged) + [Plan 2](2026-05-21-signed-in-and-pricing.md)

---

## File Structure

**New Convex files:**

```
convex/
  rateLimit.ts                  recordUsage internalMutation + checkFingerprintLimit query +
                                checkIpVelocity query
  costGuard.ts                  recordTokenSpend internalMutation + isCircuitOpen query
  retention.ts                  deleteExpiredAnonymousData cron + supporting helpers
  crons.ts                      cron registry (calls retention.deleteExpiredAnonymousData daily)
```

**New Next.js files:**

```
src/app/
  privacy/page.tsx              Privacy policy (static)
  terms/page.tsx                Terms of service (static)
  api/captcha/verify/route.ts   Turnstile server-side verify

src/components/
  landing/CaptchaWidget.tsx     Cloudflare Turnstile widget (conditionally rendered)
  landing/DemoStrip.tsx         "Frozen" 4-card sample below the hero
```

**Modified:**

- `src/components/landing/Hero.tsx` — wire captcha + show DemoStrip below
- `src/middleware.ts` — add `/privacy`, `/terms` to public matcher (no-op since middleware already lets all `/*` through)
- `convex/runsActions.ts` — call `recordUsage` + check `checkFingerprintLimit` + check `isCircuitOpen` before scheduling
- `package.json` — switch build to `npx convex deploy --cmd 'next build'`
- `.gitignore` — re-ignore `convex/_generated` (delete committed files)

---

## Phase G — Anonymous Rate Limit + IP Velocity

### Task 1: Schema — add `lastRunByFingerprint` table (or extend usageEvents)

**Files:**
- Modify: `convex/schema.ts`

The spec calls for a sliding-window check: 1 run / 24h, 3 runs / 7 days per `fingerprintHash`. We can compute this from existing `usageEvents` by counting `type: "anonymous_run_started"` entries in the window, indexed by `fingerprintHash`. The existing `by_fingerprint_type` index supports this directly.

- [ ] **Step 1: No schema change needed — reuse `usageEvents`**

Confirm existing schema already supports the query:

```ts
usageEvents: defineTable({...})
  .index("by_fingerprint_type", ["fingerprintHash", "type"])
```

Yes. Move to Task 2.

---

### Task 2: rateLimit.ts — checkFingerprintLimit + recordRun

**Files:**
- Create: `convex/rateLimit.ts`
- Create: `convex/rateLimit.test.ts` (vitest)

- [ ] **Step 1: Tests**

```typescript
// convex/rateLimit.test.ts
import { describe, it, expect } from "vitest";
import { isOverLimit } from "./rateLimit";

describe("isOverLimit", () => {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  it("0 prior runs — under limit", () => {
    expect(isOverLimit([], now)).toBe(false);
  });

  it("1 run within 24h — over daily limit", () => {
    expect(isOverLimit([now - 60_000], now)).toBe(true);
  });

  it("1 run yesterday — under daily but counts toward weekly", () => {
    expect(isOverLimit([now - 25 * 60 * 60 * 1000], now)).toBe(false);
  });

  it("3 runs in last 7 days — over weekly limit", () => {
    const t = [now - day * 6, now - day * 4, now - day * 2];
    expect(isOverLimit(t, now)).toBe(true);
  });

  it("4th run after 8 days — under weekly", () => {
    const t = [now - day * 8, now - day * 6, now - day * 4];
    expect(isOverLimit(t, now)).toBe(false);
  });
});
```

- [ ] **Step 2: Implementation**

```typescript
// convex/rateLimit.ts
import { query, internalMutation } from "./_generated/server";
import { v } from "convex/values";

const DAY = 24 * 60 * 60 * 1000;
const WEEK = 7 * DAY;
const DAILY_LIMIT = 1;
const WEEKLY_LIMIT = 3;

// pure helper — exported for unit testing
export function isOverLimit(timestamps: number[], now: number): boolean {
  const last24h = timestamps.filter((t) => now - t < DAY).length;
  const last7d = timestamps.filter((t) => now - t < WEEK).length;
  return last24h >= DAILY_LIMIT || last7d >= WEEKLY_LIMIT;
}

export const checkFingerprintLimit = query({
  args: { fingerprintHash: v.string() },
  handler: async (ctx, { fingerprintHash }) => {
    const events = await ctx.db
      .query("usageEvents")
      .withIndex("by_fingerprint_type", (q) =>
        q.eq("fingerprintHash", fingerprintHash).eq("type", "anonymous_run_started"),
      )
      .collect();
    const timestamps = events.map((e) => e._creationTime);
    return { isOverLimit: isOverLimit(timestamps, Date.now()) };
  },
});

export const recordAnonymousRun = internalMutation({
  args: { fingerprintHash: v.string(), runId: v.id("runs") },
  handler: async (ctx, args) => {
    await ctx.db.insert("usageEvents", {
      fingerprintHash: args.fingerprintHash,
      type: "anonymous_run_started",
      runId: args.runId,
    });
  },
});
```

- [ ] **Step 3: Verify + deploy + commit**

```bash
cd /Users/saisolomon/dev/resume-ai
npx vitest run convex/rateLimit.test.ts
CONVEX_DEPLOYMENT=prod:blissful-butterfly-235 npx convex deploy
git add convex/rateLimit.ts convex/rateLimit.test.ts convex/_generated/
git commit -m "Add anonymous rate limit: 1 run/24h, 3 runs/7d per fingerprint"
```

---

### Task 3: Wire rate limit into startRun

**Files:**
- Modify: `convex/runsActions.ts`

- [ ] **Step 1: Add check at start of handler**

```typescript
// in startRun handler, BEFORE resolveJobDescription:
const identity = await ctx.auth.getUserIdentity();
if (!identity) {
  // anonymous — enforce fingerprint limit
  const { isOverLimit } = await ctx.runQuery(api.rateLimit.checkFingerprintLimit, {
    fingerprintHash: args.fingerprintHash,
  });
  if (isOverLimit) {
    throw new Error("rate_limit_exceeded: You've used your free runs. Sign up free for unlimited.");
  }
}
```

After `insertRun`, record the event:

```typescript
if (!identity) {
  await ctx.runMutation(internal.rateLimit.recordAnonymousRun, {
    fingerprintHash: args.fingerprintHash,
    runId,
  });
}
```

- [ ] **Step 2: Deploy + commit**

```bash
cd /Users/saisolomon/dev/resume-ai
CONVEX_DEPLOYMENT=prod:blissful-butterfly-235 npx convex deploy
git add convex/runsActions.ts
git commit -m "startRun: enforce anonymous fingerprint rate limit + record event"
```

---

## Phase H — Result Cache + Circuit Breaker

### Task 4: Result cache check

**Files:**
- Modify: `convex/runsActions.ts`

- [ ] **Step 1: Add cache check after resumeId + jdId resolved**

```typescript
// after resolving jdId, before insertRun:
if (!identity) {
  // check for existing run with same (fingerprintHash, resumeId, jdId)
  const fingerprintRuns = await ctx.runQuery(api.runs.findByFingerprintAndIds, {
    fingerprintHash: args.fingerprintHash,
    resumeId: args.resumeId,
    jobDescriptionId: jdId,
  });
  if (fingerprintRuns) return fingerprintRuns._id;
}
```

- [ ] **Step 2: Add `findByFingerprintAndIds` query to convex/runs.ts**

```typescript
export const findByFingerprintAndIds = query({
  args: {
    fingerprintHash: v.string(),
    resumeId: v.id("resumes"),
    jobDescriptionId: v.id("jobDescriptions"),
  },
  handler: async (ctx, args) => {
    const runs = await ctx.db
      .query("runs")
      .withIndex("by_fingerprint", (q) => q.eq("fingerprintHash", args.fingerprintHash))
      .collect();
    return runs.find(
      (r) => r.resumeId === args.resumeId && r.jobDescriptionId === args.jobDescriptionId,
    ) ?? null;
  },
});
```

- [ ] **Step 3: Deploy + commit**

```bash
cd /Users/saisolomon/dev/resume-ai
CONVEX_DEPLOYMENT=prod:blissful-butterfly-235 npx convex deploy
git add convex/runsActions.ts convex/runs.ts convex/_generated/
git commit -m "startRun: result cache — return existing run for same (fp, resume, jd) triple"
```

---

### Task 5: Daily cost circuit breaker

**Files:**
- Create: `convex/costGuard.ts`
- Modify: `convex/ai/runAngle.ts` (record token spend after each generation)
- Modify: `convex/runsActions.ts` (check breaker before scheduling)

- [ ] **Step 1: costGuard.ts**

```typescript
// convex/costGuard.ts
import { query, internalMutation } from "./_generated/server";
import { v } from "convex/values";

const DAILY_USD_CAP = 50;
// approximate $/1M tokens (Sonnet 4.6): in=$3, out=$15. Haiku 4.5: in=$0.80, out=$4.
const SONNET_IN_PER_M = 3;
const SONNET_OUT_PER_M = 15;
const HAIKU_IN_PER_M = 0.8;
const HAIKU_OUT_PER_M = 4;

export function approxCostUsd(args: {
  model: "sonnet" | "haiku";
  inputTokens: number;
  outputTokens: number;
}): number {
  const i = args.inputTokens / 1_000_000;
  const o = args.outputTokens / 1_000_000;
  if (args.model === "sonnet") return i * SONNET_IN_PER_M + o * SONNET_OUT_PER_M;
  return i * HAIKU_IN_PER_M + o * HAIKU_OUT_PER_M;
}

export const recordTokenSpend = internalMutation({
  args: {
    model: v.union(v.literal("sonnet"), v.literal("haiku")),
    inputTokens: v.number(),
    outputTokens: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("usageEvents", {
      type: "token_spend",
      metadata: {
        model: args.model,
        inputTokens: args.inputTokens,
        outputTokens: args.outputTokens,
        usd: approxCostUsd(args),
      },
    });
  },
});

export const isCircuitOpen = query({
  args: {},
  handler: async (ctx) => {
    const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const events = await ctx.db
      .query("usageEvents")
      .filter((q) => q.and(q.eq(q.field("type"), "token_spend"), q.gte(q.field("_creationTime"), dayAgo)))
      .collect();
    const total = events.reduce((sum, e) => sum + (((e.metadata as { usd?: number })?.usd) ?? 0), 0);
    return { open: total >= DAILY_USD_CAP, todaysUsd: total, capUsd: DAILY_USD_CAP };
  },
});
```

- [ ] **Step 2: Record spend after each AI call**

In `convex/ai/runAngle.ts` after the Sonnet `messages.create` call:

```typescript
await ctx.runMutation(internal.costGuard.recordTokenSpend, {
  model: "sonnet",
  inputTokens: resp.usage.input_tokens,
  outputTokens: resp.usage.output_tokens,
});
```

Repeat in `convex/ai/score.ts` (scoreNarrative Haiku call), `convex/scrape/extract.ts` (Haiku), and `convex/resumesActions.ts` (Sonnet structuring call).

- [ ] **Step 3: Check breaker in startRun**

In `convex/runsActions.ts` before scheduling generations, after the rate limit check:

```typescript
const breaker = await ctx.runQuery(api.costGuard.isCircuitOpen, {});
if (breaker.open && !identity) {
  throw new Error(
    `circuit_open: We're experiencing high demand ($${breaker.todaysUsd.toFixed(2)}/$${breaker.capUsd}). Sign up for guaranteed access.`,
  );
}
```

Signed-in users bypass the breaker (paying customers get priority).

- [ ] **Step 4: Deploy + commit**

```bash
cd /Users/saisolomon/dev/resume-ai
CONVEX_DEPLOYMENT=prod:blissful-butterfly-235 npx convex deploy
git add convex/costGuard.ts convex/ai/runAngle.ts convex/ai/score.ts convex/scrape/extract.ts convex/resumesActions.ts convex/runsActions.ts convex/_generated/
git commit -m "Add daily cost circuit breaker (\$50/day cap) — anonymous users blocked above cap"
```

---

## Phase I — Captcha (Cloudflare Turnstile)

### Task 6: Set up Turnstile site + secret keys

**Files:**
- Modify: `.env.local`, `.env.local.example`

User-side action:
1. Sign up at [dash.cloudflare.com](https://dash.cloudflare.com) → Turnstile → Add Site
2. Domain: production Vercel domain + `localhost` for dev
3. Mode: Invisible
4. Get Site Key (public) + Secret Key (server-side)

- [ ] **Step 1: Add to env**

```
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
```

Set on Vercel (Preview + Production) and on Convex prod.

---

### Task 7: Captcha widget + verify endpoint

**Files:**
- Create: `src/components/landing/CaptchaWidget.tsx`
- Create: `src/app/api/captcha/verify/route.ts`
- Modify: `src/components/landing/Hero.tsx`

- [ ] **Step 1: CaptchaWidget**

```tsx
// src/components/landing/CaptchaWidget.tsx
"use client";
import { useEffect, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id: string) => void;
    };
  }
}

export function CaptchaWidget({ onToken }: { onToken: (token: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    script.onload = () => {
      window.turnstile?.render(ref.current!, {
        sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
        callback: onToken,
        appearance: "interaction-only",
      });
    };
    document.body.appendChild(script);
    return () => {
      script.remove();
    };
  }, [onToken]);

  return <div ref={ref} className="cf-turnstile" />;
}
```

- [ ] **Step 2: Verify endpoint**

```typescript
// src/app/api/captcha/verify/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { token } = (await req.json()) as { token: string };
  const secret = process.env.TURNSTILE_SECRET_KEY!;

  const resp = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `secret=${encodeURIComponent(secret)}&response=${encodeURIComponent(token)}`,
  });
  const data = (await resp.json()) as { success: boolean };
  return NextResponse.json({ verified: data.success });
}
```

- [ ] **Step 3: Wire into Hero**

Trigger captcha only when needed (second run from same fingerprint, or via a "challenge requested" flag from the server). Simplest v1: render captcha on ALL anonymous submissions but in "interaction-only" mode so most users never see it.

```tsx
// in Hero.tsx, add state:
const [captchaToken, setCaptchaToken] = useState<string | null>(null);

// in handleSubmit, before generateUploadUrl call:
if (!captchaToken) {
  setError("Please complete the verification.");
  return;
}
const verify = await fetch("/api/captcha/verify", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ token: captchaToken }),
});
const { verified } = await verify.json();
if (!verified) {
  setError("Verification failed. Try again.");
  return;
}

// add CaptchaWidget before the submit button:
<CaptchaWidget onToken={setCaptchaToken} />
```

- [ ] **Step 4: Commit**

```bash
cd /Users/saisolomon/dev/resume-ai
git add src/components/landing/CaptchaWidget.tsx src/app/api/captcha/verify/route.ts src/components/landing/Hero.tsx
git commit -m "Add Cloudflare Turnstile captcha (interaction-only) on anonymous submissions"
```

---

## Phase J — Retention Cron

### Task 8: retention.ts + cron registration

**Files:**
- Create: `convex/retention.ts`
- Create: `convex/crons.ts`

- [ ] **Step 1: retention.ts**

```typescript
// convex/retention.ts
"use node";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";

const RETENTION_MS = 30 * 24 * 60 * 60 * 1000;

export const deleteExpiredAnonymousData = internalAction({
  args: {},
  handler: async (ctx) => {
    const cutoff = Date.now() - RETENTION_MS;
    const result = await ctx.runMutation(internal.retention._deleteExpired, { cutoff });
    console.log(`retention sweep: deleted ${result.deletedRuns} runs, ${result.deletedResumes} resumes`);
    return result;
  },
});
```

- [ ] **Step 2: Internal mutation that does the deletion**

```typescript
// add to convex/retention.ts (without "use node")
import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const _deleteExpired = internalMutation({
  args: { cutoff: v.number() },
  handler: async (ctx, { cutoff }) => {
    let deletedRuns = 0;
    let deletedResumes = 0;

    // anonymous runs (no userId) older than cutoff
    const oldRuns = await ctx.db
      .query("runs")
      .filter((q) => q.and(q.eq(q.field("userId"), undefined), q.lt(q.field("_creationTime"), cutoff)))
      .collect();
    for (const run of oldRuns) {
      const cards = await ctx.db.query("cards").withIndex("by_run", (q) => q.eq("runId", run._id)).collect();
      for (const card of cards) await ctx.db.delete(card._id);
      await ctx.db.delete(run._id);
      deletedRuns++;
    }

    // anonymous resumes (no userId, no recent run reference) older than cutoff
    const oldResumes = await ctx.db
      .query("resumes")
      .filter((q) => q.and(q.eq(q.field("userId"), undefined), q.lt(q.field("_creationTime"), cutoff)))
      .collect();
    for (const r of oldResumes) {
      if (r.storageId) await ctx.storage.delete(r.storageId);
      await ctx.db.delete(r._id);
      deletedResumes++;
    }

    return { deletedRuns, deletedResumes };
  },
});
```

- [ ] **Step 3: crons.ts**

```typescript
// convex/crons.ts
import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.daily(
  "anonymous_data_retention",
  { hourUTC: 6, minuteUTC: 0 }, // 6am UTC = 1am ET, low traffic
  internal.retention.deleteExpiredAnonymousData,
);

export default crons;
```

- [ ] **Step 4: Deploy + commit**

```bash
cd /Users/saisolomon/dev/resume-ai
CONVEX_DEPLOYMENT=prod:blissful-butterfly-235 npx convex deploy
git add convex/retention.ts convex/crons.ts convex/_generated/
git commit -m "Add daily retention cron — hard-delete anonymous data older than 30 days"
```

---

## Phase K — Privacy Policy + ToS

### Task 9: Static legal pages

**Files:**
- Create: `src/app/privacy/page.tsx`
- Create: `src/app/terms/page.tsx`
- Modify: `src/app/page.tsx` (footer with links)
- Modify: `src/app/pricing/page.tsx` (footer with links)

- [ ] **Step 1: Privacy policy**

```tsx
// src/app/privacy/page.tsx
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <nav className="flex h-14 items-center border-b border-neutral-900 px-6">
        <Link href="/" className="text-lg font-semibold tracking-tight">resume.ai</Link>
      </nav>
      <article className="max-w-2xl mx-auto px-6 py-12 prose prose-invert">
        <h1>Privacy Policy</h1>
        <p>Last updated: 2026-05-21</p>

        <h2>What we collect</h2>
        <ul>
          <li><b>Anonymous users:</b> a hashed browser fingerprint (no PII), the job URL you submit, your uploaded resume content. We retain this for 30 days, then hard-delete.</li>
          <li><b>Signed-in users:</b> the above plus your email (via Clerk) and, if you subscribe, your Stripe customer ID. We retain this until you delete your account.</li>
          <li><b>Job descriptions:</b> we cache the scraped text by URL, shared across all users — they're public postings.</li>
        </ul>

        <h2>What we share</h2>
        <ul>
          <li><b>Anthropic:</b> your resume + JD content is sent to Anthropic's Claude API to generate the tailored output. Anthropic does not retain or train on your data per their API terms.</li>
          <li><b>Firecrawl:</b> the job URL is sent to Firecrawl to scrape the JD.</li>
          <li><b>Clerk:</b> handles authentication.</li>
          <li><b>Stripe:</b> handles payment.</li>
          <li><b>Convex / Vercel / Cloudflare:</b> infrastructure providers (database, hosting, captcha).</li>
        </ul>

        <h2>Your rights</h2>
        <p>Sign in and visit <Link href="/settings">Settings → Danger zone</Link> to permanently delete your account and all your data.</p>

        <h2>Contact</h2>
        <p>Questions about this policy: <a href="mailto:hi@resume.ai">hi@resume.ai</a></p>
      </article>
    </main>
  );
}
```

- [ ] **Step 2: ToS**

Similar structure with terms-of-use content. (Engineer can use plain language ToS — no need for legalese.)

- [ ] **Step 3: Footer links**

Add to landing and pricing pages:

```tsx
<footer className="border-t border-neutral-900 py-6 px-6 mt-12 text-sm text-neutral-500">
  <div className="max-w-6xl mx-auto flex justify-between">
    <span>© 2026 resume.ai</span>
    <div className="flex gap-4">
      <Link href="/privacy" className="hover:text-white">Privacy</Link>
      <Link href="/terms" className="hover:text-white">Terms</Link>
      <a href="mailto:hi@resume.ai" className="hover:text-white">Contact</a>
    </div>
  </div>
</footer>
```

- [ ] **Step 4: Commit**

```bash
cd /Users/saisolomon/dev/resume-ai
git add src/app/privacy/page.tsx src/app/terms/page.tsx src/app/page.tsx src/app/pricing/page.tsx
git commit -m "Add privacy + terms pages, link from landing/pricing footers"
```

---

## Phase L — Sample-Run Demo Strip

### Task 10: DemoStrip component + frozen run data (outline)

**Scope:** Add a "below-the-fold" 4-card sample to the landing page so visitors who don't immediately submit can still see what the output looks like.

**Sketch:**

- Generate a real run against a popular JD (e.g., Anthropic SWE) using a sample resume
- Export the resulting `ResumeData` + `AtsScore` for each of the 4 cards
- Hard-code them into a `src/data/demoRun.ts` constant
- Render below the hero with explanatory copy: "Here's what an actual run looks like — for the Anthropic SWE role:"

**Tasks to expand later:**

1. Generate the sample run, snapshot the 4 card payloads
2. Write `src/data/demoRun.ts` exporting `DEMO_CARDS: DemoCard[]`
3. Build `<DemoStrip>` component rendering 4 `CardTile` clones with the frozen data
4. Add to `src/app/page.tsx` below the hero
5. Add a "This is a real run from a real resume against a real JD" caption

**Expand into 5 full TDD tasks before execution.**

---

## Phase M — Proper Convex Deploy Key Build

### Task 11: Switch Vercel build to use CONVEX_DEPLOY_KEY (outline)

**Scope:** Replace the Plan-1 shortcut of committing `convex/_generated` with the canonical `npx convex deploy --cmd 'next build'` Vercel build. This deploys Convex AND runs Next.js build in a single command, with `NEXT_PUBLIC_CONVEX_URL` auto-injected.

**Steps (expand into full tasks before execution):**

1. Generate `CONVEX_DEPLOY_KEY` in [dashboard.convex.dev](https://dashboard.convex.dev) → project → Settings → URL & Deploy Key → "Generate Production Deploy Key"
2. Set `CONVEX_DEPLOY_KEY` on Vercel (Production only, not Preview — preview uses a different "preview deploy key" if we want per-PR Convex)
3. Update `package.json` build: `"build": "next build"` (no change; Convex CLI invokes it via --cmd)
4. Add a `vercel.json` (or use UI) to override the build command: `npx convex deploy --cmd 'next build' --cmd-url-env-var-name NEXT_PUBLIC_CONVEX_URL`
5. Re-add `convex/_generated` to `.gitignore`
6. `git rm -r --cached convex/_generated` to untrack
7. Verify Vercel build succeeds end-to-end

**Risk:** If we mess up the deploy key or build command, ALL Vercel builds will fail. Keep the Plan-1 fallback (committed _generated) until verified working in a preview build.

---

## Phase N — v1 User Migration (only if v1 has real users)

### Task 12: Audit v1 Postgres for live data (outline)

**Scope:** If the v1 production deployment had real users (which we don't know without inspecting), migrate their `User`, `Resume`, `Subscription` data into Convex.

**Steps:**

1. Connect to v1 Postgres via Vercel Postgres console or `psql`
2. Count rows in `User`, `Resume`, `Subscription`
3. If counts > 0: write a one-shot Convex action that reads from Postgres (via env var DATABASE_URL) and inserts into Convex tables, mapping `clerkId` → existing Convex `users` row or creating new
4. If counts == 0: skip migration entirely; delete `DATABASE_URL` env var from Vercel; close out

**Expand into full tasks once row counts are known.**

---

## Phase O — Stripe Hooks for Account Delete

### Task 13: Cancel subscription on account delete (outline)

**Scope:** Plan 2's account-delete mutation removes Convex + Clerk records but leaves Stripe subscriptions active. Add a Stripe cancel call.

**Steps:**

1. In `convex/cleanup.deleteCurrentUser`, before deleting the user, fetch any active subscription
2. Call `stripe.subscriptions.cancel(stripeSubscriptionId)` (requires `STRIPE_SECRET_KEY` available to Convex — already set in Plan 2)
3. Then proceed with the cascade delete

**Trivial — expand into one task.**

---

## Phase P — Indexed Run-Count Query

### Task 14: Replace listMyRuns-based run-limit check (outline)

**Scope:** Plan 2 Task 18 reused `listMyRuns` to count weekly runs, which scales poorly. Replace with a dedicated indexed count.

**Steps:**

1. Add a query `convex/dashboard.countMyRunsSince(sinceMs: number)` using `by_user` index, then filter by `_creationTime >= sinceMs` and call `.length`
2. Update the rate-limit check in `startRun` to call this instead of `listMyRuns`

**Trivial — expand into one task.**

---

## Phase Q — Final Production Polish

### Task 15: Health check + small launch polish (outline)

**Scope:**

- Add `/api/health` route returning `{ ok: true, convex: <url>, env: production }` for uptime monitoring
- Verify Sentry or similar error tracker if user wants one (optional)
- Final smoke test against the production URL
- Open PR + merge to main

---

## Self-Review

**Spec coverage (§6 Abuse Protection & Cost Model):**

- [x] Layer 1: Fingerprint rate limit (Tasks 2-3)
- [x] Layer 2: IP velocity guard — _missing_ — add as Task 3b: track IP hashes (with rotating daily salt) in `usageEvents`, query the last hour, throttle if >5 distinct fingerprints from same IP
- [x] Layer 3: Captcha gate (Tasks 6-7) — currently always-on; spec calls for triggered captcha (only on 2nd run, flagged IP, etc.). Promote to "always-on interaction-only" for v1 simplicity, tighten in v1.1
- [x] Layer 4: Result cache (Task 4)
- [x] Layer 5: Global circuit breaker (Task 5)
- [x] Privacy & retention (Task 8 — cron + Task 9 — policy page)

**Open items to expand before execution:**

- Task 3b — IP velocity guard, not yet in plan
- Tasks 10-15 — outlines only, expand to full TDD steps

**Known sharp edges:**

- The cost circuit breaker assumes accurate per-call token usage from Anthropic SDK (`resp.usage.input_tokens` etc.) — verify SDK actually exposes these in the version we're using
- Retention cron runs at 6am UTC — if Convex deployment is in a different region, it still fires at UTC time
- Captcha as "always on, interaction-only" is the simplest gate but means a tiny perf cost on every submit; if it bothers users, switch to triggered (server returns `{captcha_required: true}` on second run from same fp)
- Privacy page is a template — real legal review is your call before launch
