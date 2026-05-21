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

async function scoreNarrative(
  resume: ResumeData,
  jd: JDParsed,
): Promise<NarrativeScoreResult> {
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
  return JSON.parse(json) as NarrativeScoreResult;
}

export async function scoreCard(resume: ResumeData, jd: JDParsed): Promise<AtsScore> {
  const keyword = scoreKeywords(resume, jd.keywords);
  const format = scoreFormat(resume);
  const narrative = await scoreNarrative(resume, jd);

  const total = Math.round(
    0.4 * keyword.score + 0.2 * format.score + 0.4 * narrative.score,
  );

  return {
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
  };
}
