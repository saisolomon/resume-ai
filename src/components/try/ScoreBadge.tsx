/**
 * ATS score chip.
 *
 * Design.md bands:
 *   ≥85 → green (Match)
 *   70–84 → amber (Caution)
 *   <70 → red (Weak)
 *
 * Always renders the numeral in Geist Mono with tabular figures so a
 * score crossfade after a chat edit doesn't visually jitter.
 */
export function scoreBand(score: number): "good" | "warn" | "bad" {
  if (score >= 85) return "good";
  if (score >= 70) return "warn";
  return "bad";
}

const BG = {
  good: "bg-green-600",
  warn: "bg-amber-600",
  bad: "bg-red-600",
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
      ? "text-xs px-2 py-0.5"
      : size === "lg"
        ? "text-2xl px-4 py-2 font-bold"
        : "text-sm px-2.5 py-1";
  return (
    <span
      aria-label={`ATS score ${score}`}
      className={`inline-flex items-center justify-center rounded-full font-mono font-semibold tabular-nums text-white transition-colors duration-300 ${BG[band]} ${sizeCls}`}
    >
      {score}
    </span>
  );
}