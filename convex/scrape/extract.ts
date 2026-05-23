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

// See score.ts — record-tokens callback fires immediately after the
// Anthropic response so spend gets counted even when parsing throws.
export type RecordTokens = (tokens: { input: number; output: number }) => Promise<void>;

export async function extractJDFields(
  rawText: string,
  recordTokens?: RecordTokens,
): Promise<ExtractedJD> {
  const client = getAnthropic();
  const resp = await client.messages.create({
    model: MODELS.haiku,
    max_tokens: 1500,
    system: SYSTEM,
    messages: [{ role: "user", content: rawText.slice(0, 12000) }],
  });
  // Record IMMEDIATELY — tokens are billed regardless of what we do
  // with the response.
  if (recordTokens) {
    await recordTokens({
      input: resp.usage.input_tokens,
      output: resp.usage.output_tokens,
    });
  }
  const content = resp.content[0];
  if (content.type !== "text") throw new Error("non-text response from Haiku");
  let json = content.text.trim();
  if (json.startsWith("```")) json = json.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  return JSON.parse(json) as ExtractedJD;
}
