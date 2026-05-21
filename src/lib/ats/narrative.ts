import type { ResumeData } from "@/lib/resume/types";

export interface NarrativeScoreResult {
  score: number;
  rationale: string;
}

export interface JDParsed {
  title: string;
  company: string;
  requirements: string[];
  responsibilities: string[];
  keywords: string[];
  seniority?: string;
  location?: string;
}

export const NARRATIVE_SYSTEM = `You are an experienced hiring manager. Given a job description and a resume, score how well the resume's *framing and emphasis* match what the JD prioritizes — not just keyword presence.

Return ONLY a JSON object:
{
  "score": <0-100>,
  "rationale": "1-3 sentences explaining what's strong or weak about the framing for THIS role"
}

Scoring guide:
- 90-100: framing is precise to the role's seniority and priorities, with strongest experiences leading
- 70-89: well-aligned but missing 1-2 emphases the JD calls out
- 50-69: relevant but generic — could be the same resume for any job in the field
- 0-49: misaligned framing, wrong seniority, or experiences buried in wrong order`;

export function buildNarrativePrompt(resume: ResumeData, jd: JDParsed): string {
  return `## Job Description
Title: ${jd.title}
Company: ${jd.company}
Seniority: ${jd.seniority ?? "unspecified"}

Requirements:
${jd.requirements.map((r) => `- ${r}`).join("\n")}

Responsibilities:
${jd.responsibilities.map((r) => `- ${r}`).join("\n")}

## Resume
${JSON.stringify(resume, null, 2)}`;
}
