# 黒の祭壇 (NOCTURNE ALTAR) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** テーマ選択→日替わり1枚引きタロット占いを行う不気味・ゴシック調の静的Webサービスを構築し、GitHub Pagesへ自動デプロイする。

**Architecture:** Vite + Vanilla TypeScript の単一ページ静的サイト。URL hash で4画面(トップ/テーマ選択/抽選演出/結果)を切替。抽選は「YYYYMMDD+テーマID」をFNV-1aハッシュ→mulberry32 PRNGで決定し、localStorageに当日結果をキャッシュ。カードは共通SVGフレーム+シンボル合成で描画。占い文は大アルカナ220本を個別執筆、小アルカナ560本をキーワード×文型合成で事前生成しJSONとしてコミット。

**Tech Stack:** Vite, TypeScript, Vitest(jsdom環境)いずれも最新安定版(実績: Vite 8 / TS 6 / Vitest 4), GitHub Actions + actions/deploy-pages。フレームワーク・実行時外部依存なし(Google Fontsのみ)。

## Global Constraints

- サービス名は「黒の祭壇」、英表記「NOCTURNE ALTAR」、キャッチコピー「――今夜、あなたの運命が一枚めくられる」(全て全角ダッシュ2つ)
- カラーパレット: 背景 `#0d0713` / 深紅 `#6e0d25` / ゴールド `#a8892f` / テキスト `#e8e3da`(CSSカスタムプロパティ `--c-bg` `--c-blood` `--c-gold` `--c-text` で定義)
- テーマは5種固定: `general`(総合運), `love`(恋愛運), `work`(仕事運), `money`(金運), `relation`(対人運)
- カードは78枚固定(大アルカナ22 + 小アルカナ56)、占い文は 78×5×2=780 件固定
- 占い文の文体: 100〜150字、常体(〜だ/〜だろう)、二人称「あなた」、断定を避け示唆・警句で締める不気味なトーン。「です・ます」禁止
- localStorage キーは接頭辞 `na:` を付ける(`na:draw:<YYYYMMDD>:<themeId>`, `na:muted`)
- 音声の自動再生禁止。ミュートトグルは全画面で常時表示、`aria-label` 必須
- `prefers-reduced-motion: reduce` 時は装飾アニメーションを無効化
- モバイルファースト、ブレークポイントは `min-width: 768px` の1段階のみ
- コミットメッセージ末尾に `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>` を付ける

---

## File Structure

```
/ (repo root)
  index.html                    … エントリHTML(OGP/メタタグ含む)
  vite.config.ts                … base設定・Vitest設定
  package.json / tsconfig.json
  /src
    main.ts                     … 初期化(router起動・BGMボタン設置)
    /data
      cards.json                … 78枚のカード定義
      themes.json               … 5テーマ定義
      fortunes-major.json       … 大アルカナ占い文 220件(個別執筆)
      fortunes-minor.json       … 小アルカナ占い文 560件(tools/で生成した成果物)
    /scripts
      types.ts                  … 共有型定義
      seed.ts                   … FNV-1a + mulberry32 + 日付キー
      draw.ts                   … 抽選 + localStorageキャッシュ
      fortunes.ts               … 占い文ルックアップ(major+minor結合)
      share.ts                  … X intent URL生成
      audio.ts                  … BGM再生/ミュート制御
      router.ts                 … hashルーティング
      card-svg.ts               … カードSVG合成
    /views
      top.ts / themes.ts / draw.ts / result.ts
    /styles
      theme.css                 … パレット・フォント・共通装飾・アニメーション
    /assets/audio/.gitkeep      … bgm.mp3 は後日配置
  /tools
    generate-fortunes.ts        … 小アルカナ占い文合成(開発時のみ、npx tsx で実行)
  /tests
    seed.test.ts / draw.test.ts / data.test.ts / share.test.ts / card-svg.test.ts
  /.github/workflows/deploy.yml
```

**Interfaces(全タスク共通の型)** — `src/scripts/types.ts` で定義:

```ts
export type Arcana = "major" | "minor";
export type Suit = "wand" | "cup" | "sword" | "pentacle";
export type Orientation = "upright" | "reversed";
export type ThemeId = "general" | "love" | "work" | "money" | "relation";

export interface Card {
  id: string;            // "major_00" | "minor_wand_01" など
  name: string;          // 和名 例: "愚者"
  nameEn: string;        // 英名 例: "The Fool"
  arcana: Arcana;
  suit: Suit | null;     // 大アルカナは null
  number: number;        // 大: 0-21, 小: 1-14(11=Page,12=Knight,13=Queen,14=King)
  keywords: { upright: string[]; reversed: string[] };
}

export interface Theme {
  id: ThemeId;
  name: string;          // 例: "恋愛運"
  label: string;         // 問いかけ文 例: "その想いの行方"
  color: string;         // テーマアクセント色 hex
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
```

---

### Task 1: プロジェクト雛形(Vite + TypeScript + Vitest)

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `src/main.ts`, `src/styles/theme.css`, `src/scripts/types.ts`, `src/assets/audio/.gitkeep`, `.gitignore`

**Interfaces:**
- Produces: `npm run dev` / `npm run build` / `npm test` が動く土台。`types.ts`(上記の型)。CSSカスタムプロパティ `--c-bg` `--c-blood` `--c-gold` `--c-text`

- [ ] **Step 1: npm初期化と依存導入**

```bash
npm init -y
npm i -D vite typescript vitest jsdom tsx
```

- [ ] **Step 2: 設定ファイルを書く**

`package.json` の scripts を以下に置換:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "generate:fortunes": "tsx tools/generate-fortunes.ts"
  }
}
```

`vite.config.ts`:

```ts
/// <reference types="vitest/config" />
import { defineConfig } from "vite";

