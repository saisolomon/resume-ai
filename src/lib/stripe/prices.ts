export const PRICE_IDS = {
  PRO: process.env.STRIPE_PRO_PRICE_ID!,
  CAREER: process.env.STRIPE_CAREER_PRICE_ID!,
} as const;

export function tierFromPriceId(priceId: string): "PRO" | "CAREER" | null {
  if (priceId === PRICE_IDS.PRO) return "PRO";
  if (priceId === PRICE_IDS.CAREER) return "CAREER";
  return null;
}
