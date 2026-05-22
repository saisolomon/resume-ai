# Signed-In Product + Pricing Implementation Plan (Plan 2 of 3)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the signed-in product surface — dashboard with run history, the repurposed chat fine-tune editor for individual cards, GSO pricing page, Stripe tier gating, and full v1 Prisma cleanup. After this plan, the entire signed-in product runs on Convex; v1 routes are deleted.

**Architecture:** Build new signed-in surfaces (`/dashboard`, `/run/[runId]`, `/run/[runId]/edit/[cardId]`) as Convex-backed React pages. Port Stripe from a v1 Next.js webhook into a Convex HTTP action. Repurpose v1's chat builder (`/builder`) into a per-card fine-tune editor that mutates a single `cards` row via Convex chat messages. Replace v1's pricing page with a Grand Slam Offer build via the `/grand-slam-offer-fullstack` skill. End the plan with a clean delete of all v1 Prisma code, API routes, and dependencies.

**Tech Stack:** Convex (queries/mutations/actions, HTTP router), Stripe (subscription lifecycle), Clerk (auth, tier-gated middleware), Next.js 16 App Router, shadcn/ui, vitest.

**Spec:** [docs/superpowers/specs/2026-05-21-resume-ai-redesign-design.md](../specs/2026-05-21-resume-ai-redesign-design.md) — Sections 2, 7, 8

