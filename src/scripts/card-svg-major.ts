// 大アルカナ22種の固有シンボル定義。
// card-svg.ts から分離(モチーフ表 + 幾何描画が長くなるため)。
// 各関数は <g transform="translate(cx,cy)"> の内側に置く前提の座標(原点中心)で
// パスやシェイプを返す。

const GOLD = "#a8892f";
const BLOOD = "#6e0d25";
const TEXT = "#e8e3da";
const PALE = "#c9c2d6";

/** 0 愚者=断崖と逆さの星 */
function fool(): string {
  return `
    <path d="M -40 20 L 40 20 L 55 45 L -55 45 Z" fill="none" stroke="${GOLD}" stroke-width="1.5"/>
    <path d="M -40 20 L -40 45" stroke="${GOLD}" stroke-width="1"/>
    <path d="M 0 -35 L 8 -12 L 32 -12 L 13 3 L 20 26 L 0 12 L -20 26 L -13 3 L -32 -12 L -8 -12 Z"
      transform="rotate(180)" fill="none" stroke="${PALE}" stroke-width="1.5"/>
  `;
}

/** 1 魔術師=無限記号と杖 */
function magician(): string {
  return `
    <path d="M -22 -20 C -34 -20 -34 -4 -22 -4 C -10 -4 -10 -20 2 -20 C 14 -20 14 -4 26 -4 C 38 -4 38 -20 26 -20"
      fill="none" stroke="${GOLD}" stroke-width="2" transform="translate(-2,-16)"/>
    <line x1="0" y1="0" x2="0" y2="55" stroke="${PALE}" stroke-width="3"/>
    <circle cx="0" cy="0" r="5" fill="${GOLD}"/>
  `;
}

/** 2 女教皇=月と閉じた書 */
function highPriestess(): string {
  return `
    <path d="M -30 -20 A 22 22 0 1 0 -30 20 A 17 17 0 1 1 -30 -20 Z" fill="${PALE}" opacity="0.85"/>
    <rect x="-15" y="10" width="46" height="34" rx="2" fill="none" stroke="${GOLD}" stroke-width="1.5"/>
    <line x1="8" y1="10" x2="8" y2="44" stroke="${GOLD}" stroke-width="1"/>
  `;
}

/** 3 女帝=麦穂と円環 */
function empress(): string {
  return `
    <circle cx="0" cy="5" r="34" fill="none" stroke="${GOLD}" stroke-width="1.5"/>
    ${[0, 60, 120, 180, 240, 300]
      .map(a => {
        const r = (a * Math.PI) / 180;
        const x = 34 * Math.sin(r), y = -34 * Math.cos(r) + 5;
        return `<path d="M ${x} ${y} l 6 -10 m -6 10 l -6 -10 m 6 10 l 0 -14" stroke="${PALE}" stroke-width="1.2" fill="none"/>`;
      })
      .join("")}
  `;
}

/** 4 皇帝=玉座の四角と牡羊角 */
function emperor(): string {
  return `
    <rect x="-26" y="-8" width="52" height="46" fill="none" stroke="${GOLD}" stroke-width="2"/>
    <path d="M -20 -8 C -34 -22 -30 -34 -14 -30 C -18 -22 -16 -14 -6 -12" fill="none" stroke="${PALE}" stroke-width="2"/>
    <path d="M 20 -8 C 34 -22 30 -34 14 -30 C 18 -22 16 -14 6 -12" fill="none" stroke="${PALE}" stroke-width="2"/>
  `;
}

/** 5 教皇=三重十字と鍵 */
function hierophant(): string {
  return `
    <line x1="0" y1="-38" x2="0" y2="38" stroke="${GOLD}" stroke-width="2.5"/>
    <line x1="-16" y1="-20" x2="16" y2="-20" stroke="${GOLD}" stroke-width="2"/>
    <line x1="-11" y1="-6" x2="11" y2="-6" stroke="${GOLD}" stroke-width="2"/>
    <line x1="-20" y1="8" x2="-20" y2="26" stroke="${PALE}" stroke-width="2"/>
    <circle cx="-20" cy="32" r="6" fill="none" stroke="${PALE}" stroke-width="2"/>
  `;
}

