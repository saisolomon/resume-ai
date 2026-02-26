import { anthropic, MODEL } from "@/lib/ai/client";
import type { ResumeData } from "@/lib/resume/types";

const STRUCTURING_PROMPT = `You are a resume parser. Given raw text extracted from a resume document, extract and structure the information into the following JSON format. Be thorough — capture all information present.

Return ONLY a valid JSON object with this exact structure:
{
  "name": "Full Name",
  "contactLine1": "email | phone | LinkedIn | location",
  "contactLine2": "optional second line",
  "education": [
    {
      "institution": "University Name",
      "location": "City, State",
      "degree": "Degree Name",
      "date": "Graduation Date",
      "gpa": "GPA if mentioned",
      "details": ["honors", "relevant coursework"]
    }
  ],
  "experienceSections": [
    {
      "heading": "Experience",
      "entries": [
        {
          "company": "Company Name",
          "location": "City, State",
          "roles": [
            {
              "title": "Job Title",
              "date": "Start – End",
              "bullets": ["Achievement 1", "Achievement 2"]
            }
          ]
        }
      ]
    }
  ],
  "additionalInfo": ["Skill 1", "Skill 2"]
}

Rules:
- Return ONLY the JSON, no markdown fences, no explanations
- If information is missing, use empty strings or empty arrays
- Combine related skills into single bullet points in additionalInfo
- Keep bullet points concise and preserve the original content`;

export async function structureResumeText(text: string): Promise<ResumeData> {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: `Parse the following resume text and return structured JSON:\n\n${text}`,
      },
    ],
    system: STRUCTURING_PROMPT,
  });

  const content = response.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type from AI");
  }

  // Try to parse the response, stripping any markdown fences if present
  let jsonText = content.text.trim();
  if (jsonText.startsWith("```")) {
    jsonText = jsonText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }

  return JSON.parse(jsonText) as ResumeData;
}
