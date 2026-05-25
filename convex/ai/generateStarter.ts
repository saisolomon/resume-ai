"use node";
import { internalAction } from "../_generated/server";
import { api, internal } from "../_generated/api";
import { v } from "convex/values";
import { getAnthropic, MODELS } from "./anthropic";
import { scoreCard } from "./score";
import type { ResumeData } from "../../src/lib/resume/types";

/**
 * JD-only flow generation.
 *
 * Diverges from runAngle on one key axis: this prompt is *allowed* to
 * draft plausible bullets, because the candidate has none. The user
 * supplies basic facts (name, education, current/target roles, years
 * experience) and asks us to produce a tailored starter resume they
 * will then refine in the workspace.
 *
 * Factual guardrails still apply — no fake employers, no fabricated
 * degrees, no invented certifications. The AI only drafts what
 * legitimately *could* be drafted from the form input + JD: bullet
 * phrasing for the user's claimed role, plus a tailored skills list.
 *
 * Cost is one Sonnet call (resume drafting) plus one Haiku call (ATS
 * scoring) — same as a single angle in the 4-angle path.
 */

const SYSTEM = `You are a senior resume writer drafting a STARTER resume for a candidate who has not uploaded an existing resume. They have provided basic facts (name, education, current role, target title, years of experience) and the job they want to tailor for. Your job is to produce a plausible first-draft resume in the exact ResumeData JSON shape, tailored to the JD's keywords and seniority, that the candidate will customize in the editor afterward.

## What you ARE allowed to do (this differs from the 4-angle tailoring flow)

1. **Draft plausible bullets** for the candidate's stated role. They will rewrite these — your goal is to provide good starting points that surface the right JD keywords and demonstrate the right *kind* of work for the seniority level.
2. **Suggest a skills list** in additionalInfo drawn from the JD's stated tech stack / domain language. Bias toward the JD's keyword list.
3. **Order experienceSections / bullets** to lead with what the JD most cares about.

## What you are NOT allowed to do (factual integrity, still non-negotiable)

4. **No fake employers.** If the candidate didn't name a company, use "Most recent role" or "Current role" — never invent a brand name.
5. **No fabricated degrees, certifications, or credentials.** Use only what the candidate provided in the form.
6. **No invented dates or tenure beyond what the candidate stated.** If they said "3 years experience," reflect that — don't claim more.
7. **Bullets must be plausibly authorable by the candidate.** Don't claim "raised $5M Series A" if the candidate provided no signal that's their level — instead, write bullets that demonstrate the *seniority level claimed*.

## Bullet writing rules (from the NYU Wasserman Career Development resume guide)

Every bullet must:

8. **Start with a strong action verb.** Pick one whose category matches the candidate's claimed role.
   - Management/Leadership: Led, Spearheaded, Directed, Drove, Owned, Coordinated, Mentored
   - Technical: Architected, Built, Shipped, Engineered, Designed, Implemented, Deployed, Scaled
   - Analytical: Analyzed, Modeled, Forecasted, Quantified, Investigated, Resolved, Optimized
   - Communication: Authored, Presented, Negotiated, Influenced, Advised, Trained
9. **Never use first person.** No "I", "Me", "We", "My", "Our".
10. **Be skill-based, not task-based.** Describe the SKILL demonstrated, not the chore performed.
11. **Quantify when plausible.** Pick numbers consistent with the seniority — a junior IC's "managed budget of \$100k" is plausible, "managed budget of \$50M" is not.
12. **Be specific over generic.** "Designed the per-account sharding scheme" beats "Designed scalable systems".
13. **Each bullet ≤ 240 characters.**

## Verb tense

14. **Present tense for the current role.**
15. **Past tense if the candidate marks a role as previous.**

## Skills section (additionalInfo)

16. **Hard skills only** — technical, industry, domain, language. No soft skills.
17. **Lead with the JD's keywords.** Order matters; the JD keyword list is the ordering guide.

## ResumeData shape (return exactly this — no markdown fences, no preamble)

{
  "name": "",
  "contactLine1": "",
  "contactLine2": "",
  "education": [{ "institution": "", "location": "", "degree": "", "date": "", "gpa": "", "details": [] }],
  "experienceSections": [{ "heading": "Experience", "entries": [{ "company": "", "companyNote": "", "location": "", "roles": [{ "title": "", "date": "", "bullets": [] }] }] }],
  "additionalInfo": []
}

Generate 4-6 bullets for the candidate's role. Generate 1-2 lines of additionalInfo that surface the JD's most-cited skills.`;

