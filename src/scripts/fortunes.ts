import major from "../data/fortunes-major.json";
import minor from "../data/fortunes-minor.json";
import type { Fortune, ThemeId } from "./types";

const all = [...(major as Fortune[]), ...(minor as Fortune[])];
const index = new Map(all.map(f => [`${f.cardId}:${f.theme}`, f]));

export function allFortunes(): Fortune[] {
  return all;
}

export function getFortune(cardId: string, theme: ThemeId): Fortune {
  const f = index.get(`${cardId}:${theme}`);
  if (!f) throw new Error(`fortune not found: ${cardId}:${theme}`);
  return f;
}
