import type { ResumeData } from "@/lib/resume/types";

export interface KeywordScoreResult {
  score: number;
  found: string[];
  missing: string[];
}

function flattenResumeText(resume: ResumeData): string {
  const parts: string[] = [
    resume.name,
    resume.contactLine1,
    resume.contactLine2 ?? "",
    ...resume.education.flatMap((e) => [
      e.institution, e.location, e.degree, e.date, e.gpa ?? "",
      ...(e.details ?? []),
    ]),
    ...resume.experienceSections.flatMap((s) => [
      s.heading,
      ...s.entries.flatMap((entry) => [
        entry.company, entry.companyNote ?? "", entry.location,
        ...entry.roles.flatMap((r) => [r.title, r.date, ...r.bullets]),
      ]),
    ]),
    ...resume.additionalInfo,
  ];
  return parts.join(" ").toLowerCase();
}

export function scoreKeywords(
  resume: ResumeData,
  jdKeywords: string[],
): KeywordScoreResult {
  if (jdKeywords.length === 0) {
    return { score: 0, found: [], missing: [] };
  }
  const text = flattenResumeText(resume);
  const found: string[] = [];
  const missing: string[] = [];
  for (const kw of jdKeywords) {
    const needle = kw.toLowerCase();
    if (text.includes(needle)) found.push(needle);
    else missing.push(needle);
  }
  const score = Math.round((found.length / jdKeywords.length) * 100);
  return { score, found, missing };
}
