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

// Callers supply this to be notified of token usage AS SOON AS the
// Anthropic call returns — before any parsing or validation that could
// throw. Critical for the cost circuit breaker: even malformed responses
// still cost money, so the breaker must see the spend or the cap drifts.
export type RecordTokens = (tokens: { input: number; output: number }) => Promise<void>;

export interface ScoreCardResult {
  ats: AtsScore;
}

async function scoreNarrative(
  resume: ResumeData,
  jd: JDParsed,
  recordTokens?: RecordTokens,
): Promise<NarrativeScoreResult> {
  const client = getAnthropic();
  const resp = await client.messages.create({
    model: MODELS.haiku,
    max_tokens: 400,
    system: NARRATIVE_SYSTEM,
    messages: [{ role: "user", content: buildNarrativePrompt(resume, jd) }],
  });
  // Record IMMEDIATELY — we paid for the tokens even if parsing throws below.
  if (recordTokens) {
    await recordTokens({
      input: resp.usage.input_tokens,
      output: resp.usage.output_tokens,
    });
  }
  const c = resp.content[0];
  if (c.type !== "text") throw new Error("non-text narrative response");
  let json = c.text.trim();
  if (json.startsWith("```")) json = json.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  return JSON.parse(json) as NarrativeScoreResult;
}

export async function scoreCard(
  resume: ResumeData,
  jd: JDParsed,
  recordTokens?: RecordTokens,
): Promise<ScoreCardResult> {
  const keyword = scoreKeywords(resume, jd.keywords);
  const format = scoreFormat(resume);
  const narrative = await scoreNarrative(resume, jd, recordTokens);

  const total = Math.round(
    0.4 * keyword.score + 0.2 * format.score + 0.4 * narrative.score,
  );

  return {
    ats: {
      total,
      keywordMatch: keyword.score,
      formatSafety: format.score,
      narrativeFit: narrative.score,
      breakdown: {
        keywordsFound: keyword.found,
        keywordsMissing: keyword.missing,
        formatIssues: format.issues,
        narrativeRationale: narrative.rationale,
      },
    },
  };
}
