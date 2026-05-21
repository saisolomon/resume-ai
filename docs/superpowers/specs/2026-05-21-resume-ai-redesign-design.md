# resume.ai — v2 Redesign

**Date:** 2026-05-21
**Status:** Approved (design)
**Supersedes:** [`docs/plans/2026-02-25-resume-ai-design.md`](../../plans/2026-02-25-resume-ai-design.md)

## Overview

A full top-to-bottom redesign of resume.ai. v1 sold "AI writes your resume." v2 sells **"AI shows you four ways. You decide."**

The user pastes a job-posting URL and uploads their resume. The app scrapes the JD (Firecrawl primary, Apify fallback), generates four tailored variants in parallel (each pairing a content *angle* — engineering depth, leadership, cross-functional, specialist — with a visual *template*), shows real ATS scores broken down into keyword-match, format-safety, and narrative-fit, and lets the user pick which one to download. The anonymous demo runs end-to-end before sign-up; the wall is only at export.

The product hook: **"Stop letting AI decide your job for you."** Every surface reinforces user agency over AI homogenization.

## Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Entry point | Anonymous demo on landing page | The hook is anti-friction; results before signup |
| Output variation | Hybrid: 4 angles × templates, scored | Hook fit + differentiation; nobody else does angle-variation |
| Input model | JD URL + resume upload (PDF/DOCX/paste) | Ship-able week 1; all ingestion paths already exist in v1 |
| Paywall | At export (sign-up free, PRO unlocks unlimited) | Standard Canva/Figma pattern; preserves the hook |
| Approach | Full top-to-bottom redesign | "Make it better by changing how it works" — total redesign |
| Backend | Convex | Reactive subscriptions = trivial progressive reveal; no SSE infra |
| Pricing framework | Grand Slam Offer (Hormozi value equation) | Per user direction |

## Section 1 — Positioning & User Journey

**Brand voice.** Direct, blunt, slightly anti-establishment. Closer to Linear or Vercel than to Resume.io. No exclamation points. No "Transform your career today!" energy.

**User journey (anonymous → paying).**

1. Lands on `/`. Sees hook + two fields (job URL, resume upload) in the hero. No scroll, no signup, no "demo" pretense.
2. Hits "See my 4 designs." App scrapes JD (5–15s), parses resume (1–2s), fires 4 angle generations in parallel (10–20s each). Progressive reveal: each card streams in as its angle finishes.
3. User sees four cards: angle label, template style, ATS score, keyword match preview. Click any card → full-screen preview with score breakdown.
4. Click "Download" → soft sign-up wall (Clerk modal, Google one-click or email). Sign-up is free. Download fires immediately on completion.
5. Signed-in user lands on `/dashboard` with their first run saved. From there: re-run on a new JD, fine-tune any of the 4 in the chat editor, export DOCX/PDF, save multiple runs.
6. Paywall hits at: free-tier weekly run limit, or specific features (custom angles, version history, ATS deep-scan).

**Three things the design must avoid so positioning doesn't collapse:**

- No hidden information ("blur until you sign up" — kills the hook).
- No silent AI choices ("we automatically picked the best one" — kills the hook).
- No "AI confidence: 99%" theater — show real, defensible metrics with breakdowns.

## Section 2 — Stack & Surface Map

### Stack

- **Frontend:** Next.js 16 App Router, React 19, Tailwind v4, shadcn/ui.
- **Backend:** Convex (queries, mutations, actions, scheduled functions, file storage, real-time subscriptions). Convex replaces all of v1's `src/lib/db/*` and most of `src/app/api/*`.
- **Auth:** Clerk (kept from v1) — Clerk's Convex integration is first-class; signed JWTs flow into Convex `ctx.auth`.
- **Billing:** Stripe (kept) — webhook lands as a Convex HTTP action.
- **AI:** Anthropic SDK (kept) called from Convex actions. 4 parallel angle generations via `ctx.scheduler`.
- **Scraping:** Firecrawl (primary) + Apify (fallback for hostile domains).
- **PDF / DOCX:** `@react-pdf/renderer` and `docx` (kept) — rendered in Convex actions; output written to Convex file storage and returned as a signed URL.
- **Deployment:** Vercel (frontend) + Convex Cloud (backend). No more Vercel Postgres dependency.

### Surface map

