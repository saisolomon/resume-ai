"use node";
import { internalAction } from "../_generated/server";
import { api, internal } from "../_generated/api";
import { v } from "convex/values";
import { getAnthropic, MODELS } from "./anthropic";
import type { ResumeData } from "../../src/lib/resume/types";

/**
 * Resume content translator.
 *
 * Called from the workspace's "Translate resume" action. Takes a card
 * + target language name and produces a new ResumeData where the
 * candidate-authored content has been translated into the target
 * language, while factual content (names, employers, schools, dates,
 * GPAs) is preserved verbatim.
 *
 * Translation does NOT re-tailor against the JD. If the user wants to
 * combine translation with tailoring, they can run translate first
 * then use the chat fine-tune to re-tailor — keeping the two
 * operations separate makes each one's behavior predictable.
 */

const SYSTEM = `You translate resumes from one language to another while preserving all factual content. You receive a ResumeData JSON object and a target language. Return the same JSON shape with translated content.

## Preserve verbatim (do NOT translate these)
1. Proper nouns: person names, employer/company names, school/university names.
2. Brand / product names: tech brands (e.g. AWS, Kubernetes, Stripe), product names, library names.
3. Email addresses, URLs (LinkedIn, GitHub, portfolio), phone numbers, addresses.
4. Dates and date ranges (preserve formatting as-is — e.g. "2022 — Present" stays unchanged).
5. Numbers, percentages, quantities (preserve as written — "47%", "200k+ host fleet", "$6,000").

## Translate (faithful, natural target-language phrasing)
6. Section headings ("Experience", "Education", "Additional Information") — use natural target-language equivalents.
7. Role titles. Use the standard industry equivalent in the target language. If a role title has no clean local equivalent (e.g. "Tech Lead" in Spanish), keep the English term — that's preferable to an awkward translation.
8. Bullet content — full, natural, fluent target-language sentences. Maintain the bullet's quantified result and skill-based framing.
9. Degree names ("B.S. Computer Science" → "Lic. Ciencias de la Computación" in Spanish) — use the locale-appropriate degree abbreviation if one exists, otherwise translate descriptively.
10. \`additionalInfo\` entries — translate descriptive labels (e.g. "Programming languages:") but preserve the technology names themselves.

## Style rules
11. Use the most widely-understood register of the target language (e.g. Mexican-accessible Spanish, Brazilian Portuguese, France-French) rather than a regional dialect, unless the resume's address makes the region obvious.
12. Maintain bullet character limits (each bullet ≤ 240 chars). Translation tends to expand text — tighten phrasing as needed to stay within limit.
13. Maintain verb tense convention: present for current roles, past for prior roles.
14. Keep the candidate's voice — no marketing language, no buzzwords, no first person. The original was written by a careful resume writer; preserve that quality.

## ResumeData shape (return exactly this — no markdown fences, no preamble)

{
  "name": "",
  "contactLine1": "",
  "contactLine2": "",
  "education": [{ "institution": "", "location": "", "degree": "", "date": "", "gpa": "", "details": [] }],
  "experienceSections": [{ "heading": "Experience", "entries": [{ "company": "", "companyNote": "", "location": "", "roles": [{ "title": "", "date": "", "bullets": [] }] }] }],
  "additionalInfo": []
}`;

function buildUserMessage(resume: ResumeData, targetLang: string): string {
  return `Translate this resume into ${targetLang}.

${JSON.stringify(resume, null, 2)}

Return the translated resume as JSON.`;
}

export const translateCard = internalAction({
  args: {
    cardId: v.id("cards"),
    targetLanguage: v.string(),
  },
  handler: async (ctx, { cardId, targetLanguage }) => {
    const cardRow = await ctx.runQuery(api.cards._getCardById, { cardId });
    if (!cardRow) throw new Error("card_missing");
    if (!cardRow.content) throw new Error("card_has_no_content");

    // We deliberately do NOT flip status to "generating" here — the
    // workspace already has content rendered and we don't want it
    // disappearing while the translation streams. The client shows a
    // "Translating..." indicator on the action button instead.

    try {
      const client = getAnthropic();
      const resp = await client.messages.create({
        model: MODELS.sonnet,
        max_tokens: 4096,
        system: SYSTEM,
        messages: [
          {
            role: "user",
            content: buildUserMessage(
              cardRow.content as ResumeData,
              targetLanguage,
            ),
          },
        ],
      });

      // Account for the Sonnet spend whether parsing succeeds or not.
      try {
        await ctx.runMutation(internal.costGuard.recordTokenSpend, {
          model: "sonnet",
          inputTokens: resp.usage.input_tokens,
          outputTokens: resp.usage.output_tokens,
        });
      } catch (logErr) {
        console.error("recordTokenSpend failed (translateCard sonnet)", logErr);
      }

      const c = resp.content[0];
      if (c.type !== "text") throw new Error("non-text translation response");
      let json = c.text.trim();
      if (json.startsWith("```")) {
        json = json.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
      }
      const translated = JSON.parse(json) as ResumeData;

      // Preserve the existing ATS score — translation doesn't change
      // how well the bullets match the JD's keywords (in fact, it may
      // hurt the score, since the JD is typically in the original
      // language). We don't auto-rescore against the JD; if the user
      // wants a fresh score against a translated JD, they can use
      // chat fine-tune.
      await ctx.runMutation(internal.cards.patchCard, {
        cardId,
        patch: { content: translated },
      });
    } catch (err) {
      // Re-throw so the public action wrapper can propagate the error
      // to the client — the workspace shows a toast on failure rather
      // than silently leaving the card untranslated.
      console.error("translateCard failed", err);
      throw err;
    }
  },
});
