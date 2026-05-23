import { describe, it, expect } from "vitest";
import { hashIp, todayUTC } from "./ipHash";

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
  it("different salt → different hash", () => {
    const a = hashIp("1.2.3.4", "2026-05-23", "salt-a");
    const b = hashIp("1.2.3.4", "2026-05-23", "salt-b");
    expect(a).not.toBe(b);
  });
});

describe("todayUTC", () => {
  it("formats YYYY-MM-DD", () => {
    expect(todayUTC(new Date(Date.UTC(2026, 4, 23)))).toBe("2026-05-23");
  });
  it("pads month + day", () => {
    expect(todayUTC(new Date(Date.UTC(2026, 0, 5)))).toBe("2026-01-05");
  });
});