/** 6 恋人=交差する二つの輪 */
function lovers(): string {
  return `
    <circle cx="-14" cy="0" r="24" fill="none" stroke="${GOLD}" stroke-width="1.8"/>
    <circle cx="14" cy="0" r="24" fill="none" stroke="${BLOOD}" stroke-width="1.8"/>
  `;
}

/** 7 戦車=車輪と交差槍 */
function chariot(): string {
  return `
    <circle cx="0" cy="10" r="26" fill="none" stroke="${GOLD}" stroke-width="2"/>
    ${[0, 45, 90, 135].map(a => `<line x1="${-26 * Math.cos((a * Math.PI) / 180)}" y1="${10 - 26 * Math.sin((a * Math.PI) / 180)}" x2="${26 * Math.cos((a * Math.PI) / 180)}" y2="${10 + 26 * Math.sin((a * Math.PI) / 180)}" stroke="${GOLD}" stroke-width="1"/>`).join("")}
    <line x1="-30" y1="-30" x2="30" y2="-6" stroke="${PALE}" stroke-width="2"/>
    <line x1="30" y1="-30" x2="-30" y2="-6" stroke="${PALE}" stroke-width="2"/>
  `;
}

/** 8 力=蛇と無限記号 */
function strength(): string {
  return `
    <path d="M -30 30 C -30 -10 -10 -10 -10 10 C -10 30 10 30 10 10 C 10 -10 30 -10 30 30"
      fill="none" stroke="${PALE}" stroke-width="2"/>
    <path d="M -18 -24 C -28 -24 -28 -10 -18 -10 C -8 -24 8 -24 18 -10 C 28 -10 28 -24 18 -24"
      fill="none" stroke="${GOLD}" stroke-width="1.5"/>
  `;
}

/** 9 隠者=角灯と杖 */
function hermit(): string {
  return `
    <line x1="0" y1="-38" x2="0" y2="38" stroke="${PALE}" stroke-width="2.5"/>
    <path d="M -14 -20 L 14 -20 L 10 4 L -10 4 Z" fill="none" stroke="${GOLD}" stroke-width="1.8"/>
    <path d="M 0 -12 l 0 0" stroke="${GOLD}" stroke-width="1"/>
    ${[0, 45, 90, 135, 180, 225, 270, 315]
      .map(a => {
        const r = (a * Math.PI) / 180;
        return `<line x1="0" y1="-8" x2="${22 * Math.sin(r)}" y2="${-8 - 22 * Math.cos(r) * 0.4}" stroke="${GOLD}" stroke-width="0.7" opacity="0.7"/>`;
      })
      .join("")}
  `;
}

/** 10 運命の輪=八輻の輪 */
function wheelOfFortune(): string {
  return `
    <circle cx="0" cy="5" r="32" fill="none" stroke="${GOLD}" stroke-width="2"/>
    <circle cx="0" cy="5" r="8" fill="none" stroke="${GOLD}" stroke-width="1.2"/>
    ${[0, 45, 90, 135, 180, 225, 270, 315]
      .map(a => {
        const r = (a * Math.PI) / 180;
        return `<line x1="${8 * Math.sin(r)}" y1="${5 - 8 * Math.cos(r)}" x2="${32 * Math.sin(r)}" y2="${5 - 32 * Math.cos(r)}" stroke="${PALE}" stroke-width="1.3"/>`;
      })
      .join("")}
  `;
}

/** 11 正義=天秤と剣 */
function justice(): string {
  return `
    <line x1="0" y1="-38" x2="0" y2="30" stroke="${PALE}" stroke-width="2.5"/>
    <line x1="-30" y1="-18" x2="30" y2="-18" stroke="${GOLD}" stroke-width="1.5"/>
    <line x1="-30" y1="-18" x2="-30" y2="-4" stroke="${GOLD}" stroke-width="1"/>
    <line x1="30" y1="-18" x2="30" y2="-4" stroke="${GOLD}" stroke-width="1"/>
    <path d="M -38 -4 L -22 -4 L -30 8 Z" fill="none" stroke="${GOLD}" stroke-width="1"/>
    <path d="M 38 -4 L 22 -4 L 30 8 Z" fill="none" stroke="${GOLD}" stroke-width="1"/>
  `;
}

