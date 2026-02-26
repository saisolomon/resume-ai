import { describe, it, expect } from "vitest";
import { generateResume } from "./generate";
import type { ResumeData } from "@/lib/resume/types";

function makeResume(overrides?: Partial<ResumeData>): ResumeData {
  return {
    name: "Jane Doe",
    contactLine1: "jane@example.com | (555) 123-4567",
    education: [],
    experienceSections: [],
    additionalInfo: [],
    ...overrides,
  };
}

describe("generateResume", () => {
  it("returns a Buffer", async () => {
    const buffer = await generateResume(makeResume());
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);
  });

  it("produces a valid DOCX (ZIP magic bytes)", async () => {
    const buffer = await generateResume(makeResume());
    // DOCX files are ZIP archives: first 4 bytes = PK\x03\x04
    expect(buffer[0]).toBe(0x50); // P
    expect(buffer[1]).toBe(0x4b); // K
    expect(buffer[2]).toBe(0x03);
    expect(buffer[3]).toBe(0x04);
  });

  it("handles a full resume with all sections", async () => {
    const data = makeResume({
      name: "John Smith",
      contactLine1: "john@test.com | 555-0000",
      contactLine2: "linkedin.com/in/jsmith | github.com/jsmith",
      education: [
        {
          institution: "MIT",
          location: "Cambridge, MA",
          degree: "B.S. Computer Science",
          date: "May 2024",
          gpa: "3.9",
          details: ["Dean's List", "Teaching Assistant"],
        },
      ],
      experienceSections: [
        {
          heading: "Experience",
          entries: [
            {
              company: "Acme Corp",
              location: "San Francisco, CA",
              roles: [
                {
                  title: "Software Engineer",
                  date: "Jun 2024 – Present",
                  bullets: [
                    "Built a feature that increased revenue by 20%",
                    "Led a team of 5 engineers",
                  ],
                },
              ],
            },
          ],
        },
      ],
      additionalInfo: [
        "Languages: Python, TypeScript, Go",
        "Interests: Rock climbing, open source",
      ],
    });

    const buffer = await generateResume(data);
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(100);
  });

  it("handles a resume with multiple roles per company", async () => {
    const data = makeResume({
      experienceSections: [
        {
          heading: "Experience",
          entries: [
            {
              company: "BigCo",
              companyNote: "acquired by MegaCo",
              location: "New York, NY",
              roles: [
                {
                  title: "Senior Engineer",
                  date: "Jan 2024 – Present",
                  bullets: ["Led architecture redesign"],
                },
                {
                  title: "Engineer",
                  date: "Jun 2022 – Dec 2023",
                  bullets: ["Built core API"],
                },
              ],
            },
          ],
        },
      ],
    });

    const buffer = await generateResume(data);
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(100);
  });

  it("handles a resume with no optional fields", async () => {
    const buffer = await generateResume(makeResume());
    expect(buffer).toBeInstanceOf(Buffer);
  });

  it("handles multiple experience sections", async () => {
    const data = makeResume({
      experienceSections: [
        {
          heading: "Work Experience",
          entries: [
            {
              company: "Company A",
              location: "City, ST",
              roles: [
                { title: "Role A", date: "2024", bullets: ["Did things"] },
              ],
            },
          ],
        },
        {
          heading: "Research Experience",
          entries: [
            {
              company: "Lab B",
              location: "University",
              roles: [
                { title: "Researcher", date: "2023", bullets: ["Published paper"] },
              ],
            },
          ],
        },
      ],
    });

    const buffer = await generateResume(data);
    expect(buffer).toBeInstanceOf(Buffer);
  });
});
