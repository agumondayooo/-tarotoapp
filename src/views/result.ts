import type { View } from "../scripts/router";
import themesData from "../data/themes.json";
import cardsData from "../data/cards.json";
import type { Card, Theme } from "../scripts/types";
import { getOrDraw } from "../scripts/draw";
import { getFortune } from "../scripts/fortunes";
import { renderCardSvg } from "../scripts/card-svg";
import { buildShareUrl } from "../scripts/share";

const themes = themesData as Theme[];
const cards = cardsData as Card[];

export const render: View = (container, params, ctx) => {
  const theme = themes.find(t => t.id === params.themeId);
  if (!theme) {
    ctx.navigate("/themes");
    return;
  }

  // getOrDraw はキャッシュ済みなら同一結果を返す(冪等)。
  const { result } = getOrDraw(theme.id, cards, localStorage);
  const card = cards.find(c => c.id === result.cardId);
  if (!card) {
    ctx.navigate("/themes");
    return;
  }

  const fortune = getFortune(card.id, theme.id);
  const reversed = result.orientation === "reversed";
  const orientationLabel = reversed ? "逆位置" : "正位置";
  const fortuneText = reversed ? fortune.reversed : fortune.upright;
  const shareUrl = buildShareUrl(card, result.orientation, theme, location.origin + location.pathname);

  container.innerHTML = `
    <section class="view view-result">
      <div class="card-frame${reversed ? " reversed" : ""}">
        ${renderCardSvg(card)}
      </div>
      <h2 class="card-name">${card.name} <span class="card-name-en">${card.nameEn}</span></h2>
      <p class="orientation-label">${orientationLabel}</p>
      <p class="theme-name">${theme.name}</p>
      <p class="fortune-text">${fortuneText}</p>
      <a class="share-link" href="${shareUrl}" target="_blank" rel="noopener">Xで分かち合う</a>
      <button type="button" class="btn-again">別の問いを立てる</button>
    </section>
  `;

  container.querySelector<HTMLButtonElement>(".btn-again")!.addEventListener("click", () => {
    ctx.navigate("/themes");
  });
};