/** 12 吊るされた男=逆さの人型(線画)と光輪 */
function hangedMan(): string {
  return `
    <line x1="-24" y1="-30" x2="24" y2="-30" stroke="${GOLD}" stroke-width="2"/>
    <line x1="0" y1="-30" x2="0" y2="-6" stroke="${PALE}" stroke-width="1.5"/>
    <circle cx="0" cy="10" r="14" fill="none" stroke="${PALE}" stroke-width="1.5"/>
    <line x1="-14" y1="24" x2="-4" y2="6" stroke="${PALE}" stroke-width="1.5"/>
    <line x1="14" y1="24" x2="4" y2="6" stroke="${PALE}" stroke-width="1.5"/>
    <line x1="-16" y1="30" x2="0" y2="24" stroke="${PALE}" stroke-width="1.5"/>
    <line x1="16" y1="30" x2="0" y2="24" stroke="${PALE}" stroke-width="1.5"/>
    <circle cx="0" cy="10" r="20" fill="none" stroke="${GOLD}" stroke-width="0.8" opacity="0.6"/>
  `;
}

/** 13 死神=大鎌と砂時計 */
function death(): string {
  return `
    <path d="M -20 30 C -20 -6 20 -14 26 -34" fill="none" stroke="${PALE}" stroke-width="2.5"/>
    <path d="M 26 -34 C 10 -30 6 -14 26 -8 C 40 -4 44 -20 26 -34 Z" fill="none" stroke="${BLOOD}" stroke-width="1.5"/>
    <path d="M -16 6 L 16 6 L -12 34 L 12 34 Z" fill="none" stroke="${GOLD}" stroke-width="1" transform="translate(0,-2) scale(0.5)"/>
  `;
}

/** 14 節制=二つの杯と流れ */
function temperance(): string {
  return `
    <path d="M -30 -10 L -30 -26 L -14 -26 L -14 -10 C -14 0 -30 0 -30 -10 Z" fill="none" stroke="${GOLD}" stroke-width="1.5"/>
    <path d="M 14 10 L 14 26 L 30 26 L 30 10 C 30 0 14 0 14 10 Z" fill="none" stroke="${GOLD}" stroke-width="1.5"/>
    <path d="M -20 -14 C -6 -6 6 6 20 14" fill="none" stroke="${PALE}" stroke-width="1.8"/>
  `;
}

/** 15 悪魔=逆五芒星と鎖 */
function devil(): string {
  const pts = [0, 1, 2, 3, 4].map(i => {
    const a = (Math.PI / 2) + (i * 4 * Math.PI) / 5;
    return `${28 * Math.cos(a)},${-28 * Math.sin(a)}`;
  });
  return `
    <polygon points="${pts.join(" ")}" fill="none" stroke="${BLOOD}" stroke-width="2" transform="rotate(180)"/>
    <path d="M -20 30 a 8 8 0 1 0 16 0 a 8 8 0 1 0 -16 0" fill="none" stroke="${GOLD}" stroke-width="1.2"/>
    <path d="M 4 30 a 8 8 0 1 0 16 0 a 8 8 0 1 0 -16 0" fill="none" stroke="${GOLD}" stroke-width="1.2"/>
  `;
}

/** 16 塔=裂けた塔と稲妻 */
function tower(): string {
  return `
    <path d="M -18 40 L -22 -34 L -6 -34 L -10 6 L 8 -20 L 4 -40 L 20 -40 L 12 -6 L 22 40 Z"
      fill="none" stroke="${PALE}" stroke-width="1.6"/>
    <path d="M -2 -44 L -14 -12 L 0 -12 L -8 20" stroke="${GOLD}" stroke-width="2" fill="none"/>
  `;
}

