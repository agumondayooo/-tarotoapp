export type Arcana = "major" | "minor";
export type Suit = "wand" | "cup" | "sword" | "pentacle";
export type Orientation = "upright" | "reversed";
export type ThemeId = "general" | "love" | "work" | "money" | "relation";

export interface Card {
  id: string;
  name: string;
  nameEn: string;
  arcana: Arcana;
  suit: Suit | null;
  number: number;
  keywords: { upright: string[]; reversed: string[] };
}

export interface Theme {
  id: ThemeId;
  name: string;
  label: string;
  color: string;
}

export interface Fortune {
  cardId: string;
  theme: ThemeId;
  upright: string;
  reversed: string;
}

export interface DrawResult {
  cardId: string;
  orientation: Orientation;
}