export default defineConfig({
  // GitHub Pages のプロジェクトページ用。リポジトリ名に合わせて変更する
  base: process.env.GHPAGES_BASE ?? "/",
  test: { environment: "jsdom" },
});
```

`tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "noEmit": true,
    "types": ["vite/client"]
  },
  "include": ["src", "tests", "tools"]
}
```

`.gitignore`:

```
node_modules
dist
```

- [ ] **Step 3: index.html を書く**

```html
<!doctype html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>黒の祭壇 | NOCTURNE ALTAR - 不気味なタロット占い</title>
  <meta name="description" content="――今夜、あなたの運命が一枚めくられる。不気味なタロットが日替わりであなたを占う「黒の祭壇」。" />
  <meta property="og:title" content="黒の祭壇 | NOCTURNE ALTAR" />
  <meta property="og:description" content="――今夜、あなたの運命が一枚めくられる。不気味なタロットの一枚引き占い。" />
  <meta property="og:type" content="website" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700&family=Noto+Serif+JP:wght@400;600&display=swap" rel="stylesheet" />
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.ts"></script>
</body>
</html>
```

- [ ] **Step 4: theme.css の骨格を書く**

```css
:root {
  --c-bg: #0d0713;
  --c-blood: #6e0d25;
  --c-gold: #a8892f;
  --c-text: #e8e3da;
  --font-serif: "Noto Serif JP", serif;
  --font-display: "Cinzel", serif;
}
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { height: 100%; }
body {
  background: var(--c-bg);
  color: var(--c-text);
  font-family: var(--font-serif);
  line-height: 1.8;
}
#app { min-height: 100%; display: flex; flex-direction: column; }
```

- [ ] **Step 5: types.ts(File Structure節の型定義そのまま)と、最小の main.ts を書く**

`src/main.ts`:

```ts
import "./styles/theme.css";

const app = document.getElementById("app")!;
app.textContent = "NOCTURNE ALTAR";
```

- [ ] **Step 6: 動作確認**

Run: `npm run build`
Expected: エラーなく `dist/` が生成される

Run: `npm test`
Expected: "No test files found" で終了(まだテストなし。exit code 0 になるよう `vitest run --passWithNoTests` を一時利用してよいが、Task 2 でテストが増えるため放置でも可)

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: Vite+TypeScript+Vitestの雛形を構築"
```

---

### Task 2: シードロジック(seed.ts)

**Files:**
- Create: `src/scripts/seed.ts`
- Test: `tests/seed.test.ts`

**Interfaces:**
- Produces: `fnv1a(str: string): number`(32bit符号なし)、`mulberry32(seed: number): () => number`(0以上1未満)、`dateKey(date?: Date): string`(ローカル日付の "YYYYMMDD")

- [ ] **Step 1: 失敗するテストを書く**

`tests/seed.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { fnv1a, mulberry32, dateKey } from "../src/scripts/seed";

describe("fnv1a", () => {
  it("同一入力で同一ハッシュを返す", () => {
    expect(fnv1a("20260704love")).toBe(fnv1a("20260704love"));
  });
  it("異なる入力で異なるハッシュを返す", () => {
    expect(fnv1a("20260704love")).not.toBe(fnv1a("20260704work"));
  });
  it("32bit符号なし整数を返す", () => {
    const h = fnv1a("test");
    expect(h).toBeGreaterThanOrEqual(0);
    expect(h).toBeLessThanOrEqual(0xffffffff);
    expect(Number.isInteger(h)).toBe(true);
  });
});

describe("mulberry32", () => {
  it("同一シードで同一乱数列を返す", () => {
    const a = mulberry32(123);
    const b = mulberry32(123);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });
  it("0以上1未満を返す", () => {
    const r = mulberry32(42);
    for (let i = 0; i < 1000; i++) {
      const v = r();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
  it("78で割った剰余が全カードに分布する", () => {
    const seen = new Set<number>();
    for (let s = 0; s < 2000; s++) {
      seen.add(Math.floor(mulberry32(s)() * 78));
    }
    expect(seen.size).toBe(78);
  });
});

describe("dateKey", () => {
  it("ローカル日付をYYYYMMDDで返す", () => {
    expect(dateKey(new Date(2026, 6, 4))).toBe("20260704");
  });
  it("1桁の月日をゼロ埋めする", () => {
    expect(dateKey(new Date(2026, 0, 9))).toBe("20260109");
  });
});
```

- [ ] **Step 2: テストが失敗することを確認**

Run: `npx vitest run tests/seed.test.ts`
Expected: FAIL(モジュールが存在しない)

- [ ] **Step 3: 実装**

`src/scripts/seed.ts`:

```ts
export function fnv1a(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function dateKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}
```

- [ ] **Step 4: テストが通ることを確認**

Run: `npx vitest run tests/seed.test.ts`
Expected: PASS(8 tests)

- [ ] **Step 5: Commit**

```bash
git add src/scripts/seed.ts tests/seed.test.ts
git commit -m "feat: 日替わりシード用のFNV-1aハッシュとmulberry32 PRNGを実装"
```

---

### Task 3: カード・テーマデータ(cards.json / themes.json)

**Files:**
- Create: `src/data/cards.json`, `src/data/themes.json`
- Test: `tests/data.test.ts`

**Interfaces:**
- Produces: `cards.json` = `Card[]`(78件)、`themes.json` = `Theme[]`(5件)。カードIDは大アルカナ `major_00`〜`major_21`、小アルカナ `minor_<suit>_<number 2桁>`(例 `minor_wand_01`, `minor_cup_14`)

**データ内容(これに従い78件全てを書き起こす):**

大アルカナ22枚(番号, 和名, 英名, 正キーワード, 逆キーワード):

```
0  愚者     The Fool            自由/無邪気/冒険        無謀/軽率/迷走
1  魔術師   The Magician        創造/意志/技量          欺瞞/未熟/空回り
2  女教皇   The High Priestess  直感/静寂/洞察          秘密/猜疑/無理解
3  女帝     The Empress         豊穣/愛情/受容          過保護/怠惰/浪費
4  皇帝     The Emperor         支配/安定/責任          独裁/頑固/傲慢
5  教皇     The Hierophant      伝統/助言/信頼          束縛/形式主義/孤立
6  恋人     The Lovers          選択/共鳴/結合          誘惑/不和/優柔不断
7  戦車     The Chariot         前進/勝利/克己          暴走/敗北/停滞
8  力       Strength            忍耐/勇気/調和          臆病/短気/消耗
9  隠者     The Hermit          探求/内省/沈黙          孤独/閉鎖/頑迷
10 運命の輪 Wheel of Fortune    転機/好機/循環          暗転/空転/悪縁
11 正義     Justice             均衡/公正/清算          不正/偏り/報い
12 吊るされた男 The Hanged Man  試練/献身/転換          徒労/犠牲/膠着
13 死神     Death               終焉/再生/断絶          未練/停滞/腐敗
14 節制     Temperance          調和/節度/浄化          過剰/不均衡/放縦
15 悪魔     The Devil           誘惑/執着/欲望          解放/覚醒/断ち切り
16 塔       The Tower           崩壊/衝撃/啓示          延命/瓦解/自壊
17 星       The Star            希望/導き/霊感          失望/幻滅/見失い
18 月       The Moon            幻惑/不安/潜在          露見/晴明/覚醒
19 太陽     The Sun             成功/生命力/祝福        陰り/遅延/慢心
20 審判     Judgement           復活/召命/決着          後悔/未決/呪縛
21 世界     The World           完成/到達/統合          未完/停滞/閉塞
```

