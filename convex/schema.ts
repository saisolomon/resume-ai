import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    stripeCustomerId: v.optional(v.string()),
    tier: v.union(v.literal("free"), v.literal("pro"), v.literal("career")),
    // v4 credit-pack model: resume credits, default 0 / undefined = 0.
    // `tier` stays for backward compat with any legacy subscription rows
    // but is no longer used to gate run starts — that's now `credits`.
    credits: v.optional(v.number()),
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
    parsed: v.any(),
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
      v.literal("direct"),
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
    content: v.optional(v.any()),
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
    // Cover letters — three variants per card, generated on demand via
    // the workspace "Generate cover letters" action. Stored as plain
    // text strings (paragraphs separated by \n\n). The translation
    // pipeline operates on them via the same translateMyCard path.
    coverLetters: v.optional(v.array(v.string())),
  }).index("by_run", ["runId"]),

  // Outreach templates — three per run (cold to recruiter, referral
  // ask, hiring-manager intro). Lives on the run rather than the card
  // because outreach is JD/company-keyed, not angle-keyed. Generated
  // on demand from /run/[runId].
  outreachTemplates: defineTable({
    runId: v.id("runs"),
    userId: v.id("users"),
    templates: v.array(
      v.object({
        kind: v.union(
          v.literal("cold_recruiter"),
          v.literal("referral_ask"),
          v.literal("hiring_manager"),
        ),
        subject: v.string(),
        body: v.string(),
      }),
    ),
  }).index("by_run", ["runId"]),

  // LinkedIn rewrites — standalone deliverable, not tied to a run.
  // Users land on /linkedin, paste current profile + target title or
  // JD, get back rewritten Headline / About / featured experiences.
  // We persist so the user can come back to it later without re-paying
  // a Sonnet call.
  linkedinRewrites: defineTable({
    userId: v.id("users"),
    targetTitle: v.string(),
    headline: v.string(),
    about: v.string(),
    experienceRewrites: v.array(
      v.object({
        roleTitle: v.string(),
        company: v.string(),
        rewrite: v.string(),
      }),
    ),
  }).index("by_user", ["userId"]),

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
      v.literal("incomplete"),
      v.literal("incomplete_expired"),
      v.literal("past_due"),
      v.literal("paused"),
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

  // v4 credit-pack model: one row per Stripe Checkout `payment` session
  // that grants resume credits. Source-of-truth for purchase history shown
  // on /settings + audit trail for any support refund questions. The
  // counterpart `users.credits` field is the running balance.
  creditTransactions: defineTable({
    userId: v.id("users"),
    pack: v.union(
      v.literal("single"),
      v.literal("five_pack"),
      v.literal("twenty_pack"),
    ),
    creditsGranted: v.number(), // 1, 5, or 20
    amountUsd: v.number(),      // 9, 29, or 79 — integer dollar amount
    stripeSessionId: v.string(),
    stripePaymentIntentId: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_stripe_session", ["stripeSessionId"]),

  usageEvents: defineTable({
    userId: v.optional(v.id("users")),
    fingerprintHash: v.optional(v.string()),
    type: v.string(),
    runId: v.optional(v.id("runs")),
    metadata: v.optional(v.any()),
  })
    .index("by_user_type", ["userId", "type"])
    .index("by_fingerprint_type", ["fingerprintHash", "type"])
    // Needed by ipVelocity.checkIpVelocity so we don't full-table-scan
    // every anonymous submit. _creationTime is implicitly the secondary
    // sort key in every Convex index.
    .index("by_type", ["type"]),
});
