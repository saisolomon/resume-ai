import { mutation, query } from "./_generated/server";
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
