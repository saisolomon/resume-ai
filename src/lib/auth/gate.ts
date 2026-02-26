export const TIER_LIMITS = {
  FREE: {
    maxResumes: 1,
    maxChatMessagesPerDay: 10,
    maxDocxDownloadsPerDay: 3,
    maxPdfDownloadsPerDay: 0,
    templates: ["classic"],
    jdTailoring: false,
    fileUpload: false,
    coverLetter: false,
  },
  PRO: {
    maxResumes: Infinity,
    maxChatMessagesPerDay: Infinity,
    maxDocxDownloadsPerDay: Infinity,
    maxPdfDownloadsPerDay: Infinity,
    templates: ["classic", "modern", "creative", "minimal"],
    jdTailoring: true,
    fileUpload: true,
    coverLetter: false,
  },
  CAREER: {
    maxResumes: Infinity,
    maxChatMessagesPerDay: Infinity,
    maxDocxDownloadsPerDay: Infinity,
    maxPdfDownloadsPerDay: Infinity,
    templates: ["classic", "modern", "creative", "minimal"],
    jdTailoring: true,
    fileUpload: true,
    coverLetter: true,
  },
} as const;

export type Feature =
  | "chat"
  | "docxDownload"
  | "pdfDownload"
  | "jdTailoring"
  | "fileUpload"
  | "template"
  | "resume"
  | "coverLetter";

export type SubscriptionTier = keyof typeof TIER_LIMITS;

export function isFeatureAllowed(
  tier: SubscriptionTier,
  feature: Feature,
  extra?: { templateSlug?: string },
): boolean {
  const limits = TIER_LIMITS[tier];
  switch (feature) {
    case "pdfDownload":
      return limits.maxPdfDownloadsPerDay > 0;
    case "jdTailoring":
      return limits.jdTailoring;
    case "fileUpload":
      return limits.fileUpload;
    case "coverLetter":
      return limits.coverLetter;
    case "template":
      return extra?.templateSlug
        ? (limits.templates as readonly string[]).includes(extra.templateSlug)
        : true;
    default:
      return true;
  }
}
