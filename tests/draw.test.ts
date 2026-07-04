import { describe, it, expect, beforeEach } from "vitest";
import { computeDraw, getOrDraw, cleanupOldDraws } from "../src/scripts/draw";
import cards from "../src/data/cards.json";
import type { Card } from "../src/scripts/types";

const cardList = cards as Card[];

describe("computeDraw", () => {
  it("同一日・同一テーマなら同一結果", () => {
    const a = computeDraw("20260704", "love", cardList);
    const b = computeDraw("20260704", "love", cardList);
    expect(a).toEqual(b);
  });
  it("テーマが違えば概ね違う結果(78日分で全一致しない)", () => {
    let diff = 0;
    for (let d = 1; d <= 28; d++) {
      const dk = `202607${String(d).padStart(2, "0")}`;
      const a = computeDraw(dk, "love", cardList);
      const b = computeDraw(dk, "work", cardList);
      if (a.cardId !== b.cardId || a.orientation !== b.orientation) diff++;
    }
    expect(diff).toBeGreaterThan(20);
  });
  it("実在するカードIDを返す", () => {
    const ids = new Set(cardList.map(c => c.id));
    const r = computeDraw("20260704", "general", cardList);
    expect(ids.has(r.cardId)).toBe(true);
    expect(["upright", "reversed"]).toContain(r.orientation);
  });
  it("正逆が両方出現する", () => {
    const seen = new Set<string>();
    for (let d = 1; d <= 28; d++) {
      seen.add(computeDraw(`202608${String(d).padStart(2, "0")}`, "money", cardList).orientation);
    }
    expect(seen.size).toBe(2);
  });
});

describe("getOrDraw / cleanupOldDraws", () => {
  beforeEach(() => localStorage.clear());

  it("初回は alreadyDrawn=false、同日2回目は true で同一結果", () => {
    const now = new Date(2026, 6, 4);
    const first = getOrDraw("love", cardList, localStorage, now);
    expect(first.alreadyDrawn).toBe(false);
    const second = getOrDraw("love", cardList, localStorage, now);
    expect(second.alreadyDrawn).toBe(true);
    expect(second.result).toEqual(first.result);
  });
  it("日付が変わると新規抽選になる", () => {
    getOrDraw("love", cardList, localStorage, new Date(2026, 6, 4));
    const next = getOrDraw("love", cardList, localStorage, new Date(2026, 6, 5));
    expect(next.alreadyDrawn).toBe(false);
  });
  it("cleanupOldDraws は当日以外の na:draw: キーを消す", () => {
    localStorage.setItem("na:draw:20260101:love", "{}");
    localStorage.setItem("na:draw:20260704:love", "{}");
    localStorage.setItem("na:muted", "1");
    cleanupOldDraws(localStorage, new Date(2026, 6, 4));
    expect(localStorage.getItem("na:draw:20260101:love")).toBeNull();
    expect(localStorage.getItem("na:draw:20260704:love")).not.toBeNull();
    expect(localStorage.getItem("na:muted")).toBe("1");
  });
});
