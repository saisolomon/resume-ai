"use node";
import { action } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { v } from "convex/values";
import { getAnthropic, MODELS } from "./ai/anthropic";
import { scoreCard } from "./ai/score";
import type { ResumeData } from "../src/lib/resume/types";
import type { JDParsed } from "../src/lib/ats/narrative";

// Defense-in-depth shape guard. JSON.parse + a TS cast won't catch a
// well-formed JSON object that's missing fields the renderer expects.
function isResumeData(x: unknown): x is ResumeData {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.name === "string" &&
    Array.isArray(o.education) &&
    Array.isArray(o.experienceSections) &&
    Array.isArray(o.additionalInfo)
  );
}

// EDIT_SYSTEM — applies the same NYU bullet-writing rules as runAngle.ts
// (see docs/nyu-action-verbs.md). Edits MUST respect the same rules so a
// chat-edited bullet doesn't drift from the standards the original
// generation enforces.
const EDIT_SYSTEM = `You are editing a tailored resume based on the user's feedback. The user will give natural-language requests (e.g. "make the leadership angle stronger", "swap the AWS bullet for something more specific", "remove the Acme job"). You return the FULL ResumeData JSON with the changes applied — never a partial update.

## Factual integrity
1. Preserve factual content unless the user EXPLICITLY says to change it. Don't invent experience, employers, dates, or accomplishments.
2. Follow chat history — the latest user message takes priority.

## Bullet writing rules (NYU Wasserman resume guide standards)

Every bullet you write or rewrite must:

3. **Start with a strong action verb.** Use verbs from these categories: Led / Spearheaded / Architected / Built / Shipped / Analyzed / Quantified / Negotiated / Authored / Mentored. Avoid weak verbs: "Worked on", "Responsible for", "Helped with".

4. **No first person.** No "I", "Me", "We", "My", "Our". Bullets are sentence fragments.

5. **Skill-based, not task-based.** Describe the skill demonstrated, not the chore performed. Task: "Answered phones". Skill: "Identified and troubleshot customer concerns over phone, resolving 85% on first contact."

6. **Quantify when possible.** Numbers, percentages, scale, comparison. "Cut P99 latency 47%" > "Improved performance".

7. **Answer four questions per bullet:** What was done? Why? What was the result? What value did it add?

8. **Specific over generic.** "Designed per-account sharding scheme" > "Designed scalable systems".

9. **Each bullet ≤ 240 characters.**

## Tense

10. Present tense for current roles ("Lead", "Build"). Past tense for prior roles ("Led", "Built"). Stay in one tense within a single role's bullets.

## Skills (additionalInfo)

11. Industry / technical / language skills only. No soft skills (no "communication", "leadership", "team player"). For languages, use NYU phrasing: "(fluent / intermediate / basic)".

## Anti-patterns

- "Responsible for", "Worked on", "Helped with", "Synergized", "Leveraged", "Utilized" — always rewrite with a stronger verb.
- "Excellent communication skills" in additionalInfo — strip it.
- Buzzwords ("rockstar engineer", "10x developer") — strip them.

## Output

12. Return ONLY a JSON object with the exact ResumeData shape — no markdown fences, no preamble.

ResumeData shape:
{
  "name": "", "contactLine1": "", "contactLine2": "",
  "education": [{ "institution": "", "location": "", "degree": "", "date": "", "gpa": "", "details": [] }],
  "experienceSections": [{ "heading": "Experience", "entries": [{ "company": "", "companyNote": "", "location": "", "roles": [{ "title": "", "date": "", "bullets": [] }] }] }],
  "additionalInfo": []
}`;

export const regenerateCard = action({
  args: { cardId: v.id("cards") },
  // Explicit return-type annotation breaks the TS recursive-inference loop
  // the action would otherwise hit (it calls into api.chatMessages /
  // internal.cards / internal.chatMessages, all of which transitively
  // reference this action through the generated api graph).
  handler: async (ctx, { cardId }): Promise<{ newScore: number | null }> => {
    // Defense-in-depth ownership check at the top of the action. Today the
    // empty-history guard below would catch a non-owner because byCard is
    // owner-gated and returns []. But that's accidental coupling; a future
    // change (e.g. seeding system messages on card creation) would silently
    // re-open the leak. Verify identity + ownership BEFORE any LLM work.
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("not_authenticated");
    const me = await ctx.runQuery(api.users.getCurrentUser, {});
    if (!me) throw new Error("user_not_found");

    const card = await ctx.runQuery(api.cards._getCardById, { cardId });
    if (!card) throw new Error("card_not_found");
    if (card.status !== "ready" || !card.content) throw new Error("card_not_ready");

    const run = await ctx.runQuery(api.runs.getRun, { runId: card.runId });
    if (!run) throw new Error("run_not_found");
    if (run.userId !== me._id) throw new Error("not_owner");

    const jd = await ctx.runQuery(api.jobDescriptions.getById, { id: run.jobDescriptionId });
    if (!jd) throw new Error("jd_not_found");

    const messages = await ctx.runQuery(api.chatMessages.byCard, { cardId });
    if (messages.length === 0) throw new Error("no_chat_history");

    // Anything from here down can fail in user-visible ways (Anthropic
    // returns malformed JSON, wrong-shape JSON, network blip). Wrap the
    // model-output handling so that on failure we append a recoverable
    // apologetic assistant message instead of letting the action throw —
    // a thrown action leaves the user's message orphaned in the chat with
    // no reply, and the only recovery is to send another message.
    const lastUserId = messages[messages.length - 1].userId;

    try {
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

      // Record Sonnet token spend BEFORE parsing — see runAngle for the
      // rationale. Best-effort: don't break the chat reply if accounting
      // has a transient failure.
      try {
        await ctx.runMutation(internal.costGuard.recordTokenSpend, {
          model: "sonnet",
          inputTokens: resp.usage.input_tokens,
          outputTokens: resp.usage.output_tokens,
        });
      } catch (logErr) {
        console.error("recordTokenSpend failed (regenerateCard sonnet)", logErr);
      }

      const c = resp.content[0];
      if (c.type !== "text") throw new Error("non-text edit response");
      let json = c.text.trim();
      if (json.startsWith("```")) json = json.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");

      const parsed = JSON.parse(json) as unknown;
      if (!isResumeData(parsed)) throw new Error("invalid_resume_shape");
      const updated = parsed;

      const jdMerged: JDParsed = { ...jd.parsed, title: jd.title, company: jd.company };
      const { ats } = await scoreCard(updated, jdMerged, async (tokens) => {
        try {
          await ctx.runMutation(internal.costGuard.recordTokenSpend, {
            model: "haiku",
            inputTokens: tokens.input,
            outputTokens: tokens.output,
          });
        } catch (logErr) {
          console.error("recordTokenSpend failed (regenerateCard haiku)", logErr);
        }
      });

      await ctx.runMutation(internal.cards.patchCard, {
        cardId,
        patch: { content: updated, atsScore: ats },
      });

      const summary = `Updated. New ATS score: ${ats.total} (was ${card.atsScore?.total ?? "?"}).`;
      await ctx.runMutation(internal.chatMessages._appendAssistantMessage, {
        cardId,
        userId: lastUserId,
        content: summary,
      });

      return { newScore: ats.total };
    } catch (err) {
      console.error("regenerateCard failed", { cardId, err });
      await ctx.runMutation(internal.chatMessages._appendAssistantMessage, {
        cardId,
        userId: lastUserId,
        content:
          "Sorry — I couldn't apply that edit. Try rephrasing or breaking the change into smaller steps.",
      });
      return { newScore: card.atsScore?.total ?? null };
    }
  },
});
