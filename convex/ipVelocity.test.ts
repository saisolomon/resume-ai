import { describe, it, expect } from "vitest";
import { hashIp, isOverIpVelocity } from "./ipVelocity";

describe("hashIp", () => {
  it("same IP + same date + same salt → same hash", () => {
    const a = hashIp("1.2.3.4", "2026-05-23", "salt");
    const b = hashIp("1.2.3.4", "2026-05-23", "salt");
    expect(a).toBe(b);
  });

  it("different date rotates the hash", () => {
    const a = hashIp("1.2.3.4", "2026-05-23", "salt");
    const b = hashIp("1.2.3.4", "2026-05-24", "salt");
    expect(a).not.toBe(b);
  });

  it("different IP → different hash", () => {
    const a = hashIp("1.2.3.4", "2026-05-23", "salt");
    const b = hashIp("5.6.7.8", "2026-05-23", "salt");
    expect(a).not.toBe(b);
  });
});

describe("isOverIpVelocity", () => {
  it("0 prior fps + new fp → not over", () => {
    expect(isOverIpVelocity([], "fp_new")).toBe(false);
  });

  it("5 distinct prior fps + new fp = 6 → over", () => {
    expect(isOverIpVelocity(["a", "b", "c", "d", "e"], "fp_new")).toBe(true);
  });

  it("5 prior fps but current is one of them → 5 distinct, not over", () => {
    expect(isOverIpVelocity(["a", "b", "c", "d", "e"], "a")).toBe(false);
  });

  it("repeated same fp → only 1 distinct", () => {
    expect(isOverIpVelocity(["a", "a", "a", "a", "a", "a"], "b")).toBe(false);
  });
});
