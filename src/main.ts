import "./styles/theme.css";
import { initAudio } from "./scripts/audio";
import { startRouter, route, type AppContext } from "./scripts/router";
import { cleanupOldDraws } from "./scripts/draw";

cleanupOldDraws();

const app = document.getElementById("app")!;
const audio = initAudio();

const ctx: AppContext = {
  audio,
  navigate(path: string) {
    location.hash = "#" + path;
  },
};

// 常設BGMトグルボタン
const bgmBtn = document.createElement("button");
bgmBtn.className = "bgm-toggle";
function syncBgmBtn(): void {
  bgmBtn.textContent = audio.muted ? "🔇" : "🔊";
  bgmBtn.setAttribute("aria-label", audio.muted ? "BGMをオンにする" : "BGMをミュートする");
  bgmBtn.disabled = !audio.available;
  bgmBtn.title = audio.available ? "" : "BGMは準備中";
}
bgmBtn.addEventListener("click", () => {
  audio.toggleMute();
  syncBgmBtn();
});
audio.onAvailabilityChange = syncBgmBtn;
syncBgmBtn();
document.body.appendChild(bgmBtn);

route("/", () => import("./views/top"));
route("/themes", () => import("./views/themes"));
route("/draw/:themeId", () => import("./views/draw"));
route("/result/:themeId", () => import("./views/result"));
startRouter(app, ctx);
