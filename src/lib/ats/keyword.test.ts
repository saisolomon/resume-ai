import { describe, it, expect } from "vitest";
import { scoreKeywords } from "./keyword";
import type { ResumeData } from "@/lib/resume/types";

const sampleResume: ResumeData = {
  name: "Alex Chen",
  contactLine1: "alex@email.com",
  education: [],
  experienceSections: [
    {
      heading: "Experience",
      entries: [
        {
          company: "Anthropic",
          location: "SF",
          roles: [
            {
              title: "Engineer",
              date: "2023-Present",
              bullets: [
                "Built distributed systems in Python serving 10M requests/day",
                "Led architecture migration to Kubernetes",
              ],
            },
          ],
        },
      ],
    },
  ],
  additionalInfo: ["GraphQL", "Kafka"],
};

describe("scoreKeywords", () => {
  it("returns 100 when all JD keywords are present", () => {
    const result = scoreKeywords(sampleResume, ["python", "kubernetes", "kafka"]);
    expect(result.score).toBe(100);
    expect(result.found).toEqual(expect.arrayContaining(["python", "kubernetes", "kafka"]));
    expect(result.missing).toEqual([]);
  });

  it("returns 0 when no JD keywords are present", () => {
    const result = scoreKeywords(sampleResume, ["rust", "cuda"]);
    expect(result.score).toBe(0);
    expect(result.missing).toEqual(["rust", "cuda"]);
  });

  it("is case-insensitive", () => {
    const result = scoreKeywords(sampleResume, ["PYTHON", "Kafka"]);
    expect(result.score).toBe(100);
  });

  it("handles partial match — 50 percent", () => {
    const result = scoreKeywords(sampleResume, ["python", "rust"]);
    expect(result.score).toBe(50);
    expect(result.found).toEqual(["python"]);
    expect(result.missing).toEqual(["rust"]);
  });

  it("returns 0 with empty keyword list (no JD signal)", () => {
    const result = scoreKeywords(sampleResume, []);
    expect(result.score).toBe(0);
  });
});
