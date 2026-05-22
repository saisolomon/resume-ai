# Anonymous Demo MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the anonymous-demo wedge — a public flow where someone pastes a JD URL, uploads a resume, sees 4 tailored cards with ATS scores progressively rendering in, clicks Download, hits a sign-up wall, and after signup gets their PDF.

**Architecture:** Add a Convex backend alongside the existing v1 Next.js scaffold (Prisma + v1 routes left untouched for now — Plan 2 migrates them). Convex actions orchestrate the scraping → generation → scoring pipeline. Four parallel `runAngle` scheduled functions write rows into a `cards` table that the frontend subscribes to via `useQuery`, giving progressive reveal without any SSE/streaming code. Sign-up wall reuses Clerk; on completion an `claimAnonymousRuns` mutation rewrites fingerprint-keyed rows to userId.

**Tech Stack:** Next.js 16 + React 19, Convex, Clerk, Anthropic SDK (Sonnet 4.6 + Haiku 4.5), Firecrawl + Apify, Tailwind v4, shadcn/ui, vitest.

**Spec:** [docs/superpowers/specs/2026-05-21-resume-ai-redesign-design.md](../specs/2026-05-21-resume-ai-redesign-design.md)

---

## File Structure

**New files (this plan):**

```
convex/
  schema.ts                       8 tables: users, resumes, jobDescriptions, runs, cards,
                                  chatMessages, subscriptions, usageEvents
  auth.config.ts                  Clerk JWT verification
  users.ts                        getCurrentUser query; ensureUser mutation
  resumes.ts                      generateUploadUrl mutation; finalizeResume mutation; getResume query
  jobDescriptions.ts              getByCanonicalUrl query; upsertJobDescription mutation
  runs.ts                         startRun action (orchestrator); getRun query
  cards.ts                        byRun query (drives progressive reveal); patchCard mutation
  scrape/firecrawl.ts             Firecrawl HTTP client
  scrape/apify.ts                 Apify HTTP client (run actor + poll + fetch dataset)
  scrape/canonicalize.ts          URL canonicalization (pure)
  scrape/canonicalize.test.ts
  scrape/extract.ts               extractJDFields — Haiku call
  scrape/routing.ts               scrapeJD with Firecrawl→Apify fallback
  ai/runAngle.ts                  Per-card generation action (Sonnet)
  ai/score.ts                     scoreCard orchestrator
  ai/anthropic.ts                 Convex-side Anthropic SDK setup

src/
  lib/fingerprint.ts              Browser fingerprint (canvas + UA + tz + screen)
  lib/ats/keyword.ts              Deterministic keyword scorer (pure)
  lib/ats/keyword.test.ts
  lib/ats/format.ts               Deterministic format safety scorer (pure)
  lib/ats/format.test.ts
  lib/ats/narrative.ts            Narrative-fit Haiku call (shared shape)
  lib/angles/registry.ts          4 angle definitions
  app/page.tsx                    REWRITE: new landing page
  app/try/page.tsx                Submit form (redirects to /try/[runId])
  app/try/[runId]/page.tsx        Progressive gallery
  app/try/[runId]/cards/[cardId]/page.tsx
                                  Full-screen card detail
  app/api/download/[cardId]/route.ts
                                  Auth-gated download endpoint (calls Convex, streams file)
  components/landing/Hero.tsx     Hook + 2 fields + CTA
  components/upload/ResumeDropzone.tsx
                                  Drag-drop file input
  components/try/CardSkeleton.tsx Loading state tile
  components/try/CardTile.tsx     Ready-state tile (thumbnail + score)
  components/try/CardDetail.tsx   Full-screen preview shell
  components/try/ScoreBadge.tsx   Color-coded chip
  components/try/ScoreBreakdown.tsx
                                  3-component panel
  components/try/DownloadButton.tsx
                                  Triggers sign-up wall if anonymous
  components/try/SignUpWall.tsx   Clerk modal wrapper
  components/try/ResumePreviewHtml.tsx
                                  HTML render of ResumeData per templateSlug
  providers/ConvexClerkProvider.tsx
                                  Convex + Clerk integration
```

**Modified files (this plan):**

- `package.json` — add `convex`, `@convex-dev/auth`, no other deps
- `next.config.ts` — env passthrough for Convex
- `.env.local.example` — add Convex / Firecrawl / Apify keys
- `src/middleware.ts` — allow anonymous on `/`, `/try`, `/try/*`
- `src/app/layout.tsx` — wrap in `ConvexClerkProvider`
- `src/lib/resume/types.ts` — add `KeywordAnalysis` exports if missing; no shape change

**Not touched this plan (Plan 2 migrates):**

- `prisma/schema.prisma`, `src/lib/db/*`, `src/app/api/resumes/*`, `src/app/api/upload/*`, `src/app/api/chat/*`, `src/app/(app)/*`, `src/app/pricing/*`, `src/app/builder/*`. These stay running on v1 Prisma during Plan 1.

---

## Phase 1 — Setup & Convex Infrastructure

### Task 1: Create feature branch + push spec

**Files:** none

- [ ] **Step 1: Create branch**

```bash
cd /Users/saisolomon/Desktop/resume-ai
git checkout -b feat/v2-anonymous-demo
```

- [ ] **Step 2: Push branch + spec to GitHub**

```bash
git push -u origin feat/v2-anonymous-demo
```

Expected: branch exists on GitHub with the spec + model-id fix already committed.

---

### Task 2: Install Convex dependency

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install convex**

```bash
npm install convex
```

- [ ] **Step 2: Verify install + commit**

```bash
git diff package.json package-lock.json | head -30
git add package.json package-lock.json
git commit -m "Add convex dependency"
```

Expected: `convex` shows in `dependencies` of package.json.

---

### Task 3: Initialize Convex in repo

**Files:**
- Create: `convex/_generated/*` (auto-generated, gitignored)
- Create: `convex.json` (optional, only if customizing)
- Modify: `.gitignore`

- [ ] **Step 1: Run convex codegen scaffold (offline mode — no auth yet)**

```bash
npx convex codegen --init
```

If `--init` prompts for login or deploy, skip with Ctrl-C — we'll do `convex dev` properly in Task 6 after schema exists. We just need the dir structure.

- [ ] **Step 2: If codegen didn't create the dir, manually create `convex/`**

```bash
mkdir -p convex
```

- [ ] **Step 3: Add to gitignore**

Append to `.gitignore`:

```
# Convex
convex/_generated
.convex
```

- [ ] **Step 4: Commit**

```bash
git add .gitignore
git commit -m "Scaffold convex dir + ignore generated files"
```

---

### Task 4: Add env var template

**Files:**
- Modify: `.env.local.example`

- [ ] **Step 1: Append to `.env.local.example`**

```bash
# Convex
NEXT_PUBLIC_CONVEX_URL=
CONVEX_DEPLOYMENT=

# Scraping
FIRECRAWL_API_KEY=
APIFY_API_TOKEN=

# Fingerprint salt (rotated weekly; min 32 chars)
FINGERPRINT_SALT=
```

- [ ] **Step 2: Commit**

```bash
git add .env.local.example
git commit -m "Add Convex + scraping env vars to example"
```

---

### Task 5: Define Convex schema (all 8 tables)

**Files:**
- Create: `convex/schema.ts`

