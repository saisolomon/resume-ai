import { internalMutation, mutation, query } from "./_generated/server";
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

// JD-only flow: user has no resume to upload, just the JD + a few
// onboarding form answers. We synthesize a skeleton resume from those
// answers so the existing run/card/generation pipeline can run without
// special-casing every downstream consumer. The AI generator
// (ai/generateStarter) is allowed to draft bullets against this
// skeleton — that's the explicit user intent here.
export const insertSyntheticResume = internalMutation({
  args: {
    userId: v.optional(v.id("users")),
    fingerprintHash: v.optional(v.string()),
    title: v.string(),
    parsed: v.any(),
  },
  handler: async (ctx, args) => {
    if (!args.userId && !args.fingerprintHash) {
      throw new Error(
        "insertSyntheticResume_requires_userId_or_fingerprintHash",
      );
    }
    return await ctx.db.insert("resumes", {
      userId: args.userId,
      fingerprintHash: args.fingerprintHash,
      title: args.title,
      source: "paste",
      // rawText kept for grep-back compatibility with anonymous flows
      // that read resume.rawText; we serialize the parsed skeleton so a
      // text dump exists if anything downstream needs one.
      rawText: JSON.stringify(args.parsed, null, 2),
      parsed: args.parsed,
    });
  },
});
