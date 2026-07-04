import { fnv1a, mulberry32, dateKey } from "./seed";
import type { Card, DrawResult, ThemeId } from "./types";

export function computeDraw(dk: string, themeId: string, cards: Card[]): DrawResult {
  const rng = mulberry32(fnv1a(dk + themeId));
  const card = cards[Math.floor(rng() * cards.length)];
  const orientation = rng() < 0.5 ? "upright" : "reversed";
  return { cardId: card.id, orientation };
}

const PREFIX = "na:draw:";

export function getOrDraw(
  themeId: ThemeId,
  cards: Card[],
  storage: Storage = localStorage,
  now: Date = new Date(),
): { result: DrawResult; alreadyDrawn: boolean } {
  const dk = dateKey(now);
  const key = `${PREFIX}${dk}:${themeId}`;
  const cached = storage.getItem(key);
  if (cached) {
    try {
      return { result: JSON.parse(cached) as DrawResult, alreadyDrawn: true };
    } catch {
      storage.removeItem(key);
    }
  }
  const result = computeDraw(dk, themeId, cards);
  storage.setItem(key, JSON.stringify(result));
  return { result, alreadyDrawn: false };
}

export function cleanupOldDraws(storage: Storage = localStorage, now: Date = new Date()): void {
  const dk = dateKey(now);
  const stale: string[] = [];
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i)!;
    if (key.startsWith(PREFIX) && !key.startsWith(`${PREFIX}${dk}:`)) stale.push(key);
  }
  stale.forEach(k => storage.removeItem(k));
}
