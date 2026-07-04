import type { Card, Orientation, Theme } from "./types";

export function buildShareUrl(
  card: Card, orientation: Orientation, theme: Theme, siteUrl: string,
): string {
  const pos = orientation === "upright" ? "正位置" : "逆位置";
  const text = [
    `今夜、「${card.name}」の${pos}が示された。`,
    `#黒の祭壇 が占う今日の${theme.name}。`,
    siteUrl,
  ].join("\n");
  return `https://x.com/intent/post?text=${encodeURIComponent(text)}`;
}
