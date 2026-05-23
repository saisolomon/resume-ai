import { describe, it, expect } from "vitest";
import { canAccessFeature, weeklyRunLimit } from "./tier";

describe("canAccessFeature", () => {
  it("free can edit nothing", () => {
    expect(canAccessFeature("free", "fine_tune_editor")).toBe(false);
  });
  it("pro can edit", () => {
    expect(canAccessFeature("pro", "fine_tune_editor")).toBe(true);
  });
  it("career has cover letter", () => {
    expect(canAccessFeature("career", "cover_letter")).toBe(true);
  });
  it("pro cannot cover letter", () => {
    expect(canAccessFeature("pro", "cover_letter")).toBe(false);
  });
});

describe("weeklyRunLimit", () => {
  it("free is 3", () => expect(weeklyRunLimit("free")).toBe(3));
  it("pro is Infinity", () => expect(weeklyRunLimit("pro")).toBe(Infinity));
  it("career is Infinity", () => expect(weeklyRunLimit("career")).toBe(Infinity));
});
