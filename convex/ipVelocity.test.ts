import { describe, it, expect } from "vitest";
import { isOverIpVelocity } from "./ipVelocity";

// hashIp is tested in src/lib/ipHash.test.ts because it lives there now.

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