**Predecessor:** [Plan 1 — Anonymous Demo MVP](2026-05-21-anonymous-demo-mvp.md) (merged in PR #2)

---

## File Structure

**New Convex files:**

```
convex/
  http.ts                       Convex HTTP router (registers stripeWebhook)
  stripeWebhook.ts              Stripe webhook HTTP action (signature verify, upsert subscription)
  stripe.ts                     Stripe queries (getSubscription, getActiveTier) + internal mutations
  chatMessages.ts               byCard query + send mutation
  cardsActions.ts               regenerateCard (Sonnet rewrite based on chat history) + rerunCard (rerun the original angle)
  dashboard.ts                  listMyRuns query (paginated)
  cleanup.ts                    deleteRun mutation (cascade cards, chatMessages)
```

**New Next.js routes / components:**

```
src/app/
  dashboard/page.tsx            REWRITE: Convex-backed run list with empty state, "new run" CTA
  run/
    [runId]/
      page.tsx                  Signed-in gallery (mostly same as /try/[runId] but with owner check + delete button)
      edit/
        [cardId]/
          page.tsx              Chat fine-tune editor for a single card
  pricing/page.tsx              REWRITE: GSO pricing page (built via /grand-slam-offer-fullstack skill)
  settings/page.tsx             REWRITE: account info + Stripe customer portal link + delete account
  api/
    stripe/
      checkout/route.ts         REWRITE: create Checkout session for selected tier
      portal/route.ts           REWRITE: create Customer Portal session

src/components/
  dashboard/
    RunListItem.tsx             Single row in the run list (JD title, company, date, top-card score)
    EmptyDashboard.tsx          "No runs yet" state with CTA
  editor/
    ChatPanel.tsx               Chat UI driven by Convex chatMessages subscription
    MessageBubble.tsx           Single chat message
    ChatInput.tsx               Text input + send button
    CardPreviewPane.tsx         Live preview pane that updates as Sonnet rewrites the card
    SaveOrDiscardBar.tsx        Bottom bar: "Save changes" / "Discard" buttons after edits
  pricing/
    TierCard.tsx                Per-tier card (anchored layout, "Most popular" badge for Hunt)
    ValueStack.tsx              The Hormozi value-stack list of bullets
    GuaranteeBlock.tsx          30-day-refund guarantee block
    PricingFAQ.tsx              Common Q&A
  settings/
    BillingSection.tsx          Tier badge + Manage subscription button
    DangerZone.tsx              Delete account section

src/middleware.ts               EDIT: add /dashboard, /run/*, /settings to protected matcher
```

**v1 files DELETED in this plan:**

```
src/app/(app)/builder/[resumeId]/page.tsx
src/app/(app)/dashboard/page.tsx                 (replaced by src/app/dashboard/page.tsx)
src/app/(app)/settings/page.tsx                  (replaced by src/app/settings/page.tsx)
src/app/(app)/layout.tsx
src/app/builder/page.tsx
src/app/builder/layout.tsx
src/app/api/resumes/[resumeId]/route.ts
src/app/api/resumes/[resumeId]/chat/route.ts
src/app/api/resumes/route.ts
src/app/api/upload/route.ts
src/app/api/generate-docx/route.ts
src/app/api/generate-pdf/route.ts
src/app/api/chat/route.ts
src/app/api/usage/route.ts
src/app/api/stripe/webhook/route.ts              (replaced by convex/stripeWebhook.ts)
src/app/api/webhooks/clerk/route.ts              (Convex auth handles JWT now)
src/lib/db/prisma.ts
src/lib/db/queries/                              (entire dir)
src/lib/db/user.ts
src/lib/upload/parse-pdf.ts
src/lib/upload/parse-docx.ts                     (mammoth call moved to Convex action in Plan 1)
src/lib/upload/parse-linkedin.ts
src/lib/upload/structure.ts
src/lib/rate-limit.ts                            (Plan 3 reimplements via Convex)
src/lib/rate-limit.test.ts
src/lib/stripe/                                  (logic moves to convex/)
src/lib/resume/context.tsx                       (v1 React context, unused in v2)
src/lib/auth/gate.ts                             (Plan 2 introduces Convex-backed gating)
src/components/billing/PricingTable.tsx          (replaced by new pricing components)
src/components/chat/*                            (entire dir — v1 chat panels)
src/components/dashboard/ResumeCard.tsx
src/components/layout/AppShell.tsx
src/components/layout/SplitLayout.tsx
src/components/resume/                           (entire dir — v1 preview components, replaced by v2's ResumePreviewHtml)
src/components/templates/TemplatePicker.tsx
src/components/upload/FileUploadZone.tsx
src/components/upload/TextPasteInput.tsx
prisma/schema.prisma
prisma/                                          (entire dir)
```

**Dependencies removed:**

- `@prisma/client`
- `prisma`
- `pdf-parse` (now safe — only v1 used it)
- `@types/pdf-parse`
- `radix-ui` (only if no remaining usage; check before removing)

---

## Phase A — Stripe → Convex Migration

### Task 1: Add http router + stripeWebhook scaffold

**Files:**
- Create: `convex/http.ts`
- Create: `convex/stripeWebhook.ts`

- [ ] **Step 1: http.ts**

```typescript
// convex/http.ts
import { httpRouter } from "convex/server";
import { stripeWebhook } from "./stripeWebhook";

const http = httpRouter();

http.route({
  path: "/stripe/webhook",
  method: "POST",
  handler: stripeWebhook,
});

export default http;
```

- [ ] **Step 2: stripeWebhook scaffold**

```typescript
// convex/stripeWebhook.ts
"use node";
import { httpAction } from "./_generated/server";
import Stripe from "stripe";

export const stripeWebhook = httpAction(async (ctx, request) => {
  const sig = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !secret) {
    return new Response("missing signature or secret", { status: 400 });
  }

  const body = await request.text();
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2025-09-30.clover" });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (err) {
    return new Response(`signature_invalid: ${(err as Error).message}`, { status: 400 });
  }

  // event handling added in next task
  return new Response("ok", { status: 200 });
});
```

- [ ] **Step 3: Deploy + commit**

```bash
cd /Users/saisolomon/dev/resume-ai
CONVEX_DEPLOYMENT=prod:blissful-butterfly-235 npx convex deploy
git add convex/http.ts convex/stripeWebhook.ts convex/_generated/
git commit -m "Add Convex HTTP router + Stripe webhook scaffold"
```

---

### Task 2: stripe.ts — internal mutations to upsert subscription

**Files:**
- Create: `convex/stripe.ts`

- [ ] **Step 1: Write the file**

```typescript
// convex/stripe.ts
import { internalMutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";

export const upsertSubscription = internalMutation({
  args: {
    clerkId: v.string(),
    stripeCustomerId: v.string(),
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
  },
  handler: async (ctx, args) => {
    // ensure user exists (might be first-time event before user has called any auth-required mutation)
    let user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();
    if (!user) {
      const userId = await ctx.db.insert("users", {
        clerkId: args.clerkId,
        email: "", // filled by ensureUser later
        stripeCustomerId: args.stripeCustomerId,
        tier: args.tier,
      });
      user = await ctx.db.get(userId);
    } else {
      // patch tier + customer id
      await ctx.db.patch(user._id, {
        tier: args.tier,
        stripeCustomerId: args.stripeCustomerId,
      });
    }
    if (!user) throw new Error("user_resolve_failed");

    // upsert subscription row
    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_stripe_subscription", (q) =>
        q.eq("stripeSubscriptionId", args.stripeSubscriptionId),
      )
      .unique();

    const payload = {
      userId: user._id,
      stripeSubscriptionId: args.stripeSubscriptionId,
      stripePriceId: args.stripePriceId,
      tier: args.tier,
      status: args.status,
      currentPeriodStart: args.currentPeriodStart,
      currentPeriodEnd: args.currentPeriodEnd,
      cancelAtPeriodEnd: args.cancelAtPeriodEnd,
      trialEnd: args.trialEnd,
    };

    if (existing) await ctx.db.patch(existing._id, payload);
    else await ctx.db.insert("subscriptions", payload);
  },
});

export const getMySubscription = query({
  args: {},
  handler: async (ctx): Promise<Doc<"subscriptions"> | null> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return null;
    return await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();
  },
});
```

- [ ] **Step 2: Deploy + commit**

```bash
cd /Users/saisolomon/dev/resume-ai
CONVEX_DEPLOYMENT=prod:blissful-butterfly-235 npx convex deploy
git add convex/stripe.ts convex/_generated/
git commit -m "Add stripe.ts — upsertSubscription internal mutation + getMySubscription query"
```

---

### Task 3: Wire Stripe events into webhook handler

**Files:**
- Modify: `convex/stripeWebhook.ts`

- [ ] **Step 1: Map Stripe price IDs to tiers (helper)**

Add to top of `convex/stripeWebhook.ts`:

```typescript
const PRICE_TIER_MAP: Record<string, "pro" | "career"> = {
  [process.env.STRIPE_PRO_PRICE_ID!]: "pro",
  [process.env.STRIPE_CAREER_PRICE_ID!]: "career",
};

function priceToTier(priceId: string | null | undefined): "free" | "pro" | "career" {
  if (!priceId) return "free";
  return PRICE_TIER_MAP[priceId] ?? "free";
}
```

- [ ] **Step 2: Handle the four relevant events**

Replace the `// event handling added in next task` comment with:

```typescript
import { internal } from "./_generated/api";

const RELEVANT = new Set([
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "checkout.session.completed",
]);

if (!RELEVANT.has(event.type)) {
  return new Response("ignored", { status: 200 });
}

try {
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const clerkId = session.client_reference_id ?? session.metadata?.clerkId;
    if (!clerkId) return new Response("no clerkId", { status: 400 });
    if (!session.subscription) return new Response("no subscription", { status: 200 });
    // fetch the subscription to get full details
    const sub = await stripe.subscriptions.retrieve(session.subscription as string);
    await ctx.runMutation(internal.stripe.upsertSubscription, {
      clerkId,
      stripeCustomerId: sub.customer as string,
      stripeSubscriptionId: sub.id,
      stripePriceId: sub.items.data[0].price.id,
      tier: priceToTier(sub.items.data[0].price.id),
      status: sub.status as never,
      currentPeriodStart: sub.current_period_start * 1000,
      currentPeriodEnd: sub.current_period_end * 1000,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
      trialEnd: sub.trial_end ? sub.trial_end * 1000 : undefined,
    });
  } else {
    const sub = event.data.object as Stripe.Subscription;
    const clerkId = (sub.metadata?.clerkId as string | undefined) ?? "";
    if (!clerkId) return new Response("no clerkId in metadata", { status: 400 });
    await ctx.runMutation(internal.stripe.upsertSubscription, {
      clerkId,
      stripeCustomerId: sub.customer as string,
      stripeSubscriptionId: sub.id,
      stripePriceId: sub.items.data[0].price.id,
      tier: event.type === "customer.subscription.deleted" ? "free" : priceToTier(sub.items.data[0].price.id),
      status: sub.status as never,
      currentPeriodStart: sub.current_period_start * 1000,
      currentPeriodEnd: sub.current_period_end * 1000,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
      trialEnd: sub.trial_end ? sub.trial_end * 1000 : undefined,
    });
  }
} catch (err) {
  console.error("stripe event handler failed", err);
  return new Response(`handler_error: ${(err as Error).message}`, { status: 500 });
}

return new Response("ok", { status: 200 });
```

- [ ] **Step 3: Deploy + commit**

```bash
cd /Users/saisolomon/dev/resume-ai
CONVEX_DEPLOYMENT=prod:blissful-butterfly-235 npx convex deploy
git add convex/stripeWebhook.ts
git commit -m "Wire 4 Stripe events into webhook (subscription create/update/delete + checkout complete)"
```

---

### Task 4: Update Stripe webhook URL + delete v1 webhook

**Files:**
- Delete: `src/app/api/stripe/webhook/route.ts`

- [ ] **Step 1: Configure new webhook URL in Stripe dashboard**

In Stripe Dashboard → Developers → Webhooks:
1. Delete the old endpoint pointing to `<vercel-domain>/api/stripe/webhook`
2. Add new endpoint: `https://blissful-butterfly-235.convex.site/stripe/webhook`
3. Select events: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `checkout.session.completed`
4. Copy the new signing secret

- [ ] **Step 2: Set webhook secret on prod Convex**

```bash
cd /Users/saisolomon/dev/resume-ai
CONVEX_DEPLOYMENT=prod:blissful-butterfly-235 npx convex env set STRIPE_WEBHOOK_SECRET whsec_xxx
CONVEX_DEPLOYMENT=prod:blissful-butterfly-235 npx convex env set STRIPE_SECRET_KEY $(grep '^STRIPE_SECRET_KEY' .env.local | cut -d= -f2)
CONVEX_DEPLOYMENT=prod:blissful-butterfly-235 npx convex env set STRIPE_PRO_PRICE_ID $(grep '^STRIPE_PRO_PRICE_ID' .env.local | cut -d= -f2)
CONVEX_DEPLOYMENT=prod:blissful-butterfly-235 npx convex env set STRIPE_CAREER_PRICE_ID $(grep '^STRIPE_CAREER_PRICE_ID' .env.local | cut -d= -f2)
```

- [ ] **Step 3: Delete v1 webhook + commit**

```bash
rm src/app/api/stripe/webhook/route.ts
git add -A
git commit -m "Delete v1 Stripe webhook route — moved to Convex HTTP action"
```

---

### Task 5: Rewrite checkout + portal API routes (Convex-backed)

**Files:**
- Modify: `src/app/api/stripe/checkout/route.ts`
- Modify: `src/app/api/stripe/portal/route.ts`

- [ ] **Step 1: checkout route**

```typescript
// src/app/api/stripe/checkout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import Stripe from "stripe";

const TIER_PRICE: Record<string, string | undefined> = {
  pro: process.env.STRIPE_PRO_PRICE_ID,
  career: process.env.STRIPE_CAREER_PRICE_ID,
};

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { tier } = (await req.json()) as { tier: "pro" | "career" };
  const priceId = TIER_PRICE[tier];
  if (!priceId) return NextResponse.json({ error: "unknown_tier" }, { status: 400 });

  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress;

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2025-09-30.clover" });
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    customer_email: email,
    client_reference_id: userId,
    subscription_data: { metadata: { clerkId: userId } },
    success_url: `${req.nextUrl.origin}/dashboard?upgraded=1`,
    cancel_url: `${req.nextUrl.origin}/pricing?canceled=1`,
  });
  return NextResponse.json({ url: session.url });
}
```

- [ ] **Step 2: portal route**

```typescript
// src/app/api/stripe/portal/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth, getToken } from "@clerk/nextjs/server";
import Stripe from "stripe";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";

export async function POST(req: NextRequest) {
  const { userId, getToken } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const token = await getToken({ template: "convex" });
  const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
  if (token) convex.setAuth(token);

  const sub = await convex.query(api.stripe.getMySubscription, {});
  if (!sub) return NextResponse.json({ error: "no_subscription" }, { status: 404 });

  // need stripe customer id — fetch from users table via getCurrentUser
  const user = await convex.query(api.users.getCurrentUser, {});
  if (!user?.stripeCustomerId) {
    return NextResponse.json({ error: "no_customer_id" }, { status: 404 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2025-09-30.clover" });
  const portal = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${req.nextUrl.origin}/settings`,
  });
  return NextResponse.json({ url: portal.url });
}
```

- [ ] **Step 3: TS check + commit**

```bash
cd /Users/saisolomon/dev/resume-ai
npx tsc --noEmit
git add src/app/api/stripe/checkout/route.ts src/app/api/stripe/portal/route.ts
git commit -m "Rewrite Stripe checkout + portal routes for Convex-backed auth"
```

---

## Phase B — Dashboard

### Task 6: dashboard.ts — listMyRuns query

**Files:**
- Create: `convex/dashboard.ts`

- [ ] **Step 1: Write file**

```typescript
// convex/dashboard.ts
import { query } from "./_generated/server";
import { v } from "convex/values";

