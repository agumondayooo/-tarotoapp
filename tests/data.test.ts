import { describe, it, expect } from "vitest";
import cards from "../src/data/cards.json";
import themes from "../src/data/themes.json";
import type { Card, Theme } from "../src/scripts/types";

const cardList = cards as Card[];
const themeList = themes as Theme[];

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