小アルカナ(4スート×14枚)。和名は「<スート和名>の<数字和名>」(例: 杖のエース、剣の10、杯のペイジ)、英名は「<数字英名> of <スート英名複数形>」(例: Ace of Wands):

- スート: `wand`=杖(Wands, 情熱・行動), `cup`=杯(Cups, 感情・愛), `sword`=剣(Swords, 思考・闘争), `pentacle`=金貨(Pentacles, 物質・実利)
- 数字和名/英名: 1=エース/Ace, 2〜10=数字表記/Two..Ten, 11=ペイジ/Page, 12=ナイト/Knight, 13=クイーン/Queen, 14=キング/King

小アルカナのキーワードは「数字の意味 × スートの領域」で各カード3語(正)/2語(逆)を作る。数字の基調:

```
1  始まり/萌芽      → 逆: 空振り/遅れ
2  均衡/選択        → 逆: 停滞/優柔不断
3  展開/協調        → 逆: 不和/遅延
4  安定/休息        → 逆: 停滞/倦怠
5  喪失/闘争        → 逆: 回復/和解
6  調和/追憶        → 逆: 執着/停滞
7  模索/策略        → 逆: 露見/挫折
8  力量/束縛        → 逆: 解放/浪費
9  成熟/重圧        → 逆: 悪夢/枯渇
10 完成/過剰        → 逆: 崩壊/重荷
11(Page)   兆し/学び → 逆: 未熟/軽率
12(Knight) 突進/使者 → 逆: 暴走/遅延
13(Queen)  包容/感受 → 逆: 依存/冷淡
14(King)   支配/熟達 → 逆: 専横/硬直
```

例: `minor_wand_01` = 杖のエース / Ace of Wands / upright: ["情熱の火種","衝動","好機"], reversed: ["不発","気力の枯渇"]。この要領で数字基調をスートの領域語(杖=情熱・行動、杯=感情・愛、剣=思考・闘争、金貨=物質・実利)で言い換えて56枚分を執筆する。機械的な複製(全スートで同一キーワード)は不可。

`themes.json`(この5件そのまま):

```json
[
  { "id": "general",  "name": "総合運", "label": "今日という日の輪郭",   "color": "#7b6ca8" },
  { "id": "love",     "name": "恋愛運", "label": "その想いの行方",       "color": "#8e1f3f" },
  { "id": "work",     "name": "仕事運", "label": "為すべき業の吉凶",     "color": "#2f5d78" },
  { "id": "money",    "name": "金運",   "label": "富の流れと澱み",       "color": "#a8892f" },
  { "id": "relation", "name": "対人運", "label": "人の縁が結ぶ影",       "color": "#4a7a5a" }
]
```

- [ ] **Step 1: 失敗するテストを書く**

`tests/data.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import cards from "../src/data/cards.json";
import themes from "../src/data/themes.json";
import type { Card, Theme } from "../src/scripts/types";

const cardList = cards as Card[];
const themeList = themes as Theme[];

describe("cards.json", () => {
  it("78枚ある", () => {
    expect(cardList.length).toBe(78);
  });
  it("大アルカナ22枚・小アルカナ56枚", () => {
    expect(cardList.filter(c => c.arcana === "major").length).toBe(22);
    expect(cardList.filter(c => c.arcana === "minor").length).toBe(56);
  });
  it("IDが一意", () => {
    expect(new Set(cardList.map(c => c.id)).size).toBe(78);
  });
  it("ID形式が正しい", () => {
    for (const c of cardList) {
      if (c.arcana === "major") {
        expect(c.id).toMatch(/^major_\d{2}$/);
        expect(c.suit).toBeNull();
      } else {
        expect(c.id).toMatch(/^minor_(wand|cup|sword|pentacle)_\d{2}$/);
        expect(c.suit).not.toBeNull();
      }
    }
  });
  it("各スート14枚ずつ", () => {
    for (const suit of ["wand", "cup", "sword", "pentacle"]) {
      expect(cardList.filter(c => c.suit === suit).length).toBe(14);
    }
  });
  it("全カードにキーワードがある", () => {
    for (const c of cardList) {
      expect(c.keywords.upright.length).toBeGreaterThanOrEqual(2);
      expect(c.keywords.reversed.length).toBeGreaterThanOrEqual(2);
      expect(c.name.length).toBeGreaterThan(0);
      expect(c.nameEn.length).toBeGreaterThan(0);
    }
  });
});

describe("themes.json", () => {
  it("5テーマある", () => {
    expect(themeList.map(t => t.id).sort()).toEqual(
      ["general", "love", "money", "relation", "work"]
    );
  });
  it("全テーマに名前・ラベル・色がある", () => {
    for (const t of themeList) {
      expect(t.name.length).toBeGreaterThan(0);
      expect(t.label.length).toBeGreaterThan(0);
      expect(t.color).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });
});
```

- [ ] **Step 2: テストが失敗することを確認**

Run: `npx vitest run tests/data.test.ts`
Expected: FAIL(JSONが存在しない)

- [ ] **Step 3: cards.json(78件)と themes.json(5件)を上記データ内容に従い執筆**

- [ ] **Step 4: テストが通ることを確認**

Run: `npx vitest run tests/data.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/data/cards.json src/data/themes.json tests/data.test.ts
git commit -m "feat: タロット78枚と5テーマのデータを追加"
```

---

### Task 4: 抽選ロジック(draw.ts)

**Files:**
- Create: `src/scripts/draw.ts`
- Test: `tests/draw.test.ts`

**Interfaces:**
- Consumes: `fnv1a`, `mulberry32`, `dateKey`(Task 2)、`Card`, `DrawResult`, `ThemeId`(types.ts)
- Produces: `computeDraw(dk: string, themeId: string, cards: Card[]): DrawResult`、`getOrDraw(themeId: ThemeId, cards: Card[], storage?: Storage, now?: Date): { result: DrawResult; alreadyDrawn: boolean }`、`cleanupOldDraws(storage?: Storage, now?: Date): void`

- [ ] **Step 1: 失敗するテストを書く**

`tests/draw.test.ts`:

