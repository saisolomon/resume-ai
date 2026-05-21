const FP_STORAGE_KEY = "resume-ai:fp";

async function computeFingerprint(): Promise<string> {
  if (typeof window === "undefined") return "ssr";

  const parts: string[] = [
    navigator.userAgent,
    navigator.language,
    String(screen.width),
    String(screen.height),
    String(screen.colorDepth),
    Intl.DateTimeFormat().resolvedOptions().timeZone ?? "unknown",
    String(navigator.hardwareConcurrency ?? 0),
  ];

  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.textBaseline = "top";
      ctx.font = "14px Arial";
      ctx.fillText("resume.ai fp", 0, 0);
      parts.push(canvas.toDataURL().slice(-64));
    }
  } catch {
    // ignore — canvas can be blocked
  }

  const enc = new TextEncoder().encode(parts.join("|"));
  const digest = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function getFingerprint(): Promise<string> {
  if (typeof window === "undefined") return "ssr";
  const cached = window.localStorage.getItem(FP_STORAGE_KEY);
  if (cached) return cached;
  const fp = await computeFingerprint();
  window.localStorage.setItem(FP_STORAGE_KEY, fp);
  return fp;
}