- [ ] **Step 1: Write schema**

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    stripeCustomerId: v.optional(v.string()),
    tier: v.union(v.literal("free"), v.literal("pro"), v.literal("career")),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_stripe_customer", ["stripeCustomerId"]),

  resumes: defineTable({
    userId: v.optional(v.id("users")),
    fingerprintHash: v.optional(v.string()),
    title: v.string(),
    source: v.union(
      v.literal("pdf"),
      v.literal("docx"),
      v.literal("paste"),
      v.literal("linkedin"),
    ),
    rawText: v.string(),
    parsed: v.any(), // ResumeData JSON (validated at app boundary)
    storageId: v.optional(v.id("_storage")),
  })
    .index("by_user", ["userId"])
    .index("by_fingerprint", ["fingerprintHash"]),

  jobDescriptions: defineTable({
    sourceUrl: v.string(),
    canonicalUrl: v.string(),
    title: v.string(),
    company: v.string(),
    rawText: v.string(),
    parsed: v.object({
      requirements: v.array(v.string()),
      responsibilities: v.array(v.string()),
      keywords: v.array(v.string()),
      seniority: v.optional(v.string()),
      location: v.optional(v.string()),
    }),
    scraper: v.union(
      v.literal("firecrawl"),
      v.literal("apify"),
      v.literal("manual"),
    ),
    scrapedAt: v.number(),
  }).index("by_canonical_url", ["canonicalUrl"]),

  runs: defineTable({
    userId: v.optional(v.id("users")),
    fingerprintHash: v.optional(v.string()),
    resumeId: v.id("resumes"),
    jobDescriptionId: v.id("jobDescriptions"),
    status: v.union(
      v.literal("scraping"),
      v.literal("generating"),
      v.literal("ready"),
      v.literal("failed"),
    ),
    failureReason: v.optional(v.string()),
    completedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_fingerprint", ["fingerprintHash"]),

  cards: defineTable({
    runId: v.id("runs"),
    angle: v.union(
      v.literal("eng_depth"),
      v.literal("leadership"),
      v.literal("cross_functional"),
      v.literal("specialist"),
    ),
    angleLabel: v.string(),
    templateSlug: v.union(
      v.literal("classic"),
      v.literal("modern"),
      v.literal("creative"),
      v.literal("minimal"),
    ),
    status: v.union(
      v.literal("pending"),
      v.literal("generating"),
      v.literal("ready"),
      v.literal("failed"),
    ),
    content: v.optional(v.any()), // ResumeData JSON
    atsScore: v.optional(
      v.object({
        total: v.number(),
        keywordMatch: v.number(),
        formatSafety: v.number(),
        narrativeFit: v.number(),
        breakdown: v.object({
          keywordsFound: v.array(v.string()),
          keywordsMissing: v.array(v.string()),
          formatIssues: v.array(v.string()),
          narrativeRationale: v.string(),
        }),
      }),
    ),
    failureReason: v.optional(v.string()),
  }).index("by_run", ["runId"]),

  chatMessages: defineTable({
    cardId: v.id("cards"),
    userId: v.id("users"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
  }).index("by_card", ["cardId"]),

  subscriptions: defineTable({
    userId: v.id("users"),
    stripeSubscriptionId: v.string(),
    stripePriceId: v.string(),
    tier: v.union(v.literal("free"), v.literal("pro"), v.literal("career")),
    status: v.union(
      v.literal("active"),
      v.literal("canceled"),
      v.literal("past_due"),
      v.literal("trialing"),
      v.literal("unpaid"),
    ),
    currentPeriodStart: v.number(),
    currentPeriodEnd: v.number(),
    cancelAtPeriodEnd: v.boolean(),
    trialEnd: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_stripe_subscription", ["stripeSubscriptionId"]),

  usageEvents: defineTable({
    userId: v.optional(v.id("users")),
    fingerprintHash: v.optional(v.string()),
    type: v.string(),
    runId: v.optional(v.id("runs")),
    metadata: v.optional(v.any()),
  })
    .index("by_user_type", ["userId", "type"])
    .index("by_fingerprint_type", ["fingerprintHash", "type"]),
});
```

- [ ] **Step 2: Commit**

```bash
git add convex/schema.ts
git commit -m "Add Convex schema (8 tables) for v2"
```

---

### Task 6: Run convex dev to provision deployment + generate types

**Files:**
- Create: `convex/_generated/*` (gitignored, but needed at compile time)
- Generated: `.env.local` with Convex URL

- [ ] **Step 1: Provision a dev deployment**

```bash
npx convex dev --once
```

This will:
1. Prompt to log in to Convex (interactive — user must complete)
2. Create a dev deployment
3. Write `CONVEX_DEPLOYMENT` to `.env.local`
4. Write `NEXT_PUBLIC_CONVEX_URL` to `.env.local`
5. Generate `convex/_generated/api.d.ts` etc.

- [ ] **Step 2: Verify**

```bash
ls convex/_generated/
cat .env.local | grep CONVEX
```

Expected: `api.d.ts`, `dataModel.d.ts`, `server.d.ts` exist. Env vars set.

No commit — `_generated` is gitignored and `.env.local` is gitignored.

---

### Task 7: Add Clerk-Convex JWT integration

**Files:**
- Create: `convex/auth.config.ts`

- [ ] **Step 1: Get Clerk JWT issuer URL**

In Clerk Dashboard → JWT Templates → Add new template → Convex template (Clerk has a pre-built one). Save and copy the issuer URL (looks like `https://<clerk-id>.clerk.accounts.dev`).

- [ ] **Step 2: Write auth config**

```typescript
// convex/auth.config.ts
export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN!,
      applicationID: "convex",
    },
  ],
};
```

- [ ] **Step 3: Add env var to `.env.local.example` and `.env.local`**

Append to `.env.local.example`:

```
# Clerk JWT issuer (from Clerk dashboard JWT template "convex")
CLERK_JWT_ISSUER_DOMAIN=
```

Set in `.env.local` to the value from Clerk.

- [ ] **Step 4: Re-deploy convex**

```bash
npx convex dev --once
```

- [ ] **Step 5: Commit**

```bash
git add convex/auth.config.ts .env.local.example
git commit -m "Wire Clerk JWT issuer into Convex auth"
```

---

### Task 8: Create Convex+Clerk provider wrapper

**Files:**
- Create: `src/providers/ConvexClerkProvider.tsx`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Write provider component**

```tsx
// src/providers/ConvexClerkProvider.tsx
"use client";
import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function ConvexClerkProvider({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
```

- [ ] **Step 2: Wrap root layout**

Open `src/app/layout.tsx`. Wrap the body's children:

```tsx
import { ConvexClerkProvider } from "@/providers/ConvexClerkProvider";

// inside the existing <body>:
<ConvexClerkProvider>
  {children}
</ConvexClerkProvider>
```

(Replace whatever existing top-level Clerk wrapping is there with this.)

- [ ] **Step 3: Run dev server to sanity-check no crash**

```bash
npm run dev
```

Visit `http://localhost:3000`. Expected: existing v1 landing still renders. No console errors about Convex or Clerk.

- [ ] **Step 4: Commit**

```bash
git add src/providers/ConvexClerkProvider.tsx src/app/layout.tsx
git commit -m "Add ConvexClerkProvider wrapping root layout"
```

---

## Phase 2 — Pure Utilities (TDD)

### Task 9: URL canonicalization

**Files:**
- Create: `convex/scrape/canonicalize.ts`
- Create: `convex/scrape/canonicalize.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// convex/scrape/canonicalize.test.ts
import { describe, it, expect } from "vitest";
import { canonicalizeJobUrl } from "./canonicalize";

describe("canonicalizeJobUrl", () => {
  it("lowercases host", () => {
    expect(canonicalizeJobUrl("https://Jobs.Lever.co/anthropic/123"))
      .toBe("https://jobs.lever.co/anthropic/123");
  });

  it("strips trailing slash", () => {
    expect(canonicalizeJobUrl("https://jobs.lever.co/anthropic/123/"))
      .toBe("https://jobs.lever.co/anthropic/123");
  });

  it("strips tracking query params", () => {
    expect(canonicalizeJobUrl("https://jobs.lever.co/anthropic/123?gh_jid=abc&utm_source=x"))
      .toBe("https://jobs.lever.co/anthropic/123?gh_jid=abc");
  });

  it("preserves gh_jid", () => {
    expect(canonicalizeJobUrl("https://boards.greenhouse.io/foo?gh_jid=999"))
      .toBe("https://boards.greenhouse.io/foo?gh_jid=999");
  });

  it("strips fragments", () => {
    expect(canonicalizeJobUrl("https://jobs.ashbyhq.com/foo/bar#apply"))
      .toBe("https://jobs.ashbyhq.com/foo/bar");
  });

  it("throws on invalid url", () => {
    expect(() => canonicalizeJobUrl("not-a-url")).toThrow();
  });
});
```

- [ ] **Step 2: Verify tests fail**

```bash
npx vitest run convex/scrape/canonicalize.test.ts
```

Expected: FAIL (`canonicalizeJobUrl is not a function` or similar).

- [ ] **Step 3: Implement**

```typescript
// convex/scrape/canonicalize.ts
const TRACKING_PARAMS = new Set([
  "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content",
  "ref", "referrer", "fbclid", "gclid", "msclkid",
  "source", "src",
]);

export function canonicalizeJobUrl(input: string): string {
  const url = new URL(input); // throws on invalid
  url.hostname = url.hostname.toLowerCase();
  url.hash = "";

  // strip tracking params, preserve job-identifying params
  const kept = new URLSearchParams();
  for (const [k, val] of url.searchParams) {
    if (!TRACKING_PARAMS.has(k.toLowerCase())) kept.set(k, val);
  }
  url.search = kept.toString();

  let str = url.toString();
  if (str.endsWith("/") && url.pathname !== "/") str = str.slice(0, -1);
  return str;
}
```

- [ ] **Step 4: Verify tests pass**

```bash
npx vitest run convex/scrape/canonicalize.test.ts
```

Expected: 6 passed.

- [ ] **Step 5: Commit**

```bash
git add convex/scrape/canonicalize.ts convex/scrape/canonicalize.test.ts
git commit -m "Add canonicalizeJobUrl with tests"
```

---

### Task 10: Angle registry

**Files:**
- Create: `src/lib/angles/registry.ts`

- [ ] **Step 1: Write file**

```typescript
// src/lib/angles/registry.ts
export type AngleSlug = "eng_depth" | "leadership" | "cross_functional" | "specialist";

export interface AngleDef {
  slug: AngleSlug;
  label: string;
  directive: string;
  defaultTemplate: "classic" | "modern" | "creative" | "minimal";
}

export const ANGLES: AngleDef[] = [
  {
    slug: "eng_depth",
    label: "Engineering depth",
    directive:
      "Frame the candidate around technical scope, system complexity, and deep specialization. " +
      "Lead bullets with what was built and how complex it was. Quantify systems (TPS, data volume, " +
      "users at scale). De-emphasize people management unless directly relevant.",
    defaultTemplate: "classic",
  },
  {
    slug: "leadership",
    label: "Leadership",
    directive:
      "Frame the candidate around team scope, cross-team impact, mentorship, and hiring. " +
      "Lead bullets with people influenced and outcomes shipped via others. Quantify team size, " +
      "headcount changes, retention.",
    defaultTemplate: "modern",
  },
  {
    slug: "cross_functional",
    label: "Cross-functional",
    directive:
      "Frame the candidate around multi-discipline work — engineering + product + design + biz. " +
      "Lead bullets with stakeholders worked with and launches enabled. Quantify cross-functional " +
      "outcomes (launches, revenue, partnerships).",
    defaultTemplate: "creative",
  },
  {
    slug: "specialist",
    label: "Specialist",
    directive:
      "Frame the candidate around the single deepest skill the JD prioritizes. Tight, role-shaped. " +
      "All bullets reinforce expertise in that one area. De-emphasize anything not directly aligned.",
    defaultTemplate: "minimal",
  },
];

export function getAngle(slug: AngleSlug): AngleDef {
  const found = ANGLES.find((a) => a.slug === slug);
  if (!found) throw new Error(`Unknown angle: ${slug}`);
  return found;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/angles/registry.ts
git commit -m "Add angle registry — 4 angles with directives and default templates"
```

---

### Task 11: Keyword scorer (deterministic ATS component)

**Files:**
- Create: `src/lib/ats/keyword.ts`
- Create: `src/lib/ats/keyword.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// src/lib/ats/keyword.test.ts
import { describe, it, expect } from "vitest";
import { scoreKeywords } from "./keyword";
import type { ResumeData } from "@/lib/resume/types";

const sampleResume: ResumeData = {
  name: "Alex Chen",
  contactLine1: "alex@email.com",
  education: [],
  experienceSections: [
    {
      heading: "Experience",
      entries: [
        {
          company: "Anthropic",
          location: "SF",
          roles: [
            {
              title: "Engineer",
              date: "2023-Present",
              bullets: [
                "Built distributed systems in Python serving 10M requests/day",
                "Led architecture migration to Kubernetes",
              ],
            },
          ],
        },
      ],
    },
  ],
  additionalInfo: ["GraphQL", "Kafka"],
};

describe("scoreKeywords", () => {
  it("returns 100 when all JD keywords are present", () => {
    const result = scoreKeywords(sampleResume, ["python", "kubernetes", "kafka"]);
    expect(result.score).toBe(100);
    expect(result.found).toEqual(expect.arrayContaining(["python", "kubernetes", "kafka"]));
    expect(result.missing).toEqual([]);
  });

  it("returns 0 when no JD keywords are present", () => {
    const result = scoreKeywords(sampleResume, ["rust", "cuda"]);
    expect(result.score).toBe(0);
    expect(result.missing).toEqual(["rust", "cuda"]);
  });

  it("is case-insensitive", () => {
    const result = scoreKeywords(sampleResume, ["PYTHON", "Kafka"]);
    expect(result.score).toBe(100);
  });

  it("handles partial match — 50 percent", () => {
    const result = scoreKeywords(sampleResume, ["python", "rust"]);
    expect(result.score).toBe(50);
    expect(result.found).toEqual(["python"]);
    expect(result.missing).toEqual(["rust"]);
  });

  it("returns 0 with empty keyword list (no JD signal)", () => {
    const result = scoreKeywords(sampleResume, []);
    expect(result.score).toBe(0);
  });
});
```

- [ ] **Step 2: Verify tests fail**

```bash
npx vitest run src/lib/ats/keyword.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement**

```typescript
// src/lib/ats/keyword.ts
import type { ResumeData } from "@/lib/resume/types";

export interface KeywordScoreResult {
  score: number; // 0-100
  found: string[];
  missing: string[];
}

function flattenResumeText(resume: ResumeData): string {
  const parts: string[] = [
    resume.name,
    resume.contactLine1,
    resume.contactLine2 ?? "",
    ...resume.education.flatMap((e) => [
      e.institution, e.location, e.degree, e.date, e.gpa ?? "",
      ...(e.details ?? []),
    ]),
    ...resume.experienceSections.flatMap((s) => [
      s.heading,
      ...s.entries.flatMap((entry) => [
        entry.company, entry.companyNote ?? "", entry.location,
        ...entry.roles.flatMap((r) => [r.title, r.date, ...r.bullets]),
      ]),
    ]),
    ...resume.additionalInfo,
  ];
  return parts.join(" ").toLowerCase();
}

export function scoreKeywords(
  resume: ResumeData,
  jdKeywords: string[],
): KeywordScoreResult {
  if (jdKeywords.length === 0) {
    return { score: 0, found: [], missing: [] };
  }
  const text = flattenResumeText(resume);
  const found: string[] = [];
  const missing: string[] = [];
  for (const kw of jdKeywords) {
    const needle = kw.toLowerCase();
    if (text.includes(needle)) found.push(needle);
    else missing.push(needle);
  }
  const score = Math.round((found.length / jdKeywords.length) * 100);
  return { score, found, missing };
}
```

- [ ] **Step 4: Verify tests pass**

```bash
npx vitest run src/lib/ats/keyword.test.ts
```

Expected: 5 passed.

- [ ] **Step 5: Commit**

```bash
git add src/lib/ats/keyword.ts src/lib/ats/keyword.test.ts
git commit -m "Add deterministic keyword scorer with tests"
```

---

### Task 12: Format-safety scorer (deterministic ATS component)

**Files:**
- Create: `src/lib/ats/format.ts`
- Create: `src/lib/ats/format.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// src/lib/ats/format.test.ts
import { describe, it, expect } from "vitest";
import { scoreFormat } from "./format";
import type { ResumeData } from "@/lib/resume/types";

function baseResume(): ResumeData {
  return {
    name: "Alex Chen",
    contactLine1: "alex@email.com | (555) 555-5555 | linkedin.com/in/alex",
    education: [
      { institution: "MIT", location: "Cambridge, MA", degree: "BS CS", date: "May 2020" },
    ],
    experienceSections: [
      {
        heading: "Experience",
        entries: [
          {
            company: "Anthropic", location: "SF",
            roles: [{ title: "Engineer", date: "Mar 2023 - Present", bullets: ["Built X"] }],
          },
        ],
      },
    ],
    additionalInfo: ["Python", "TypeScript"],
  };
}

describe("scoreFormat", () => {
  it("returns 100 when format is clean", () => {
    const result = scoreFormat(baseResume());
    expect(result.score).toBe(100);
    expect(result.issues).toEqual([]);
  });

  it("flags missing email", () => {
    const r = baseResume();
    r.contactLine1 = "(555) 555-5555 | linkedin.com/in/alex";
    const result = scoreFormat(r);
    expect(result.score).toBeLessThan(100);
    expect(result.issues).toContain("missing_email");
  });

  it("flags missing phone", () => {
    const r = baseResume();
    r.contactLine1 = "alex@email.com | linkedin.com/in/alex";
    const result = scoreFormat(r);
    expect(result.issues).toContain("missing_phone");
  });

  it("flags non-standard section heading", () => {
    const r = baseResume();
    r.experienceSections[0].heading = "My Adventures";
    const result = scoreFormat(r);
    expect(result.issues).toContain("nonstandard_section_heading");
  });

  it("flags overly long bullets", () => {
    const r = baseResume();
    r.experienceSections[0].entries[0].roles[0].bullets = [
      "x".repeat(300),
    ];
    const result = scoreFormat(r);
    expect(result.issues).toContain("bullet_too_long");
  });

  it("flags unparseable dates", () => {
    const r = baseResume();
    r.experienceSections[0].entries[0].roles[0].date = "this year-ish";
    const result = scoreFormat(r);
    expect(result.issues).toContain("date_unparseable");
  });
});
```

- [ ] **Step 2: Verify tests fail**

```bash
npx vitest run src/lib/ats/format.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement**

```typescript
// src/lib/ats/format.ts
import type { ResumeData } from "@/lib/resume/types";

export type FormatIssue =
  | "missing_email"
  | "missing_phone"
  | "nonstandard_section_heading"
  | "bullet_too_long"
  | "date_unparseable";

export interface FormatScoreResult {
  score: number; // 0-100
  issues: FormatIssue[];
}

const STANDARD_HEADINGS = new Set([
  "experience", "professional experience", "work experience",
  "education", "skills", "additional", "additional information",
  "projects", "publications", "certifications",
]);

// matches "Mar 2023 - Present", "May 2020 – Dec 2022", "2020 - 2024", "Jan 2024", etc.
const DATE_RE = /(\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\.?\s+\d{4}\b|\b\d{4}\b|present|current)/i;

// max chars per bullet — 2 lines × 100 chars is the spec
const MAX_BULLET_LEN = 240;

const EMAIL_RE = /[a-z0-9._-]+@[a-z0-9.-]+\.[a-z]{2,}/i;
const PHONE_RE = /(\+?\d[\d\s().-]{8,}\d)/;

export function scoreFormat(resume: ResumeData): FormatScoreResult {
  const issues: FormatIssue[] = [];
  const contact = `${resume.contactLine1} ${resume.contactLine2 ?? ""}`;

  if (!EMAIL_RE.test(contact)) issues.push("missing_email");
  if (!PHONE_RE.test(contact)) issues.push("missing_phone");

  for (const section of resume.experienceSections) {
    if (!STANDARD_HEADINGS.has(section.heading.toLowerCase())) {
      if (!issues.includes("nonstandard_section_heading")) {
        issues.push("nonstandard_section_heading");
      }
    }
    for (const entry of section.entries) {
      for (const role of entry.roles) {
        if (!DATE_RE.test(role.date)) {
          if (!issues.includes("date_unparseable")) issues.push("date_unparseable");
        }
        for (const bullet of role.bullets) {
          if (bullet.length > MAX_BULLET_LEN) {
            if (!issues.includes("bullet_too_long")) issues.push("bullet_too_long");
          }
        }
      }
    }
  }

  // each issue costs 20 points (5 possible issues × 20 = 100 max penalty)
  const score = Math.max(0, 100 - issues.length * 20);
  return { score, issues };
}
```

- [ ] **Step 4: Verify tests pass**

```bash
npx vitest run src/lib/ats/format.test.ts
```

Expected: 6 passed.

- [ ] **Step 5: Commit**

```bash
git add src/lib/ats/format.ts src/lib/ats/format.test.ts
git commit -m "Add deterministic format-safety scorer with tests"
```

---

### Task 12.5: Browser fingerprint

**Files:**
- Create: `src/lib/fingerprint.ts`

- [ ] **Step 1: Write the file**

```typescript
// src/lib/fingerprint.ts
// Client-side fingerprint. NOT cryptographic — just a stable-ish browser identity
// used to rate-limit anonymous runs. Server hashes this with a rotating salt.

const FP_STORAGE_KEY = "resume-ai:fp";

async function computeFingerprint(): Promise<string> {
  if (typeof window === "undefined") return "ssr";

  const parts: string[] = [
    navigator.userAgent,
    navigator.language,
    String(screen.width),
    String(screen.height),
    String(screen.colorDepth),
    Intl.DateTimeFormat().resolvedOptions().timeZone ?? "unknown",
    String(navigator.hardwareConcurrency ?? 0),
  ];

  // small canvas signature
  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.textBaseline = "top";
      ctx.font = "14px Arial";
      ctx.fillText("resume.ai fp", 0, 0);
      parts.push(canvas.toDataURL().slice(-64));
    }
  } catch {
    // ignore — canvas can be blocked
  }

  // hash with subtle.digest
  const enc = new TextEncoder().encode(parts.join("|"));
  const digest = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function getFingerprint(): Promise<string> {
  if (typeof window === "undefined") return "ssr";
  const cached = window.localStorage.getItem(FP_STORAGE_KEY);
  if (cached) return cached;
  const fp = await computeFingerprint();
  window.localStorage.setItem(FP_STORAGE_KEY, fp);
  return fp;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/fingerprint.ts
git commit -m "Add client-side fingerprint helper for anonymous rate limiting"
```

---

## Phase 3 — Scraping Pipeline

### Task 13: Firecrawl client

**Files:**
- Create: `convex/scrape/firecrawl.ts`

- [ ] **Step 1: Write client**

```typescript
// convex/scrape/firecrawl.ts
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
```

- [ ] **Step 2: Commit**

```bash
git add convex/scrape/firecrawl.ts
git commit -m "Add Firecrawl scrape client"
```

---

### Task 14: Apify client

**Files:**
- Create: `convex/scrape/apify.ts`

- [ ] **Step 1: Write client**

```typescript
// convex/scrape/apify.ts
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
      ? { startUrls: [{ url }], pageFunction: "async ({ request, $ }) => ({ url: request.url, text: $('body').text() })" }
      : { startUrls: [{ url }] };

  // Synchronous run-with-output (Apify supports run-sync-get-dataset-items)
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
```

- [ ] **Step 2: Commit**

```bash
git add convex/scrape/apify.ts
git commit -m "Add Apify scrape client with domain-based actor routing"
```

---

### Task 15: JD field extractor (Haiku)

**Files:**
- Create: `convex/ai/anthropic.ts`
- Create: `convex/scrape/extract.ts`

- [ ] **Step 1: Write Anthropic client setup**

```typescript
// convex/ai/anthropic.ts
"use node";
import Anthropic from "@anthropic-ai/sdk";

let _client: Anthropic | null = null;

export function getAnthropic(): Anthropic {
  if (_client) return _client;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");
  _client = new Anthropic({ apiKey });
  return _client;
}

export const MODELS = {
  sonnet: "claude-sonnet-4-6",
  haiku: "claude-haiku-4-5-20251001",
} as const;
```

- [ ] **Step 2: Write extractor**

```typescript
// convex/scrape/extract.ts
"use node";
import { getAnthropic, MODELS } from "../ai/anthropic";

export interface ExtractedJD {
  title: string;
  company: string;
  requirements: string[];
  responsibilities: string[];
  keywords: string[];
  seniority?: string;
  location?: string;
}

const SYSTEM = `You extract structured fields from a job posting. Return ONLY a JSON object matching:
{
  "title": "Job title",
  "company": "Company name",
  "requirements": ["specific requirement", ...],
  "responsibilities": ["specific responsibility", ...],
  "keywords": ["technical-term-1", "technical-term-2", ...],
  "seniority": "junior" | "mid" | "senior" | "staff" | "principal" | undefined,
  "location": "City, State or Remote or undefined"
}

Rules:
- keywords: hard technical/domain skills only (Python, Kubernetes, distributed systems, SQL).
  No soft skills, no buzzwords, no "team player". 10-25 items.
- requirements: must-haves from the JD, verbatim or near-verbatim. Up to 10.
- responsibilities: what the role does, paraphrased tightly. Up to 8.
- Return raw JSON. No markdown fences, no preamble.`;

export async function extractJDFields(rawText: string): Promise<ExtractedJD> {
  const client = getAnthropic();
  const resp = await client.messages.create({
    model: MODELS.haiku,
    max_tokens: 1500,
    system: SYSTEM,
    messages: [{ role: "user", content: rawText.slice(0, 12000) }],
  });
  const content = resp.content[0];
  if (content.type !== "text") throw new Error("non-text response from Haiku");
  let json = content.text.trim();
  if (json.startsWith("```")) json = json.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  return JSON.parse(json) as ExtractedJD;
}
```

- [ ] **Step 3: Commit**

```bash
git add convex/ai/anthropic.ts convex/scrape/extract.ts
git commit -m "Add Anthropic client + Haiku JD field extractor"
```

---

### Task 16: scrapeJD routing with fallback

**Files:**
- Create: `convex/scrape/routing.ts`

- [ ] **Step 1: Write routing**

```typescript
// convex/scrape/routing.ts
"use node";
import { firecrawlScrape } from "./firecrawl";
import { apifyScrape, actorForDomain } from "./apify";
import { canonicalizeJobUrl } from "./canonicalize";
import { extractJDFields, ExtractedJD } from "./extract";

const HOSTILE_HOSTS = ["linkedin.com", "workday.com", "myworkdayjobs.com", "indeed.com"];

function isHostile(host: string): boolean {
  const h = host.toLowerCase();
  return HOSTILE_HOSTS.some((d) => h === d || h.endsWith("." + d));
}

export interface ScrapeResult {
  sourceUrl: string;
  canonicalUrl: string;
  rawText: string;
  parsed: ExtractedJD;
  scraper: "firecrawl" | "apify";
}

const MIN_CONTENT_LEN = 800;

export async function scrapeJD(url: string): Promise<ScrapeResult> {
  const canonicalUrl = canonicalizeJobUrl(url);
  const host = new URL(canonicalUrl).host;

  let result: { text: string; scraper: "firecrawl" | "apify" };

  if (isHostile(host)) {
    const r = await apifyScrape(canonicalUrl);
    result = { text: r.text, scraper: "apify" };
  } else {
    try {
      const r = await firecrawlScrape(canonicalUrl);
      if (r.text.length < MIN_CONTENT_LEN) {
        const fallback = await apifyScrape(canonicalUrl);
        result = { text: fallback.text, scraper: "apify" };
      } else {
        result = { text: r.text, scraper: "firecrawl" };
      }
    } catch {
      const fallback = await apifyScrape(canonicalUrl);
      result = { text: fallback.text, scraper: "apify" };
    }
  }

  if (result.text.length < 400) {
    throw new Error("scrape_failed: insufficient content from both scrapers");
  }

  const parsed = await extractJDFields(result.text);
  return {
    sourceUrl: url,
    canonicalUrl,
    rawText: result.text,
    parsed,
    scraper: result.scraper,
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add convex/scrape/routing.ts
git commit -m "Add scrapeJD with Firecrawl→Apify fallback routing"
```

---

## Phase 4 — Backend Pipeline (Convex orchestration)

### Task 17: users.ts — getCurrentUser query + ensureUser mutation

**Files:**
- Create: `convex/users.ts`

- [ ] **Step 1: Write file**

```typescript
// convex/users.ts
import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    return user;
  },
});

export const ensureUser = mutation({
  args: { email: v.string(), name: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("not_authenticated");

    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (existing) return existing._id;

    return await ctx.db.insert("users", {
      clerkId: identity.subject,
      email: args.email,
      name: args.name,
      tier: "free",
    });
  },
});
```

- [ ] **Step 2: Push schema + functions to Convex**

```bash
npx convex dev --once
```

Expected: no schema errors, functions deploy successfully.

- [ ] **Step 3: Commit**

```bash
git add convex/users.ts
git commit -m "Add getCurrentUser query + ensureUser mutation"
```

---

### Task 18: resumes.ts — upload + parse mutation

**Files:**
- Create: `convex/resumes.ts`
- Create: `convex/resumesActions.ts` (Node action that calls pdf-parse / mammoth)

- [ ] **Step 1: Write resumes.ts (queries + mutations only — no node deps)**

```typescript
// convex/resumes.ts
import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const finalizeAnonymousResume = mutation({
  args: {
    storageId: v.id("_storage"),
    fingerprintHash: v.string(),
    filename: v.string(),
    source: v.union(v.literal("pdf"), v.literal("docx")),
    rawText: v.string(),
    parsed: v.any(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("resumes", {
      fingerprintHash: args.fingerprintHash,
      title: args.filename,
      source: args.source,
      rawText: args.rawText,
      parsed: args.parsed,
      storageId: args.storageId,
    });
  },
});

export const getResume = query({
  args: { resumeId: v.id("resumes") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.resumeId);
  },
});

export const internalGetResume = internalMutation({
  args: { resumeId: v.id("resumes") },
  handler: async (ctx, args) => await ctx.db.get(args.resumeId),
});
```

- [ ] **Step 2: Write resumesActions.ts (node-only)**

```typescript
// convex/resumesActions.ts
"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";
import { getAnthropic, MODELS } from "./ai/anthropic";

const STRUCTURING_PROMPT = `You are a resume parser. Given raw text extracted from a resume document, extract and structure the information into JSON. Return ONLY valid JSON, no markdown fences. Use this exact shape:
{
  "name": "Full Name",
  "contactLine1": "email | phone | LinkedIn | location",
  "contactLine2": "optional",
  "education": [{ "institution": "", "location": "", "degree": "", "date": "", "gpa": "", "details": [] }],
  "experienceSections": [{ "heading": "Experience", "entries": [{ "company": "", "location": "", "roles": [{ "title": "", "date": "", "bullets": [] }] }] }],
  "additionalInfo": []
}
Rules: If a field is missing, use empty string or array. Keep bullets concise, preserve content.`;

async function parsePdfBuffer(buf: ArrayBuffer): Promise<string> {
  const parser = new PDFParse({ data: Buffer.from(buf) });
  try {
    const r = await parser.getText();
    return r.text;
  } finally {
    await parser.destroy();
  }
}

async function parseDocxBuffer(buf: ArrayBuffer): Promise<string> {
  const r = await mammoth.extractRawText({ buffer: Buffer.from(buf) });
  return r.value;
}

export const parseAndStoreResume = action({
  args: {
    storageId: v.id("_storage"),
    fingerprintHash: v.string(),
    filename: v.string(),
    source: v.union(v.literal("pdf"), v.literal("docx")),
  },
  handler: async (ctx, args) => {
    const blob = await ctx.storage.get(args.storageId);
    if (!blob) throw new Error("uploaded_file_missing");
    const buffer = await blob.arrayBuffer();

    const rawText =
      args.source === "pdf" ? await parsePdfBuffer(buffer) : await parseDocxBuffer(buffer);

    const client = getAnthropic();
    const resp = await client.messages.create({
      model: MODELS.sonnet,
      max_tokens: 4096,
      system: STRUCTURING_PROMPT,
      messages: [{ role: "user", content: `Parse this resume:\n\n${rawText}` }],
    });
    const c = resp.content[0];
    if (c.type !== "text") throw new Error("non-text response from sonnet");
    let json = c.text.trim();
    if (json.startsWith("```")) json = json.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    const parsed = JSON.parse(json);

    const resumeId = await ctx.runMutation(api.resumes.finalizeAnonymousResume, {
      storageId: args.storageId,
      fingerprintHash: args.fingerprintHash,
      filename: args.filename,
      source: args.source,
      rawText,
      parsed,
    });
    return { resumeId };
  },
});
```

- [ ] **Step 3: Push to Convex**

```bash
npx convex dev --once
```

Expected: deploys successfully.

- [ ] **Step 4: Commit**

```bash
git add convex/resumes.ts convex/resumesActions.ts
git commit -m "Add resume upload + parse pipeline (Convex action + mutations)"
```

---

### Task 19: jobDescriptions.ts — cached resolution

**Files:**
- Create: `convex/jobDescriptions.ts`
- Create: `convex/jobDescriptionsActions.ts`

- [ ] **Step 1: Write jobDescriptions.ts**

```typescript
// convex/jobDescriptions.ts
import { internalMutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getByCanonicalUrl = query({
  args: { canonicalUrl: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("jobDescriptions")
      .withIndex("by_canonical_url", (q) => q.eq("canonicalUrl", args.canonicalUrl))
      .unique();
  },
});

export const insertJD = internalMutation({
  args: {
    sourceUrl: v.string(),
    canonicalUrl: v.string(),
    title: v.string(),
    company: v.string(),
    rawText: v.string(),
    parsed: v.any(),
    scraper: v.union(v.literal("firecrawl"), v.literal("apify"), v.literal("manual")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("jobDescriptions", {
      ...args,
      scrapedAt: Date.now(),
    });
  },
});
```

- [ ] **Step 2: Write action**

```typescript
// convex/jobDescriptionsActions.ts
"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import { scrapeJD } from "./scrape/routing";
import { canonicalizeJobUrl } from "./scrape/canonicalize";

export const resolveJobDescription = action({
  args: { url: v.string() },
  handler: async (ctx, { url }) => {
    const canonicalUrl = canonicalizeJobUrl(url);

    // cache lookup
    const existing = await ctx.runQuery(api.jobDescriptions.getByCanonicalUrl, {
      canonicalUrl,
    });
    if (existing) return existing._id;

    // scrape + insert
    const scraped = await scrapeJD(url);
    return await ctx.runMutation(internal.jobDescriptions.insertJD, {
      sourceUrl: scraped.sourceUrl,
      canonicalUrl: scraped.canonicalUrl,
      title: scraped.parsed.title,
      company: scraped.parsed.company,
      rawText: scraped.rawText,
      parsed: scraped.parsed,
      scraper: scraped.scraper,
    });
  },
});
```

- [ ] **Step 3: Push + commit**

```bash
npx convex dev --once
git add convex/jobDescriptions.ts convex/jobDescriptionsActions.ts
git commit -m "Add jobDescriptions resolver with shared cache"
```

---

### Task 20: cards.ts — byRun query and patchCard mutation

**Files:**
- Create: `convex/cards.ts`

- [ ] **Step 1: Write file**

```typescript
// convex/cards.ts
import { internalMutation, query } from "./_generated/server";
import { v } from "convex/values";

export const byRun = query({
  args: { runId: v.id("runs") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("cards")
      .withIndex("by_run", (q) => q.eq("runId", args.runId))
      .collect();
  },
});

export const patchCard = internalMutation({
  args: {
    cardId: v.id("cards"),
    patch: v.object({
      status: v.optional(
        v.union(v.literal("pending"), v.literal("generating"), v.literal("ready"), v.literal("failed")),
      ),
      content: v.optional(v.any()),
      atsScore: v.optional(v.any()),
      failureReason: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.cardId, args.patch);
  },
});
```

- [ ] **Step 2: Push + commit**

```bash
npx convex dev --once
git add convex/cards.ts
git commit -m "Add cards.byRun query + patchCard internal mutation"
```

---

### Task 21: Narrative-fit scorer (Haiku)

**Files:**
- Create: `src/lib/ats/narrative.ts`

- [ ] **Step 1: Write file**

(Note: this is in `src/lib/` because it's a shared shape used by Convex. The actual call is wrapped in a Convex action — Convex can import from `src/lib/` because it's pure TypeScript.)

```typescript
// src/lib/ats/narrative.ts
import type { ResumeData } from "@/lib/resume/types";

export interface NarrativeScoreResult {
  score: number; // 0-100
  rationale: string;
}

export interface JDParsed {
  title: string;
  company: string;
  requirements: string[];
  responsibilities: string[];
  keywords: string[];
  seniority?: string;
  location?: string;
}

export const NARRATIVE_SYSTEM = `You are an experienced hiring manager. Given a job description and a resume, score how well the resume's *framing and emphasis* match what the JD prioritizes — not just keyword presence.

Return ONLY a JSON object:
{
  "score": <0-100>,
  "rationale": "1-3 sentences explaining what's strong or weak about the framing for THIS role"
}

Scoring guide:
- 90-100: framing is precise to the role's seniority and priorities, with strongest experiences leading
- 70-89: well-aligned but missing 1-2 emphases the JD calls out
- 50-69: relevant but generic — could be the same resume for any job in the field
- 0-49: misaligned framing, wrong seniority, or experiences buried in wrong order`;

export function buildNarrativePrompt(resume: ResumeData, jd: JDParsed): string {
  return `## Job Description
Title: ${jd.title}
Company: ${jd.company}
Seniority: ${jd.seniority ?? "unspecified"}

Requirements:
${jd.requirements.map((r) => `- ${r}`).join("\n")}

Responsibilities:
${jd.responsibilities.map((r) => `- ${r}`).join("\n")}

## Resume
${JSON.stringify(resume, null, 2)}`;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/ats/narrative.ts
git commit -m "Add narrative-fit prompt and types (Haiku scorer)"
```

---

### Task 22: ai/score.ts — scoreCard orchestrator

**Files:**
- Create: `convex/ai/score.ts`

- [ ] **Step 1: Write file**

```typescript
// convex/ai/score.ts
"use node";
import { getAnthropic, MODELS } from "./anthropic";
import { scoreKeywords } from "../../src/lib/ats/keyword";
import { scoreFormat } from "../../src/lib/ats/format";
import { NARRATIVE_SYSTEM, buildNarrativePrompt, JDParsed, NarrativeScoreResult } from "../../src/lib/ats/narrative";
import type { ResumeData } from "../../src/lib/resume/types";

export interface AtsScore {
  total: number;
  keywordMatch: number;
  formatSafety: number;
  narrativeFit: number;
  breakdown: {
    keywordsFound: string[];
    keywordsMissing: string[];
    formatIssues: string[];
    narrativeRationale: string;
  };
}

async function scoreNarrative(resume: ResumeData, jd: JDParsed): Promise<NarrativeScoreResult> {
  const client = getAnthropic();
  const resp = await client.messages.create({
    model: MODELS.haiku,
    max_tokens: 400,
    system: NARRATIVE_SYSTEM,
    messages: [{ role: "user", content: buildNarrativePrompt(resume, jd) }],
  });
  const c = resp.content[0];
  if (c.type !== "text") throw new Error("non-text narrative response");
  let json = c.text.trim();
  if (json.startsWith("```")) json = json.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  return JSON.parse(json) as NarrativeScoreResult;
}

export async function scoreCard(resume: ResumeData, jd: JDParsed): Promise<AtsScore> {
  const keyword = scoreKeywords(resume, jd.keywords);
  const format = scoreFormat(resume);
  const narrative = await scoreNarrative(resume, jd);

  const total = Math.round(
    0.4 * keyword.score + 0.2 * format.score + 0.4 * narrative.score,
  );

  return {
    total,
    keywordMatch: keyword.score,
    formatSafety: format.score,
    narrativeFit: narrative.score,
    breakdown: {
      keywordsFound: keyword.found,
      keywordsMissing: keyword.missing,
      formatIssues: format.issues,
      narrativeRationale: narrative.rationale,
    },
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add convex/ai/score.ts
git commit -m "Add scoreCard composer (keyword + format + narrative)"
```

---

### Task 23: ai/runAngle.ts — per-card generation action

**Files:**
- Create: `convex/ai/runAngle.ts`

- [ ] **Step 1: Write file**

```typescript
// convex/ai/runAngle.ts
"use node";
import { internalAction } from "../_generated/server";
import { internal, api } from "../_generated/api";
import { v } from "convex/values";
import { getAnthropic, MODELS } from "./anthropic";
import { getAngle, AngleSlug } from "../../src/lib/angles/registry";
import { scoreCard } from "./score";
import type { ResumeData } from "../../src/lib/resume/types";

const SYSTEM = `You are a senior resume writer tailoring a candidate's resume for a specific job. The candidate provides their existing resume and the target job. You provide a rewritten resume in the SAME JSON shape, optimized for the specified angle.

Rules:
1. Preserve all factual content (company names, dates, education). Do NOT invent experience.
2. Rewrite/reorder BULLETS to emphasize the angle's directive.
3. Reorder experienceSections so the most relevant section is first.
4. Adjust additionalInfo to surface skills the JD prioritizes.
5. Use strong action verbs (Led, Built, Architected, Shipped, Quantified).
6. Each bullet: action + what + context + quantified result.
7. Each bullet ≤ 240 characters.
8. Return ONLY a JSON object with the exact ResumeData shape — no markdown fences, no preamble.

ResumeData shape:
{
  "name": "",
  "contactLine1": "",
  "contactLine2": "",
  "education": [{ "institution": "", "location": "", "degree": "", "date": "", "gpa": "", "details": [] }],
  "experienceSections": [{ "heading": "Experience", "entries": [{ "company": "", "companyNote": "", "location": "", "roles": [{ "title": "", "date": "", "bullets": [] }] }] }],
  "additionalInfo": []
}`;

function buildUserMessage(args: {
  angleDirective: string;
  resume: ResumeData;
  jd: { title: string; company: string; requirements: string[]; responsibilities: string[]; keywords: string[]; seniority?: string };
}): string {
  return `## Angle
${args.angleDirective}

## Job
Title: ${args.jd.title}
Company: ${args.jd.company}
Seniority: ${args.jd.seniority ?? "unspecified"}

Requirements:
${args.jd.requirements.map((r) => `- ${r}`).join("\n")}

Responsibilities:
${args.jd.responsibilities.map((r) => `- ${r}`).join("\n")}

Keywords to mirror where truthful: ${args.jd.keywords.join(", ")}

## Candidate's current resume
${JSON.stringify(args.resume, null, 2)}

Return the rewritten resume as JSON.`;
}

export const runAngle = internalAction({
  args: { cardId: v.id("cards") },
  handler: async (ctx, { cardId }) => {
    // load card → run → resume + jd
    const card = await ctx.runQuery(api.cards.byRun, { runId: "" as any }); // placeholder — use getCard
    // we need a getCard query — instead use runs.getRun then filter
    // (defer: just patch via direct queries below)
    const cardRow = (await ctx.runQuery(api.cards._getCardById, { cardId })) as any;
    if (!cardRow) throw new Error("card_missing");

    await ctx.runMutation(internal.cards.patchCard, {
      cardId, patch: { status: "generating" },
    });

    const run = (await ctx.runQuery(api.runs.getRun, { runId: cardRow.runId })) as any;
    if (!run) throw new Error("run_missing");
    const resume = (await ctx.runQuery(api.resumes.getResume, { resumeId: run.resumeId })) as any;
    if (!resume) throw new Error("resume_missing");
    const jd = (await ctx.runQuery(api.jobDescriptions.getById, { id: run.jobDescriptionId })) as any;
    if (!jd) throw new Error("jd_missing");

    try {
      const angle = getAngle(cardRow.angle as AngleSlug);
      const client = getAnthropic();
      const resp = await client.messages.create({
        model: MODELS.sonnet,
        max_tokens: 4096,
        system: SYSTEM,
        messages: [
          {
            role: "user",
            content: buildUserMessage({
              angleDirective: angle.directive,
              resume: resume.parsed,
              jd: jd.parsed,
            }),
          },
        ],
      });
      const c = resp.content[0];
      if (c.type !== "text") throw new Error("non-text gen response");
      let json = c.text.trim();
      if (json.startsWith("```")) json = json.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
      const content = JSON.parse(json) as ResumeData;

      const ats = await scoreCard(content, jd.parsed);

      await ctx.runMutation(internal.cards.patchCard, {
        cardId,
        patch: { status: "ready", content, atsScore: ats },
      });
    } catch (err) {
      await ctx.runMutation(internal.cards.patchCard, {
        cardId,
        patch: { status: "failed", failureReason: (err as Error).message },
      });
    }
  },
});
```

- [ ] **Step 2: Add helper queries the action depends on**

Append to `convex/cards.ts`:

```typescript
import { query as queryX } from "./_generated/server"; // (already imported above; this is illustrative)

export const _getCardById = query({
  args: { cardId: v.id("cards") },
  handler: async (ctx, args) => await ctx.db.get(args.cardId),
});
```

Append to `convex/jobDescriptions.ts`:

```typescript
export const getById = query({
  args: { id: v.id("jobDescriptions") },
  handler: async (ctx, args) => await ctx.db.get(args.id),
});
```

- [ ] **Step 3: Push + commit**

```bash
npx convex dev --once
git add convex/ai/runAngle.ts convex/cards.ts convex/jobDescriptions.ts
git commit -m "Add runAngle internal action — per-card generation + scoring"
```

---

### Task 24: runs.ts — startRun orchestrator + getRun query

**Files:**
- Create: `convex/runs.ts`
- Create: `convex/runsActions.ts`

- [ ] **Step 1: Write runs.ts**

```typescript
// convex/runs.ts
import { internalMutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getRun = query({
  args: { runId: v.id("runs") },
  handler: async (ctx, args) => await ctx.db.get(args.runId),
});

export const insertRun = internalMutation({
  args: {
    fingerprintHash: v.string(),
    resumeId: v.id("resumes"),
    jobDescriptionId: v.id("jobDescriptions"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("runs", {
      fingerprintHash: args.fingerprintHash,
      resumeId: args.resumeId,
      jobDescriptionId: args.jobDescriptionId,
      status: "generating",
    });
  },
});

export const patchRun = internalMutation({
  args: {
    runId: v.id("runs"),
    patch: v.object({
      status: v.optional(
        v.union(v.literal("scraping"), v.literal("generating"), v.literal("ready"), v.literal("failed")),
      ),
      failureReason: v.optional(v.string()),
      completedAt: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args) => await ctx.db.patch(args.runId, args.patch),
});

export const insertInitialCards = internalMutation({
  args: { runId: v.id("runs") },
  handler: async (ctx, args) => {
    const angles = [
      { slug: "eng_depth", label: "Engineering depth", template: "classic" },
      { slug: "leadership", label: "Leadership", template: "modern" },
      { slug: "cross_functional", label: "Cross-functional", template: "creative" },
      { slug: "specialist", label: "Specialist", template: "minimal" },
    ] as const;

    const ids: string[] = [];
    for (const a of angles) {
      const id = await ctx.db.insert("cards", {
        runId: args.runId,
        angle: a.slug,
        angleLabel: a.label,
        templateSlug: a.template,
        status: "pending",
      });
      ids.push(id);
    }
    return ids;
  },
});
```

- [ ] **Step 2: Write runsActions.ts (the orchestrator)**

```typescript
// convex/runsActions.ts
"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

export const startRun = action({
  args: {
    resumeId: v.id("resumes"),
    jdUrl: v.string(),
    fingerprintHash: v.string(),
  },
  handler: async (ctx, args) => {
    // resolve JD (scrape or cache hit)
    const jdId = (await ctx.runAction(api.jobDescriptionsActions.resolveJobDescription, {
      url: args.jdUrl,
    })) as Id<"jobDescriptions">;

    // insert run
    const runId = (await ctx.runMutation(internal.runs.insertRun, {
      fingerprintHash: args.fingerprintHash,
      resumeId: args.resumeId,
      jobDescriptionId: jdId,
    })) as Id<"runs">;

    // insert 4 cards
    const cardIds = (await ctx.runMutation(internal.runs.insertInitialCards, {
      runId,
    })) as Id<"cards">[];

    // schedule 4 parallel angle generations
    for (const cardId of cardIds) {
      await ctx.scheduler.runAfter(0, internal.runAngle.runAngle, { cardId });
    }

    return runId;
  },
});
```

- [ ] **Step 3: Push + commit**

```bash
npx convex dev --once
git add convex/runs.ts convex/runsActions.ts
git commit -m "Add startRun orchestrator action"
```

---

### Task 25: ResumePreview HTML component (template-aware)

**Files:**
- Create: `src/components/try/ResumePreviewHtml.tsx`

- [ ] **Step 1: Write component**

```tsx
// src/components/try/ResumePreviewHtml.tsx
import type { ResumeData } from "@/lib/resume/types";

const TEMPLATE_STYLES = {
  classic: {
    container: "bg-white text-black font-serif text-[10pt] leading-[1.3] p-9",
    name: "text-[14pt] font-bold text-center mb-1",
    contact: "text-[10pt] text-center text-gray-700",
    section: "text-[11pt] font-bold uppercase mt-2 mb-1",
    rule: "border-t border-black my-1",
  },
  modern: {
    container: "bg-white text-black font-sans text-[10pt] leading-[1.3] p-9",
    name: "text-[16pt] font-bold mb-1 text-blue-700",
    contact: "text-[10pt] text-gray-600",
    section: "text-[11pt] font-semibold uppercase tracking-wide text-blue-700 mt-3 mb-1",
    rule: "border-t border-gray-200 my-1",
  },
  creative: {
    container: "bg-white text-black font-sans text-[10pt] leading-[1.3] p-9 grid grid-cols-[2fr_1fr] gap-6",
    name: "text-[15pt] font-bold col-span-2 text-purple-700",
    contact: "text-[10pt] text-gray-600 col-span-2",
    section: "text-[11pt] font-semibold uppercase text-purple-700 mt-2 mb-1",
    rule: "border-t border-purple-200 my-1",
  },
  minimal: {
    container: "bg-white text-black font-sans text-[11pt] leading-[1.5] p-14",
    name: "text-[18pt] font-light mb-2",
    contact: "text-[10pt] text-gray-500",
    section: "text-[11pt] font-medium uppercase tracking-widest text-gray-600 mt-4 mb-2",
    rule: "border-t border-gray-200 my-2",
  },
} as const;

export type TemplateSlug = keyof typeof TEMPLATE_STYLES;

export function ResumePreviewHtml({
  data,
  template,
  className,
}: {
  data: ResumeData;
  template: TemplateSlug;
  className?: string;
}) {
  const s = TEMPLATE_STYLES[template];
  return (
    <div className={`${s.container} ${className ?? ""}`} aria-label={`Resume in ${template} template`}>
      <div className={s.name}>{data.name}</div>
      <div className={s.contact}>{data.contactLine1}</div>
      {data.contactLine2 && <div className={s.contact}>{data.contactLine2}</div>}
      <div className={s.rule} />

      {data.education.length > 0 && (
        <>
          <div className={s.section}>Education</div>
          <div className={s.rule} />
          {data.education.map((e, i) => (
            <div key={i} className="mb-2">
              <div className="flex justify-between">
                <span>
                  <b>{e.institution}</b>, {e.location}
                </span>
                <span>{e.date}</span>
              </div>
              <div className="italic">{e.gpa ? `${e.degree}; GPA: ${e.gpa}` : e.degree}</div>
              {e.details?.map((d, j) => (
                <div key={j} className="ml-4">• {d}</div>
              ))}
            </div>
          ))}
        </>
      )}

      {data.experienceSections.map((sec, si) => (
        <div key={si}>
          <div className={s.section}>{sec.heading}</div>
          <div className={s.rule} />
          {sec.entries.map((entry, ei) => (
            <div key={ei} className="mb-2">
              {entry.roles.map((role, ri) => (
                <div key={ri}>
                  {ri === 0 && (
                    <div className="flex justify-between">
                      <span>
                        <b>{entry.company}</b>
                        {entry.companyNote && ` (${entry.companyNote})`}, {entry.location}
                      </span>
                      <span>{role.date}</span>
                    </div>
                  )}
                  <div className="italic">{role.title}{ri > 0 ? `  ${role.date}` : ""}</div>
                  {role.bullets.map((b, bi) => (
                    <div key={bi} className="ml-4">• {b}</div>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}

      {data.additionalInfo.length > 0 && (
        <>
          <div className={s.section}>Additional</div>
          <div className={s.rule} />
          {data.additionalInfo.map((item, i) => (
            <div key={i} className="ml-4">• {item}</div>
          ))}
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/try/ResumePreviewHtml.tsx
git commit -m "Add template-aware HTML resume preview"
```

---

## Phase 5 — Frontend

### Task 26: New landing page hero

**Files:**
- Create: `src/components/landing/Hero.tsx`
- Modify: `src/app/page.tsx` (REWRITE)

- [ ] **Step 1: Write Hero component**

```tsx
// src/components/landing/Hero.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAction, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { getFingerprint } from "@/lib/fingerprint";
import { ResumeDropzone } from "@/components/upload/ResumeDropzone";

export function Hero() {
  const router = useRouter();
  const startRun = useAction(api.runsActions.startRun);
  const parseAndStoreResume = useAction(api.resumesActions.parseAndStoreResume);
  const generateUploadUrl = useMutation(api.resumes.generateUploadUrl);

  const [jdUrl, setJdUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!jdUrl || !file) return;
    setSubmitting(true);
    setError(null);

    try {
      const fingerprintHash = await getFingerprint();
      const ext = file.name.split(".").pop()?.toLowerCase();
      const source = ext === "pdf" ? "pdf" : ext === "docx" ? "docx" : null;
      if (!source) throw new Error("Upload a .pdf or .docx file");

      // 1. get upload URL
      const uploadUrl = await generateUploadUrl({});
      const putResp = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!putResp.ok) throw new Error("upload_failed");
      const { storageId } = (await putResp.json()) as { storageId: string };

      // 2. parse + store
      const { resumeId } = await parseAndStoreResume({
        storageId: storageId as any,
        fingerprintHash,
        filename: file.name,
        source: source as "pdf" | "docx",
      });

      // 3. start run (this scrapes JD and schedules 4 generations)
      const runId = await startRun({
        resumeId: resumeId as any,
        jdUrl,
        fingerprintHash,
      });

      router.push(`/try/${runId}`);
    } catch (err) {
      setError((err as Error).message);
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-xl w-full">
      <input
        type="url"
        required
        placeholder="https://jobs.lever.co/anthropic/swe"
        value={jdUrl}
        onChange={(e) => setJdUrl(e.target.value)}
        className="w-full rounded border border-neutral-700 bg-neutral-900 px-4 py-3 text-sm text-white placeholder:text-neutral-500"
      />
      <ResumeDropzone file={file} onFile={setFile} />
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={!jdUrl || !file || submitting}
        className="rounded bg-white text-black px-6 py-3 font-semibold disabled:opacity-50"
      >
        {submitting ? "Tailoring…" : "See my 4 designs →"}
      </button>
    </form>
  );
}
```

- [ ] **Step 2: Write ResumeDropzone**

```tsx
// src/components/upload/ResumeDropzone.tsx
"use client";
import { useRef } from "react";

export function ResumeDropzone({
  file,
  onFile,
}: {
  file: File | null;
  onFile: (f: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const f = e.dataTransfer.files[0];
        if (f) onFile(f);
      }}
      className="rounded border border-dashed border-neutral-700 bg-neutral-900 px-4 py-6 text-center text-sm text-neutral-400 cursor-pointer hover:border-neutral-500"
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx"
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0] ?? null)}
      />
      {file ? file.name : "Drop resume.pdf or .docx (or click)"}
    </div>
  );
}
```

- [ ] **Step 3: Rewrite landing page**

```tsx
// src/app/page.tsx
import { Hero } from "@/components/landing/Hero";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <nav className="flex h-14 items-center justify-between border-b border-neutral-900 px-6">
        <span className="text-lg font-semibold tracking-tight">resume.ai</span>
        <div className="flex items-center gap-3 text-sm">
          <a href="/sign-in" className="text-neutral-400 hover:text-white">Sign in</a>
        </div>
      </nav>

      <section className="flex flex-col items-center justify-center px-6 py-24 text-center">
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-[1.05] max-w-3xl">
          Stop letting AI decide<br />your job for you.
        </h1>
        <p className="mt-6 text-lg text-neutral-400 max-w-xl">
          Paste a job. Drop your resume. See four ways to win it — with real ATS scores.
        </p>
        <div className="mt-10 w-full max-w-xl">
          <Hero />
        </div>
      </section>
    </main>
  );
}
```

- [ ] **Step 4: Verify it loads**

```bash
npm run dev
```

Visit `localhost:3000`. Expected: new dark-themed hero with form. (Will fail submit until /try/[runId] page exists.)

- [ ] **Step 5: Commit**

```bash
git add src/components/landing/Hero.tsx src/components/upload/ResumeDropzone.tsx src/app/page.tsx
git commit -m "Rewrite landing page with new hook + Hero submission form"
```

---

### Task 27: Score badge + breakdown components

**Files:**
- Create: `src/components/try/ScoreBadge.tsx`
- Create: `src/components/try/ScoreBreakdown.tsx`

- [ ] **Step 1: ScoreBadge**

```tsx
// src/components/try/ScoreBadge.tsx
export function scoreBand(score: number): "good" | "warn" | "bad" {
  if (score >= 85) return "good";
  if (score >= 70) return "warn";
  return "bad";
}

const BG = {
  good: "bg-green-600",
  warn: "bg-amber-600",
  bad: "bg-red-600",
};

export function ScoreBadge({ score, size = "md" }: { score: number; size?: "sm" | "md" | "lg" }) {
  const band = scoreBand(score);
  const sizeCls = size === "sm" ? "text-xs px-2 py-0.5" : size === "lg" ? "text-3xl px-4 py-2 font-bold" : "text-sm px-2.5 py-1";
  return (
    <span className={`inline-flex items-center rounded-full text-white font-semibold ${BG[band]} ${sizeCls}`}>
      {score}
    </span>
  );
}
```

- [ ] **Step 2: ScoreBreakdown**

```tsx
// src/components/try/ScoreBreakdown.tsx
import { ScoreBadge } from "./ScoreBadge";

interface AtsScore {
  total: number;
  keywordMatch: number;
  formatSafety: number;
  narrativeFit: number;
  breakdown: {
    keywordsFound: string[];
    keywordsMissing: string[];
    formatIssues: string[];
    narrativeRationale: string;
  };
}

function Bar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs text-neutral-400">
        <span>{label}</span>
        <span className="font-semibold text-white">{value}</span>
      </div>
      <div className="mt-1 h-1 rounded bg-neutral-800 overflow-hidden">
        <div className="h-full bg-green-500" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export function ScoreBreakdown({ score }: { score: AtsScore }) {
  return (
    <div className="rounded-lg bg-neutral-950 border border-neutral-800 p-5 space-y-4">
      <div className="flex flex-col items-center">
        <ScoreBadge score={score.total} size="lg" />
        <span className="text-xs text-neutral-400 mt-2">ATS score</span>
      </div>
      <div className="space-y-3">
        <Bar label="Keyword match" value={score.keywordMatch} />
        <Bar label="Format safety" value={score.formatSafety} />
        <Bar label="Narrative fit" value={score.narrativeFit} />
      </div>
      <div className="rounded bg-neutral-900 p-3 text-xs space-y-2">
        <div>
          <span className="text-neutral-500">Found:</span>{" "}
          <span className="text-white">{score.breakdown.keywordsFound.join(", ") || "—"}</span>
        </div>
        <div>
          <span className="text-neutral-500">Missing:</span>{" "}
          <span className="text-amber-400">{score.breakdown.keywordsMissing.join(", ") || "—"}</span>
        </div>
        {score.breakdown.formatIssues.length > 0 && (
          <div>
            <span className="text-neutral-500">Format issues:</span>{" "}
            <span className="text-red-400">{score.breakdown.formatIssues.join(", ")}</span>
          </div>
        )}
        <div className="pt-2 border-t border-neutral-800">
          <span className="text-neutral-500">Narrative:</span>{" "}
          <span className="text-neutral-300">{score.breakdown.narrativeRationale}</span>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/try/ScoreBadge.tsx src/components/try/ScoreBreakdown.tsx
git commit -m "Add ScoreBadge + ScoreBreakdown components"
```

---

### Task 28: Card tile + skeleton

**Files:**
- Create: `src/components/try/CardSkeleton.tsx`
- Create: `src/components/try/CardTile.tsx`

- [ ] **Step 1: CardSkeleton**

```tsx
// src/components/try/CardSkeleton.tsx
export function CardSkeleton({ angleLabel, templateSlug }: { angleLabel: string; templateSlug: string }) {
  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-4 aspect-[3/4] animate-pulse flex flex-col">
      <div className="text-[10px] uppercase tracking-wider text-blue-400 font-semibold mb-2">
        {angleLabel} · {templateSlug}
      </div>
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-neutral-800 rounded w-3/4" />
        <div className="h-2 bg-neutral-800 rounded w-1/2" />
        <div className="h-2 bg-neutral-800 rounded w-2/3" />
        <div className="h-2 bg-neutral-800 rounded w-3/5" />
      </div>
      <div className="text-xs text-neutral-500 text-center mt-2">Generating…</div>
    </div>
  );
}
```

- [ ] **Step 2: CardTile**

```tsx
// src/components/try/CardTile.tsx
import Link from "next/link";
import { ScoreBadge } from "./ScoreBadge";
import { ResumePreviewHtml, TemplateSlug } from "./ResumePreviewHtml";
import type { ResumeData } from "@/lib/resume/types";

export function CardTile({
  runId,
  cardId,
  angleLabel,
  templateSlug,
  content,
  totalScore,
}: {
  runId: string;
  cardId: string;
  angleLabel: string;
  templateSlug: string;
  content: ResumeData;
  totalScore: number;
}) {
  return (
    <Link
      href={`/try/${runId}/cards/${cardId}`}
      className="block rounded-lg border border-neutral-800 bg-white hover:border-neutral-500 overflow-hidden relative aspect-[3/4]"
    >
      <div className="absolute top-2 right-2 z-10">
        <ScoreBadge score={totalScore} size="sm" />
      </div>
      <div className="absolute top-2 left-2 z-10 text-[10px] uppercase tracking-wider text-blue-700 bg-white/90 px-2 py-0.5 rounded font-semibold">
        {angleLabel}
      </div>
      <div className="absolute inset-0 overflow-hidden transform scale-[0.4] origin-top-left w-[250%] h-[250%]">
        <ResumePreviewHtml data={content} template={templateSlug as TemplateSlug} />
      </div>
    </Link>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/try/CardSkeleton.tsx src/components/try/CardTile.tsx
git commit -m "Add CardSkeleton + CardTile components"
```

---

### Task 29: Gallery page (/try/[runId])

**Files:**
- Create: `src/app/try/[runId]/page.tsx`

- [ ] **Step 1: Write page**

```tsx
// src/app/try/[runId]/page.tsx
"use client";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { CardSkeleton } from "@/components/try/CardSkeleton";
import { CardTile } from "@/components/try/CardTile";
import { use } from "react";

export default function TryRunPage({ params }: { params: Promise<{ runId: string }> }) {
  const { runId } = use(params);
  const cards = useQuery(api.cards.byRun, { runId: runId as Id<"runs"> });
  const run = useQuery(api.runs.getRun, { runId: runId as Id<"runs"> });

  if (cards === undefined) {
    return <div className="p-12 text-center text-neutral-400">Loading…</div>;
  }
  if (cards.length === 0 && run?.status === "scraping") {
    return <div className="p-12 text-center text-neutral-400">Scraping the job posting…</div>;
  }

  const readyCount = cards.filter((c) => c.status === "ready").length;
  const totalCount = cards.length || 4;
  const allReady = readyCount === totalCount;

  return (
    <main className="min-h-screen bg-black text-white">
      <nav className="border-b border-neutral-900 px-6 h-14 flex items-center">
        <a href="/" className="text-lg font-semibold tracking-tight">resume.ai</a>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold">Your 4 designs</h1>
          <p className="text-sm text-neutral-400 mt-1">
            {allReady ? "Ready — click any to preview." : `Tailoring… ${readyCount} / ${totalCount} ready`}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {cards.map((card) =>
            card.status === "ready" && card.content && card.atsScore ? (
              <CardTile
                key={card._id}
                runId={runId}
                cardId={card._id}
                angleLabel={card.angleLabel}
                templateSlug={card.templateSlug}
                content={card.content}
                totalScore={card.atsScore.total}
              />
            ) : card.status === "failed" ? (
              <div key={card._id} className="rounded border border-red-900 bg-red-950 p-4 aspect-[3/4] flex flex-col">
                <div className="text-[10px] uppercase tracking-wider text-red-400 font-semibold mb-2">
                  {card.angleLabel}
                </div>
                <div className="flex-1 text-xs text-red-300">{card.failureReason}</div>
                <div className="text-xs text-red-400 text-center">Failed</div>
              </div>
            ) : (
              <CardSkeleton key={card._id} angleLabel={card.angleLabel} templateSlug={card.templateSlug} />
            ),
          )}
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add 'src/app/try/[runId]/page.tsx'
git commit -m "Add /try/[runId] gallery page with progressive reveal"
```

---

### Task 30: Card detail page (/try/[runId]/cards/[cardId])

**Files:**
- Create: `src/app/try/[runId]/cards/[cardId]/page.tsx`
- Create: `src/components/try/CardDetail.tsx`
- Create: `src/components/try/DownloadButton.tsx`

- [ ] **Step 1: CardDetail**

```tsx
// src/components/try/CardDetail.tsx
"use client";
import { ResumePreviewHtml, TemplateSlug } from "./ResumePreviewHtml";
import { ScoreBreakdown } from "./ScoreBreakdown";
import { DownloadButton } from "./DownloadButton";
import type { ResumeData } from "@/lib/resume/types";

interface AtsScore {
  total: number;
  keywordMatch: number;
  formatSafety: number;
  narrativeFit: number;
  breakdown: {
    keywordsFound: string[];
    keywordsMissing: string[];
    formatIssues: string[];
    narrativeRationale: string;
  };
}

export function CardDetail({
  cardId,
  angleLabel,
  templateSlug,
  content,
  atsScore,
}: {
  cardId: string;
  angleLabel: string;
  templateSlug: string;
  content: ResumeData;
  atsScore: AtsScore;
}) {
  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="border-b border-neutral-900 px-6 h-14 flex items-center justify-between">
        <a href="/" className="text-lg font-semibold tracking-tight">resume.ai</a>
        <a href="#" onClick={(e) => { e.preventDefault(); history.back(); }} className="text-sm text-neutral-400 hover:text-white">
          ← Back to gallery
        </a>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="text-xs uppercase tracking-wider text-blue-400 font-semibold mb-1">
          {angleLabel} · {templateSlug}
        </div>
        <h1 className="text-2xl font-semibold mb-6">Preview</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
          <div className="rounded border border-neutral-800 overflow-hidden bg-white max-h-[80vh] overflow-y-auto">
            <ResumePreviewHtml data={content} template={templateSlug as TemplateSlug} />
          </div>
          <div className="space-y-4">
            <ScoreBreakdown score={atsScore} />
            <DownloadButton cardId={cardId} />
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: DownloadButton (with sign-up wall)**

```tsx
// src/components/try/DownloadButton.tsx
"use client";
import { useState } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { getFingerprint } from "@/lib/fingerprint";
import { SignUpWall } from "./SignUpWall";

export function DownloadButton({ cardId }: { cardId: string }) {
  const { isSignedIn, isLoaded } = useUser();
  const [showWall, setShowWall] = useState(false);
  const [downloading, setDownloading] = useState(false);

  async function triggerDownload() {
    setDownloading(true);
    try {
      const resp = await fetch(`/api/download/${cardId}?format=docx`);
      if (!resp.ok) throw new Error(`download_failed_${resp.status}`);
      const blob = await resp.blob();
      const filename = resp.headers.get("X-Filename") ?? "resume.docx";
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }

  async function handleClick() {
    if (!isLoaded) return;
    if (isSignedIn) {
      await triggerDownload();
      return;
    }
    setShowWall(true);
  }

  async function handleSignedUp() {
    setShowWall(false);
    // claim the anonymous run for this user
    const fp = await getFingerprint();
    // call /api/claim to attach all runs/resumes with this fingerprint to the user
    await fetch("/api/claim", { method: "POST", body: JSON.stringify({ fingerprintHash: fp }), headers: { "Content-Type": "application/json" } });
    await triggerDownload();
  }

  return (
    <>
      <button
        onClick={handleClick}
        disabled={downloading}
        className="w-full rounded bg-white text-black px-6 py-3 font-semibold disabled:opacity-50"
      >
        {downloading ? "Downloading…" : "Download DOCX →"}
      </button>
      {showWall && <SignUpWall onClose={() => setShowWall(false)} onSignedUp={handleSignedUp} />}
    </>
  );
}
```

- [ ] **Step 3: SignUpWall (Clerk modal)**

```tsx
// src/components/try/SignUpWall.tsx
"use client";
import { SignUp } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";

export function SignUpWall({ onClose, onSignedUp }: { onClose: () => void; onSignedUp: () => void }) {
  const { isSignedIn } = useUser();
  useEffect(() => { if (isSignedIn) onSignedUp(); }, [isSignedIn, onSignedUp]);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-white mb-2">One more step</h3>
        <p className="text-sm text-neutral-400 mb-4">Save your run. Download the PDF. Free forever.</p>
        <SignUp
          appearance={{
            elements: { rootBox: "w-full", card: "shadow-none border-0" },
          }}
        />
        <p className="text-xs text-neutral-500 mt-3">Your 4 designs are saved to this browser.</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Card detail page**

```tsx
// src/app/try/[runId]/cards/[cardId]/page.tsx
"use client";
import { use } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { CardDetail } from "@/components/try/CardDetail";

export default function CardDetailPage({
  params,
}: {
  params: Promise<{ runId: string; cardId: string }>;
}) {
  const { cardId } = use(params);
  const card = useQuery(api.cards._getCardById, { cardId: cardId as Id<"cards"> });

  if (card === undefined) return <div className="p-12 text-center text-neutral-400">Loading…</div>;
  if (!card || card.status !== "ready" || !card.content || !card.atsScore) {
    return <div className="p-12 text-center text-neutral-400">This card isn't ready yet.</div>;
  }

  return (
    <CardDetail
      cardId={card._id}
      angleLabel={card.angleLabel}
      templateSlug={card.templateSlug}
      content={card.content}
      atsScore={card.atsScore}
    />
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add src/components/try/CardDetail.tsx src/components/try/DownloadButton.tsx src/components/try/SignUpWall.tsx 'src/app/try/[runId]/cards/[cardId]/page.tsx'
git commit -m "Add card detail page + sign-up wall + download trigger"
```

---

### Task 31: Download API route (DOCX generation, auth-gated)

**Files:**
- Create: `src/app/api/download/[cardId]/route.ts`
- Create: `src/app/api/claim/route.ts`
- Create: `convex/claim.ts`

- [ ] **Step 1: Download route**

```typescript
// src/app/api/download/[cardId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { generateResume } from "@/lib/docx/generate";
import type { ResumeData } from "@/lib/resume/types";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ cardId: string }> },
) {
  const { userId, getToken } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { cardId } = await params;
  const token = await getToken({ template: "convex" });
  const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
  if (token) convex.setAuth(token);

  const card = await convex.query(api.cards._getCardById, { cardId: cardId as Id<"cards"> });
  if (!card || card.status !== "ready" || !card.content) {
    return NextResponse.json({ error: "card_not_ready" }, { status: 404 });
  }

  const buf = await generateResume(card.content as ResumeData);

  return new NextResponse(buf, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "X-Filename": `resume-${card.angle}.docx`,
      "Content-Disposition": `attachment; filename="resume-${card.angle}.docx"`,
    },
  });
}
```

- [ ] **Step 2: Claim mutation**

```typescript
// convex/claim.ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const claimAnonymousRuns = mutation({
  args: { fingerprintHash: v.string(), email: v.string(), name: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("not_authenticated");

    // ensureUser
    let user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) {
      const userId = await ctx.db.insert("users", {
        clerkId: identity.subject,
        email: args.email,
        name: args.name,
        tier: "free",
      });
      user = await ctx.db.get(userId);
    }
    if (!user) throw new Error("user_create_failed");

    // reassign resumes
    const resumes = await ctx.db
      .query("resumes")
      .withIndex("by_fingerprint", (q) => q.eq("fingerprintHash", args.fingerprintHash))
      .collect();
    for (const r of resumes) {
      await ctx.db.patch(r._id, { userId: user._id, fingerprintHash: undefined });
    }

    // reassign runs
    const runs = await ctx.db
      .query("runs")
      .withIndex("by_fingerprint", (q) => q.eq("fingerprintHash", args.fingerprintHash))
      .collect();
    for (const r of runs) {
      await ctx.db.patch(r._id, { userId: user._id, fingerprintHash: undefined });
    }

    return { userId: user._id, claimed: { resumes: resumes.length, runs: runs.length } };
  },
});
```

- [ ] **Step 3: Claim API route**

```typescript
// src/app/api/claim/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";

export async function POST(req: NextRequest) {
  const { userId, getToken } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const user = await currentUser();
  const { fingerprintHash } = await req.json() as { fingerprintHash: string };

  const token = await getToken({ template: "convex" });
  const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
  if (token) convex.setAuth(token);

  const result = await convex.mutation(api.claim.claimAnonymousRuns, {
    fingerprintHash,
    email: user?.emailAddresses[0]?.emailAddress ?? "",
    name: user?.firstName ?? undefined,
  });

  return NextResponse.json(result);
}
```

- [ ] **Step 4: Push + commit**

```bash
npx convex dev --once
git add 'src/app/api/download/[cardId]/route.ts' src/app/api/claim/route.ts convex/claim.ts
git commit -m "Add download route, claim mutation, and claim API endpoint"
```

---

### Task 32: Middleware — allow anonymous on new routes

**Files:**
- Modify: `src/middleware.ts`

- [ ] **Step 1: Read current middleware**

```bash
cat src/middleware.ts
```

- [ ] **Step 2: Update to make new anonymous routes public**

```typescript
// src/middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const PUBLIC_ROUTES = createRouteMatcher([
  "/",
  "/try(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/health",
]);

export default clerkMiddleware(async (auth, req) => {
  if (!PUBLIC_ROUTES(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
```

- [ ] **Step 3: Test in browser**

```bash
npm run dev
```

Visit `/` and `/try/some-id` — both should load without redirecting to sign-in. Visit `/dashboard` — should redirect to sign-in.

- [ ] **Step 4: Commit**

```bash
git add src/middleware.ts
git commit -m "Allow anonymous access to / and /try/*"
```

---

### Task 33: End-to-end manual test

**Files:** none — exercise the full flow

- [ ] **Step 1: Start servers**

In one terminal:
```bash
npx convex dev
```

In another:
```bash
npm run dev
```

- [ ] **Step 2: Walk the flow**

1. Open `http://localhost:3000`. Confirm new hero loads.
2. Paste a real JD URL (e.g., `https://jobs.lever.co/anthropic` — pick any active posting).
3. Upload any PDF or DOCX resume.
4. Click "See my 4 designs". Confirm redirect to `/try/[runId]`.
5. Watch 4 skeletons → progressive reveal as cards finish (10-40s).
6. Click any card → full preview + score breakdown.
7. Click "Download DOCX". Sign-up wall opens.
8. Complete sign-up (Clerk test account). After auth: download should fire automatically.
9. Open downloaded `.docx` — verify it renders correctly.

- [ ] **Step 3: Document any issues**

If anything broke, file inline TODOs and fix before moving to next plan. Things to verify especially:
- Scraping returns content for non-LinkedIn URLs (greenhouse, lever, ashby work?)
- Sonnet returns valid ResumeData JSON (no markdown fences leaking through)
- Cards stream in (not all-at-once at the end)
- Sign-up wall doesn't trap the user (close button works, after sign-up download fires)

- [ ] **Step 4: Commit any fixes that came out of E2E**

```bash
git status
# stage and commit any fixes individually
```

---

### Task 34: Push branch + open draft PR

**Files:** none

- [ ] **Step 1: Push final state**

```bash
git push
```

- [ ] **Step 2: Open draft PR**

```bash
gh pr create --draft --title "v2: anonymous demo MVP (Plan 1)" --body "$(cat <<'EOF'
## Summary
Implements Plan 1 of the v2 redesign: the anonymous-demo wedge.

- Convex backend (8 tables, schema.ts) added alongside existing v1 Prisma scaffold
- Firecrawl + Apify scraping with domain-based fallback routing
- 4 parallel angle generations (Sonnet) per run, each scored with 3-component ATS (deterministic keyword + format + Haiku narrative)
- Progressive reveal via Convex `useQuery` subscription on cards table
- Sign-up wall (Clerk modal) at export — claims anonymous runs on sign-up
- DOCX download via existing v1 generator
- New landing page at `/` with hook + 2 fields

## Out of scope (later plans)
- Plan 2: signed-in dashboard, fine-tune editor, pricing, Stripe gates
- Plan 3: abuse protection, captcha, retention cron, v1 user migration

## Test plan
- [ ] Submit a Greenhouse JD URL — confirm cards stream in
- [ ] Submit a Lever JD URL
- [ ] Submit a LinkedIn jobs URL (Apify fallback path)
- [ ] Submit a JD that doesn't exist — confirm graceful failure
- [ ] All 4 cards generate and have valid ATS scores
- [ ] Sign-up wall on download → after auth, downloads `.docx`
- [ ] Vitest passes: `npm test`
- [ ] `npx convex dev --once` deploys cleanly

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

- [ ] **Step 3: Print the PR URL**

```bash
gh pr view --json url -q .url
```

---

## Self-Review Checklist (for the planning author — fill out before handoff)

**Spec coverage** — does Plan 1 implement every Plan-1-scoped section of the spec?

- [x] §1 Positioning & journey — landing copy + flow shape (Task 26)
- [x] §2 Stack & surface map — Convex, Clerk, Sonnet, Firecrawl, Apify, /, /try, /try/[runId], /try/[runId]/cards/[cardId] (Tasks 5, 7, 8, 13, 14, 26, 29, 30)
- [x] §3 Data model — all 8 tables in Convex schema (Task 5)
- [x] §4 Backend pipeline — scrapeJD, JD cache, resume parse, runAngle ×4, scoreCard (Tasks 13-24)
- [x] §5 Anonymous demo flow — landing → gallery → detail → sign-up → download (Tasks 26, 29, 30, 31)
- [ ] §6 Abuse protection — DEFERRED to Plan 3 (intentional)
- [ ] §7 Pricing — DEFERRED to Plan 2 (intentional)
- [ ] §8 Brand aesthetic — partial (color tokens applied in landing + gallery; full polish wave deferred to Plan 2)

**Placeholder scan:** None. Every step has explicit code or commands.

**Type consistency:**
- `AtsScore` shape consistent between `convex/ai/score.ts`, `src/components/try/ScoreBreakdown.tsx`, schema validator on `cards.atsScore`
- `ResumeData` shape unchanged from v1 — every render path uses the same type
- `TemplateSlug` ("classic" | "modern" | "creative" | "minimal") consistent between schema, registry, ResumePreviewHtml
- `AngleSlug` consistent between schema, registry, runAngle

**Known sharp edges** (engineer should be aware):
- Convex action `runAngle` references queries via `api.cards._getCardById`, `api.runs.getRun`, `api.resumes.getResume`, `api.jobDescriptions.getById`. Make sure those query exports exist in their respective files (they do in this plan, but cross-reference during execution).
- The Hero submission calls `generateUploadUrl` typed as `useAction` but it's actually a mutation. Convex's React bindings handle this — use `useMutation` if `useAction` doesn't work for mutation types in your codegen version.
- LinkedIn scraping via Apify is slow (30-90s) and sometimes flaky. Acceptable for v1 anon demo; users will see it.
- `claim` route assumes the user's email is set on Clerk *before* the post-signup callback fires. Sometimes there's a race — if `email` is empty, `ensureUser` may fail. Plan 2 can add retry.