```ts
import { describe, it, expect, beforeEach } from "vitest";
import { computeDraw, getOrDraw, cleanupOldDraws } from "../src/scripts/draw";
import cards from "../src/data/cards.json";
import type { Card } from "../src/scripts/types";

const cardList = cards as Card[];

describe("computeDraw", () => {
  it("同一日・同一テーマなら同一結果", () => {
    const a = computeDraw("20260704", "love", cardList);
    const b = computeDraw("20260704", "love", cardList);
    expect(a).toEqual(b);
  });
  it("テーマが違えば概ね違う結果(78日分で全一致しない)", () => {
    let diff = 0;
    for (let d = 1; d <= 28; d++) {
      const dk = `202607${String(d).padStart(2, "0")}`;
      const a = computeDraw(dk, "love", cardList);
      const b = computeDraw(dk, "work", cardList);
      if (a.cardId !== b.cardId || a.orientation !== b.orientation) diff++;
    }
    expect(diff).toBeGreaterThan(20);
  });
  it("実在するカードIDを返す", () => {
    const ids = new Set(cardList.map(c => c.id));
    const r = computeDraw("20260704", "general", cardList);
    expect(ids.has(r.cardId)).toBe(true);
    expect(["upright", "reversed"]).toContain(r.orientation);
  });
  it("正逆が両方出現する", () => {
    const seen = new Set<string>();
    for (let d = 1; d <= 28; d++) {
      seen.add(computeDraw(`202608${String(d).padStart(2, "0")}`, "money", cardList).orientation);
    }
    expect(seen.size).toBe(2);
  });
});

describe("getOrDraw / cleanupOldDraws", () => {
  beforeEach(() => localStorage.clear());

  it("初回は alreadyDrawn=false、同日2回目は true で同一結果", () => {
    const now = new Date(2026, 6, 4);
    const first = getOrDraw("love", cardList, localStorage, now);
    expect(first.alreadyDrawn).toBe(false);
    const second = getOrDraw("love", cardList, localStorage, now);
    expect(second.alreadyDrawn).toBe(true);
    expect(second.result).toEqual(first.result);
  });
  it("日付が変わると新規抽選になる", () => {
    getOrDraw("love", cardList, localStorage, new Date(2026, 6, 4));
    const next = getOrDraw("love", cardList, localStorage, new Date(2026, 6, 5));
    expect(next.alreadyDrawn).toBe(false);
  });
  it("cleanupOldDraws は当日以外の na:draw: キーを消す", () => {
    localStorage.setItem("na:draw:20260101:love", "{}");
    localStorage.setItem("na:draw:20260704:love", "{}");
    localStorage.setItem("na:muted", "1");
    cleanupOldDraws(localStorage, new Date(2026, 6, 4));
    expect(localStorage.getItem("na:draw:20260101:love")).toBeNull();
    expect(localStorage.getItem("na:draw:20260704:love")).not.toBeNull();
    expect(localStorage.getItem("na:muted")).toBe("1");
  });
});
```

- [ ] **Step 2: テストが失敗することを確認**

Run: `npx vitest run tests/draw.test.ts`
Expected: FAIL(モジュールが存在しない)

- [ ] **Step 3: 実装**

`src/scripts/draw.ts`:

```ts
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
```

- [ ] **Step 4: テストが通ることを確認**

Run: `npx vitest run tests/draw.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/scripts/draw.ts tests/draw.test.ts
git commit -m "feat: 日替わり抽選ロジックとlocalStorageキャッシュを実装"
```

---

### Task 5: 大アルカナ占い文(fortunes-major.json, 220件)

**Files:**
- Create: `src/data/fortunes-major.json`
- Test: `tests/data.test.ts` に describe を追加

**Interfaces:**
- Produces: `fortunes-major.json` = `Fortune[]`(cardId `major_00`〜`major_21` × 5テーマ = 110エントリ、各エントリに upright/reversed の2文 = 220本)

**執筆ガイド(Global Constraintsの文体規則に加えて):**
- カードのキーワード(cards.json)とテーマの領域を掛け合わせる。例: 塔×金運・正位置 =「積み上げたものが音を立てて崩れる日。だが崩壊は清算でもある。失って初めて、何に金を吸われていたかが見えるだろう。財布の紐は、今日は固く。」
- 各文は独立して読める(前後の文脈に依存しない)
- 同一カード内でテーマ間の文面コピーは禁止(観点を変える)
- 禁止語: 「絶対」「必ず」「100%」。締めは暗示・警句・問いかけのいずれか

- [ ] **Step 1: 失敗するテストを追加**

`tests/data.test.ts` に追記:

```ts
import fortunesMajor from "../src/data/fortunes-major.json";
import type { Fortune } from "../src/scripts/types";

const majorFortunes = fortunesMajor as Fortune[];
const THEMES = ["general", "love", "work", "money", "relation"] as const;

describe("fortunes-major.json", () => {
  it("大アルカナ22枚×5テーマ=110エントリある", () => {
    expect(majorFortunes.length).toBe(110);
  });
  it("全組み合わせを網羅し重複がない", () => {
    const keys = new Set(majorFortunes.map(f => `${f.cardId}:${f.theme}`));
    expect(keys.size).toBe(110);
    for (let n = 0; n < 22; n++) {
      for (const t of THEMES) {
        expect(keys.has(`major_${String(n).padStart(2, "0")}:${t}`)).toBe(true);
      }
    }
  });
  it("本文は60〜180字で、です・ます調を含まない", () => {
    for (const f of majorFortunes) {
      for (const text of [f.upright, f.reversed]) {
        expect(text.length).toBeGreaterThanOrEqual(60);
        expect(text.length).toBeLessThanOrEqual(180);
        expect(text).not.toMatch(/です|ます/);
      }
    }
  });
});
```

- [ ] **Step 2: テストが失敗することを確認**

Run: `npx vitest run tests/data.test.ts`
Expected: FAIL(fortunes-major.json が存在しない)

- [ ] **Step 3: 220本を執筆する**

執筆ガイドに従い、cards.json の各大アルカナのキーワードを参照しながら110エントリ(×正逆)を書き起こす。分量が多いため `major_00`〜`major_10` と `major_11`〜`major_21` の2回に分けて書いてよい(中間コミット可)。

- [ ] **Step 4: テストが通ることを確認**

Run: `npx vitest run tests/data.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/data/fortunes-major.json tests/data.test.ts
git commit -m "feat: 大アルカナ22枚×5テーマの占い文220本を執筆"
```

---

### Task 6: 小アルカナ占い文の生成(tools/generate-fortunes.ts → fortunes-minor.json)

**Files:**
- Create: `tools/generate-fortunes.ts`, `src/data/fortunes-minor.json`(生成成果物)
- Test: `tests/data.test.ts` に describe を追加

