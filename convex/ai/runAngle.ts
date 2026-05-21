"use node";
import { internalAction } from "../_generated/server";
import { api, internal } from "../_generated/api";
import { v } from "convex/values";
import { getAnthropic, MODELS } from "./anthropic";
import { getAngle, AngleSlug } from "../../src/lib/angles/registry";
import { scoreCard } from "./score";
import type { ResumeData } from "../../src/lib/resume/types";

const SYSTEM = `You are a senior resume writer tailoring a candidate's resume for a specific job. The candidate provides their existing resume and the target job. You provide a rewritten resume in the SAME JSON shape, optimized for the specified angle.

Rules:
1. Preserve all factual content (company names, dates, education). Do NOT invent experience.
2. Rewrite/reorder BULLETS to emphasize the angle's directive.
3. Reorder experienceSections so the most relevant section is first.
4. Adjust additionalInfo to surface skills the JD prioritizes.
5. Use strong action verbs (Led, Built, Architected, Shipped, Quantified).
6. Each bullet: action + what + context + quantified result.
7. Each bullet ≤ 240 characters.
8. Return ONLY a JSON object with the exact ResumeData shape — no markdown fences, no preamble.

ResumeData shape:
{
  "name": "",
  "contactLine1": "",
  "contactLine2": "",
  "education": [{ "institution": "", "location": "", "degree": "", "date": "", "gpa": "", "details": [] }],
  "experienceSections": [{ "heading": "Experience", "entries": [{ "company": "", "companyNote": "", "location": "", "roles": [{ "title": "", "date": "", "bullets": [] }] }] }],
  "additionalInfo": []
}`;

function buildUserMessage(args: {
  angleDirective: string;
  resume: ResumeData;
  jd: {
    title: string;
    company: string;
    requirements: string[];
    responsibilities: string[];
    keywords: string[];
    seniority?: string;
  };
}): string {
  return `## Angle
${args.angleDirective}

## Job
Title: ${args.jd.title}
Company: ${args.jd.company}
Seniority: ${args.jd.seniority ?? "unspecified"}

Requirements:
${args.jd.requirements.map((r) => `- ${r}`).join("\n")}

Responsibilities:
${args.jd.responsibilities.map((r) => `- ${r}`).join("\n")}

Keywords to mirror where truthful: ${args.jd.keywords.join(", ")}

## Candidate's current resume
${JSON.stringify(args.resume, null, 2)}

Return the rewritten resume as JSON.`;
}

export const runAngle = internalAction({
  args: { cardId: v.id("cards") },
  handler: async (ctx, { cardId }) => {
    const cardRow = await ctx.runQuery(api.cards._getCardById, { cardId });
    if (!cardRow) throw new Error("card_missing");

    await ctx.runMutation(internal.cards.patchCard, {
      cardId,
      patch: { status: "generating" },
    });

    const run = await ctx.runQuery(api.runs.getRun, { runId: cardRow.runId });
    if (!run) throw new Error("run_missing");
    const resume = await ctx.runQuery(api.resumes.getResume, { resumeId: run.resumeId });
    if (!resume) throw new Error("resume_missing");
    const jd = await ctx.runQuery(api.jobDescriptions.getById, { id: run.jobDescriptionId });
    if (!jd) throw new Error("jd_missing");

    try {
      const angle = getAngle(cardRow.angle as AngleSlug);
      const client = getAnthropic();
      const resp = await client.messages.create({
        model: MODELS.sonnet,
        max_tokens: 4096,
        system: SYSTEM,
        messages: [
          {
            role: "user",
            content: buildUserMessage({
              angleDirective: angle.directive,
              resume: resume.parsed,
              jd: jd.parsed,
            }),
          },
        ],
      });
      const c = resp.content[0];
      if (c.type !== "text") throw new Error("non-text gen response");
      let json = c.text.trim();
      if (json.startsWith("```")) json = json.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
      const content = JSON.parse(json) as ResumeData;

      const ats = await scoreCard(content, jd.parsed);

      await ctx.runMutation(internal.cards.patchCard, {
        cardId,
        patch: { status: "ready", content, atsScore: ats },
      });
    } catch (err) {
      await ctx.runMutation(internal.cards.patchCard, {
        cardId,
        patch: { status: "failed", failureReason: (err as Error).message },
      });
    }
  },
});