/** 17 星=八芒星と水流 */
function star(): string {
  return `
    ${[0, 45, 90, 135, 180, 225, 270, 315]
      .map(a => {
        const r = (a * Math.PI) / 180;
        return `<line x1="0" y1="0" x2="${30 * Math.sin(r)}" y2="${-30 * Math.cos(r)}" stroke="${GOLD}" stroke-width="1.2"/>`;
      })
      .join("")}
    <circle cx="0" cy="0" r="6" fill="${GOLD}"/>
    <path d="M -10 32 C -6 40 -14 44 -10 50" stroke="${PALE}" stroke-width="1.3" fill="none"/>
    <path d="M 10 32 C 14 40 6 44 10 50" stroke="${PALE}" stroke-width="1.3" fill="none"/>
  `;
}

/** 18 月=欠け月と滴 */
function moon(): string {
  return `
    <path d="M 14 -30 A 26 26 0 1 0 14 22 A 20 20 0 1 1 14 -30 Z" fill="${PALE}" opacity="0.9"/>
    <path d="M -30 30 l -4 10 m 14 -10 l -4 10 m 14 -10 l -4 10" stroke="${GOLD}" stroke-width="1.3"/>
  `;
}

/** 19 太陽=放射する日輪と眼 */
function sun(): string {
  return `
    ${[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330]
      .map(a => {
        const r = (a * Math.PI) / 180;
        return `<line x1="${20 * Math.sin(r)}" y1="${-20 * Math.cos(r)}" x2="${34 * Math.sin(r)}" y2="${-34 * Math.cos(r)}" stroke="${GOLD}" stroke-width="2"/>`;
      })
      .join("")}
    <circle cx="0" cy="0" r="18" fill="none" stroke="${GOLD}" stroke-width="1.8"/>
    <ellipse cx="0" cy="0" rx="9" ry="5" fill="none" stroke="${TEXT}" stroke-width="1.3"/>
    <circle cx="0" cy="0" r="2.4" fill="${TEXT}"/>
  `;
}

/** 20 審判=喇叭と開く棺 */
function judgement(): string {
  return `
    <path d="M -6 -30 L 14 -20 L -6 -10 Z" fill="none" stroke="${GOLD}" stroke-width="1.5"/>
    <line x1="-6" y1="-20" x2="-6" y2="10" stroke="${GOLD}" stroke-width="1.3"/>
    <path d="M -26 14 L 26 14 L 20 40 L -20 40 Z" fill="none" stroke="${PALE}" stroke-width="1.6"/>
    <line x1="-26" y1="14" x2="-34" y2="4" stroke="${PALE}" stroke-width="1.3"/>
    <line x1="26" y1="14" x2="34" y2="4" stroke="${PALE}" stroke-width="1.3"/>
  `;
}

/** 21 世界=月桂の円環と四隅の眼 */
function world(): string {
  return `
    <ellipse cx="0" cy="0" rx="30" ry="38" fill="none" stroke="${GOLD}" stroke-width="1.8"/>
    <path d="M -30 -20 C -40 -10 -40 10 -30 20" stroke="${PALE}" stroke-width="1.2" fill="none"/>
    <path d="M 30 -20 C 40 -10 40 10 30 20" stroke="${PALE}" stroke-width="1.2" fill="none"/>
    ${[
      [-30, -38],
      [30, -38],
      [-30, 38],
      [30, 38],
    ]
      .map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="4" ry="2.4" fill="none" stroke="${TEXT}" stroke-width="1"/>`)
      .join("")}
  `;
}

const MAJOR_SYMBOLS: Array<() => string> = [
  fool,
  magician,
  highPriestess,
  empress,
  emperor,
  hierophant,
  lovers,
  chariot,
  strength,
  hermit,
  wheelOfFortune,
  justice,
  hangedMan,
  death,
  temperance,
  devil,
  tower,
  star,
  moon,
  sun,
  judgement,
  world,
];

/** number(0-21)に対応する大アルカナ固有シンボルの<g>内容を返す */
export function majorSymbol(number: number): string {
  const fn = MAJOR_SYMBOLS[number];
  return fn ? fn() : "";
}