**Interfaces:**
- Consumes: `src/data/cards.json`
- Produces: `fortunes-minor.json` = `Fortune[]`(小アルカナ56枚×5テーマ=280エントリ、560本)。生成コマンド `npm run generate:fortunes`

**生成方式:** テーマごとに「導入(キーワード差し込み)→展開→警句」の文型を4種以上用意し、`(カードnumber + スートindex) % 文型数` で割り当てて重複感を抑える。キーワードは cards.json の keywords から差し込む。スートごとの領域語(杖=衝動と行動 / 杯=心と情 / 剣=言葉と刃 / 金貨=実りと代価)も差し込みスロットにする。

- [ ] **Step 1: 失敗するテストを追加**

`tests/data.test.ts` に追記:

```ts
import fortunesMinor from "../src/data/fortunes-minor.json";

const minorFortunes = fortunesMinor as Fortune[];

describe("fortunes-minor.json", () => {
  it("小アルカナ56枚×5テーマ=280エントリある", () => {
    expect(minorFortunes.length).toBe(280);
  });
  it("全組み合わせを網羅し重複がない", () => {
    const keys = new Set(minorFortunes.map(f => `${f.cardId}:${f.theme}`));
    expect(keys.size).toBe(280);
    const minorIds = (cards as Card[]).filter(c => c.arcana === "minor").map(c => c.id);
    for (const id of minorIds) {
      for (const t of THEMES) expect(keys.has(`${id}:${t}`)).toBe(true);
    }
  });
  it("本文は60〜180字で、です・ます調を含まない", () => {
    for (const f of minorFortunes) {
      for (const text of [f.upright, f.reversed]) {
        expect(text.length).toBeGreaterThanOrEqual(60);
        expect(text.length).toBeLessThanOrEqual(180);
        expect(text).not.toMatch(/です|ます/);
      }
    }
  });
  it("同一テーマ内で全文一致の重複がない", () => {
    for (const t of THEMES) {
      const texts = minorFortunes.filter(f => f.theme === t).flatMap(f => [f.upright, f.reversed]);
      expect(new Set(texts).size).toBe(texts.length);
    }
  });
});
```

- [ ] **Step 2: テストが失敗することを確認**

Run: `npx vitest run tests/data.test.ts`
Expected: FAIL(fortunes-minor.json が存在しない)

- [ ] **Step 3: 生成スクリプトを実装**

`tools/generate-fortunes.ts` の骨格(文型は各テーマ4種以上、以下は構造を示す。実装時は全テーマ分の文型を不気味トーンで書き切ること):

```ts
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import type { Card, Fortune, ThemeId } from "../src/scripts/types";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const cards = JSON.parse(readFileSync(join(root, "src/data/cards.json"), "utf-8")) as Card[];

const SUIT_WORD: Record<string, string> = {
  wand: "衝動と行動", cup: "心と情", sword: "言葉と刃", pentacle: "実りと代価",
};
const SUIT_INDEX: Record<string, number> = { wand: 0, cup: 1, sword: 2, pentacle: 3 };

// kw1/kw2: keywords配列の先頭2語, suitWord: スート領域語
type Tpl = (kw1: string, kw2: string, suitWord: string) => string;

// テーマ×正逆ごとに文型を4種以上定義する(以下は general/upright の例。
// love/work/money/relation と reversed も同じ構造で全て書き切る)
const TEMPLATES: Record<ThemeId, { upright: Tpl[]; reversed: Tpl[] }> = {
  general: {
    upright: [
      (a, b, s) => `${s}が今日のあなたの輪郭を縁取る。「${a}」の気配が朝から静かに満ちるだろう。${b}を恐れる必要はないが、招き入れるかどうかは、あなたの手に委ねられている。`,
      // …あと3種以上
    ],
    reversed: [
      (a, b, s) => `${s}が今日は裏返る。「${a}」の影が足元に伸び、気づかぬうちに${b}へと導かれるかもしれない。灯りを一つ、心の内に灯しておくことだ。`,
      // …あと3種以上
    ],
  },
  // love / work / money / relation も同様に定義
} as never;

const fortunes: Fortune[] = [];
for (const card of cards.filter(c => c.arcana === "minor")) {
  for (const theme of Object.keys(TEMPLATES) as ThemeId[]) {
    const pick = (arr: Tpl[]) => arr[(card.number + SUIT_INDEX[card.suit!]) % arr.length];
    fortunes.push({
      cardId: card.id,
      theme,
      upright: pick(TEMPLATES[theme].upright)(
        card.keywords.upright[0], card.keywords.upright[1], SUIT_WORD[card.suit!]),
      reversed: pick(TEMPLATES[theme].reversed)(
        card.keywords.reversed[0], card.keywords.reversed[1], SUIT_WORD[card.suit!]),
    });
  }
}

writeFileSync(join(root, "src/data/fortunes-minor.json"), JSON.stringify(fortunes, null, 2) + "\n");
console.log(`generated ${fortunes.length} entries`);
```

注意: キーワード差し込みだけでは「同一テーマ内全文一致なし」テストを満たせない場合(同スート内でキーワードが被る等)、文型スロットに `card.name` を含めることで一意性を担保する。文の長さが60字を下回る文型は書かないこと。

- [ ] **Step 4: 生成を実行**

Run: `npm run generate:fortunes`
Expected: `generated 280 entries`

- [ ] **Step 5: テストが通ることを確認**

Run: `npx vitest run tests/data.test.ts`
Expected: PASS

- [ ] **Step 6: 生成文を3件抜き読みして日本語として破綻していないか確認し、必要なら文型を修正して再生成**

- [ ] **Step 7: Commit**

```bash
git add tools/generate-fortunes.ts src/data/fortunes-minor.json tests/data.test.ts
git commit -m "feat: 小アルカナ占い文560本を文型合成で生成"
```

---

### Task 7: 占い文ルックアップ(fortunes.ts)と全780件の整合性テスト

**Files:**
- Create: `src/scripts/fortunes.ts`
- Test: `tests/data.test.ts` に describe を追加

**Interfaces:**
- Consumes: `fortunes-major.json`, `fortunes-minor.json`
- Produces: `getFortune(cardId: string, theme: ThemeId): Fortune`(見つからなければ throw)、`allFortunes(): Fortune[]`

- [ ] **Step 1: 失敗するテストを追加**

`tests/data.test.ts` に追記:

