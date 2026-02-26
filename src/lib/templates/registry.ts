export interface TemplateInfo {
  slug: string;
  name: string;
  description: string;
  tier: "FREE" | "PRO" | "CAREER";
}

export const TEMPLATES: TemplateInfo[] = [
  {
    slug: "classic",
    name: "Classic",
    description: "Traditional ATS-friendly format with Times New Roman",
    tier: "FREE",
  },
  {
    slug: "modern",
    name: "Modern",
    description: "Clean sans-serif design with subtle color accents",
    tier: "PRO",
  },
  {
    slug: "creative",
    name: "Creative",
    description: "Two-column layout with sidebar for skills",
    tier: "PRO",
  },
  {
    slug: "minimal",
    name: "Minimal",
    description: "Ultra-clean design with generous whitespace",
    tier: "PRO",
  },
];

export function getTemplate(slug: string): TemplateInfo | undefined {
  return TEMPLATES.find((t) => t.slug === slug);
}
