/**
 * ATS score chip.
 *
 * Design.md bands:
 *   ≥85 → green (Match)  — #1A7F45
 *   70–84 → amber (Caution) — #B45309
 *   <70 → red (Weak)     — #B91C1C
 *
 * Calibrated for the light canvas — slightly deeper saturation than the prior
 * dark-mode versions so the chip clears AA contrast on white-paper resumes.
 * Always renders the numeral in Geist Mono with tabular figures so a score
 * crossfade after a chat edit doesn't visually jitter.
 */
export function scoreBand(score: number): "good" | "warn" | "bad" {
  if (score >= 85) return "good";
  if (score >= 70) return "warn";
  return "bad";
}

const BG = {
  good: "bg-[#1A7F45]",
  warn: "bg-[#B45309]",
  bad: "bg-[#B91C1C]",
};

export function ScoreBadge({
  score,
  size = "md",
}: {
  score: number;
  size?: "sm" | "md" | "lg";
}) {
  const band = scoreBand(score);
  const sizeCls =
    size === "sm"
      ? "text-[12px] px-2 py-0.5"
      : size === "lg"
        ? "text-[22px] px-4 py-2 font-bold"
        : "text-[13px] px-2.5 py-0.5";
  return (
    <span
      aria-label={`ATS score ${score}`}
      className={`inline-flex items-center justify-center rounded-full font-mono font-medium tabular-nums text-white transition-colors duration-300 ${BG[band]} ${sizeCls}`}
    >
      {score}
    </span>
  );
}
