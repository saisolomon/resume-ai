import { describe, it, expect } from "vitest";
import { scoreFormat } from "./format";
import type { ResumeData } from "@/lib/resume/types";

function baseResume(): ResumeData {
  return {
    name: "Alex Chen",
    contactLine1: "alex@email.com | (555) 555-5555 | linkedin.com/in/alex",
    education: [
      { institution: "MIT", location: "Cambridge, MA", degree: "BS CS", date: "May 2020" },
    ],
    experienceSections: [
      {
        heading: "Experience",
        entries: [
          {
            company: "Anthropic", location: "SF",
            roles: [{ title: "Engineer", date: "Mar 2023 - Present", bullets: ["Built X"] }],
          },
        ],
      },
    ],
    additionalInfo: ["Python", "TypeScript"],
  };
}

describe("scoreFormat", () => {
  it("returns 100 when format is clean", () => {
    const result = scoreFormat(baseResume());
    expect(result.score).toBe(100);
    expect(result.issues).toEqual([]);
  });

  it("flags missing email", () => {
    const r = baseResume();
    r.contactLine1 = "(555) 555-5555 | linkedin.com/in/alex";
    const result = scoreFormat(r);
    expect(result.score).toBeLessThan(100);
    expect(result.issues).toContain("missing_email");
  });

  it("flags missing phone", () => {
    const r = baseResume();
    r.contactLine1 = "alex@email.com | linkedin.com/in/alex";
    const result = scoreFormat(r);
    expect(result.issues).toContain("missing_phone");
  });

  it("flags non-standard section heading", () => {
    const r = baseResume();
    r.experienceSections[0].heading = "My Adventures";
    const result = scoreFormat(r);
    expect(result.issues).toContain("nonstandard_section_heading");
  });

  it("flags overly long bullets", () => {
    const r = baseResume();
    r.experienceSections[0].entries[0].roles[0].bullets = [
      "x".repeat(300),
    ];
    const result = scoreFormat(r);
    expect(result.issues).toContain("bullet_too_long");
  });

  it("flags unparseable dates", () => {
    const r = baseResume();
    r.experienceSections[0].entries[0].roles[0].date = "this year-ish";
    const result = scoreFormat(r);
    expect(result.issues).toContain("date_unparseable");
  });
});
