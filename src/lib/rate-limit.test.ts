import { describe, it, expect, vi, beforeEach } from "vitest";
import { rateLimit } from "./rate-limit";

describe("rateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  // Use unique keys per test to avoid cross-test state
  let keyCounter = 0;
  function uniqueKey(prefix: string) {
    return `${prefix}:${++keyCounter}`;
  }

  it("allows requests under the limit", () => {
    const key = uniqueKey("under");
    expect(rateLimit(key, 3, 60_000)).toBe(true);
    expect(rateLimit(key, 3, 60_000)).toBe(true);
    expect(rateLimit(key, 3, 60_000)).toBe(true);
  });

  it("blocks requests over the limit", () => {
    const key = uniqueKey("over");
    rateLimit(key, 2, 60_000);
    rateLimit(key, 2, 60_000);
    expect(rateLimit(key, 2, 60_000)).toBe(false);
  });

  it("allows requests again after the window expires", () => {
    const key = uniqueKey("expire");
    rateLimit(key, 1, 10_000);
    expect(rateLimit(key, 1, 10_000)).toBe(false);

    // Advance time past the window
    vi.advanceTimersByTime(10_001);

    expect(rateLimit(key, 1, 10_000)).toBe(true);
  });

  it("uses sliding window (partial expiry)", () => {
    const key = uniqueKey("sliding");

    // t=0: first request
    rateLimit(key, 2, 10_000);

    // t=5000: second request
    vi.advanceTimersByTime(5_000);
    rateLimit(key, 2, 10_000);

    // t=5000: limit hit
    expect(rateLimit(key, 2, 10_000)).toBe(false);

    // t=10001: first request expired, second still valid
    vi.advanceTimersByTime(5_001);
    expect(rateLimit(key, 2, 10_000)).toBe(true);
  });

  it("tracks different keys independently", () => {
    const key1 = uniqueKey("indep-a");
    const key2 = uniqueKey("indep-b");

    rateLimit(key1, 1, 60_000);
    expect(rateLimit(key1, 1, 60_000)).toBe(false);
    // key2 should be unaffected
    expect(rateLimit(key2, 1, 60_000)).toBe(true);
  });

  it("returns true for limit of 1 on first call", () => {
    const key = uniqueKey("first");
    expect(rateLimit(key, 1, 60_000)).toBe(true);
  });
});