```ts
import { getFortune, allFortunes } from "../src/scripts/fortunes";

describe("fortunes.ts", () => {
  it("全390エントリ(780本)が揃っている", () => {
    expect(allFortunes().length).toBe(390);
  });
  it("全カード×全テーマで取得できる", () => {
    for (const c of cards as Card[]) {
      for (const t of THEMES) {
        const f = getFortune(c.id, t);
        expect(f.upright.length).toBeGreaterThan(0);
        expect(f.reversed.length).toBeGreaterThan(0);
      }
    }
  });
  it("存在しない組み合わせは throw する", () => {
    expect(() => getFortune("major_99", "love")).toThrow();
  });
});
```

- [ ] **Step 2: テストが失敗することを確認**

Run: `npx vitest run tests/data.test.ts`
Expected: FAIL

- [ ] **Step 3: 実装**

`src/scripts/fortunes.ts`:

```ts
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
```

- [ ] **Step 4: テストが通ることを確認**

Run: `npm test`
Expected: 全テストPASS

- [ ] **Step 5: Commit**

```bash
git add src/scripts/fortunes.ts tests/data.test.ts
git commit -m "feat: 占い文ルックアップと780本の整合性テストを追加"
```

---

### Task 8: カードSVG合成(card-svg.ts)

**Files:**
- Create: `src/scripts/card-svg.ts`
- Test: `tests/card-svg.test.ts`

**Interfaces:**
- Consumes: `Card`(types.ts)
- Produces: `renderCardSvg(card: Card): string`(`<svg viewBox="0 0 200 340" role="img" aria-label="<和名>">` で始まる完全なSVG文字列)、`renderCardBack(): string`(裏面SVG)

**意匠仕様:**
- 共通フレーム: 外周に `--c-gold` 系(#a8892f)の二重細線、四隅に小さな菱形紋、下部にカード名(和名)と番号のローマ数字(大アルカナのみ)を `<text>` で配置。背景は #0d0713 より一段明るい #161022
- 大アルカナ22種: カードごとに固有の中央シンボルを `<g>` で描く。幾何・記号表現(円・三角・線・星・月・眼など)。最低限、以下のモチーフ対応で22種を作る:

```
0 愚者=断崖と逆さの星 / 1 魔術師=無限記号と杖 / 2 女教皇=月と閉じた書
3 女帝=麦穂と円環 / 4 皇帝=玉座の四角と牡羊角 / 5 教皇=三重十字と鍵
6 恋人=交差する二つの輪 / 7 戦車=車輪と交差槍 / 8 力=蛇と無限記号
9 隠者=角灯と杖 / 10 運命の輪=八輻の輪 / 11 正義=天秤と剣
12 吊るされた男=逆さの人型(線画)と光輪 / 13 死神=大鎌と砂時計 / 14 節制=二つの杯と流れ
15 悪魔=逆五芒星と鎖 / 16 塔=裂けた塔と稲妻 / 17 星=八芒星と水流
18 月=欠け月と滴 / 19 太陽=放射する日輪と眼 / 20 審判=喇叭と開く棺
21 世界=月桂の円環と四隅の眼
```

- 小アルカナ56種: スート記号(杖=縦棒に炎/杯=聖杯/剣=直剣/金貨=五芒星入り円)を数字分(1〜10は個数配置、11〜14はスート記号1つ+冠・兜・光輪等の階級記号)グリッド配置で自動レイアウト
- 実装はカードIDから分岐する純関数群。1ファイルが600行を超えそうなら `card-svg-major.ts`(大アルカナシンボル定義)を分割してよい

- [ ] **Step 1: 失敗するテストを書く**

`tests/card-svg.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { renderCardSvg, renderCardBack } from "../src/scripts/card-svg";
import cards from "../src/data/cards.json";
import type { Card } from "../src/scripts/types";

describe("renderCardSvg", () => {
  it("全78枚で有効なSVG文字列を返す", () => {
    for (const c of cards as Card[]) {
      const svg = renderCardSvg(c);
      expect(svg).toContain("<svg");
      expect(svg).toContain('role="img"');
      expect(svg).toContain(`aria-label="${c.name}"`);
      expect(svg).toContain("</svg>");
    }
  });
  it("大アルカナはカードごとに異なるシンボルを持つ", () => {
    const majors = (cards as Card[]).filter(c => c.arcana === "major");
    const bodies = new Set(majors.map(c => renderCardSvg(c)));
    expect(bodies.size).toBe(22);
  });
  it("jsdomでparseしてもエラーにならない", () => {
    const div = document.createElement("div");
    for (const c of (cards as Card[]).slice(0, 10)) {
      div.innerHTML = renderCardSvg(c);
      expect(div.querySelector("svg")).not.toBeNull();
    }
  });
});

describe("renderCardBack", () => {
  it("裏面SVGを返す", () => {
    expect(renderCardBack()).toContain("<svg");
  });
});
```

- [ ] **Step 2: テストが失敗することを確認**

Run: `npx vitest run tests/card-svg.test.ts`
Expected: FAIL

- [ ] **Step 3: 実装**

意匠仕様に従い実装する。骨格:

```ts
import type { Card } from "./types";

const W = 200, H = 340;
const GOLD = "#a8892f", BLOOD = "#6e0d25", BG = "#161022", TEXT = "#e8e3da";

const ROMAN = ["0","I","II","III","IV","V","VI","VII","VIII","IX","X","XI",
  "XII","XIII","XIV","XV","XVI","XVII","XVIII","XIX","XX","XXI"];

function frame(inner: string, label: string, numeral: string | null): string {
  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${label}">
  <rect width="${W}" height="${H}" rx="10" fill="${BG}"/>
  <rect x="6" y="6" width="${W - 12}" height="${H - 12}" rx="7" fill="none" stroke="${GOLD}" stroke-width="1.5"/>
  <rect x="12" y="12" width="${W - 24}" height="${H - 24}" rx="5" fill="none" stroke="${GOLD}" stroke-width="0.5" opacity="0.6"/>
  ${[[16,16],[W-16,16],[16,H-16],[W-16,H-16]].map(([x,y]) =>
    `<path d="M ${x} ${y-5} L ${x+5} ${y} L ${x} ${y+5} L ${x-5} ${y} Z" fill="${GOLD}" opacity="0.8"/>`).join("")}
  ${numeral ? `<text x="${W / 2}" y="34" text-anchor="middle" fill="${GOLD}" font-size="14" font-family="Cinzel, serif">${numeral}</text>` : ""}
  <g transform="translate(${W / 2}, ${H / 2 - 10})">${inner}</g>
  <text x="${W / 2}" y="${H - 24}" text-anchor="middle" fill="${TEXT}" font-size="13" font-family="'Noto Serif JP', serif">${label}</text>
</svg>`;
}

