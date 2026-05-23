export type Tier = "free" | "pro" | "career";

export type Feature =
  | "fine_tune_editor"
  | "custom_angle"
  | "ats_deep_scan"
  | "side_by_side"
  | "priority_queue"
  | "jd_watchlist"
  | "cover_letter"
  | "linkedin_rewrite"
  | "interview_prep"
  | "outreach_templates"
  | "human_review";

const FREE_FEATURES = new Set<Feature>();
const PRO_FEATURES = new Set<Feature>([
  "fine_tune_editor",
  "custom_angle",
  "ats_deep_scan",
  "side_by_side",
  "priority_queue",
  "jd_watchlist",
]);
const CAREER_FEATURES = new Set<Feature>([
  "cover_letter",
  "linkedin_rewrite",
  "interview_prep",
  "outreach_templates",
  "human_review",
]);

export function canAccessFeature(tier: Tier, feature: Feature): boolean {
  if (tier === "free") return FREE_FEATURES.has(feature);
  if (tier === "pro") return PRO_FEATURES.has(feature);
  return PRO_FEATURES.has(feature) || CAREER_FEATURES.has(feature);
}

export function weeklyRunLimit(tier: Tier): number {
  if (tier === "free") return 3;
  return Infinity;
}
