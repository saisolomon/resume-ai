"use node";
import { internalAction } from "../_generated/server";
import { api, internal } from "../_generated/api";
import { v } from "convex/values";
import { getAnthropic, MODELS } from "./anthropic";
import type { ResumeData } from "../../src/lib/resume/types";

/**
 * Outreach templates — three templates per run keyed to the company /
 * JD. One Sonnet call returns all three:
 *
 *   1. cold_recruiter   — emails to a recruiter at the company,
 *                         attaching the tailored resume.
 *   2. referral_ask     — outreach to a 1st/2nd connection at the
 *                         company asking for an internal referral.
 *   3. hiring_manager   — a direct intro to the hiring manager for
 *                         the role.
 *
 * Templates ship with placeholders the user fills in
 * ({{recruiter_name}}, {{your_specific_ask}}). The model is told
 * which placeholders are allowed so they don't sprawl.
 */

const SYSTEM = `You write three short outreach email templates for a candidate targeting a specific job at a specific company. Return EXACTLY three templates as a JSON array, in this order: cold_recruiter, referral_ask, hiring_manager.

## Each template must

1. Be SHORT. Subject ≤ 60 characters. Body ≤ 160 words.
2. Be specific to this company and this role — reference at least one concrete detail from the JD.
3. Read as if a human wrote it on a Tuesday morning, not as if a template assembled itself. No marketing voice.
4. End with a clear ask. One ask, never two.
5. Use only these placeholders where needed (do NOT invent others):
   - {{recruiter_name}} — for cold_recruiter
   - {{contact_first_name}} — for referral_ask
   - {{hiring_manager_name}} — for hiring_manager
   - {{your_specific_value_line}} — optional, for any of the three; ≤ 14 words
6. Don't include "Sent from my iPhone" or signature blocks. The user fills those in.

## Variant specifics

- **cold_recruiter:** Subject implies relevance ("Tailored for [role] at [company]"). Opens with one line of why this candidate matches the JD. Body is two paragraphs max. Ask: a 15-minute intro call.
- **referral_ask:** Subject is casual ("[Role] at [company] — would you intro me?"). Opens with the connection / shared context (left blank for user to fill — use {{shared_context}}). Body is brief. Ask: forward the resume to the team's recruiter or the hiring manager directly.
- **hiring_manager:** Subject is direct ("[Specific JD nuance] — quick intro?"). Opens with one substantive sentence that demonstrates the candidate has read the JD carefully (specific tech, specific responsibility). Body is two short paragraphs. Ask: a 20-minute call to discuss how the candidate's work maps to the team's goals.

## Return format

Return a JSON array of EXACTLY three objects, in this exact shape and order:

[
  {"kind": "cold_recruiter", "subject": "...", "body": "..."},
  {"kind": "referral_ask",   "subject": "...", "body": "..."},
  {"kind": "hiring_manager", "subject": "...", "body": "..."}
]

No markdown fences, no preamble. Body is plain text — newlines OK, no markdown.`;

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

Top requirements:
${jd.requirements.slice(0, 5).map((r) => `- ${r}`).join("\n")}

Top responsibilities:
${jd.responsibilities.slice(0, 5).map((r) => `- ${r}`).join("\n")}

JD keywords: ${jd.keywords.slice(0, 12).join(", ")}

## Candidate (for context — do not paste the whole resume into templates)

Name: ${resume.name}
Latest role: ${resume.experienceSections[0]?.entries[0]?.roles[0]?.title ?? "(unspecified)"} at ${resume.experienceSections[0]?.entries[0]?.company ?? "(unspecified)"}

Return three outreach templates as a JSON array.`;
}

export const generateOutreachTemplates = internalAction({
  args: { runId: v.id("runs") },
  handler: async (ctx, { runId }) => {
    const run = await ctx.runQuery(api.runs.getRun, { runId });
    if (!run) throw new Error("run_missing");
    if (!run.userId) throw new Error("anonymous_runs_unsupported");
    const jd = await ctx.runQuery(api.jobDescriptions.getById, {
      id: run.jobDescriptionId,
    });
    if (!jd) throw new Error("jd_missing");

    // Pick the first ready card as the resume context. The outreach
    // templates aren't angle-specific (they're company-keyed) so we
    // just need ONE valid resume snapshot.
    const cards = await ctx.runQuery(api.cards.byRun, { runId });
    const ready = cards.find((c) => c.status === "ready" && c.content);
    if (!ready) throw new Error("no_ready_cards");

    try {
      const client = getAnthropic();
      const jdMerged = { ...jd.parsed, title: jd.title, company: jd.company };
      const resp = await client.messages.create({
        model: MODELS.sonnet,
        max_tokens: 2048,
        system: SYSTEM,
        messages: [
          {
            role: "user",
            content: buildUserMessage(ready.content as ResumeData, jdMerged),
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
          "recordTokenSpend failed (generateOutreachTemplates sonnet)",
          logErr,
        );
      }

      const c = resp.content[0];
      if (c.type !== "text") throw new Error("non-text outreach response");
      let json = c.text.trim();
      if (json.startsWith("```")) {
        json = json.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
      }
      const templates = JSON.parse(json) as Array<{
        kind: "cold_recruiter" | "referral_ask" | "hiring_manager";
        subject: string;
        body: string;
      }>;
      if (!Array.isArray(templates) || templates.length !== 3) {
        throw new Error(
          `outreach_parse_unexpected_shape: got length ${Array.isArray(templates) ? templates.length : "n/a"}`,
        );
      }

      await ctx.runMutation(internal.outreach.insertOrReplace, {
        runId,
        userId: run.userId,
        templates,
      });
    } catch (err) {
      console.error("generateOutreachTemplates failed", err);
      throw err;
    }
  },
});
