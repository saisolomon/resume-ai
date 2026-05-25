"use node";
import { internalAction } from "../_generated/server";
import { api, internal } from "../_generated/api";
import { v } from "convex/values";
import { getAnthropic, MODELS } from "./anthropic";
import type { ResumeData } from "../../src/lib/resume/types";

/**
 * Cover letter generator — produces three variants for a single card.
 *
 * One Sonnet call returns all three variants in a JSON array. Cheaper
 * than three sequential calls and keeps the three letters consistent
 * (model sees them together when drafting, avoids near-duplicates).
 *
 * Variants are intentionally tonally distinct so the user has real
 * choice rather than three near-identical drafts:
 *   1. Direct — confident, results-led, modern recruiter-friendly.
 *   2. Story — opens with a moment, lands on fit; warmer voice.
 *   3. Concise — punchy, max 180 words, for senior roles where the
 *      reader skims.
 *
 * Translation: stored as plain text; the existing translateCard
 * action handles ES/PT/etc. through the same workspace UI.
 */

const SYSTEM = `You are a senior career writer producing three tailored cover letters for a specific job, given the candidate's resume. You return EXACTLY three letters, one per tonal variant, as a JSON array of strings.

## Variants (all three, in this order)

1. **Direct.** Confident, results-led. Opens with a concrete value statement ("I help payment teams cut p99 latency without rewriting their ledger"). Three short paragraphs.
2. **Story.** Warmer. Opens with a brief moment or anecdote that demonstrates the candidate's fit, then bridges to the role. Three to four paragraphs.
3. **Concise.** Punchy. No more than 180 words total. For senior-skim readers — every sentence carries weight.

## Hard rules

1. **No factual invention.** Use only the candidate's actual experience, employers, schools, dates. Don't claim outcomes they didn't claim. Don't claim roles they didn't hold.
2. **No first-paragraph cliches.** "I am writing to apply for…" and "I am excited about the opportunity…" are banned in every variant. Start with substance.
3. **JD specificity required.** Each letter must reference at least two specifics from the JD (technology, responsibility, team mission) in a way that's clearly tailored, not generic.
4. **Voice.** Calm and direct. No corporate filler ("synergize", "leverage", "passionate"), no marketing language ("rockstar", "ninja", "guru"), no soft-skill self-rating ("excellent communication skills"). The resume bullets show; the letter tells *why*.
5. **No sign-off block.** End with the closing paragraph — no "Sincerely, [Name]". The product surfaces signature separately.
6. **Plain text only.** No markdown, no bold/italic markers, no bullet lists in the letter body.

## Return format

Return a JSON array of EXACTLY three strings — nothing else. No markdown fences, no preamble, no commentary, no object wrapper.

[
  "Variant 1 (Direct) full letter text...",
  "Variant 2 (Story) full letter text...",
  "Variant 3 (Concise) full letter text..."
]`;

function buildUserMessage(
  resume: ResumeData,
  jd: {
    title: string;
    company: string;
    requirements: string[];
    responsibilities: string[];
    keywords: string[];
    seniority?: string;
  },
): string {
  return `## Target job

Title: ${jd.title}
Company: ${jd.company}
Seniority: ${jd.seniority ?? "unspecified"}

Requirements:
${jd.requirements.map((r) => `- ${r}`).join("\n")}

Responsibilities:
${jd.responsibilities.map((r) => `- ${r}`).join("\n")}

Keywords to mirror where truthful: ${jd.keywords.join(", ")}

## Candidate resume

${JSON.stringify(resume, null, 2)}

Return three cover letter variants as a JSON array of strings.`;
}

export const generateCoverLetters = internalAction({
  args: { cardId: v.id("cards") },
  handler: async (ctx, { cardId }) => {
    const card = await ctx.runQuery(api.cards._getCardById, { cardId });
    if (!card) throw new Error("card_missing");
    if (!card.content) throw new Error("card_has_no_content");

    const run = await ctx.runQuery(api.runs.getRun, { runId: card.runId });
    if (!run) throw new Error("run_missing");
    const jd = await ctx.runQuery(api.jobDescriptions.getById, {
      id: run.jobDescriptionId,
    });
    if (!jd) throw new Error("jd_missing");

    try {
      const client = getAnthropic();
      const jdMerged = { ...jd.parsed, title: jd.title, company: jd.company };
      const resp = await client.messages.create({
        model: MODELS.sonnet,
        max_tokens: 4096,
        system: SYSTEM,
        messages: [
          {
            role: "user",
            content: buildUserMessage(card.content as ResumeData, jdMerged),
          },
        ],
      });

      try {
        await ctx.runMutation(internal.costGuard.recordTokenSpend, {
          model: "sonnet",
          inputTokens: resp.usage.input_tokens,
          outputTokens: resp.usage.output_tokens,
        });
      } catch (logErr) {
        console.error(
          "recordTokenSpend failed (generateCoverLetters sonnet)",
          logErr,
        );
      }

      const c = resp.content[0];
      if (c.type !== "text") throw new Error("non-text cover letter response");
      let json = c.text.trim();
      if (json.startsWith("```")) {
        json = json.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
      }
      const variants = JSON.parse(json) as string[];
      if (!Array.isArray(variants) || variants.length !== 3) {
        throw new Error(
          `cover_letter_parse_unexpected_shape: got ${typeof variants}, length ${Array.isArray(variants) ? variants.length : "n/a"}`,
        );
      }

      await ctx.runMutation(internal.cards.patchCard, {
        cardId,
        patch: { coverLetters: variants },
      });
    } catch (err) {
      console.error("generateCoverLetters failed", err);
      throw err;
    }
  },
});
