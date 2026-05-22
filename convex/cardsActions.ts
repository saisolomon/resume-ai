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
    const card = await ctx.runQuery(api.cards._getCardById, { cardId });
    if (!card) throw new Error("card_not_found");
    if (card.status !== "ready" || !card.content) throw new Error("card_not_ready");

    const run = await ctx.runQuery(api.runs.getRun, { runId: card.runId });
    if (!run) throw new Error("run_not_found");
    const jd = await ctx.runQuery(api.jobDescriptions.getById, { id: run.jobDescriptionId });
    if (!jd) throw new Error("jd_not_found");

    const messages = await ctx.runQuery(api.chatMessages.byCard, { cardId });
    if (messages.length === 0) throw new Error("no_chat_history");

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

    const summary = `Updated. New ATS score: ${ats.total} (was ${card.atsScore?.total ?? "?"}).`;
    await ctx.runMutation(internal.chatMessages._appendAssistantMessage, {
      cardId,
      userId: messages[messages.length - 1].userId,
      content: summary,
    });

    return { newScore: ats.total };
  },
});
