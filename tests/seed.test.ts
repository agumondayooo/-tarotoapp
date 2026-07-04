import { describe, it, expect } from "vitest";
import { fnv1a, mulberry32, dateKey } from "../src/scripts/seed";

describe("fnv1a", () => {
  it("同一入力で同一ハッシュを返す", () => {
    expect(fnv1a("20260704love")).toBe(fnv1a("20260704love"));
  });
  it("異なる入力で異なるハッシュを返す", () => {
    expect(fnv1a("20260704love")).not.toBe(fnv1a("20260704work"));
  });
  it("32bit符号なし整数を返す", () => {
    const h = fnv1a("test");
    expect(h).toBeGreaterThanOrEqual(0);
    expect(h).toBeLessThanOrEqual(0xffffffff);
    expect(Number.isInteger(h)).toBe(true);
  });
});

describe("mulberry32", () => {
  it("同一シードで同一乱数列を返す", () => {
    const a = mulberry32(123);
    const b = mulberry32(123);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });
  it("0以上1未満を返す", () => {
    const r = mulberry32(42);
    for (let i = 0; i < 1000; i++) {
      const v = r();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
  it("78で割った剰余が全カードに分布する", () => {
    const seen = new Set<number>();
    for (let s = 0; s < 2000; s++) {
      seen.add(Math.floor(mulberry32(s)() * 78));
    }
    expect(seen.size).toBe(78);
  });
});

describe("dateKey", () => {
  it("ローカル日付をYYYYMMDDで返す", () => {
    expect(dateKey(new Date(2026, 6, 4))).toBe("20260704");
  });
  it("1桁の月日をゼロ埋めする", () => {
    expect(dateKey(new Date(2026, 0, 9))).toBe("20260109");
  });
});
