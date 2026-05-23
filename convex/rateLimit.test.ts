import { describe, it, expect } from "vitest";
import { isOverLimit } from "./rateLimit";

describe("isOverLimit", () => {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  it("0 prior runs — under limit", () => {
    expect(isOverLimit([], now)).toBe(false);
  });

  it("1 run within 24h — over daily limit", () => {
    expect(isOverLimit([now - 60_000], now)).toBe(true);
  });

  it("1 run yesterday — under daily but counts toward weekly", () => {
    expect(isOverLimit([now - 25 * 60 * 60 * 1000], now)).toBe(false);
  });

  it("3 runs in last 7 days — over weekly limit", () => {
    const t = [now - day * 6, now - day * 4, now - day * 2];
    expect(isOverLimit(t, now)).toBe(true);
  });

  it("4th run after 8 days — under weekly", () => {
    const t = [now - day * 8, now - day * 6, now - day * 4];
    expect(isOverLimit(t, now)).toBe(false);
  });
});
