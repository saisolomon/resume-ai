"use node";
import { getAnthropic, MODELS } from "./anthropic";
import { scoreKeywords } from "../../src/lib/ats/keyword";
import { scoreFormat } from "../../src/lib/ats/format";
import {
  NARRATIVE_SYSTEM,
  buildNarrativePrompt,
  JDParsed,
  NarrativeScoreResult,
} from "../../src/lib/ats/narrative";
import type { ResumeData } from "../../src/lib/resume/types";

export interface AtsScore {
  total: number;
  keywordMatch: number;
  formatSafety: number;
  narrativeFit: number;
  breakdown: {
    keywordsFound: string[];
    keywordsMissing: string[];
    formatIssues: string[];
    narrativeRationale: string;
  };
}

export interface ScoreCardResult {
  ats: AtsScore;
  // Token usage from the narrative Haiku call. Callers (runAngle,
  // regenerateCard) record this via internal.costGuard.recordTokenSpend
  // so the daily breaker reflects real spend. Bubbled up instead of
  // recorded here because score.ts is a plain helper, not an action —
  // it doesn't have a Convex ctx to call runMutation against.
  narrativeTokens: { input: number; output: number };
}

async function scoreNarrative(
  resume: ResumeData,
  jd: JDParsed,
): Promise<{ result: NarrativeScoreResult; tokens: { input: number; output: number } }> {
  const client = getAnthropic();
  const resp = await client.messages.create({
    model: MODELS.haiku,
    max_tokens: 400,
    system: NARRATIVE_SYSTEM,
    messages: [{ role: "user", content: buildNarrativePrompt(resume, jd) }],
  });
  const c = resp.content[0];
  if (c.type !== "text") throw new Error("non-text narrative response");
  let json = c.text.trim();
  if (json.startsWith("```")) json = json.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  return {
    result: JSON.parse(json) as NarrativeScoreResult,
    tokens: { input: resp.usage.input_tokens, output: resp.usage.output_tokens },
  };
}

export async function scoreCard(
  resume: ResumeData,
  jd: JDParsed,
): Promise<ScoreCardResult> {
  const keyword = scoreKeywords(resume, jd.keywords);
  const format = scoreFormat(resume);
  const narrative = await scoreNarrative(resume, jd);

  const total = Math.round(
    0.4 * keyword.score + 0.2 * format.score + 0.4 * narrative.result.score,
  );

  return {
    ats: {
      total,
      keywordMatch: keyword.score,
      formatSafety: format.score,
      narrativeFit: narrative.result.score,
      breakdown: {
        keywordsFound: keyword.found,
        keywordsMissing: keyword.missing,
        formatIssues: format.issues,
        narrativeRationale: narrative.result.rationale,
      },
    },
    narrativeTokens: narrative.tokens,
  };
}
