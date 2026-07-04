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

  const ctrl: AudioController = {
    available: true,
    muted: localStorage.getItem(MUTE_KEY) === "1",
    start() {
      if (!ctrl.available || ctrl.muted) return;
      audio.play().catch(() => { /* 自動再生ブロックは無視。次のユーザー操作で再試行 */ });
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

  return ctrl;
}
