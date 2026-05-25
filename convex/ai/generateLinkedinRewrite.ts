"use node";
import { internalAction } from "../_generated/server";
import { internal } from "../_generated/api";
import { v } from "convex/values";
import type { Id } from "../_generated/dataModel";
import { getAnthropic, MODELS } from "./anthropic";

/**
 * LinkedIn rewrite generator.
 *
 * Standalone of the resume runs — input is whatever the user pastes
 * (current LinkedIn text) plus a target title. One Sonnet call returns
 * rewritten Headline, About, and a list of experience-entry rewrites.
 *
 * Why this is its own route rather than piggybacking on the resume
 * pipeline: the LinkedIn writing voice diverges sharply from the
 * resume voice. Resumes are skill-based fragments; LinkedIn About is
 * a first-person paragraph that reads like a person. Different
 * prompt, different prompt rules, different surface.
 */

const SYSTEM = `You rewrite a candidate's LinkedIn profile to position them for a specific target title or role. You return THREE sections — Headline, About, Experience rewrites — in a JSON object.

## Voice

LinkedIn is first-person, conversational, and human. The opposite of a resume. Strong opinions stated calmly. The reader should walk away with a clear sense of *what this person is good at and what they want next*. No corporate filler. No third-person resume voice.

## Section rules

### Headline (1 line, max 220 chars)
- Lead with the value the candidate delivers, not the title they currently hold.
- Anchor with proof — domain, stack, or scale.
- Hint at what they want next if it differs from what they do now.
- Good: "Payments-reliability engineer (Stripe, Datadog) — building durable settlement systems. Open to senior IC + tech lead roles."
- Bad: "Software Engineer | Innovator | Problem Solver | Team Player"

### About (3-5 short paragraphs)
- First person. Conversational. The reader is a human, not an ATS.
- Paragraph 1: What you're good at, with one concrete proof point.
- Paragraph 2: What you're currently working on, and the *why* behind it.
- Paragraph 3 (optional): What you're looking for next.
- Paragraph 4 (optional): A bit of voice — what you care about, how you work.
- Hard ban: "I'm passionate about...", "Excited to...", "rockstar", "ninja", "guru", "synergize", "leverage". If you find yourself writing those, rewrite the sentence.

### Experience rewrites (one per role provided)
- Three to five bullets per role.
- Same NYU action-verb rules as the resume bullets — quantify, skill-based, no first person inside individual bullets (LinkedIn experience bullets are still bullets).
- Lead with the bullet that best supports the target title.

## Hard rules

1. No factual invention. Use only what the candidate provided. Don't claim outcomes they didn't claim.
2. JD-aware if a JD is provided — mirror keywords where truthful.
3. Plain text. No markdown bold/italic markers. Newlines OK inside About paragraphs.

## Return format

A single JSON object — no markdown fences, no preamble, no commentary:

{
  "headline": "...",
  "about": "...",
  "experienceRewrites": [
    {"roleTitle": "...", "company": "...", "rewrite": "...bullets separated by newlines..."}
  ]
}`;

export type LinkedinExperienceInput = {
  roleTitle: string;
  company: string;
  description: string;
};

function buildUserMessage(args: {
  currentHeadline: string;
  currentAbout: string;
  experiences: LinkedinExperienceInput[];
  targetTitle: string;
  jdContext: string;
}): string {
  return `## Target title

${args.targetTitle}

## Optional JD context (mirror these keywords where truthful)

${args.jdContext || "(none provided — write to the target title broadly)"}

## Candidate's current LinkedIn

Headline: ${args.currentHeadline || "(empty)"}

About:
${args.currentAbout || "(empty)"}

Experience:
${args.experiences
  .map(
    (e, i) =>
      `[${i + 1}] ${e.roleTitle} at ${e.company}\n${e.description || "(no description provided)"}`,
  )
  .join("\n\n")}

Return the rewritten LinkedIn profile as a JSON object.`;
}

export const generateLinkedinRewrite = internalAction({
  args: {
    userId: v.id("users"),
    targetTitle: v.string(),
    currentHeadline: v.string(),
    currentAbout: v.string(),
    experiences: v.array(
      v.object({
        roleTitle: v.string(),
        company: v.string(),
        description: v.string(),
      }),
    ),
    jdContext: v.string(),
  },
  handler: async (ctx, args): Promise<Id<"linkedinRewrites">> => {
    try {
      const client = getAnthropic();
      const resp = await client.messages.create({
        model: MODELS.sonnet,
        max_tokens: 3072,
        system: SYSTEM,
        messages: [
          {
            role: "user",
            content: buildUserMessage({
              currentHeadline: args.currentHeadline,
              currentAbout: args.currentAbout,
              experiences: args.experiences,
              targetTitle: args.targetTitle,
              jdContext: args.jdContext,
            }),
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
          "recordTokenSpend failed (generateLinkedinRewrite sonnet)",
          logErr,
        );
      }

      const c = resp.content[0];
      if (c.type !== "text") throw new Error("non-text linkedin response");
      let json = c.text.trim();
      if (json.startsWith("```")) {
        json = json.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
      }
      const result = JSON.parse(json) as {
        headline: string;
        about: string;
        experienceRewrites: Array<{
          roleTitle: string;
          company: string;
          rewrite: string;
        }>;
      };

      const id = (await ctx.runMutation(internal.linkedin.insertRewrite, {
        userId: args.userId,
        targetTitle: args.targetTitle,
        headline: result.headline,
        about: result.about,
        experienceRewrites: result.experienceRewrites,
      })) as Id<"linkedinRewrites">;

      return id;
    } catch (err) {
      console.error("generateLinkedinRewrite failed", err);
      throw err;
    }
  },
});
