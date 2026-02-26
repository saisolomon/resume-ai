import type { ResumeData, KeywordAnalysis } from "@/lib/resume/types";

export interface ParsedResponse {
  chatText: string;
  resumeData?: ResumeData;
  matchScore?: number;
  keywords?: KeywordAnalysis;
}

export function parseAssistantResponse(text: string): ParsedResponse {
  // Look for a JSON code block at the end of the response
  const jsonBlockRegex = /```json\s*\n([\s\S]*?)\n\s*```\s*$/;
  const match = text.match(jsonBlockRegex);

  if (!match) {
    return { chatText: text.trim() };
  }

  const chatText = text.slice(0, match.index).trim();
  const jsonStr = match[1].trim();

  try {
    const parsed = JSON.parse(jsonStr);
    return {
      chatText,
      resumeData: parsed.resumeData,
      matchScore: parsed.matchScore,
      keywords: parsed.keywords,
    };
  } catch {
    // If JSON parsing fails, return the full text
    return { chatText: text.trim() };
  }
}
