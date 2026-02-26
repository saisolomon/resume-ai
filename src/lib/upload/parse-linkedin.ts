const LINKEDIN_SECTIONS = [
  "Experience",
  "Education",
  "Skills",
  "Licenses & Certifications",
  "Volunteer Experience",
  "Languages",
  "Projects",
  "Honors & Awards",
  "Summary",
  "About",
];

export function isLinkedInPdf(text: string): boolean {
  // LinkedIn PDFs typically contain "linkedin.com" and multiple known section headers
  const hasLinkedIn = text.toLowerCase().includes("linkedin.com");
  const sectionCount = LINKEDIN_SECTIONS.filter((s) =>
    text.includes(s)
  ).length;
  return hasLinkedIn && sectionCount >= 3;
}

export function parseLinkedInPdf(text: string): { sections: Record<string, string> } {
  const sections: Record<string, string> = {};
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

  let currentSection = "header";
  let currentContent: string[] = [];

  for (const line of lines) {
    if (LINKEDIN_SECTIONS.includes(line)) {
      if (currentContent.length > 0) {
        sections[currentSection] = currentContent.join("\n");
      }
      currentSection = line;
      currentContent = [];
    } else {
      currentContent.push(line);
    }
  }

  if (currentContent.length > 0) {
    sections[currentSection] = currentContent.join("\n");
  }

  return { sections };
}
