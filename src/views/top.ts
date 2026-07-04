import type { View } from "../scripts/router";

// 魔法陣風の装飾SVG。二重円+ルーン風の記号を放射状に配置する。
// 実際の回転アニメーションはCSS(`.magic-circle`にkeyframesを当てる)側でTask 12にて仕上げる。
function magicCircleSvg(): string {
  const runes = Array.from({ length: 12 }, (_, i) => {
    const angle = (i * 30 * Math.PI) / 180;
    const x = 180 * Math.cos(angle);
    const y = 180 * Math.sin(angle);
    return `<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="4" fill="currentColor" opacity="0.7"/>`;
  }).join("");
  return `
    <svg class="magic-circle" viewBox="-200 -200 400 400" aria-hidden="true" focusable="false">
      <g class="magic-circle__ring magic-circle__ring--outer">
        <circle cx="0" cy="0" r="190" fill="none" stroke="currentColor" stroke-width="1"/>
        ${runes}
      </g>
      <g class="magic-circle__ring magic-circle__ring--inner">
        <circle cx="0" cy="0" r="120" fill="none" stroke="currentColor" stroke-width="1"/>
        <polygon points="0,-120 104,60 -104,60" fill="none" stroke="currentColor" stroke-width="0.75"/>
      </g>
    </svg>
  `;
}

export const render: View = (container, _params, ctx) => {
  container.innerHTML = `
    <section class="view view-top">
      ${magicCircleSvg()}
      <div class="view-top__content">
        <h1>黒の祭壇</h1>
        <p class="subtitle">NOCTURNE ALTAR</p>
        <p class="catchphrase">――今夜、あなたの運命が一枚めくられる</p>
        <button type="button" class="btn-ritual">儀式を始める</button>
      </div>
    </section>
  `;

  const btn = container.querySelector<HTMLButtonElement>(".btn-ritual")!;
  btn.addEventListener("click", () => {
    ctx.audio.start();
    ctx.navigate("/themes");
  });
};
