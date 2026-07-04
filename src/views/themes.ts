import type { View } from "../scripts/router";
import themesData from "../data/themes.json";
import type { Theme } from "../scripts/types";

const themes = themesData as Theme[];

export const render: View = (container, _params, ctx) => {
  container.innerHTML = `
    <section class="view view-themes">
      <h2>何を問う</h2>
      <div class="theme-list">
        ${themes
          .map(
            t => `
          <button type="button" class="theme-card" style="--theme-color: ${t.color}" data-theme-id="${t.id}">
            <span class="theme-name">${t.name}</span>
            <span class="theme-label">${t.label}</span>
          </button>
        `,
          )
          .join("")}
      </div>
    </section>
  `;

  container.querySelectorAll<HTMLButtonElement>(".theme-card").forEach(btn => {
    btn.addEventListener("click", () => {
      ctx.navigate("/draw/" + btn.dataset.themeId);
    });
  });
};
