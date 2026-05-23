import { describe, it, expect } from "vitest";
import { approxCostUsd } from "./costGuard";

describe("approxCostUsd", () => {
  it("zero tokens = $0", () => {
    expect(approxCostUsd({ model: "sonnet", inputTokens: 0, outputTokens: 0 })).toBe(0);
  });
  it("1M sonnet input only = $3", () => {
    expect(
      approxCostUsd({ model: "sonnet", inputTokens: 1_000_000, outputTokens: 0 }),
    ).toBeCloseTo(3, 5);
  });
  it("1M sonnet output only = $15", () => {
    expect(
      approxCostUsd({ model: "sonnet", inputTokens: 0, outputTokens: 1_000_000 }),
    ).toBeCloseTo(15, 5);
  });
  it("1M haiku input only = $0.80", () => {
    expect(
      approxCostUsd({ model: "haiku", inputTokens: 1_000_000, outputTokens: 0 }),
    ).toBeCloseTo(0.8, 5);
  });
  it("1M haiku output only = $4", () => {
    expect(
      approxCostUsd({ model: "haiku", inputTokens: 0, outputTokens: 1_000_000 }),
    ).toBeCloseTo(4, 5);
  });
  it("typical Sonnet rewrite: 8k in + 4k out = ~$0.084", () => {
    const cost = approxCostUsd({
      model: "sonnet",
      inputTokens: 8000,
      outputTokens: 4000,
    });
    expect(cost).toBeCloseTo(0.084, 4);
  });
});
