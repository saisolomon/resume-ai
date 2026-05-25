"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import type { ResumeData } from "../src/lib/resume/types";

export const startRun = action({
  args: {
    resumeId: v.id("resumes"),
    jdUrl: v.string(),
    fingerprintHash: v.string(),
  },
  handler: async (ctx, args): Promise<Id<"runs">> => {
    const identity = await ctx.auth.getUserIdentity();
    // Resolve the signed-in user (if any) once — used both for the
    // credit balance check AND to set run.userId so the run shows up in
    // /dashboard immediately. Without this, signed-in users' runs were
    // created with only fingerprintHash, so listMyRuns (which filters
    // by_user) never returned them — runs were reachable only via /try.
    const user = identity
      ? await ctx.runQuery(api.users.getCurrentUser, {})
      : null;

    // v4 credit-pack gating. Signed-in users need >=1 credit to start
    // a run. The old free-tier weekly-limit check has been removed;
    // `user.tier` stays in the schema for legacy subscription rows but
    // is no longer consulted here.
    if (user) {
      const balance = user.credits ?? 0;
      if (balance <= 0) {
        throw new Error(
          "no_credits: You're out of credits. Buy a pack to start a new run.",
        );
      }
    }

    // Anonymous flow — enforce per-fingerprint rate limit:
    // 1 run / 24h, 3 runs / 7d. Skipped for signed-in users (who have
    // their own free-tier weekly limit above).
    if (!user) {
      const limitCheck = await ctx.runQuery(api.rateLimit.checkFingerprintLimit, {
        fingerprintHash: args.fingerprintHash,
      });
      if (limitCheck.isOverLimit) {
        throw new Error(
          "rate_limit_exceeded: You've used your free runs. Sign up free for unlimited.",
        );
      }
    }

    const jdId = (await ctx.runAction(api.jobDescriptionsActions.resolveJobDescription, {
      url: args.jdUrl,
    })) as Id<"jobDescriptions">;

    // Anonymous result cache: if the same fingerprint already has a run
    // for this (resume, JD) pair, return it instead of paying for a new
    // Sonnet × 4 + Haiku × 4 generation. Signed-in users are deliberately
    // excluded — they may want to regenerate against the same JD/resume
    // after editing one of the cards.
    if (!user) {
      const cached = await ctx.runQuery(api.runs.findByFingerprintAndIds, {
        fingerprintHash: args.fingerprintHash,
        resumeId: args.resumeId,
        jobDescriptionId: jdId,
      });
      if (cached) {
        return cached._id;
      }
    }

    // Daily cost circuit breaker — anonymous only. Signed-in users
    // (especially paying tiers) bypass this so a flood of anonymous
    // traffic can't lock out paying customers.
    if (!user) {
      const breaker = await ctx.runQuery(api.costGuard.isCircuitOpen, {});
      if (breaker.open) {
        throw new Error(
          `circuit_open: We're experiencing high demand ($${breaker.todaysUsd.toFixed(2)}/$${breaker.capUsd}). Sign up for guaranteed access.`,
        );
      }
    }

    const runId = (await ctx.runMutation(internal.runs.insertRun, {
      // Attach userId for signed-in callers; fall back to fingerprintHash
      // for anonymous demo users so the claim flow can later migrate them.
      userId: user?._id,
      fingerprintHash: user ? undefined : args.fingerprintHash,
      resumeId: args.resumeId,
      jobDescriptionId: jdId,
    })) as Id<"runs">;

    // v4 credit-pack model. Signed-in users had their balance gate-checked
    // above; consume the credit now that the run row exists. `consumeCredit`
    // throws on a 0 balance — defensive against concurrent startRun calls
    // from the same user racing past the gate.
    if (user) {
      await ctx.runMutation(internal.users.consumeCredit, { userId: user._id });
    }

    // For anonymous runs, log the usage event so the next call from this
    // fingerprint sees the run in its sliding window. Must happen after
    // insertRun succeeds so we have a valid runId to attach.
    if (!user) {
      await ctx.runMutation(internal.rateLimit.recordAnonymousRun, {
        fingerprintHash: args.fingerprintHash,
        runId,
      });
    }

    const cardIds = (await ctx.runMutation(internal.runs.insertInitialCards, {
      runId,
    })) as Id<"cards">[];

    for (const cardId of cardIds) {
      await ctx.scheduler.runAfter(0, internal.ai.runAngle.runAngle, { cardId });
    }

    return runId;
  },
});

// JD-only flow entry point. Signed-in users only — anonymous users
// can use the existing upload-resume flow, which has the IP velocity
// + rate-limit infrastructure already plumbed through the
// /api/anonymous-run-start route. Keeping JD-only signed-in-only keeps
// the abuse surface tight (you have to burn a credit + a Clerk account
// to fire a Sonnet call here).
export const startRunFromForm = action({
  args: {
    jdUrl: v.string(),
    formData: v.object({
      name: v.string(),
      contactLine: v.string(),
      eduInstitution: v.string(),
      eduDegree: v.string(),
      eduDate: v.string(),
      currentRole: v.string(),
      currentCompany: v.optional(v.string()),
      targetTitle: v.string(),
      yearsExp: v.string(),
    }),
  },
  handler: async (ctx, args): Promise<{ runId: Id<"runs">; cardId: Id<"cards"> }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("not_authenticated");
    const user = await ctx.runQuery(api.users.getCurrentUser, {});
    if (!user) throw new Error("user_row_missing");

    if ((user.credits ?? 0) <= 0) {
      throw new Error(
        "no_credits: You're out of credits. Buy a pack to start a new run.",
      );
    }

    // Build the skeleton ResumeData from form input. The AI generator
    // (ai/generateStarter) reads this via run.resumeId → resumes.parsed
    // and is allowed to draft bullets against it.
    const skeleton: ResumeData = {
      name: args.formData.name,
      contactLine1: args.formData.contactLine,
      contactLine2: undefined,
      education: [
        {
          institution: args.formData.eduInstitution,
          location: "",
          degree: args.formData.eduDegree,
          date: args.formData.eduDate,
        },
      ],
      experienceSections: [
        {
          heading: "Experience",
          entries: [
            {
              company:
                args.formData.currentCompany || "Current role",
              location: "",
              roles: [
                {
                  title: args.formData.currentRole,
                  date: `${args.formData.yearsExp} yrs · Present`,
                  bullets: [],
                },
              ],
            },
          ],
        },
      ],
      additionalInfo: [],
    };

    const resumeId = (await ctx.runMutation(
      internal.resumes.insertSyntheticResume,
      {
        userId: user._id,
        title: `${args.formData.name} — starter (${args.formData.targetTitle})`,
        parsed: skeleton,
      },
    )) as Id<"resumes">;

    const jdId = (await ctx.runAction(
      api.jobDescriptionsActions.resolveJobDescription,
      { url: args.jdUrl },
    )) as Id<"jobDescriptions">;

    const runId = (await ctx.runMutation(internal.runs.insertRun, {
      userId: user._id,
      resumeId,
      jobDescriptionId: jdId,
    })) as Id<"runs">;

    // Burn the credit immediately — same as the standard run flow.
    await ctx.runMutation(internal.users.consumeCredit, { userId: user._id });

    const cardId = (await ctx.runMutation(
      internal.runs.insertSingleStarterCard,
      { runId },
    )) as Id<"cards">;

    await ctx.scheduler.runAfter(0, internal.ai.generateStarter.generateStarter, {
      cardId,
      formData: args.formData,
    });

    return { runId, cardId };
  },
});