export const listMyRuns = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return [];

    const runs = await ctx.db
      .query("runs")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    // for each run, fetch JD + top card score
    return await Promise.all(
      runs.map(async (run) => {
        const jd = await ctx.db.get(run.jobDescriptionId);
        const cards = await ctx.db
          .query("cards")
          .withIndex("by_run", (q) => q.eq("runId", run._id))
          .collect();
        const ready = cards.filter((c) => c.status === "ready" && c.atsScore);
        const topScore = ready.length > 0 ? Math.max(...ready.map((c) => c.atsScore!.total)) : null;
        return {
          _id: run._id,
          _creationTime: run._creationTime,
          status: run.status,
          jdTitle: jd?.title ?? "(unknown)",
          jdCompany: jd?.company ?? "",
          topScore,
          cardCount: cards.length,
          readyCount: ready.length,
        };
      }),
    );
  },
});
```

- [ ] **Step 2: Deploy + commit**

```bash
cd /Users/saisolomon/dev/resume-ai
CONVEX_DEPLOYMENT=prod:blissful-butterfly-235 npx convex deploy
git add convex/dashboard.ts convex/_generated/
git commit -m "Add dashboard.listMyRuns query"
```

---

### Task 7: Dashboard page + components

**Files:**
- Modify: `src/app/dashboard/page.tsx` (full rewrite)
- Create: `src/components/dashboard/RunListItem.tsx`
- Create: `src/components/dashboard/EmptyDashboard.tsx`

- [ ] **Step 1: RunListItem**

```tsx
// src/components/dashboard/RunListItem.tsx
import Link from "next/link";
import { ScoreBadge } from "@/components/try/ScoreBadge";

export function RunListItem({
  runId,
  jdTitle,
  jdCompany,
  topScore,
  readyCount,
  cardCount,
  createdAt,
  status,
}: {
  runId: string;
  jdTitle: string;
  jdCompany: string;
  topScore: number | null;
  readyCount: number;
  cardCount: number;
  createdAt: number;
  status: string;
}) {
  return (
    <Link
      href={`/run/${runId}`}
      className="flex items-center justify-between border border-neutral-800 bg-neutral-950 hover:border-neutral-600 rounded-lg p-4"
    >
      <div className="min-w-0">
        <div className="font-medium truncate">{jdTitle}</div>
        <div className="text-sm text-neutral-500">{jdCompany}</div>
        <div className="text-xs text-neutral-600 mt-1">
          {new Date(createdAt).toLocaleString()} · {readyCount}/{cardCount} cards · {status}
        </div>
      </div>
      {topScore !== null ? (
        <div className="ml-4 flex flex-col items-center">
          <ScoreBadge score={topScore} size="md" />
          <span className="text-[10px] text-neutral-500 mt-1">top</span>
        </div>
      ) : null}
    </Link>
  );
}
```

- [ ] **Step 2: EmptyDashboard**

```tsx
// src/components/dashboard/EmptyDashboard.tsx
import Link from "next/link";

export function EmptyDashboard() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-24">
      <h2 className="text-2xl font-semibold">No runs yet</h2>
      <p className="text-neutral-500 mt-2">Tailor your resume to your first job posting.</p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center rounded bg-white text-black px-5 py-2 font-semibold"
      >
        New run →
      </Link>
    </div>
  );
}
```

- [ ] **Step 3: Dashboard page**

```tsx
// src/app/dashboard/page.tsx
"use client";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { RunListItem } from "@/components/dashboard/RunListItem";
import { EmptyDashboard } from "@/components/dashboard/EmptyDashboard";

