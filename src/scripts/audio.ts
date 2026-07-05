const MUTE_KEY = "na:muted";

export interface AudioController {
  available: boolean;
  muted: boolean;
  start(): void;
  toggleMute(): boolean;
  onAvailabilityChange?: (available: boolean) => void;
}

export function initAudio(): AudioController {
  const audio = new Audio(new URL("../assets/audio/bgm.mp3", import.meta.url).href);
  audio.loop = true;
  audio.volume = 0.4;

  // ブラウザの自動再生制限下では、再生はユーザー操作を起点にしか始められない。
  // 「儀式を始める」ボタンの1回のクリックだけに頼ると、それ以外を先に操作した場合や
  // 最初のplay()がブロックされた場合にBGMが永久に鳴らなくなる。そこで、ページ上の
  // 最初のユーザー操作(どこをクリック/タップ/キー入力しても)を起点に再生を試み、
  // 成功するまでリトライする定番パターンを使う。ミュート中・利用不可時は何もしない。
  function tryPlayOnInteraction(): void {
    if (!ctrl.available || ctrl.muted) return; // ミュート解除は toggleMute() が再生を試みる
    audio.play()
      .then(() => {
        document.removeEventListener("pointerdown", tryPlayOnInteraction);
        document.removeEventListener("keydown", tryPlayOnInteraction);
      })
      .catch(() => { /* まだブロックされている。次のユーザー操作で再試行 */ });
  }

  const ctrl: AudioController = {
    available: true,
    muted: localStorage.getItem(MUTE_KEY) === "1",
    start() {
      tryPlayOnInteraction();
    },
    toggleMute() {
      ctrl.muted = !ctrl.muted;
      localStorage.setItem(MUTE_KEY, ctrl.muted ? "1" : "0");
      if (ctrl.muted) audio.pause();
      else ctrl.start();
      return ctrl.muted;
    },
  };

  audio.addEventListener("error", () => {
    ctrl.available = false;
    ctrl.onAvailabilityChange?.(false);
  });

  document.addEventListener("pointerdown", tryPlayOnInteraction);
  document.addEventListener("keydown", tryPlayOnInteraction);

  return ctrl;
}