| Route | Auth | Purpose |
|---|---|---|
| `/` | none | New landing — hero with URL + upload; below-fold sample-run demo strip |
| `/try` | none | Anonymous run page — submission, progressive gallery reveal, card preview, sign-up wall at export |
| `/sign-in`, `/sign-up` | none | Clerk-hosted |
| `/dashboard` | required | All saved runs + "new run" CTA |
| `/run/[runId]` | owner | A single run's gallery + per-card editor |
| `/run/[runId]/edit/[cardId]` | owner | Repurposed chat fine-tune editor (v1's `/builder`, refitted) |
| `/pricing` | none | Grand Slam Offer page — built with `/grand-slam-offer-fullstack` skill |
| `/settings` | required | Account + billing portal |

### State boundaries

- **Convex tables:** `users`, `runs`, `cards`, `jobDescriptions`, `chatMessages`, `subscriptions`, `usageEvents`, `resumes`.
- **Browser state:** anonymous fingerprint (localStorage), so an anonymous run survives refresh and can be claimed on sign-up.
- **No client-only state** for resume content — Convex subscriptions drive everything reactively.

### Why Convex fits this product specifically

The 4-design gallery streams in over 15–45 seconds. In v1's Prisma + SSE world that's a custom streaming endpoint per route, manual reconnect logic, optimistic UI hacks. In Convex it's:

```ts
const cards = useQuery(api.runs.getCards, { runId });
```

When each parallel angle finishes and writes its row, the UI updates. No SSE, no polling, no reconnect logic. Same applies to the chat fine-tune editor.

## Section 3 — Data Model (Convex Schema)

Eight tables. Templates live in code, not the DB.

```ts
// convex/schema.ts (sketch)

users: {
  clerkId, email, name?, stripeCustomerId?, tier: "free" | "pro" | "career"
} // indexed by clerkId, stripeCustomerId

resumes: {
  userId?, fingerprintHash?,
  title, source: "pdf"|"docx"|"paste"|"linkedin",
  rawText, parsed: ResumeData,
  storageId?
} // indexed by userId, fingerprintHash

jobDescriptions: {
  sourceUrl, canonicalUrl,
  title, company, rawText,
  parsed: { requirements[], responsibilities[], keywords[], seniority?, location? },
  scraper: "firecrawl"|"apify"|"manual",
  scrapedAt
} // indexed by canonicalUrl — cached across users for popular JDs

runs: {
  userId?, fingerprintHash?, resumeId, jobDescriptionId,
  status: "scraping"|"generating"|"ready"|"failed",
  failureReason?, completedAt?
} // indexed by userId+createdAt, fingerprintHash

cards: {
  runId,
  angle: "eng_depth"|"leadership"|"cross_functional"|"specialist",
  angleLabel,
  templateSlug: "classic"|"modern"|"creative"|"minimal",
  status: "pending"|"generating"|"ready"|"failed",
  content?: ResumeData,
  atsScore?: { total, keywordMatch, formatSafety, narrativeFit, breakdown }
} // indexed by runId — powers the progressive reveal subscription

chatMessages: {
  cardId, userId, role: "user"|"assistant", content
} // indexed by cardId — for the fine-tune editor

subscriptions, usageEvents: ported from v1
```

### Key data design choices

- **`jobDescriptions` is shared & cached, not per-user.** Two engineers applying to the same Anthropic posting hit the same `canonicalUrl` and reuse the scraped JD. JDs are public — no privacy issue.
- **Anonymous identity = `fingerprintHash`.** Generated client-side, hashed server-side with a rotating salt. On sign-up, a one-time `claimAnonymousRuns` mutation rewrites rows from fingerprint to userId.
- **Each `card` is its own row.** This is what makes progressive reveal trivial.
- **Templates aren't in the DB.** They're code: a `templates/registry.ts` with the 4 entries + their React-PDF render component + their DOCX generator (v1 already has all 4). Deletes v1's unused `Template` table.
- **`ResumeData` shape stays identical to v1.** Four templates already render it; no reason to break it.

## Section 4 — Backend Pipeline

### Flow

```
Client                          Convex
──────                          ──────
1. Upload resume file ─────────► storage.generateUploadUrl()  (mutation)
   PUT file ───────────────────► Convex storage (returns storageId)

2. startRun({jdUrl, resumeStorageId, fingerprintHash})  ────► action
                                  │
                                  ├─► parseResume(storageId)  [pdf-parse or mammoth]
                                  │   └─ upsert resumes row
                                  │
                                  ├─► resolveJobDescription(jdUrl)
                                  │   ├─ canonical = canonicalize(url)
                                  │   ├─ db: jobDescriptions.byCanonicalUrl(canonical)
                                  │   ├─ if hit: return existing
                                  │   └─ if miss: scrapeJD(url) → upsert
                                  │
                                  ├─► insert runs row (status="generating")
                                  ├─► insert 4 cards rows (status="pending")
                                  └─► scheduler.runAfter(0, internal.generation.runAngle, ×4)

3. useQuery(api.cards.byRun, {runId})  ─── real-time subscription
```

### Scraping routing (`scrapeJD`)

Two-tier with manual-paste fallback. Routing by domain + content quality, not user choice.

```
scrapeJD(url):
  domain = parse(url).host
  if domain in HOSTILE_DOMAINS:      // linkedin.com/jobs, workday hosts, indeed.com
    result = apify.run(actorFor(domain), {url})
  else:                              // default: greenhouse, lever, ashby, ~85% of postings
    result = firecrawl.scrape(url, {formats: ["markdown"], onlyMainContent: true})
    if result.text.length < 800 or missing key fields:
      result = apify.run("apify/web-scraper", {url})
  parsed = extractJDFields(result.text)  // Claude Haiku
  return {sourceUrl, canonicalUrl, rawText, parsed, scraper}
```

If both scrapers return nothing meaningful, the `runs` row is marked `failed` with `failureReason: "scrape_failed"` and the UI flips to a "Paste the JD instead" recovery path.

### Generation (`runAngle`, one per card)

```
runAngle({cardId, runId}):
  card  = db.get(cardId)
  run   = db.get(runId)
  resume= db.get(run.resumeId)
  jd    = db.get(run.jobDescriptionId)

  patch(cardId, {status: "generating"})

  prompt = buildPrompt({
    angle: card.angle,
    template: card.templateSlug,
    resume: resume.parsed,
    jd: jd.parsed,
  })

  content = await anthropic.messages.create({model: "claude-sonnet-4-7", ...prompt})
  parsed  = parseResumeData(content)

  ats = await scoreCard({parsed, jd: jd.parsed})

  patch(cardId, {status: "ready", content: parsed, atsScore: ats})
```

All 4 dispatched via `ctx.scheduler.runAfter(0, ...)` from `startRun`. Each independent. One failure doesn't poison the others — the gallery shows 3 successes + 1 retry tile.

### The four angles (hard-coded for v1)

| Angle | Directive to Claude |
|---|---|
| `eng_depth` | Lead with technical scope, system complexity, deep specialization. Quantify systems built. |
| `leadership` | Lead with team scope, cross-team impact, mentorship, hiring. Quantify people influenced. |
| `cross_functional` | Lead with multi-discipline work — eng + product + design + biz. Quantify launches and stakeholders. |
| `specialist` | Lead with a single deepest skill the JD wants. Tight, role-shaped. |

Template assignment for v1 is fixed: `eng_depth → classic`, `leadership → modern`, `cross_functional → creative`, `specialist → minimal`. Decouples in v2 ("regenerate with a different template").

### ATS score (`scoreCard`)

Three components, all shown to the user with breakdowns. Total is a weighted blend.

```
keywordMatch (40%):  deterministic. |JD keywords ∩ resume terms| / |JD keywords|
                     stemmed/lowercased match; returns found[] and missing[]
formatSafety (20%):  deterministic. rules check against ResumeData:
                     — no images / no tables / no columns
                     — section headers are standard ("Experience" not "My Journey")
                     — dates parseable
                     — bullets <= 2 lines each
                     — phone & email present in contactLine
narrativeFit (40%):  single Claude Haiku call. Rubric-scored 0-100 with rationale.

total = 0.4*keyword + 0.2*format + 0.4*narrative
```

Format checks are deterministic on purpose — the user sees "Format safety: 100" with confidence, not "AI thinks your format is good." Narrative fit is where AI judgment lives; we show its rationale.

### Cost per run

| Step | Model | Tok in / out | Cost |
|---|---|---|---|
| JD parse | Sonnet 4.7 | 4k / 1.5k | $0.034 |
| 4× angle gen | Sonnet 4.7 | 6k / 2k each | $0.252 |
| 4× narrative score | Haiku 4.5 | 4k / 0.3k each | $0.012 |
| Firecrawl scrape | — | — | $0.002–0.01 |
| **Total** | | | **~$0.30 / run** |

## Section 5 — Anonymous Demo Flow

Four screens, none gated until export.

**1. Landing (`/`).** Hook + two fields in the hero. No scroll needed. CTA fires `startRun`. Below the fold: a sample run frozen at "ready" state showing 4 cards from a well-known JD (e.g., the Anthropic SWE posting) for social proof.

**2. Gallery (`/try/[runId]`).** Four skeleton cards appear instantly. Each flips to "ready" as its angle finishes, driven by Convex subscription. Failed cards show a retry button without blocking the others.

**3. Card detail.** Click any card → full-screen preview + 3-component score breakdown + found/missing keywords. Download triggers sign-up wall.

**4. Sign-up wall.** Clerk modal — Google one-click or email. After auth: `claimAnonymousRuns(fingerprintHash)` reassigns the run to userId, then PDF download fires immediately. The user lands on `/dashboard` with their run saved.

### Failure paths (handled inline)

| Failure | Behavior |
|---|---|
| Scrape fails | Skeleton stage replaces itself with a "Paste the JD" textarea + Continue button — same run, different input |
| 1 of 4 cards fails | That card shows "Retry"; gallery still works on the other 3 |
| All 4 cards fail | Run page shows "Something went wrong — your data is saved, try again in 1m" |
| Rate-limited anonymous user | Submit form shows "You've used your free run today. Sign up free for unlimited." |

## Section 6 — Abuse Protection & Cost Model

### Five layers of defense

1. **Fingerprint rate limit** (the main throttle): 1 run/24h, 3 runs/7d per `fingerprintHash`. Soft-fails with sign-up CTA.
2. **IP velocity guard**: in the Convex action, before starting a run: if >5 anonymous runs/hour from same IP across distinct fingerprints, hard-block with 429. Hashed IPs only, TTL 1h.
3. **Captcha gate** (Cloudflare Turnstile): triggered on 2nd run same fingerprint, flagged IP/ASN, or after 100 anonymous runs in last hour globally.
4. **Result cache**: same `(fingerprintHash, resumeStorageHash, jdCanonicalUrl)` → return existing run instead of re-generating.
5. **Global circuit breaker**: daily Anthropic spend cap (default $50/day for v1). On approach: anonymous demo degrades to "We're experiencing high demand. [Sign up] for guaranteed access."

### Cost projections

| Volume / day | Daily cost | Monthly | Implied paid-tier breakeven (Apply=$15/mo) |
|---|---|---|---|
| 50 anon | $15 | $450 | 30 paid users |
| 250 anon | $75 | $2,250 | 150 paid users |
| 1,000 anon | $300 | $9,000 | 600 paid users |

Conversion ≥3% breaks even at scale.

### Privacy & retention

| Data | Retention |
|---|---|
| Anonymous `runs`, `cards`, `resumes` | 30 days after last access; hard-deleted via cron |
| `jobDescriptions` | Forever (public postings, shared cache) |
| Signed-in user data | Until account deletion (one-click in `/settings`) |
| Fingerprint salt | Rotated weekly |
| Stripe customer data | Per Stripe; we only mirror IDs |
| AI prompts/completions | Not stored separately — only final `card.content` persisted |

## Section 7 — Pricing (Grand Slam Offer)

Three tiers. Schema stays `FREE / PRO / CAREER`; UI display names: **Try · Apply · Hunt.**

### Try — $0

- 3 runs / week, 3 saved runs total
- All 4 templates, all 4 angles
- PDF + DOCX export
- Standard ATS scoring (3-component breakdown shown)

### Apply — $15/mo or $144/yr (20% off annual)

For someone actively interviewing:

- Unlimited runs, unlimited saved history
- **Chat fine-tune editor** — every card editable with AI
- **Custom angles** — free-form text prompt ("show me as a startup-y generalist") replaces one of the 4 default angles per run
- **ATS deep-scan** — per-bullet score impact
- **Side-by-side compare** any 2 runs
- **Priority queue** — sub-10s generation
- **JD watchlist** — re-score weekly if the posting changes

Stack math: each capability priced alone is ~$5–8/mo = $40+ implied. Sold at $15.

### Hunt — $35/mo or $336/yr

For strategic searches (career switches, FAANG runs, executive transitions):

- Everything in Apply
- **Cover letter generator** — 3 angle variants per JD
- **LinkedIn profile rewrite** — quarterly, regenerated to match positioning
- **Interview prep** — Claude generates likely questions from JD + practice mode with critique
- **Outreach templates** — tailored DMs for hiring managers per JD
- **1 human review credit/mo** — actual recruiter reviews top-scoring card (sources a small recruiter network — real ops dependency, flag for ops planning)

Stack math: $100+/mo implied. Sold at $35.

### Risk reversal

Single guarantee, shown on pricing page and checkout:

> **30 days. If you don't land an interview, full refund.**
> One email, no support hoops.

Track refund rate. If it tops 10%, the product has a fit problem, not a marketing one.

### Anchoring

Pricing page leads with **Hunt** in the center, larger, marked "Most popular." Apply on the left as the "rational" choice. Try on the right as a step-down.

### What pricing page does NOT do

- No "Enterprise — Contact us" pretense tier.
- No fake countdown timers.
- No "Save 67%" red sticker. Discounts stated factually ("20% off annual"), nothing else.

### Implementation

Invoke `/grand-slam-offer-fullstack` for the pricing-page build during Wave 5. Pre-fill the skill with the tier structure above.

## Section 8 — Migration, Launch Waves, Testing, Non-Goals

### Preserved from v1

Clerk auth, Stripe products + price IDs, four DOCX template generators, `ResumeData` shape, pdf-parse + mammoth resume parsing.

### Replaced

Prisma → Convex. Postgres → Convex DB. `/builder` chat-only flow → multi-design `/try` + repurposed editor. Landing page. Pricing page.

### Launch waves (~4–5 weeks focused work)

| Wave | Scope | Days |
|---|---|---|
| 1. Infra port | Convex project, schema deploy, Clerk↔Convex JWT, Stripe webhook → Convex HTTP action, Postgres→Convex data migration | 2–3 |
| 2. Backend pipeline | Firecrawl + Apify clients, JD canonicalization + caching, JD parser, resume parser ports, 4-angle generator, ATS scoring | 4–5 |
| 3. Anonymous frontend | New `/`, `/try/[runId]` with progressive reveal, card-detail modal, fingerprint client, upload flow | 4–5 |
| 4. Signed-in surfaces | `/dashboard`, `/run/[runId]`, repurposed `/run/[runId]/edit/[cardId]`, `/settings` | 3–4 |
| 5. Pricing + monetization | Pricing page (via `/grand-slam-offer-fullstack`), Stripe checkout, tier gates, customer portal | 2–3 |
| 6. Abuse + cost | Turnstile, IP velocity guard, result cache, circuit breaker, 30-day cleanup cron | 2–3 |
| 7. Launch | Migrate existing v1 users, privacy policy + ToS, sample-run demo strip, soft launch + monitoring | 2–3 |

Waves 3–4 partially overlap with Wave 2 once backend contracts are stable.

### Testing strategy

| Layer | How |
|---|---|
| Convex functions | Unit tests via `convex-test` |
| ATS deterministic scorers | Full unit-test coverage (vitest) |
| LLM pipeline | Golden-set: 10 pre-recorded JDs × 5 resumes, eyeball-reviewed once; assert structural correctness + scores within ±10 of snapshot |
| Scraping | Smoke test ~20 live JD URLs in CI (allowed failures, re-run before launch) |
| End-to-end | Playwright: `paste → 4 cards → download → sign-up modal` on every PR |
| Manual visual QA | 4 templates × 4 angles = 16 PDFs eyeballed per release |
| Cost monitoring | Nightly cron sums `usageEvents` × token metadata → Slack alert if >$X/day |

### Non-goals (explicitly out for v1)

- LinkedIn URL as resume input (deferred, Apify cost + flakiness)
- Native mobile (web-responsive only)
- B2B / recruiter / team accounts
- Public resume hosting (resume.ai/u/alex-chen)
- Multi-language (English only)
- "Apply with one click" job-board integrations
- Direct ATS submission APIs
- Resume version-control / diff viewer
- Custom template builder
- Analytics dashboards beyond Vercel + Convex logs
- Email marketing automation (transactional only)

### Brand aesthetic

- **Palette:** near-black background (`#0a0a0a`), high-contrast off-white text, single accent green for scores (`#16a34a`), amber for warnings (`#ca8a04`), red for failures (`#dc2626`). Score colors are functional — they map to ATS bands.
- **Type:** Inter for UI; IBM Plex Sans / Mono for system details; Times New Roman *only* inside rendered resume previews (because that's what ATS-friendly classic templates use).
- **Voice references:** Linear's directness, Vercel's restraint, Stripe's confidence. No emoji in product surfaces. No gradients beyond a subtle one in the hero.
- **Density:** product-grade, not consumer. Closer to Linear's app than to Notion's marketing site.

## Open questions for implementation

- **Apify actors:** confirm the specific actors for LinkedIn-jobs and Workday before Wave 2. Cost per scrape varies by actor; final routing logic depends on which actors we adopt.
- **Human-review network (Hunt tier):** sourcing/qualifying recruiters is an ops dependency, not an engineering one. Flag for ops planning before Wave 7 launch.
- **Sample-run demo strip:** which JD do we freeze on the landing page? Probably the Anthropic SWE posting since it's instantly recognizable to the target audience. Confirm with marketing before Wave 7.
- **Convex production region:** default is us-east; revisit if EU users dominate traffic.
