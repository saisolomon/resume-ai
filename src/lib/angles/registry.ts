export type AngleSlug = "eng_depth" | "leadership" | "cross_functional" | "specialist";

export interface AngleDef {
  slug: AngleSlug;
  label: string;
  directive: string;
  defaultTemplate: "classic" | "modern" | "creative" | "minimal";
}

export const ANGLES: AngleDef[] = [
  {
    slug: "eng_depth",
    label: "Engineering depth",
    directive:
      "Frame the candidate around technical scope, system complexity, and deep specialization. " +
      "Lead bullets with what was built and how complex it was. Quantify systems (TPS, data volume, " +
      "users at scale). De-emphasize people management unless directly relevant.",
    defaultTemplate: "classic",
  },
  {
    slug: "leadership",
    label: "Leadership",
    directive:
      "Frame the candidate around team scope, cross-team impact, mentorship, and hiring. " +
      "Lead bullets with people influenced and outcomes shipped via others. Quantify team size, " +
      "headcount changes, retention.",
    defaultTemplate: "modern",
  },
  {
    slug: "cross_functional",
    label: "Cross-functional",
    directive:
      "Frame the candidate around multi-discipline work — engineering + product + design + biz. " +
      "Lead bullets with stakeholders worked with and launches enabled. Quantify cross-functional " +
      "outcomes (launches, revenue, partnerships).",
    defaultTemplate: "creative",
  },
  {
    slug: "specialist",
    label: "Specialist",
    directive:
      "Frame the candidate around the single deepest skill the JD prioritizes. Tight, role-shaped. " +
      "All bullets reinforce expertise in that one area. De-emphasize anything not directly aligned.",
    defaultTemplate: "minimal",
  },
];

export function getAngle(slug: AngleSlug): AngleDef {
  const found = ANGLES.find((a) => a.slug === slug);
  if (!found) throw new Error(`Unknown angle: ${slug}`);
  return found;
}
