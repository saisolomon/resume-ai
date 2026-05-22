import { describe, it, expect } from "vitest";
import { canonicalizeJobUrl } from "./canonicalize";

describe("canonicalizeJobUrl", () => {
  it("lowercases host", () => {
    expect(canonicalizeJobUrl("https://Jobs.Lever.co/anthropic/123"))
      .toBe("https://jobs.lever.co/anthropic/123");
  });

  it("strips trailing slash", () => {
    expect(canonicalizeJobUrl("https://jobs.lever.co/anthropic/123/"))
      .toBe("https://jobs.lever.co/anthropic/123");
  });

  it("strips tracking query params", () => {
    expect(canonicalizeJobUrl("https://jobs.lever.co/anthropic/123?gh_jid=abc&utm_source=x"))
      .toBe("https://jobs.lever.co/anthropic/123?gh_jid=abc");
  });

  it("preserves gh_jid", () => {
    expect(canonicalizeJobUrl("https://boards.greenhouse.io/foo?gh_jid=999"))
      .toBe("https://boards.greenhouse.io/foo?gh_jid=999");
  });

  it("strips fragments", () => {
    expect(canonicalizeJobUrl("https://jobs.ashbyhq.com/foo/bar#apply"))
      .toBe("https://jobs.ashbyhq.com/foo/bar");
  });

  it("throws on invalid url", () => {
    expect(() => canonicalizeJobUrl("not-a-url")).toThrow();
  });
});
