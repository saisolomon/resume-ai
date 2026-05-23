"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import mammoth from "mammoth";
import { getAnthropic, MODELS } from "./ai/anthropic";

const STRUCTURING_PROMPT = `You are a resume parser. Given a resume document, extract and structure the information into JSON. Return ONLY valid JSON, no markdown fences. Use this exact shape:
{
  "name": "Full Name",
  "contactLine1": "email | phone | LinkedIn | location",
  "contactLine2": "optional",
  "education": [{ "institution": "", "location": "", "degree": "", "date": "", "gpa": "", "details": [] }],
  "experienceSections": [{ "heading": "Experience", "entries": [{ "company": "", "location": "", "roles": [{ "title": "", "date": "", "bullets": [] }] }] }],
  "additionalInfo": []
}
Rules: If a field is missing, use empty string or array. Keep bullets concise, preserve content.`;

function arrayBufferToBase64(buf: ArrayBuffer): string {
  return Buffer.from(buf).toString("base64");
}

interface StructureResult {
  rawText: string;
  parsed: unknown;
}

// See ai/score.ts — record-tokens callback fires immediately after the
// Anthropic response so spend gets counted even when JSON parsing throws.
type RecordTokens = (tokens: { input: number; output: number }) => Promise<void>;

async function structureFromDocxBuffer(
  buf: ArrayBuffer,
  recordTokens: RecordTokens,
): Promise<StructureResult> {
  const r = await mammoth.extractRawText({ buffer: Buffer.from(buf) });
  const rawText = r.value;

  const client = getAnthropic();
  const resp = await client.messages.create({
    model: MODELS.sonnet,
    max_tokens: 4096,
    system: STRUCTURING_PROMPT,
    messages: [{ role: "user", content: `Parse this resume:\n\n${rawText}` }],
  });
  // Record IMMEDIATELY — we paid for the tokens whether the JSON parsed or not.
  await recordTokens({
    input: resp.usage.input_tokens,
    output: resp.usage.output_tokens,
  });
  const c = resp.content[0];
  if (c.type !== "text") throw new Error("non-text response from sonnet");
  let json = c.text.trim();
  if (json.startsWith("```")) json = json.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  return { rawText, parsed: JSON.parse(json) };
}

async function structureFromPdfBuffer(
  buf: ArrayBuffer,
  recordTokens: RecordTokens,
): Promise<StructureResult> {
  const client = getAnthropic();
  const resp = await client.messages.create({
    model: MODELS.sonnet,
    max_tokens: 4096,
    system: STRUCTURING_PROMPT,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "document",
            source: {
              type: "base64",
              media_type: "application/pdf",
              data: arrayBufferToBase64(buf),
            },
          },
          {
            type: "text",
            text: "Parse this resume PDF and return the JSON structure. Also extract the plain text content for storage.",
          },
        ],
      },
    ],
  });
  await recordTokens({
    input: resp.usage.input_tokens,
    output: resp.usage.output_tokens,
  });
  const c = resp.content[0];
  if (c.type !== "text") throw new Error("non-text response from sonnet");
  let json = c.text.trim();
  if (json.startsWith("```")) json = json.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  const parsed = JSON.parse(json);
  const rawText = JSON.stringify(parsed);
  return { rawText, parsed };
}

export const parseAndStoreResume = action({
  args: {
    storageId: v.id("_storage"),
    fingerprintHash: v.string(),
    filename: v.string(),
    source: v.union(v.literal("pdf"), v.literal("docx")),
  },
  handler: async (ctx, args): Promise<{ resumeId: Id<"resumes"> }> => {
    const blob = await ctx.storage.get(args.storageId);
    if (!blob) throw new Error("uploaded_file_missing");
    const buffer = await blob.arrayBuffer();

    // Best-effort spend recording — never break the user's run if the
    // accounting mutation has a transient failure. The cap can drift by
    // pennies on rare write failures; that's better than a 500.
    const recordSonnet: RecordTokens = async (tokens) => {
      try {
        await ctx.runMutation(internal.costGuard.recordTokenSpend, {
          model: "sonnet",
          inputTokens: tokens.input,
          outputTokens: tokens.output,
        });
      } catch (err) {
        console.error("recordTokenSpend failed (resume parse)", err);
      }
    };

    const { rawText, parsed } =
      args.source === "pdf"
        ? await structureFromPdfBuffer(buffer, recordSonnet)
        : await structureFromDocxBuffer(buffer, recordSonnet);

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
