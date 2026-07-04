import type { View } from "../scripts/router";
import themesData from "../data/themes.json";
import cardsData from "../data/cards.json";
import type { Card, Theme, ThemeId } from "../scripts/types";
import { getOrDraw } from "../scripts/draw";
import { renderCardBack } from "../scripts/card-svg";

const themes = themesData as Theme[];
const cards = cardsData as Card[];

const ALREADY_DRAWN_DELAY_MS = 1200;
const SHUFFLE_DELAY_MS = 2000;

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export const render: View = (container, params, ctx) => {
  const theme = themes.find(t => t.id === params.themeId);
  if (!theme) {
    ctx.navigate("/themes");
    return;
  }

  const { alreadyDrawn } = getOrDraw(theme.id as ThemeId, cards, localStorage);
  const reduced = prefersReducedMotion();

  if (alreadyDrawn) {
    container.innerHTML = `
      <section class="view view-draw view-draw--already">
        <p class="draw-message">本日の託宣はすでに下されている――</p>
      </section>
    `;
    if (reduced) {
      ctx.navigate("/result/" + theme.id);
    } else {
      setTimeout(() => ctx.navigate("/result/" + theme.id), ALREADY_DRAWN_DELAY_MS);
    }
    return;
  }

  // 初回抽選: 裏面カード3枚のシャッフル演出用の骨組み。
  // 実際のシャッフル/フリップのkeyframesはTask 12でCSSに実装する。
  container.innerHTML = `
    <section class="view view-draw${reduced ? " reduced-motion" : ""}">
      <p class="draw-message">運命の一枚が選ばれている――</p>
      <div class="shuffle-stage">
        <div class="card-back shuffle-card shuffle-card--1">${renderCardBack()}</div>
        <div class="card-back shuffle-card shuffle-card--2">${renderCardBack()}</div>
        <div class="card-back card-flip shuffle-card shuffle-card--3">${renderCardBack()}</div>
      </div>
    </section>
  `;

  if (reduced) {
    ctx.navigate("/result/" + theme.id);
  } else {
    setTimeout(() => ctx.navigate("/result/" + theme.id), SHUFFLE_DELAY_MS);
  }
};
