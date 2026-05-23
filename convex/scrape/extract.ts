"use node";
import { getAnthropic, MODELS } from "../ai/anthropic";

export interface ExtractedJD {
  title: string;
  company: string;
  requirements: string[];
  responsibilities: string[];
  keywords: string[];
  seniority?: string;
  location?: string;
}

const SYSTEM = `You extract structured fields from a job posting. Return ONLY a JSON object matching:
{
  "title": "Job title",
  "company": "Company name",
  "requirements": ["specific requirement", ...],
  "responsibilities": ["specific responsibility", ...],
  "keywords": ["technical-term-1", "technical-term-2", ...],
  "seniority": "junior" | "mid" | "senior" | "staff" | "principal" | undefined,
  "location": "City, State or Remote or undefined"
}

Rules:
- keywords: hard technical/domain skills only (Python, Kubernetes, distributed systems, SQL).
  No soft skills, no buzzwords, no "team player". 10-25 items.
- requirements: must-haves from the JD, verbatim or near-verbatim. Up to 10.
- responsibilities: what the role does, paraphrased tightly. Up to 8.
- Return raw JSON. No markdown fences, no preamble.`;

export interface ExtractJDResult {
  parsed: ExtractedJD;
  tokens: { input: number; output: number };
}

export async function extractJDFields(rawText: string): Promise<ExtractJDResult> {
  const client = getAnthropic();
  const resp = await client.messages.create({
    model: MODELS.haiku,
    max_tokens: 1500,
    system: SYSTEM,
    messages: [{ role: "user", content: rawText.slice(0, 12000) }],
  });
  const content = resp.content[0];
  if (content.type !== "text") throw new Error("non-text response from Haiku");
  let json = content.text.trim();
  if (json.startsWith("```")) json = json.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  return {
    parsed: JSON.parse(json) as ExtractedJD,
    tokens: { input: resp.usage.input_tokens, output: resp.usage.output_tokens },
  };
}
