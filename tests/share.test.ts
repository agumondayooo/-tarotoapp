import { describe, it, expect } from "vitest";
import { buildShareUrl } from "../src/scripts/share";
import cards from "../src/data/cards.json";
import themes from "../src/data/themes.json";
import type { Card, Theme } from "../src/scripts/types";

const fool = (cards as Card[]).find(c => c.id === "major_00")!;
const love = (themes as Theme[]).find(t => t.id === "love")!;

describe("buildShareUrl", () => {
  it("x.com の intent URL を返す", () => {
    const url = buildShareUrl(fool, "upright", love, "https://example.com/");
    expect(url.startsWith("https://x.com/intent/post?text=")).toBe(true);
  });
  it("カード名・正逆・サイトURLがエンコードされて含まれる", () => {
    const url = buildShareUrl(fool, "reversed", love, "https://example.com/");
    const text = decodeURIComponent(url.split("text=")[1]);
    expect(text).toContain("愚者");
    expect(text).toContain("逆位置");
    expect(text).toContain("恋愛運");
    expect(text).toContain("https://example.com/");
    expect(text).toContain("黒の祭壇");
  });
});
