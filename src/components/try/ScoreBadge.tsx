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

export function ScoreBadge({ score, size = "md" }: { score: number; size?: "sm" | "md" | "lg" }) {
  const band = scoreBand(score);
  const sizeCls =
    size === "sm"
      ? "text-xs px-2 py-0.5"
      : size === "lg"
      ? "text-3xl px-4 py-2 font-bold"
      : "text-sm px-2.5 py-1";
  return (
    <span className={`inline-flex items-center rounded-full text-white font-semibold ${BG[band]} ${sizeCls}`}>
      {score}
    </span>
  );
}