// majorSymbol(number): 22種の固有シンボル<g>内容を返す(意匠仕様のモチーフ対応表に従う)
// minorSymbol(card): スート記号×数字グリッド or コート記号を返す
export function renderCardSvg(card: Card): string { /* frame + 分岐 */ }
export function renderCardBack(): string { /* 裏面: 中央に八芒星と眼、放射線 */ }
```

- [ ] **Step 4: テストが通ることを確認**

Run: `npx vitest run tests/card-svg.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/scripts/card-svg.ts tests/card-svg.test.ts
git commit -m "feat: 共通フレーム+シンボル合成のカードSVG描画を実装"
```

---

### Task 9: シェアURL生成(share.ts)

**Files:**
- Create: `src/scripts/share.ts`
- Test: `tests/share.test.ts`

**Interfaces:**
- Consumes: `Card`, `Orientation`, `Theme`(types.ts)
- Produces: `buildShareUrl(card: Card, orientation: Orientation, theme: Theme, siteUrl: string): string`

- [ ] **Step 1: 失敗するテストを書く**

`tests/share.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { buildShareUrl } from "../src/scripts/share";
import cards from "../src/data/cards.json";
import themes from "../src/data/themes.json";
import type { Card, Theme } from "../src/scripts/types";

const fool = (cards as Card[]).find(c => c.id === "major_00")!;
const love = (themes as Theme[]).find(t => t.id === "love")!;

describe("buildShareUrl", () => {
  it("x.com の intent URL を返す", () => {
    const url = buildShareUrl(fool, "upright", love, "https://example.com/");
    expect(url.startsWith("https://x.com/intent/post?text=")).toBe(true);
  });
  it("カード名・正逆・サイトURLがエンコードされて含まれる", () => {
    const url = buildShareUrl(fool, "reversed", love, "https://example.com/");
    const text = decodeURIComponent(url.split("text=")[1]);
    expect(text).toContain("愚者");
    expect(text).toContain("逆位置");
    expect(text).toContain("恋愛運");
    expect(text).toContain("https://example.com/");
    expect(text).toContain("黒の祭壇");
  });
});
```

- [ ] **Step 2: テストが失敗することを確認**

Run: `npx vitest run tests/share.test.ts`
Expected: FAIL

- [ ] **Step 3: 実装**

`src/scripts/share.ts`:

```ts
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
```

- [ ] **Step 4: テストが通ることを確認**

Run: `npx vitest run tests/share.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/scripts/share.ts tests/share.test.ts
git commit -m "feat: Xシェア用intent URL生成を実装"
```

---

### Task 10: BGM制御(audio.ts)

**Files:**
- Create: `src/scripts/audio.ts`
- Test: なし(HTMLAudioElement依存のためユニットテスト対象外。Task 12で手動確認)

**Interfaces:**
- Produces: `initAudio(): AudioController`。`AudioController` = `{ available: boolean; muted: boolean; start(): void; toggleMute(): boolean }`。音源URLは `new URL("../assets/audio/bgm.mp3", import.meta.url)` で解決し、fetch HEADではなく `audio.onerror` で不在検知して `available=false` にする

- [ ] **Step 1: 実装**

`src/scripts/audio.ts`:

```ts
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
```

- [ ] **Step 2: 型チェック**

Run: `npx tsc --noEmit`
Expected: エラーなし

- [ ] **Step 3: Commit**

```bash
git add src/scripts/audio.ts
git commit -m "feat: BGM再生・ミュート制御(音源未配置フォールバック付き)を実装"
```

---

### Task 11: ルーター+4画面(views)+main.ts 結線

**Files:**
- Create: `src/scripts/router.ts`, `src/views/top.ts`, `src/views/themes.ts`, `src/views/draw.ts`, `src/views/result.ts`
- Modify: `src/main.ts`

**Interfaces:**
- Consumes: これまでの全モジュール
- Produces: hashルート `#/`(トップ), `#/themes`(テーマ選択), `#/draw/<themeId>`(抽選演出), `#/result/<themeId>`(結果)。各viewは `render(container: HTMLElement, params: Record<string,string>, ctx: AppContext): void` を実装。`AppContext = { audio: AudioController; navigate(path: string): void }`

- [ ] **Step 1: router.ts を実装**

```ts
import type { AudioController } from "./audio";

export interface AppContext {
  audio: AudioController;
  navigate(path: string): void;
}

export type View = (container: HTMLElement, params: Record<string, string>, ctx: AppContext) => void;

const routes: Array<{ pattern: RegExp; view: () => Promise<{ render: View }>; paramNames: string[] }> = [];

export function route(pattern: string, view: () => Promise<{ render: View }>): void {
  const paramNames: string[] = [];
  const regex = new RegExp("^" + pattern.replace(/:(\w+)/g, (_, name) => {
    paramNames.push(name);
    return "([\\w-]+)";
  }) + "$");
  routes.push({ pattern: regex, view, paramNames });
}

export function startRouter(container: HTMLElement, ctx: AppContext): void {
  async function resolve(): Promise<void> {
    const hash = location.hash.replace(/^#/, "") || "/";
    for (const r of routes) {
      const m = hash.match(r.pattern);
      if (m) {
        const params: Record<string, string> = {};
        r.paramNames.forEach((n, i) => (params[n] = m[i + 1]));
        (await r.view()).render(container, params, ctx);
        window.scrollTo(0, 0);
        return;
      }
    }
    location.hash = "#/";
  }
  window.addEventListener("hashchange", resolve);
  resolve();
}
```

- [ ] **Step 2: 4つのviewを実装**

各viewの要点(HTML構造はこのタスクで確定し、装飾はTask 12で仕上げる):

`src/views/top.ts` — 魔法陣風SVG背景(ゆっくり回転する二重円+ルーン風記号)、`<h1>黒の祭壇</h1>`、`NOCTURNE ALTAR` サブタイトル、キャッチコピー、`儀式を始める` ボタン。ボタンclickで `ctx.audio.start()` を呼んでから `ctx.navigate("/themes")`。

`src/views/themes.ts` — `themes.json` から5枚の護符風カードを描画。各カードは `style="--theme-color: <color>"` でアクセント差分、`<button>` として実装しclickで `ctx.navigate("/draw/" + id)`。見出し「何を問う」。

