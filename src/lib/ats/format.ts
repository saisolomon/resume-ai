import type { ResumeData } from "@/lib/resume/types";

export type FormatIssue =
  | "missing_email"
  | "missing_phone"
  | "nonstandard_section_heading"
  | "bullet_too_long"
  | "date_unparseable";

export interface FormatScoreResult {
  score: number;
  issues: FormatIssue[];
}

const STANDARD_HEADINGS = new Set([
  "experience", "professional experience", "work experience",
  "education", "skills", "additional", "additional information",
  "projects", "publications", "certifications",
]);

const DATE_RE = /(\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\.?\s+\d{4}\b|\b\d{4}\b|present|current)/i;

const MAX_BULLET_LEN = 240;

const EMAIL_RE = /[a-z0-9._-]+@[a-z0-9.-]+\.[a-z]{2,}/i;
const PHONE_RE = /(\+?\d[\d\s().-]{8,}\d)/;

export function scoreFormat(resume: ResumeData): FormatScoreResult {
  const issues: FormatIssue[] = [];
  const contact = `${resume.contactLine1} ${resume.contactLine2 ?? ""}`;

  if (!EMAIL_RE.test(contact)) issues.push("missing_email");
  if (!PHONE_RE.test(contact)) issues.push("missing_phone");

  for (const section of resume.experienceSections) {
    if (!STANDARD_HEADINGS.has(section.heading.toLowerCase())) {
      if (!issues.includes("nonstandard_section_heading")) {
        issues.push("nonstandard_section_heading");
      }
    }
    for (const entry of section.entries) {
      for (const role of entry.roles) {
        if (!DATE_RE.test(role.date)) {
          if (!issues.includes("date_unparseable")) issues.push("date_unparseable");
        }
        for (const bullet of role.bullets) {
          if (bullet.length > MAX_BULLET_LEN) {
            if (!issues.includes("bullet_too_long")) issues.push("bullet_too_long");
          }
        }
      }
    }
  }

  const score = Math.max(0, 100 - issues.length * 20);
  return { score, issues };
}
