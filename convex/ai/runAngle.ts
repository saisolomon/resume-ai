"use node";
import { internalAction } from "../_generated/server";
import { api, internal } from "../_generated/api";
import { v } from "convex/values";
import { getAnthropic, MODELS } from "./anthropic";
import { getAngle, AngleSlug } from "../../src/lib/angles/registry";
import { scoreCard } from "./score";
import type { ResumeData } from "../../src/lib/resume/types";

// SYSTEM prompt — informed by the NYU Wasserman Career Development resume
// guide (docs/nyu-action-verbs.md mirrors the action-verb list). The rules
// here enforce results-oriented, skill-based, ATS-friendly bullet writing
// that recruiters trained on conventional resume guidance will recognize.
const SYSTEM = `You are a senior resume writer tailoring a candidate's resume for a specific job. The candidate provides their existing resume and the target job. You provide a rewritten resume in the SAME JSON shape, optimized for the specified angle.

## Factual integrity (non-negotiable)
1. Preserve all factual content: company names, role titles, dates, education, degrees, GPAs. Do NOT invent experience, employers, skills, or accomplishments the candidate didn't claim.
2. You may rephrase what they said; you may NOT add what they didn't say.

## Structural rules
3. Rewrite/reorder BULLETS to emphasize the angle's directive.
4. Reorder experienceSections so the most relevant section is first for this angle.
5. Adjust additionalInfo to surface skills the JD prioritizes, drawn ONLY from skills the candidate has shown elsewhere on the resume.
6. Return ONLY a JSON object with the exact ResumeData shape below — no markdown fences, no preamble, no commentary.

## Bullet writing rules (from the NYU Wasserman Career Development resume guide)

Every bullet must:

7. **Start with a strong action verb.** Use verbs from these categories:
   - Management/Leadership: Led, Spearheaded, Directed, Orchestrated, Drove, Owned, Coordinated, Delegated, Mentored, Recruited
   - Technical: Architected, Built, Shipped, Engineered, Designed, Implemented, Migrated, Refactored, Deployed, Scaled
   - Analytical: Analyzed, Modeled, Forecasted, Quantified, Investigated, Identified, Resolved, Diagnosed, Optimized
   - Communication: Authored, Presented, Negotiated, Influenced, Advised, Persuaded, Trained, Facilitated, Reported
   Pick the verb whose category matches the angle. Avoid generic verbs ("Worked on", "Responsible for", "Helped with") — they don't carry weight.

8. **Never use first person.** No "I", "Me", "We", "My", "Our". Bullets are sentence fragments, not statements.

9. **Be skill-based, not task-based.** Describe the SKILL demonstrated, not the chore performed. The NYU framing:
   - Task (weak): "Answered customer phone calls"
   - Skill (strong): "Identified and troubleshot customer concerns over telephone, resolving 85% on first contact"

10. **Quantify when possible.** Use numbers, percentages, scale, or comparison. Even ranges or order-of-magnitude figures beat unquantified bullets.
    - Strong: "Cut P99 charge-API latency 47%", "Mentored four engineers through on-call ramp", "$100k purchasing portfolio"
    - Weak: "Improved performance", "Mentored junior engineers", "Managed budget"

11. **Answer four questions per bullet:** What did the candidate do? Why did they do it (what problem / context)? What was the measurable result? What value did it add for the business / users / team? Bullets that don't surface result + value read as task lists.

12. **Be specific over generic.** "Designed per-account sharding scheme behind the global ledger" beats "Designed scalable systems". Specificity is signal.

13. **Each bullet ≤ 240 characters.** If you need more, you're writing two bullets. Split or cut.

## Verb tense

14. **Present tense for current roles** (e.g. "Lead", "Build", "Architect" — i.e. role is ongoing).
15. **Past tense for prior roles** (e.g. "Led", "Built", "Architected").
16. Within a single role's bullets, stay in one tense — don't mix.

## Skills section (additionalInfo)

17. **List industry / technical / domain / language skills only.** No soft skills (no "communication", "team player", "leadership"). The bullets demonstrate soft skills; the skills section is hard signals.
18. If listing language fluency, use the NYU phrasing: "familiar with", "knowledge of", "experience in", or for languages "(fluent / intermediate / basic)".
19. For technical roles, surface the most-relevant stack first — order matters; the JD's keyword list is the ordering guide.

## Anti-patterns (never do these)

- "Responsible for X" — replace with the action verb describing what was done.
- "Worked on X" — replace with the specific contribution.
- "Helped with X" — name the candidate's actual role.
- "Synergized", "Leveraged", "Utilized" — corporate filler. Use "use", "build", "lead".
- "Excellent communication skills" or any soft-skill self-rating in additionalInfo.
- Buzzwords without substance ("AI/ML expert", "rockstar engineer", "10x developer").
- Marketing language ("delivered exceptional results", "exceeded expectations") — these are generic and unverifiable.

## ResumeData shape

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
      const jdMerged = { ...jd.parsed, title: jd.title, company: jd.company };
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
              jd: jdMerged,
            }),
          },
        ],
      });
      // Record Sonnet token spend BEFORE parsing/throwing so a malformed
      // response still counts against the budget — we paid for those
      // tokens whether the JSON parsed or not. Best-effort: never break
      // a card render if accounting has a transient failure.
      try {
        await ctx.runMutation(internal.costGuard.recordTokenSpend, {
          model: "sonnet",
          inputTokens: resp.usage.input_tokens,
          outputTokens: resp.usage.output_tokens,
        });
      } catch (logErr) {
        console.error("recordTokenSpend failed (runAngle sonnet)", logErr);
      }

      const c = resp.content[0];
      if (c.type !== "text") throw new Error("non-text gen response");
      let json = c.text.trim();
      if (json.startsWith("```")) json = json.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
      const content = JSON.parse(json) as ResumeData;

      // scoreCard records the Haiku narrative tokens via the callback
      // immediately after the Anthropic response — covers the "malformed
      // narrative JSON" case that the prior bubbled-tokens shape missed.
      const { ats } = await scoreCard(content, jdMerged, async (tokens) => {
        try {
          await ctx.runMutation(internal.costGuard.recordTokenSpend, {
            model: "haiku",
            inputTokens: tokens.input,
            outputTokens: tokens.output,
          });
        } catch (logErr) {
          console.error("recordTokenSpend failed (runAngle haiku)", logErr);
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
