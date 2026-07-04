import { describe, it, expect } from "vitest";
import { renderCardSvg, renderCardBack } from "../src/scripts/card-svg";
import cards from "../src/data/cards.json";
import type { Card } from "../src/scripts/types";

describe("renderCardSvg", () => {
  it("全78枚で有効なSVG文字列を返す", () => {
    for (const c of cards as Card[]) {
      const svg = renderCardSvg(c);
      expect(svg).toContain("<svg");
      expect(svg).toContain('role="img"');
      expect(svg).toContain(`aria-label="${c.name}"`);
      expect(svg).toContain("</svg>");
    }
  });
  it("大アルカナはカードごとに異なるシンボルを持つ", () => {
    const majors = (cards as Card[]).filter(c => c.arcana === "major");
    const bodies = new Set(majors.map(c => renderCardSvg(c)));
    expect(bodies.size).toBe(22);
  });
  it("jsdomでparseしてもエラーにならない", () => {
    const div = document.createElement("div");
    for (const c of (cards as Card[]).slice(0, 10)) {
      div.innerHTML = renderCardSvg(c);
      expect(div.querySelector("svg")).not.toBeNull();
    }
  });
});

describe("renderCardBack", () => {
  it("裏面SVGを返す", () => {
    expect(renderCardBack()).toContain("<svg");
  });
});
