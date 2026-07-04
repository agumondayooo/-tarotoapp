import type { Card, Suit } from "./types";
import { majorSymbol } from "./card-svg-major";

const W = 200,
  H = 340;
const GOLD = "#a8892f",
  BLOOD = "#6e0d25",
  BG = "#161022",
  TEXT = "#e8e3da",
  PALE = "#c9c2d6";

const ROMAN = [
  "0",
  "I",
  "II",
  "III",
  "IV",
  "V",
  "VI",
  "VII",
  "VIII",
  "IX",
  "X",
  "XI",
  "XII",
  "XIII",
  "XIV",
  "XV",
  "XVI",
  "XVII",
  "XVIII",
  "XIX",
  "XX",
  "XXI",
];

function frame(inner: string, label: string, numeral: string | null): string {
  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${label}">
  <rect width="${W}" height="${H}" rx="10" fill="${BG}"/>
  <rect x="6" y="6" width="${W - 12}" height="${H - 12}" rx="7" fill="none" stroke="${GOLD}" stroke-width="1.5"/>
  <rect x="12" y="12" width="${W - 24}" height="${H - 24}" rx="5" fill="none" stroke="${GOLD}" stroke-width="0.5" opacity="0.6"/>
  ${[
    [16, 16],
    [W - 16, 16],
    [16, H - 16],
    [W - 16, H - 16],
  ]
    .map(
      ([x, y]) =>
        `<path d="M ${x} ${y - 5} L ${x + 5} ${y} L ${x} ${y + 5} L ${x - 5} ${y} Z" fill="${GOLD}" opacity="0.8"/>`
    )
    .join("")}
  ${numeral ? `<text x="${W / 2}" y="34" text-anchor="middle" fill="${GOLD}" font-size="14" font-family="Cinzel, serif">${numeral}</text>` : ""}
  <g transform="translate(${W / 2}, ${H / 2 - 10})">${inner}</g>
  <text x="${W / 2}" y="${H - 24}" text-anchor="middle" fill="${TEXT}" font-size="13" font-family="'Noto Serif JP', serif">${label}</text>
</svg>`;
}

// ---- 小アルカナ: スート記号 ----

function suitSymbol(suit: Suit, cx: number, cy: number, s = 1): string {
  switch (suit) {
    case "wand":
      return `<g transform="translate(${cx},${cy}) scale(${s})">
        <rect x="-2" y="-6" width="4" height="18" fill="${PALE}"/>
        <path d="M 0 -20 C 5 -15 5 -8 0 -6 C -5 -8 -5 -15 0 -20 Z" fill="${BLOOD}"/>
      </g>`;
    case "cup":
      return `<g transform="translate(${cx},${cy}) scale(${s})">
        <path d="M -9 -14 C -9 -1 9 -1 9 -14 Z" fill="none" stroke="${GOLD}" stroke-width="1.4"/>
        <line x1="0" y1="-1" x2="0" y2="9" stroke="${GOLD}" stroke-width="1.4"/>
        <line x1="-6" y1="11" x2="6" y2="11" stroke="${GOLD}" stroke-width="1.4"/>
      </g>`;
    case "sword":
      return `<g transform="translate(${cx},${cy}) scale(${s})">
        <line x1="0" y1="-18" x2="0" y2="13" stroke="${PALE}" stroke-width="1.6"/>
        <line x1="-7" y1="-3" x2="7" y2="-3" stroke="${GOLD}" stroke-width="1.6"/>
        <circle cx="0" cy="16" r="2.2" fill="${GOLD}"/>
      </g>`;
    case "pentacle":
    default: {
      const pts = [0, 1, 2, 3, 4]
        .map(i => {
          const a = Math.PI / 2 + (i * 4 * Math.PI) / 5;
          return `${9 * Math.cos(a)},${-9 * Math.sin(a)}`;
        })
        .join(" ");
      return `<g transform="translate(${cx},${cy}) scale(${s})">
        <circle r="11" fill="none" stroke="${GOLD}" stroke-width="1.4"/>
        <polygon points="${pts}" fill="none" stroke="${GOLD}" stroke-width="1.2"/>
      </g>`;
    }
  }
}

// ---- 小アルカナ: 数札のグリッド配置 ----

function gridPositions(n: number, xR = 62, yR = 96): Array<[number, number]> {
  const cols = Math.max(1, Math.ceil(Math.sqrt(n)));
  const rows = Math.max(1, Math.ceil(n / cols));
  const pos: Array<[number, number]> = [];
  for (let i = 0; i < n; i++) {
    const r = Math.floor(i / cols);
    const c = i % cols;
    const x = cols === 1 ? 0 : -xR + (2 * xR * c) / (cols - 1);
    const y = rows === 1 ? 0 : -yR + (2 * yR * r) / (rows - 1);
    pos.push([x, y]);
  }
  return pos;
}

// ---- 小アルカナ: コートカードの階級記号(ペイジ/ナイト/クイーン/キング) ----

function rankEmblem(rank: 11 | 12 | 13 | 14, cx: number, cy: number): string {
  switch (rank) {
    case 11: // ペイジ: 小さな葉飾り
      return `<g transform="translate(${cx},${cy})">
        <path d="M -8 4 C -8 -8 8 -8 8 4 C 4 4 -4 4 -8 4 Z" fill="none" stroke="${PALE}" stroke-width="1.3"/>
        <line x1="0" y1="4" x2="0" y2="-6" stroke="${PALE}" stroke-width="1"/>
      </g>`;
    case 12: // ナイト: 兜(三角形+羽飾り)
      return `<g transform="translate(${cx},${cy})">
        <path d="M -10 6 L 0 -12 L 10 6 Z" fill="none" stroke="${PALE}" stroke-width="1.4"/>
        <line x1="0" y1="-12" x2="0" y2="-22" stroke="${PALE}" stroke-width="1.2"/>
        <path d="M 0 -22 C 4 -18 4 -14 0 -12" fill="none" stroke="${GOLD}" stroke-width="1"/>
      </g>`;
    case 13: // クイーン: 柔らかな弧の光輪冠
      return `<g transform="translate(${cx},${cy})">
        <path d="M -12 4 C -12 -10 12 -10 12 4" fill="none" stroke="${GOLD}" stroke-width="1.4"/>
        <circle cx="-10" cy="4" r="2" fill="${GOLD}"/>
        <circle cx="0" cy="-10" r="2.4" fill="${GOLD}"/>
        <circle cx="10" cy="4" r="2" fill="${GOLD}"/>
      </g>`;
    case 14: // キング: 尖った冠+十字
    default:
      return `<g transform="translate(${cx},${cy})">
        <path d="M -12 6 L -12 -4 L -6 2 L 0 -10 L 6 2 L 12 -4 L 12 6 Z" fill="none" stroke="${GOLD}" stroke-width="1.4"/>
        <line x1="0" y1="-10" x2="0" y2="-16" stroke="${GOLD}" stroke-width="1.2"/>
        <line x1="-3" y1="-13" x2="3" y2="-13" stroke="${GOLD}" stroke-width="1.2"/>
      </g>`;
  }
}

function minorSymbol(card: Card): string {
  const suit = card.suit as Suit;
  if (card.number >= 11 && card.number <= 14) {
    return `${rankEmblem(card.number as 11 | 12 | 13 | 14, 0, -34)}${suitSymbol(suit, 0, 24, 1.6)}`;
  }
  const positions = gridPositions(card.number);
  return positions.map(([x, y]) => suitSymbol(suit, x, y, 1)).join("");
}

export function renderCardSvg(card: Card): string {
  const inner = card.arcana === "major" ? majorSymbol(card.number) : minorSymbol(card);
  const numeral = card.arcana === "major" ? ROMAN[card.number] : null;
  return frame(inner, card.name, numeral);
}

export function renderCardBack(): string {
  const inner = `
    ${[0, 45, 90, 135, 180, 225, 270, 315]
      .map(a => {
        const r = (a * Math.PI) / 180;
        return `<line x1="0" y1="0" x2="${34 * Math.sin(r)}" y2="${-34 * Math.cos(r)}" stroke="${GOLD}" stroke-width="1.2"/>`;
      })
      .join("")}
    <circle cx="0" cy="0" r="20" fill="none" stroke="${GOLD}" stroke-width="1.6"/>
    <ellipse cx="0" cy="0" rx="9" ry="5" fill="none" stroke="${TEXT}" stroke-width="1.3"/>
    <circle cx="0" cy="0" r="2.4" fill="${TEXT}"/>
  `;
  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="カード裏面">
  <rect width="${W}" height="${H}" rx="10" fill="${BG}"/>
  <rect x="6" y="6" width="${W - 12}" height="${H - 12}" rx="7" fill="none" stroke="${GOLD}" stroke-width="1.5"/>
  <rect x="12" y="12" width="${W - 24}" height="${H - 24}" rx="5" fill="none" stroke="${GOLD}" stroke-width="0.5" opacity="0.6"/>
  ${[
    [16, 16],
    [W - 16, 16],
    [16, H - 16],
    [W - 16, H - 16],
  ]
    .map(
      ([x, y]) =>
        `<path d="M ${x} ${y - 5} L ${x + 5} ${y} L ${x} ${y + 5} L ${x - 5} ${y} Z" fill="${GOLD}" opacity="0.8"/>`
    )
    .join("")}
  <g transform="translate(${W / 2}, ${H / 2})">${inner}</g>
</svg>`;
}
