import { createHash } from "crypto";

// Daily-rotating IP hash. The salt is (FINGERPRINT_SALT + YYYY-MM-DD)
// so the hash changes daily — limits long-term ability to track IPs but
// preserves correlation within a single day for abuse detection.
//
// Lives in src/lib (not convex/) because Node's `crypto` module isn't
// available in Convex's default V8 isolate — and we don't need this
// helper inside Convex (the Next.js API route does the IP hashing
// before forwarding the hash to Convex).
export function hashIp(ip: string, dateUTC: string, salt: string): string {
  return createHash("sha256").update(`${salt}:${dateUTC}:${ip}`).digest("hex");
}

export function todayUTC(d: Date = new Date()): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}