`src/views/draw.ts` — `getOrDraw()` を呼ぶ。`alreadyDrawn === true` なら「本日の託宣はすでに下されている」を1.2秒表示してから `/result/<themeId>` へ。初回なら裏面カード(`renderCardBack()`)3枚のシャッフルアニメーション(CSS keyframes、約2秒)→中央の1枚が3Dフリップ(`transform: rotateY`)→フリップ完了後 `/result/<themeId>` へ遷移。`prefers-reduced-motion` 時は演出スキップで即遷移。

`src/views/result.ts` — `getOrDraw()`(キャッシュ済みのはず)→ `renderCardSvg()`(逆位置は `.reversed` クラスで180度回転)、カード名(和英)、正位置/逆位置ラベル、テーマ名、`getFortune()` の該当文、Xシェアリンク(`buildShareUrl(card, orientation, theme, location.origin + location.pathname)` を `<a target="_blank" rel="noopener">`)、`別の問いを立てる` ボタン(→ `/themes`)。存在しないthemeIdなら `/themes` へリダイレクト。

- [ ] **Step 3: main.ts を結線**

```ts
import "./styles/theme.css";
import { initAudio } from "./scripts/audio";
import { startRouter, route, type AppContext } from "./scripts/router";
import { cleanupOldDraws } from "./scripts/draw";

cleanupOldDraws();

const app = document.getElementById("app")!;
const audio = initAudio();

const ctx: AppContext = {
  audio,
  navigate(path: string) { location.hash = "#" + path; },
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
bgmBtn.addEventListener("click", () => { audio.toggleMute(); syncBgmBtn(); });
audio.onAvailabilityChange = syncBgmBtn;
syncBgmBtn();
document.body.appendChild(bgmBtn);

route("/", () => import("./views/top") as never);
route("/themes", () => import("./views/themes") as never);
route("/draw/:themeId", () => import("./views/draw") as never);
route("/result/:themeId", () => import("./views/result") as never);
startRouter(app, ctx);
```

(importパスは実ファイル配置に合わせて調整。`as never` は各viewが `{ render: View }` を named export していれば不要)

- [ ] **Step 4: 手動確認**

Run: `npm run dev` でブラウザ確認:
- トップ→テーマ選択→シャッフル演出→結果、まで一巡できる
- 同じテーマを再度選ぶと「本日の託宣はすでに下されている」経由で同一結果
- 別テーマは別カードが出うる
- ブラウザバックで前画面に戻れる
- シェアリンクがXのpost画面を開く(文言確認)

- [ ] **Step 5: 型チェックと全テスト**

Run: `npm run build && npm test`
Expected: ビルド成功・全テストPASS

- [ ] **Step 6: Commit**

```bash
git add src/
git commit -m "feat: hashルーターと4画面(トップ/テーマ/抽選/結果)を実装"
```

---

### Task 12: 世界観スタイリング(theme.css 仕上げ)+アクセシビリティ

**Files:**
- Modify: `src/styles/theme.css`, 各view(クラス付与の調整)

**Interfaces:**
- Consumes: Task 11のHTML構造

**要件:**
- モバイルファースト。カードSVGは `max-width: min(70vw, 280px)`
- トップ: 魔法陣の微回転(60s/linear/infinite)、タイトルに `text-shadow` のにじみ、ロウソクの揺らぎ(画面下部に`radial-gradient`の光だまり2つを`opacity`アニメで揺らす)
- 結果表示: フェードイン(0.8s)+一瞬のグリッチ(`clip-path`を数フレームずらすkeyframes、1回のみ)
- カードフリップ: `.card-flip { transform-style: preserve-3d; transition: transform 1s; }`
- ボタン: 深紅ボーダー+hoverでゴールド発光(`box-shadow: 0 0 12px`)
- `@media (prefers-reduced-motion: reduce)` で全アニメーション `animation: none; transition: none`
- BGMトグル: `position: fixed; top: 12px; right: 12px;` 44px角以上(タップターゲット)
- フォーカスリング(`:focus-visible { outline: 2px solid var(--c-gold) }`)を消さない

- [ ] **Step 1: theme.css を上記要件で仕上げる**
- [ ] **Step 2: 手動確認(モバイル幅375px / PC幅1280pxの両方でレイアウト崩れなし、reduced-motion有効時に演出が止まること)**
- [ ] **Step 3: `npm run build && npm test` がPASSすることを確認**
- [ ] **Step 4: Commit**

```bash
git add src/
git commit -m "style: ゴシック調の世界観スタイリングとアクセシビリティ対応"
```

---

### Task 13: GitHub Pages デプロイ(GitHub Actions)+README

**Files:**
- Create: `.github/workflows/deploy.yml`, `README.md`

**Interfaces:**
- Consumes: `npm run build`(Task 1)、`GHPAGES_BASE` 環境変数(vite.config.ts)

- [ ] **Step 1: workflow を書く**

`.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main, master]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm test
      - run: npm run build
        env:
          GHPAGES_BASE: /${{ github.event.repository.name }}/
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: README.md を書く**

内容: サービス概要、開発コマンド(dev/build/test/generate:fortunes)、BGM差し替え手順(「`src/assets/audio/bgm.mp3` に商用利用可のループ音源を置く。DOVA-SYNDROME等で選曲しライセンス表記条件を確認すること」)、デプロイ手順(GitHubリポジトリ作成→Settings > Pages > Source を "GitHub Actions" に設定→push)。

- [ ] **Step 3: 手動確認**

Run: `GHPAGES_BASE=/tarotoapp/ npm run build && npm run preview`(PowerShellでは `$env:GHPAGES_BASE="/tarotoapp/"; npm run build`)
Expected: サブパス配信でもアセットが404にならない

- [ ] **Step 4: Commit**

```bash
git add .github README.md
git commit -m "ci: GitHub Pagesへの自動デプロイとREADMEを追加"
```

---

### Task 14: 最終検証

- [ ] **Step 1: 全テスト+ビルド**

Run: `npm test && npm run build`
Expected: 全PASS・ビルド成功

- [ ] **Step 2: superpowers:verification-before-completion スキルに従い、devサーバーで全フロー(5テーマ全て)を一巡し、spec(docs/superpowers/specs/2026-07-04-nocturne-altar-design.md)の§8画面フローと§9非機能要件を1項目ずつ照合**

- [ ] **Step 3: localStorageを消して日付跨ぎ挙動を確認(dateKeyのモックまたはOS日付に依存しないテストで代替可)**

- [ ] **Step 4: 残作業(BGM音源選定・GitHubリポジトリ作成・Pages有効化・OGP画像)をREADMEの「今後の作業」節に記録して Commit**

```bash
git add -A
git commit -m "docs: 最終検証と残作業の記録"
```