export default function DashboardPage() {
  const runs = useQuery(api.dashboard.listMyRuns, {});

  return (
    <main className="min-h-screen bg-black text-white">
      <nav className="flex h-14 items-center justify-between border-b border-neutral-900 px-6">
        <Link href="/" className="text-lg font-semibold tracking-tight">resume.ai</Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/" className="text-neutral-400 hover:text-white">New run</Link>
          <Link href="/settings" className="text-neutral-400 hover:text-white">Settings</Link>
          <UserButton afterSignOutUrl="/" />
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-semibold mb-6">Your runs</h1>

        {runs === undefined ? (
          <div className="text-neutral-500">Loading…</div>
        ) : runs.length === 0 ? (
          <EmptyDashboard />
        ) : (
          <div className="space-y-2">
            {runs.map((r) => (
              <RunListItem
                key={r._id}
                runId={r._id}
                jdTitle={r.jdTitle}
                jdCompany={r.jdCompany}
                topScore={r.topScore}
                readyCount={r.readyCount}
                cardCount={r.cardCount}
                createdAt={r._creationTime}
                status={r.status}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
```

- [ ] **Step 4: Commit**

```bash
cd /Users/saisolomon/dev/resume-ai
git add src/components/dashboard/ src/app/dashboard/page.tsx
git commit -m "Add Convex-backed dashboard with run list + empty state"
```

---

### Task 8: Signed-in /run/[runId] page (clone /try/[runId] with owner check)

**Files:**
- Create: `src/app/run/[runId]/page.tsx`

- [ ] **Step 1: Write page**

```tsx
// src/app/run/[runId]/page.tsx
"use client";
import { use } from "react";
import { useQuery, useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { useUser, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { CardSkeleton } from "@/components/try/CardSkeleton";
import { CardTile } from "@/components/try/CardTile";

export default function RunPage({ params }: { params: Promise<{ runId: string }> }) {
  const { runId } = use(params);
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();
  const cards = useQuery(api.cards.byRun, { runId: runId as Id<"runs"> });
  const run = useQuery(api.runs.getRun, { runId: runId as Id<"runs"> });
  const deleteRun = useMutation(api.cleanup.deleteRun);

  if (isLoaded && !isSignedIn) {
    router.replace(`/sign-in?redirect=/run/${runId}`);
    return null;
  }

  if (cards === undefined || run === undefined) {
    return <div className="p-12 text-center text-neutral-400">Loading…</div>;
  }

  const readyCount = cards.filter((c) => c.status === "ready").length;
  const allReady = readyCount === 4;

  return (
    <main className="min-h-screen bg-black text-white">
      <nav className="flex h-14 items-center justify-between border-b border-neutral-900 px-6">
        <Link href="/dashboard" className="text-lg font-semibold tracking-tight">resume.ai</Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/dashboard" className="text-neutral-400 hover:text-white">Dashboard</Link>
          <UserButton afterSignOutUrl="/" />
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Your 4 designs</h1>
            <p className="text-sm text-neutral-400 mt-1">
              {allReady ? "Click any card to preview or edit." : `Tailoring… ${readyCount} / 4 ready`}
            </p>
          </div>
          <button
            onClick={async () => {
              if (!confirm("Delete this run? This cannot be undone.")) return;
              await deleteRun({ runId: runId as Id<"runs"> });
              router.push("/dashboard");
            }}
            className="text-sm text-red-500 hover:text-red-400"
          >
            Delete run
          </button>
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
                <div className="text-[10px] uppercase tracking-wider text-red-400 font-semibold mb-2">{card.angleLabel}</div>
                <div className="flex-1 text-xs text-red-300">{card.failureReason}</div>
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
cd /Users/saisolomon/dev/resume-ai
git add 'src/app/run/[runId]/page.tsx'
git commit -m "Add signed-in /run/[runId] gallery (clone of /try/[runId] with owner check + delete)"
```

---

### Task 9: cleanup.ts — deleteRun mutation

**Files:**
- Create: `convex/cleanup.ts`

- [ ] **Step 1: Write**

```typescript
// convex/cleanup.ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const deleteRun = mutation({
  args: { runId: v.id("runs") },
  handler: async (ctx, { runId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("not_authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("user_not_found");

    const run = await ctx.db.get(runId);
    if (!run) return;
    if (run.userId !== user._id) throw new Error("not_owner");

    // cascade: delete chatMessages → cards → run
    const cards = await ctx.db
      .query("cards")
      .withIndex("by_run", (q) => q.eq("runId", runId))
      .collect();
    for (const card of cards) {
      const msgs = await ctx.db
        .query("chatMessages")
        .withIndex("by_card", (q) => q.eq("cardId", card._id))
        .collect();
      for (const m of msgs) await ctx.db.delete(m._id);
      await ctx.db.delete(card._id);
    }
    await ctx.db.delete(runId);
  },
});
```

- [ ] **Step 2: Deploy + commit**

```bash
cd /Users/saisolomon/dev/resume-ai
CONVEX_DEPLOYMENT=prod:blissful-butterfly-235 npx convex deploy
git add convex/cleanup.ts convex/_generated/
git commit -m "Add cleanup.deleteRun mutation (cascade chatMessages + cards)"
```

---

## Phase C — Chat Fine-Tune Editor

### Task 10: chatMessages.ts — byCard query + send mutation

**Files:**
- Create: `convex/chatMessages.ts`

- [ ] **Step 1: Write**

```typescript
// convex/chatMessages.ts
import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const byCard = query({
  args: { cardId: v.id("cards") },
  handler: async (ctx, { cardId }) => {
    return await ctx.db
      .query("chatMessages")
      .withIndex("by_card", (q) => q.eq("cardId", cardId))
      .order("asc")
      .collect();
  },
});

export const sendUserMessage = mutation({
  args: { cardId: v.id("cards"), content: v.string() },
  handler: async (ctx, { cardId, content }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("not_authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("user_not_found");

    const card = await ctx.db.get(cardId);
    if (!card) throw new Error("card_not_found");
    const run = await ctx.db.get(card.runId);
    if (!run || run.userId !== user._id) throw new Error("not_owner");

    return await ctx.db.insert("chatMessages", {
      cardId,
      userId: user._id,
      role: "user",
      content,
    });
  },
});

export const _appendAssistantMessage = internalMutation({
  args: { cardId: v.id("cards"), userId: v.id("users"), content: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.insert("chatMessages", {
      cardId: args.cardId,
      userId: args.userId,
      role: "assistant",
      content: args.content,
    });
  },
});
```

- [ ] **Step 2: Deploy + commit**

```bash
cd /Users/saisolomon/dev/resume-ai
CONVEX_DEPLOYMENT=prod:blissful-butterfly-235 npx convex deploy
git add convex/chatMessages.ts convex/_generated/
git commit -m "Add chatMessages.byCard query + sendUserMessage mutation"
```

---

### Task 11: cardsActions.ts — regenerateCard action

**Files:**
- Create: `convex/cardsActions.ts`

- [ ] **Step 1: Write**

```typescript
// convex/cardsActions.ts
"use node";
import { action } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { v } from "convex/values";
import { getAnthropic, MODELS } from "./ai/anthropic";
import { scoreCard } from "./ai/score";
import type { ResumeData } from "../src/lib/resume/types";
import type { JDParsed } from "../src/lib/ats/narrative";

const EDIT_SYSTEM = `You are editing a tailored resume based on the user's feedback. The user will give natural-language requests (e.g. "make the leadership angle stronger", "swap the AWS bullet for something more specific", "remove the Acme job"). You return the FULL ResumeData JSON with the changes applied — never a partial update.

Rules:
1. Preserve factual content unless the user explicitly says to change it.
2. Follow chat history — the latest user message takes priority.
3. Each bullet ≤ 240 characters.
4. Return ONLY a JSON object with the exact ResumeData shape — no markdown fences, no preamble.

ResumeData shape:
{
  "name": "", "contactLine1": "", "contactLine2": "",
  "education": [{ "institution": "", "location": "", "degree": "", "date": "", "gpa": "", "details": [] }],
  "experienceSections": [{ "heading": "Experience", "entries": [{ "company": "", "companyNote": "", "location": "", "roles": [{ "title": "", "date": "", "bullets": [] }] }] }],
  "additionalInfo": []
}`;

export const regenerateCard = action({
  args: { cardId: v.id("cards") },
  handler: async (ctx, { cardId }) => {
    // load card + history + run/jd context
    const card = await ctx.runQuery(api.cards._getCardById, { cardId });
    if (!card) throw new Error("card_not_found");
    if (card.status !== "ready" || !card.content) throw new Error("card_not_ready");

    const run = await ctx.runQuery(api.runs.getRun, { runId: card.runId });
    if (!run) throw new Error("run_not_found");
    const jd = await ctx.runQuery(api.jobDescriptions.getById, { id: run.jobDescriptionId });
    if (!jd) throw new Error("jd_not_found");

    const messages = await ctx.runQuery(api.chatMessages.byCard, { cardId });

    const client = getAnthropic();
    const resp = await client.messages.create({
      model: MODELS.sonnet,
      max_tokens: 4096,
      system: EDIT_SYSTEM,
      messages: [
        {
          role: "user",
          content: `Job: ${jd.title} at ${jd.company}\n\nCurrent resume:\n${JSON.stringify(card.content, null, 2)}\n\nChat so far:`,
        },
        ...messages.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
        {
          role: "user",
          content: "Return the updated resume JSON only.",
        },
      ],
    });

    const c = resp.content[0];
    if (c.type !== "text") throw new Error("non-text edit response");
    let json = c.text.trim();
    if (json.startsWith("```")) json = json.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    const updated = JSON.parse(json) as ResumeData;

    const jdMerged: JDParsed = { ...jd.parsed, title: jd.title, company: jd.company };
    const ats = await scoreCard(updated, jdMerged);

    await ctx.runMutation(internal.cards.patchCard, {
      cardId,
      patch: { content: updated, atsScore: ats },
    });

    // append assistant ack
    const summary = `Updated. New ATS score: ${ats.total} (was ${card.atsScore?.total ?? "?"}).`;
    await ctx.runMutation(internal.chatMessages._appendAssistantMessage, {
      cardId,
      userId: messages[messages.length - 1].userId,
      content: summary,
    });

    return { newScore: ats.total };
  },
});
```

- [ ] **Step 2: Deploy + commit**

```bash
cd /Users/saisolomon/dev/resume-ai
CONVEX_DEPLOYMENT=prod:blissful-butterfly-235 npx convex deploy
git add convex/cardsActions.ts convex/_generated/
git commit -m "Add regenerateCard action — Sonnet rewrites a card based on chat history"
```

---

### Task 12: Chat panel components

**Files:**
- Create: `src/components/editor/MessageBubble.tsx`
- Create: `src/components/editor/ChatInput.tsx`
- Create: `src/components/editor/ChatPanel.tsx`

- [ ] **Step 1: MessageBubble**

```tsx
// src/components/editor/MessageBubble.tsx
export function MessageBubble({ role, content }: { role: "user" | "assistant"; content: string }) {
  return (
    <div className={`flex ${role === "user" ? "justify-end" : "justify-start"} mb-2`}>
      <div
        className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
          role === "user" ? "bg-blue-600 text-white" : "bg-neutral-800 text-white"
        }`}
      >
        {content}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: ChatInput**

```tsx
// src/components/editor/ChatInput.tsx
"use client";
import { useState, KeyboardEvent } from "react";

export function ChatInput({
  onSend,
  disabled,
}: {
  onSend: (text: string) => void | Promise<void>;
  disabled: boolean;
}) {
  const [text, setText] = useState("");
  async function submit() {
    if (!text.trim() || disabled) return;
    const t = text;
    setText("");
    await onSend(t);
  }
  function onKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }
  return (
    <div className="border-t border-neutral-800 p-3 flex gap-2">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={onKey}
        placeholder='e.g. "make the leadership angle stronger" or "remove the bullet about AWS"'
        disabled={disabled}
        rows={2}
        className="flex-1 rounded border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white placeholder:text-neutral-600 resize-none"
      />
      <button
        onClick={submit}
        disabled={!text.trim() || disabled}
        className="rounded bg-white text-black px-4 py-2 text-sm font-semibold disabled:opacity-50"
      >
        Send
      </button>
    </div>
  );
}
```

- [ ] **Step 3: ChatPanel**

```tsx
// src/components/editor/ChatPanel.tsx
"use client";
import { useState } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";

export function ChatPanel({ cardId }: { cardId: string }) {
  const messages = useQuery(api.chatMessages.byCard, { cardId: cardId as Id<"cards"> });
  const sendMessage = useMutation(api.chatMessages.sendUserMessage);
  const regenerate = useAction(api.cardsActions.regenerateCard);
  const [thinking, setThinking] = useState(false);

  async function handleSend(text: string) {
    setThinking(true);
    try {
      await sendMessage({ cardId: cardId as Id<"cards">, content: text });
      await regenerate({ cardId: cardId as Id<"cards"> });
    } finally {
      setThinking(false);
    }
  }

  return (
    <div className="flex flex-col h-full border border-neutral-800 rounded-lg bg-neutral-950">
      <div className="flex-1 overflow-y-auto p-3">
        {messages === undefined ? (
          <div className="text-xs text-neutral-500">Loading…</div>
        ) : messages.length === 0 ? (
          <div className="text-xs text-neutral-500">
            Tell the AI how to change this card. e.g. "lead with the FAANG experience",
            or "make the bullets more quantitative".
          </div>
        ) : (
          messages.map((m) => <MessageBubble key={m._id} role={m.role} content={m.content} />)
        )}
        {thinking && (
          <div className="text-xs text-neutral-500 mt-2 italic">Rewriting + rescoring…</div>
        )}
      </div>
      <ChatInput onSend={handleSend} disabled={thinking} />
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
cd /Users/saisolomon/dev/resume-ai
git add src/components/editor/
git commit -m "Add chat panel components (MessageBubble + ChatInput + ChatPanel)"
```

---

### Task 13: Editor page — /run/[runId]/edit/[cardId]

**Files:**
- Create: `src/app/run/[runId]/edit/[cardId]/page.tsx`

- [ ] **Step 1: Write**

```tsx
// src/app/run/[runId]/edit/[cardId]/page.tsx
"use client";
import { use } from "react";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useUser, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { ResumePreviewHtml, TemplateSlug } from "@/components/try/ResumePreviewHtml";
import { ScoreBreakdown } from "@/components/try/ScoreBreakdown";
import { ChatPanel } from "@/components/editor/ChatPanel";

export default function EditCardPage({
  params,
}: {
  params: Promise<{ runId: string; cardId: string }>;
}) {
  const { runId, cardId } = use(params);
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();
  const card = useQuery(api.cards._getCardById, { cardId: cardId as Id<"cards"> });

  if (isLoaded && !isSignedIn) {
    router.replace(`/sign-in?redirect=/run/${runId}/edit/${cardId}`);
    return null;
  }

  if (card === undefined) return <div className="p-12 text-neutral-400 text-center">Loading…</div>;
  if (!card || !card.content || !card.atsScore) {
    return <div className="p-12 text-neutral-400 text-center">Card not ready.</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <nav className="flex h-14 items-center justify-between border-b border-neutral-900 px-6">
        <Link href="/dashboard" className="text-lg font-semibold tracking-tight">resume.ai</Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href={`/run/${runId}`} className="text-neutral-400 hover:text-white">← Back to gallery</Link>
          <UserButton afterSignOutUrl="/" />
        </div>
      </nav>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-4 p-4 overflow-hidden">
        <div className="flex flex-col gap-4 overflow-hidden">
          <div className="text-xs uppercase tracking-wider text-blue-400 font-semibold">
            {card.angleLabel} · {card.templateSlug}
          </div>
          <div className="flex-1 overflow-y-auto rounded border border-neutral-800 bg-white">
            <ResumePreviewHtml data={card.content} template={card.templateSlug as TemplateSlug} />
          </div>
          <ScoreBreakdown score={card.atsScore} />
        </div>
        <ChatPanel cardId={cardId} />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/saisolomon/dev/resume-ai
git add 'src/app/run/[runId]/edit/[cardId]/page.tsx'
git commit -m "Add /run/[runId]/edit/[cardId] chat fine-tune editor page"
```

---

## Phase D — Pricing Page

### Task 14: Generate pricing page via /grand-slam-offer-fullstack skill

**Files:**
- Modify: `src/app/pricing/page.tsx` (full rewrite)
- Create: `src/components/pricing/TierCard.tsx`
- Create: `src/components/pricing/ValueStack.tsx`
- Create: `src/components/pricing/GuaranteeBlock.tsx`
- Create: `src/components/pricing/PricingFAQ.tsx`

**Note:** This task is where we invoke `/grand-slam-offer-fullstack` skill. The skill generates the layout — pass it the tier structure from spec §7.

- [ ] **Step 1: Invoke the skill with the spec's tier structure**

When dispatching this task to a subagent, include the GSO config:

```
Tiers (display names "Try / Apply / Hunt"):

TRY ($0):
- 3 runs / week, 3 saved runs total
- All 4 templates, all 4 angles
- PDF + DOCX export
- Standard ATS scoring

APPLY ($15/mo, $144/yr — 20% off):
- Unlimited runs, unlimited history
- Chat fine-tune editor
- Custom angles (free-form prompt replacing one of the 4 defaults)
- ATS deep-scan (per-bullet impact)
- Side-by-side compare any 2 runs
- Priority queue (sub-10s)
- JD watchlist (weekly rescore)
- Stack math: $40+ implied, sold at $15

HUNT ($35/mo, $336/yr — 20% off):
- Everything in Apply
- Cover letter generator (3 angle variants per JD)
- LinkedIn profile rewrite (quarterly)
- Interview prep (Claude generates likely questions + practice mode)
- Outreach templates (DMs for hiring managers per JD)
- 1 human review credit/mo (recruiter reviews top card)
- Stack math: $100+ implied, sold at $35

Guarantee: "30 days. No interview, full refund. One email, no support hoops."
Anchor: Hunt center + larger + "Most popular" badge. Apply left. Try right.
Brand voice: Direct, blunt. No fake countdowns. No "save 67%" red stickers.
```

- [ ] **Step 2: Build the page using the skill's output**

The skill produces the page layout. Wire up Stripe checkout on each tier's CTA:

```tsx
// src/components/pricing/TierCard.tsx (illustrative — skill may produce a richer version)
"use client";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export function TierCard({
  name,
  display,
  priceMonthly,
  priceYearly,
  bullets,
  most_popular,
}: {
  name: "free" | "pro" | "career";
  display: string;
  priceMonthly: number;
  priceYearly: number;
  bullets: string[];
  most_popular?: boolean;
}) {
  const { isSignedIn } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function pick() {
    if (!isSignedIn) {
      router.push(`/sign-up?redirect=/pricing`);
      return;
    }
    if (name === "free") {
      router.push("/dashboard");
      return;
    }
    setLoading(true);
    const resp = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tier: name }),
    });
    const { url } = await resp.json();
    window.location.href = url;
  }

  return (
    <div
      className={`rounded-xl border p-6 flex flex-col ${
        most_popular ? "border-white scale-105 bg-neutral-950" : "border-neutral-800 bg-neutral-950"
      }`}
    >
      {most_popular && (
        <div className="text-[10px] uppercase tracking-widest text-white font-semibold mb-2">Most popular</div>
      )}
      <div className="text-lg font-semibold">{display}</div>
      <div className="mt-3 text-3xl font-bold">
        ${priceMonthly}
        <span className="text-sm font-normal text-neutral-500">/mo</span>
      </div>
      <div className="text-xs text-neutral-500">${priceYearly}/year (20% off)</div>
      <ul className="mt-6 space-y-2 text-sm text-neutral-300 flex-1">
        {bullets.map((b, i) => (
          <li key={i}>✓ {b}</li>
        ))}
      </ul>
      <button
        onClick={pick}
        disabled={loading}
        className={`mt-6 rounded px-4 py-2 font-semibold ${
          most_popular ? "bg-white text-black" : "bg-neutral-800 text-white hover:bg-neutral-700"
        }`}
      >
        {loading ? "Loading…" : `Get ${display}`}
      </button>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
cd /Users/saisolomon/dev/resume-ai
git add src/app/pricing/page.tsx src/components/pricing/
git commit -m "Add GSO pricing page (Try / Apply / Hunt) with Stripe checkout"
```

---

## Phase E — Settings + Tier Gating

### Task 15: Settings page

**Files:**
- Modify: `src/app/settings/page.tsx`
- Create: `src/components/settings/BillingSection.tsx`
- Create: `src/components/settings/DangerZone.tsx`

- [ ] **Step 1: BillingSection**

```tsx
// src/components/settings/BillingSection.tsx
"use client";
import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

const TIER_LABEL: Record<string, string> = { free: "Try", pro: "Apply", career: "Hunt" };

export function BillingSection() {
  const sub = useQuery(api.stripe.getMySubscription, {});
  const user = useQuery(api.users.getCurrentUser, {});
  const [loading, setLoading] = useState(false);

  async function openPortal() {
    setLoading(true);
    const resp = await fetch("/api/stripe/portal", { method: "POST" });
    const { url } = await resp.json();
    window.location.href = url;
  }

  const tier = user?.tier ?? "free";

  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-5">
      <h3 className="font-semibold mb-3">Billing</h3>
      <div className="flex items-center justify-between text-sm">
        <div>
          <div>Current plan: <span className="font-semibold">{TIER_LABEL[tier]}</span></div>
          {sub && (
            <div className="text-xs text-neutral-500 mt-1">
              Renews {new Date(sub.currentPeriodEnd).toLocaleDateString()}
              {sub.cancelAtPeriodEnd && " — canceling at period end"}
            </div>
          )}
        </div>
        {tier !== "free" ? (
          <button
            onClick={openPortal}
            disabled={loading}
            className="rounded bg-white text-black px-4 py-2 font-semibold"
          >
            {loading ? "…" : "Manage subscription"}
          </button>
        ) : (
          <a href="/pricing" className="rounded bg-white text-black px-4 py-2 font-semibold">
            Upgrade
          </a>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: DangerZone**

```tsx
// src/components/settings/DangerZone.tsx
"use client";
import { useClerk } from "@clerk/nextjs";

export function DangerZone() {
  const { user, signOut } = useClerk();

  async function deleteAccount() {
    if (!confirm("Delete your account permanently? All runs will be erased.")) return;
    if (!confirm("Are you absolutely sure? This cannot be undone.")) return;

    // delete Convex-side via API
    await fetch("/api/account", { method: "DELETE" });
    // delete Clerk user
    await user?.delete();
    signOut({ redirectUrl: "/" });
  }

  return (
    <div className="rounded-lg border border-red-900 bg-red-950/30 p-5 mt-6">
      <h3 className="font-semibold mb-2 text-red-400">Danger zone</h3>
      <p className="text-sm text-neutral-400 mb-3">Permanently delete your account and all your runs.</p>
      <button onClick={deleteAccount} className="rounded border border-red-700 text-red-400 px-4 py-2 text-sm">
        Delete account
      </button>
    </div>
  );
}
```

- [ ] **Step 3: /api/account delete endpoint**

Create `src/app/api/account/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";

export async function DELETE(_req: NextRequest) {
  const { userId, getToken } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const token = await getToken({ template: "convex" });
  const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
  if (token) convex.setAuth(token);

  await convex.mutation(api.cleanup.deleteCurrentUser, {});
  return NextResponse.json({ ok: true });
}
```

Add `deleteCurrentUser` to `convex/cleanup.ts`:

```typescript
export const deleteCurrentUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("not_authenticated");
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return;

    // cascade through everything owned by user
    const runs = await ctx.db.query("runs").withIndex("by_user", (q) => q.eq("userId", user._id)).collect();
    for (const r of runs) {
      const cards = await ctx.db.query("cards").withIndex("by_run", (q) => q.eq("runId", r._id)).collect();
      for (const c of cards) {
        const msgs = await ctx.db.query("chatMessages").withIndex("by_card", (q) => q.eq("cardId", c._id)).collect();
        for (const m of msgs) await ctx.db.delete(m._id);
        await ctx.db.delete(c._id);
      }
      await ctx.db.delete(r._id);
    }
    const resumes = await ctx.db.query("resumes").withIndex("by_user", (q) => q.eq("userId", user._id)).collect();
    for (const r of resumes) await ctx.db.delete(r._id);
    const subs = await ctx.db.query("subscriptions").withIndex("by_user", (q) => q.eq("userId", user._id)).collect();
    for (const s of subs) await ctx.db.delete(s._id);
    await ctx.db.delete(user._id);
  },
});
```

- [ ] **Step 4: Settings page**

```tsx
// src/app/settings/page.tsx
"use client";
import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";
import { BillingSection } from "@/components/settings/BillingSection";
import { DangerZone } from "@/components/settings/DangerZone";

export default function SettingsPage() {
  const { user } = useUser();

  return (
    <main className="min-h-screen bg-black text-white">
      <nav className="flex h-14 items-center justify-between border-b border-neutral-900 px-6">
        <Link href="/dashboard" className="text-lg font-semibold tracking-tight">resume.ai</Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/dashboard" className="text-neutral-400 hover:text-white">Dashboard</Link>
          <UserButton afterSignOutUrl="/" />
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Settings</h1>
          <p className="text-sm text-neutral-500 mt-1">{user?.emailAddresses[0]?.emailAddress}</p>
        </div>
        <BillingSection />
        <DangerZone />
      </div>
    </main>
  );
}
```

- [ ] **Step 5: Deploy + commit**

```bash
cd /Users/saisolomon/dev/resume-ai
CONVEX_DEPLOYMENT=prod:blissful-butterfly-235 npx convex deploy
git add convex/cleanup.ts convex/_generated/ src/components/settings/ src/app/settings/page.tsx src/app/api/account/route.ts
git commit -m "Add settings page with billing + danger zone, deleteCurrentUser mutation"
```

---

### Task 16: Update middleware — protect new signed-in routes

**Files:**
- Modify: `src/middleware.ts`

- [ ] **Step 1: Update protected route matcher**

```typescript
// src/middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/run(.*)",
  "/settings(.*)",
  "/api/download(.*)",
  "/api/claim(.*)",
  "/api/account(.*)",
  "/api/stripe/checkout(.*)",
  "/api/stripe/portal(.*)",
]);

const handler = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  ? clerkMiddleware(async (auth, req) => {
      if (isProtectedRoute(req)) await auth.protect();
    })
  : () => NextResponse.next();

export default handler;

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
```

- [ ] **Step 2: Commit**

```bash
cd /Users/saisolomon/dev/resume-ai
git add src/middleware.ts
git commit -m "Middleware: protect /dashboard, /run/*, /settings + drop v1 routes"
```

---

### Task 17: Tier gating helper + apply to features

**Files:**
- Create: `src/lib/tier.ts`
- Create: `src/lib/tier.test.ts`

- [ ] **Step 1: Tests**

```typescript
// src/lib/tier.test.ts
import { describe, it, expect } from "vitest";
import { canAccessFeature, weeklyRunLimit } from "./tier";

describe("canAccessFeature", () => {
  it("free can edit nothing", () => {
    expect(canAccessFeature("free", "fine_tune_editor")).toBe(false);
  });
  it("pro can edit", () => {
    expect(canAccessFeature("pro", "fine_tune_editor")).toBe(true);
  });
  it("career has cover letter", () => {
    expect(canAccessFeature("career", "cover_letter")).toBe(true);
  });
  it("pro cannot cover letter", () => {
    expect(canAccessFeature("pro", "cover_letter")).toBe(false);
  });
});

describe("weeklyRunLimit", () => {
  it("free is 3", () => expect(weeklyRunLimit("free")).toBe(3));
  it("pro is Infinity", () => expect(weeklyRunLimit("pro")).toBe(Infinity));
  it("career is Infinity", () => expect(weeklyRunLimit("career")).toBe(Infinity));
});
```

- [ ] **Step 2: Verify fails**

```bash
cd /Users/saisolomon/dev/resume-ai
npx vitest run src/lib/tier.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement**

```typescript
// src/lib/tier.ts
export type Tier = "free" | "pro" | "career";

export type Feature =
  | "fine_tune_editor"
  | "custom_angle"
  | "ats_deep_scan"
  | "side_by_side"
  | "priority_queue"
  | "jd_watchlist"
  | "cover_letter"
  | "linkedin_rewrite"
  | "interview_prep"
  | "outreach_templates"
  | "human_review";

const FREE_FEATURES = new Set<Feature>();
const PRO_FEATURES = new Set<Feature>([
  "fine_tune_editor",
  "custom_angle",
  "ats_deep_scan",
  "side_by_side",
  "priority_queue",
  "jd_watchlist",
]);
const CAREER_FEATURES = new Set<Feature>([
  "cover_letter",
  "linkedin_rewrite",
  "interview_prep",
  "outreach_templates",
  "human_review",
]);

export function canAccessFeature(tier: Tier, feature: Feature): boolean {
  if (tier === "free") return FREE_FEATURES.has(feature);
  if (tier === "pro") return PRO_FEATURES.has(feature);
  // career has everything in pro + career-only
  return PRO_FEATURES.has(feature) || CAREER_FEATURES.has(feature);
}

export function weeklyRunLimit(tier: Tier): number {
  if (tier === "free") return 3;
  return Infinity;
}
```

- [ ] **Step 4: Verify passes + commit**

```bash
cd /Users/saisolomon/dev/resume-ai
npx vitest run src/lib/tier.test.ts
git add src/lib/tier.ts src/lib/tier.test.ts
git commit -m "Add tier gating helper (canAccessFeature, weeklyRunLimit) with tests"
```

---

### Task 18: Apply tier gate in chat editor + run-limit enforcement

**Files:**
- Modify: `src/components/editor/ChatPanel.tsx`
- Modify: `convex/runsActions.ts`

- [ ] **Step 1: Editor gating UI**

In `ChatPanel.tsx`, add a gate at the top:

```tsx
// add to imports:
import { useQuery } from "convex/react";
import { canAccessFeature } from "@/lib/tier";
import Link from "next/link";

// inside ChatPanel, before the return:
const user = useQuery(api.users.getCurrentUser, {});
const tier = (user?.tier ?? "free") as "free" | "pro" | "career";

if (user !== undefined && !canAccessFeature(tier, "fine_tune_editor")) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-6 border border-neutral-800 rounded-lg bg-neutral-950">
      <div className="text-lg font-semibold mb-2">Fine-tune editor is Apply+</div>
      <p className="text-sm text-neutral-500 mb-4">Edit any card with chat AI. Unlimited rewrites.</p>
      <Link href="/pricing" className="rounded bg-white text-black px-5 py-2 font-semibold text-sm">
        Upgrade →
      </Link>
    </div>
  );
}
```

- [ ] **Step 2: Backend run-limit enforcement**

In `convex/runsActions.ts` `startRun`, before scheduling angle generations:

```typescript
import { weeklyRunLimit } from "../src/lib/tier";

// at top of handler, after auth check (if any):
const identity = await ctx.auth.getUserIdentity();
if (identity) {
  // signed-in run — check weekly limit
  const user = await ctx.runQuery(api.users.getCurrentUser, {});
  if (user) {
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recentRuns = await ctx.runQuery(api.dashboard.listMyRuns, {});
    const recentCount = recentRuns.filter((r) => r._creationTime >= oneWeekAgo).length;
    const limit = weeklyRunLimit(user.tier);
    if (recentCount >= limit) {
      throw new Error(`run_limit: free tier is ${limit} runs/week. Upgrade to Apply for unlimited.`);
    }
  }
}
```

(Note: a more robust limit check would be a dedicated count query, not reusing listMyRuns. Keep simple for v1.)

- [ ] **Step 3: Deploy + commit**

```bash
cd /Users/saisolomon/dev/resume-ai
CONVEX_DEPLOYMENT=prod:blissful-butterfly-235 npx convex deploy
git add src/components/editor/ChatPanel.tsx convex/runsActions.ts
git commit -m "Apply tier gate: chat editor (Apply+) and free-tier run limit (3/week)"
```

---

## Phase F — v1 Cleanup

### Task 19: Delete all v1 Next.js routes

**Files:** (delete)
- `src/app/(app)/builder/[resumeId]/page.tsx`
- `src/app/(app)/dashboard/page.tsx`
- `src/app/(app)/settings/page.tsx`
- `src/app/(app)/layout.tsx`
- `src/app/builder/page.tsx`
- `src/app/builder/layout.tsx`
- `src/app/api/resumes/[resumeId]/route.ts`
- `src/app/api/resumes/[resumeId]/chat/route.ts`
- `src/app/api/resumes/route.ts`
- `src/app/api/upload/route.ts`
- `src/app/api/generate-docx/route.ts`
- `src/app/api/generate-pdf/route.ts`
- `src/app/api/chat/route.ts`
- `src/app/api/usage/route.ts`
- `src/app/api/webhooks/clerk/route.ts`

- [ ] **Step 1: Delete + commit**

```bash
cd /Users/saisolomon/dev/resume-ai
rm -rf 'src/app/(app)' src/app/builder
rm 'src/app/api/resumes/[resumeId]/route.ts' 'src/app/api/resumes/[resumeId]/chat/route.ts' src/app/api/resumes/route.ts
rm src/app/api/upload/route.ts src/app/api/generate-docx/route.ts src/app/api/generate-pdf/route.ts
rm src/app/api/chat/route.ts src/app/api/usage/route.ts src/app/api/webhooks/clerk/route.ts
rmdir 'src/app/api/resumes' src/app/api/webhooks 2>/dev/null
git add -A
git commit -m "Delete v1 Next.js routes — replaced by Convex + v2 UI"
```

---

### Task 20: Delete v1 lib code

**Files:** (delete)
- `src/lib/db/` (entire)
- `src/lib/upload/parse-pdf.ts`
- `src/lib/upload/parse-docx.ts`
- `src/lib/upload/parse-linkedin.ts`
- `src/lib/upload/structure.ts`
- `src/lib/rate-limit.ts`
- `src/lib/rate-limit.test.ts`
- `src/lib/stripe/`
- `src/lib/resume/context.tsx`
- `src/lib/auth/`

- [ ] **Step 1: Delete + commit**

```bash
cd /Users/saisolomon/dev/resume-ai
rm -rf src/lib/db src/lib/upload src/lib/stripe src/lib/auth
rm src/lib/rate-limit.ts src/lib/rate-limit.test.ts src/lib/resume/context.tsx
git add -A
git commit -m "Delete v1 lib code — Prisma, parsers, rate-limit, stripe client"
```

---

### Task 21: Delete v1 components

**Files:** (delete)
- `src/components/billing/`
- `src/components/chat/`
- `src/components/dashboard/ResumeCard.tsx`
- `src/components/layout/AppShell.tsx`
- `src/components/layout/SplitLayout.tsx`
- `src/components/layout/Navbar.tsx`
- `src/components/resume/`
- `src/components/templates/`
- `src/components/upload/FileUploadZone.tsx`
- `src/components/upload/TextPasteInput.tsx`

- [ ] **Step 1: Delete + commit**

```bash
cd /Users/saisolomon/dev/resume-ai
rm -rf src/components/billing src/components/chat src/components/resume src/components/templates
rm src/components/dashboard/ResumeCard.tsx src/components/layout/AppShell.tsx src/components/layout/SplitLayout.tsx src/components/layout/Navbar.tsx
rm src/components/upload/FileUploadZone.tsx src/components/upload/TextPasteInput.tsx
rmdir src/components/layout 2>/dev/null
git add -A
git commit -m "Delete v1 components"
```

---

### Task 22: Delete Prisma + DOCX generator (move to convex)

**Files:**
- Delete: `prisma/` (entire)
- Move: `src/lib/docx/generate.ts` → `convex/docx/generate.ts` (so /api/download can call from Vercel)

- [ ] **Step 1: Verify docx generator is still used**

```bash
grep -rln "from \"@/lib/docx" src/ 2>/dev/null
```

If it's only used by `src/app/api/download/[cardId]/route.ts`, leave it in `src/lib/docx/` (Next.js can import from src/lib/). If we want to move it to Convex actions, that's a bigger refactor — skip for now.

- [ ] **Step 2: Delete prisma**

```bash
cd /Users/saisolomon/dev/resume-ai
rm -rf prisma
git add -A
git commit -m "Delete prisma schema dir"
```

---

### Task 23: Remove unused deps from package.json

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Uninstall**

```bash
cd /Users/saisolomon/dev/resume-ai
npm uninstall @prisma/client prisma pdf-parse @types/pdf-parse
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: clean build with new route tree (no /builder, no /api/resumes, etc.).

If TypeScript errors remain in v2 code that depended on now-deleted files, fix them inline.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "Drop @prisma/client, prisma, pdf-parse from deps (v1 removed)"
```

---

### Task 24: Final integration test + PR

**Files:** none

- [ ] **Step 1: Run all tests**

```bash
cd /Users/saisolomon/dev/resume-ai
npx vitest run
```

Expected: all pass (including new tier.test.ts).

- [ ] **Step 2: Build**

```bash
npm run build
```

Expected: clean.

- [ ] **Step 3: Walk the signed-in flow locally**

```bash
npx convex dev    # one terminal
npm run dev       # another terminal
```

In browser:
1. Visit `/` → submit a run anonymously
2. Hit download → sign-up wall → sign up
3. Land on `/dashboard` → see the new run
4. Click the run → see gallery at `/run/<runId>`
5. Click a card → fine-tune editor at `/run/<runId>/edit/<cardId>`
6. Send "make this more concise" in chat → wait for rewrite
7. Score should update
8. Visit `/pricing` → see Try/Apply/Hunt
9. Click "Get Apply" → Stripe Checkout opens (use test card 4242 4242 4242 4242)
10. After Checkout success → `/dashboard?upgraded=1` → tier should show Apply
11. Visit `/settings` → see Apply tier badge + Manage subscription button
12. Click Manage → opens Stripe Customer Portal

- [ ] **Step 4: Push + open PR**

```bash
git push -u origin feat/v2-signed-in-pricing
gh pr create --base main --title "v2 Plan 2: signed-in dashboard + chat editor + GSO pricing + v1 cleanup" --body "$(cat <<'EOF'
## Summary
Implements Plan 2 of the v2 redesign.

- Convex-backed dashboard (\`/dashboard\`) with run history
- Signed-in gallery (\`/run/[runId]\`) with delete
- Chat fine-tune editor (\`/run/[runId]/edit/[cardId]\`) — Sonnet rewrites a single card based on natural-language requests
- Stripe webhook migrated from Next.js API route to Convex HTTP action
- GSO pricing page (Try / Apply / Hunt) with Stripe Checkout integration
- Settings page with billing + danger zone
- Tier gating: free = 3 runs/week + no editor; Apply unlocks editor; Hunt unlocks future features
- **v1 cleanup**: deleted all v1 Next.js routes, v1 components, v1 lib code, Prisma, pdf-parse

## Out of scope (Plan 3)
- Abuse protection (Turnstile, IP velocity guards)
- 30-day retention cron
- v1 user data migration (if any real users)
- Privacy policy + ToS pages
- Sample-run demo strip on landing
- Switch to proper CONVEX_DEPLOY_KEY build

## Test plan
- [ ] Submit anonymous run → sign up → land on /dashboard with the run saved
- [ ] Open a card → edit via chat → score updates
- [ ] Upgrade via Stripe Checkout (test card 4242 4242 4242 4242)
- [ ] Open Stripe Customer Portal from /settings
- [ ] Delete account from /settings → all data gone
- [ ] All vitest tests pass
- [ ] \`next build\` clean

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

## Self-Review

**Spec coverage** — does Plan 2 implement all Plan-2-scoped sections?

- [x] §2 (Surface map) — `/dashboard`, `/run/[runId]`, `/run/[runId]/edit/[cardId]`, `/pricing`, `/settings` all built (Tasks 7, 8, 13, 14, 15)
- [x] §3 (Data model) — chat editor reads/writes `chatMessages` per existing schema (Tasks 10-11)
- [x] §4 (Backend pipeline) — `regenerateCard` action mirrors `runAngle` shape (Task 11)
- [x] §7 (Pricing — Grand Slam Offer) — Try/Apply/Hunt tier cards + Stripe Checkout (Task 14)
- [x] §8 (Migration) — v1 cleanup (Tasks 19-23)

**Known sharp edges:**

- Pricing page in Task 14 leaves the layout work to `/grand-slam-offer-fullstack` skill — the subagent dispatching this task needs to invoke that skill and use its output. The illustrative `TierCard.tsx` is a fallback if the skill output doesn't ship per-tier components.
- Stripe webhook URL change in Task 4 is a manual dashboard step. Make sure to set `STRIPE_WEBHOOK_SECRET` on Convex AFTER Stripe generates a new secret (it'll be a different value than v1's).
- Account delete (Task 15 Step 3) doesn't delete from Stripe — only Clerk + Convex. Stripe subscriptions remain active until they expire. Worth flagging in Plan 3 as a cleanup hook.
- Free-tier run limit (Task 18 Step 2) uses `listMyRuns` which is inefficient if user has many runs. Plan 3 can add a dedicated indexed count query.