function buildUserMessage(args: {
  formData: StarterFormInput;
  jd: {
    title: string;
    company: string;
    requirements: string[];
    responsibilities: string[];
    keywords: string[];
    seniority?: string;
  };
}): string {
  const { formData, jd } = args;
  return `## Candidate's profile (from onboarding form)

Name: ${formData.name}
Contact: ${formData.contactLine}
Education: ${formData.eduInstitution} — ${formData.eduDegree} (${formData.eduDate})
Current role: ${formData.currentRole}${formData.currentCompany ? ` at ${formData.currentCompany}` : ""}
Target title: ${formData.targetTitle}
Years of experience: ${formData.yearsExp}

## Job they're tailoring for

Title: ${jd.title}
Company: ${jd.company}
Seniority: ${jd.seniority ?? "unspecified"}

Requirements:
${jd.requirements.map((r) => `- ${r}`).join("\n")}

Responsibilities:
${jd.responsibilities.map((r) => `- ${r}`).join("\n")}

Keywords to mirror where plausible: ${jd.keywords.join(", ")}

Draft the starter resume as JSON.`;
}

// Form input shape — kept in this file rather than the shared types
// module so the AI prompt and the action signature stay in lockstep.
export type StarterFormInput = {
  name: string;
  contactLine: string;
  eduInstitution: string;
  eduDegree: string;
  eduDate: string;
  currentRole: string;
  currentCompany?: string;
  targetTitle: string;
  yearsExp: string;
};

export const generateStarter = internalAction({
  args: {
    cardId: v.id("cards"),
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
  handler: async (ctx, { cardId, formData }) => {
    const cardRow = await ctx.runQuery(api.cards._getCardById, { cardId });
    if (!cardRow) throw new Error("card_missing");

    await ctx.runMutation(internal.cards.patchCard, {
      cardId,
      patch: { status: "generating" },
    });

    const run = await ctx.runQuery(api.runs.getRun, { runId: cardRow.runId });
    if (!run) throw new Error("run_missing");
    const jd = await ctx.runQuery(api.jobDescriptions.getById, {
      id: run.jobDescriptionId,
    });
    if (!jd) throw new Error("jd_missing");

    try {
      const jdMerged = { ...jd.parsed, title: jd.title, company: jd.company };
      const client = getAnthropic();
      const resp = await client.messages.create({
        model: MODELS.sonnet,
        max_tokens: 4096,
        system: SYSTEM,
        messages: [
          {
            role: "user",
            content: buildUserMessage({ formData, jd: jdMerged }),
          },
        ],
      });

      // Record Sonnet spend BEFORE parsing so we account for what we
      // paid even if the response is malformed.
      try {
        await ctx.runMutation(internal.costGuard.recordTokenSpend, {
          model: "sonnet",
          inputTokens: resp.usage.input_tokens,
          outputTokens: resp.usage.output_tokens,
        });
      } catch (logErr) {
        console.error("recordTokenSpend failed (generateStarter sonnet)", logErr);
      }

      const c = resp.content[0];
      if (c.type !== "text") throw new Error("non-text gen response");
      let json = c.text.trim();
      if (json.startsWith("```")) {
        json = json.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
      }
      const content = JSON.parse(json) as ResumeData;

      const { ats } = await scoreCard(content, jdMerged, async (tokens) => {
        try {
          await ctx.runMutation(internal.costGuard.recordTokenSpend, {
            model: "haiku",
            inputTokens: tokens.input,
            outputTokens: tokens.output,
          });
        } catch (logErr) {
          console.error("recordTokenSpend failed (generateStarter haiku)", logErr);
        }
      });

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
