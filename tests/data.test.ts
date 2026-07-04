import { describe, it, expect } from "vitest";
import cards from "../src/data/cards.json";
import themes from "../src/data/themes.json";
import fortunesMajor from "../src/data/fortunes-major.json";
import fortunesMinor from "../src/data/fortunes-minor.json";
import { getFortune, allFortunes } from "../src/scripts/fortunes";
import type { Card, Theme, Fortune } from "../src/scripts/types";

const cardList = cards as Card[];
const themeList = themes as Theme[];
const majorFortunes = fortunesMajor as Fortune[];
const minorFortunes = fortunesMinor as Fortune[];
const THEMES = ["general", "love", "work", "money", "relation"] as const;

describe("cards.json", () => {
  it("78枚ある", () => {
    expect(cardList.length).toBe(78);
  });
  it("大アルカナ22枚・小アルカナ56枚", () => {
    expect(cardList.filter(c => c.arcana === "major").length).toBe(22);
    expect(cardList.filter(c => c.arcana === "minor").length).toBe(56);
  });
  it("IDが一意", () => {
    expect(new Set(cardList.map(c => c.id)).size).toBe(78);
  });
  it("ID形式が正しい", () => {
    for (const c of cardList) {
      if (c.arcana === "major") {
        expect(c.id).toMatch(/^major_\d{2}$/);
        expect(c.suit).toBeNull();
      } else {
        expect(c.id).toMatch(/^minor_(wand|cup|sword|pentacle)_\d{2}$/);
        expect(c.suit).not.toBeNull();
      }
    }
  });
  it("各スート14枚ずつ", () => {
    for (const suit of ["wand", "cup", "sword", "pentacle"]) {
      expect(cardList.filter(c => c.suit === suit).length).toBe(14);
    }
  });
  it("全カードにキーワードがある", () => {
    for (const c of cardList) {
      expect(c.keywords.upright.length).toBeGreaterThanOrEqual(2);
      expect(c.keywords.reversed.length).toBeGreaterThanOrEqual(2);
      expect(c.name.length).toBeGreaterThan(0);
      expect(c.nameEn.length).toBeGreaterThan(0);
    }
  });
});

describe("themes.json", () => {
  it("5テーマある", () => {
    expect(themeList.map(t => t.id).sort()).toEqual(
      ["general", "love", "money", "relation", "work"]
    );
  });
  it("全テーマに名前・ラベル・色がある", () => {
    for (const t of themeList) {
      expect(t.name.length).toBeGreaterThan(0);
      expect(t.label.length).toBeGreaterThan(0);
      expect(t.color).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });
});

describe("fortunes-major.json", () => {
  it("大アルカナ22枚×5テーマ=110エントリある", () => {
    expect(majorFortunes.length).toBe(110);
  });
  it("全組み合わせを網羅し重複がない", () => {
    const keys = new Set(majorFortunes.map(f => `${f.cardId}:${f.theme}`));
    expect(keys.size).toBe(110);
    for (let n = 0; n < 22; n++) {
      for (const t of THEMES) {
        expect(keys.has(`major_${String(n).padStart(2, "0")}:${t}`)).toBe(true);
      }
    }
  });
  it("本文は60〜180字で、です・ます調を含まない", () => {
    for (const f of majorFortunes) {
      for (const text of [f.upright, f.reversed]) {
        expect(text.length).toBeGreaterThanOrEqual(60);
        expect(text.length).toBeLessThanOrEqual(180);
        expect(text).not.toMatch(/です|ます/);
      }
    }
  });
});

describe("fortunes-minor.json", () => {
  it("小アルカナ56枚×5テーマ=280エントリある", () => {
    expect(minorFortunes.length).toBe(280);
  });
  it("全組み合わせを網羅し重複がない", () => {
    const keys = new Set(minorFortunes.map(f => `${f.cardId}:${f.theme}`));
    expect(keys.size).toBe(280);
    const minorIds = (cards as Card[]).filter(c => c.arcana === "minor").map(c => c.id);
    for (const id of minorIds) {
      for (const t of THEMES) expect(keys.has(`${id}:${t}`)).toBe(true);
    }
  });
  it("本文は60〜180字で、です・ます調を含まない", () => {
    for (const f of minorFortunes) {
      for (const text of [f.upright, f.reversed]) {
        expect(text.length).toBeGreaterThanOrEqual(60);
        expect(text.length).toBeLessThanOrEqual(180);
        expect(text).not.toMatch(/です|ます/);
      }
    }
  });
  it("同一テーマ内で全文一致の重複がない", () => {
    for (const t of THEMES) {
      const texts = minorFortunes.filter(f => f.theme === t).flatMap(f => [f.upright, f.reversed]);
      expect(new Set(texts).size).toBe(texts.length);
    }
  });
});

describe("fortunes.ts", () => {
  it("全390エントリ(780本)が揃っている", () => {
    expect(allFortunes().length).toBe(390);
  });
  it("全カード×全テーマで取得できる", () => {
    for (const c of cardList) {
      for (const t of THEMES) {
        const f = getFortune(c.id, t);
        expect(f.upright.length).toBeGreaterThan(0);
        expect(f.reversed.length).toBeGreaterThan(0);
      }
    }
  });
  it("存在しない組み合わせは throw する", () => {
    expect(() => getFortune("major_99", "love")).toThrow();
  });
});
