import { describe, it, expect } from "vitest";
import { parseAssistantResponse } from "./parse-response";

describe("parseAssistantResponse", () => {
  it("returns plain text when no JSON block is present", () => {
    const result = parseAssistantResponse("Hello, how can I help you?");
    expect(result).toEqual({ chatText: "Hello, how can I help you?" });
    expect(result.resumeData).toBeUndefined();
    expect(result.matchScore).toBeUndefined();
    expect(result.keywords).toBeUndefined();
  });

  it("trims whitespace from plain text", () => {
    const result = parseAssistantResponse("  Hello  \n  ");
    expect(result.chatText).toBe("Hello");
  });

  it("extracts resumeData from a trailing JSON block", () => {
    const text = `Here's your updated resume!

\`\`\`json
{
  "resumeData": {
    "name": "Jane Doe",
    "contactLine1": "jane@example.com | 555-1234",
    "education": [],
    "experienceSections": [],
    "additionalInfo": []
  }
}
\`\`\``;

    const result = parseAssistantResponse(text);
    expect(result.chatText).toBe("Here's your updated resume!");
    expect(result.resumeData).toEqual({
      name: "Jane Doe",
      contactLine1: "jane@example.com | 555-1234",
      education: [],
      experienceSections: [],
      additionalInfo: [],
    });
  });

  it("extracts matchScore and keywords", () => {
    const text = `I've analyzed the job description.

\`\`\`json
{
  "resumeData": {
    "name": "John",
    "contactLine1": "john@test.com",
    "education": [],
    "experienceSections": [],
    "additionalInfo": []
  },
  "matchScore": 72,
  "keywords": {
    "found": ["Python", "AWS"],
    "missing": ["Kubernetes", "Terraform"]
  }
}
\`\`\``;

    const result = parseAssistantResponse(text);
    expect(result.chatText).toBe("I've analyzed the job description.");
    expect(result.matchScore).toBe(72);
    expect(result.keywords).toEqual({
      found: ["Python", "AWS"],
      missing: ["Kubernetes", "Terraform"],
    });
  });

  it("returns full text when JSON block has invalid JSON", () => {
    const text = `Here's an update.

\`\`\`json
{ invalid json !!!
\`\`\``;

    const result = parseAssistantResponse(text);
    expect(result.chatText).toBe(text.trim());
    expect(result.resumeData).toBeUndefined();
  });

  it("ignores JSON blocks that are not at the end", () => {
    const text = `Here's some code:

\`\`\`json
{"example": true}
\`\`\`

And then some more text after it.`;

    const result = parseAssistantResponse(text);
    expect(result.chatText).toBe(text.trim());
    expect(result.resumeData).toBeUndefined();
  });

  it("handles response with only a JSON block and no chat text", () => {
    const text = `\`\`\`json
{
  "resumeData": {
    "name": "Test",
    "contactLine1": "test@test.com",
    "education": [],
    "experienceSections": [],
    "additionalInfo": []
  }
}
\`\`\``;

    const result = parseAssistantResponse(text);
    expect(result.chatText).toBe("");
    expect(result.resumeData?.name).toBe("Test");
  });

  it("handles empty string input", () => {
    const result = parseAssistantResponse("");
    expect(result.chatText).toBe("");
  });

  it("preserves fields not in the schema (passthrough)", () => {
    const text = `Updated.

\`\`\`json
{
  "resumeData": {
    "name": "A",
    "contactLine1": "a@a.com",
    "education": [],
    "experienceSections": [],
    "additionalInfo": []
  },
  "matchScore": 50
}
\`\`\``;

    const result = parseAssistantResponse(text);
    expect(result.matchScore).toBe(50);
    expect(result.keywords).toBeUndefined();
  });
});
