# 黒の祭壇 (NOCTURNE ALTAR) — 設計書

作成日: 2026-07-04
基底要件: `tarot_service_requirements.md`(本設計書は要件定義書を前提とし、未確定事項の確定と実装設計を定める)

---

## 1. 確定事項

| 項目 | 決定内容 |
|---|---|
| サービス名 | 黒の祭壇(英表記: NOCTURNE ALTAR) |
| キャッチコピー | ――今夜、あなたの運命が一枚めくられる |
| テーマ | 総合運・恋愛運・仕事運・金運・対人運の5テーマ |
| BGM | 再生・ミュート基盤のみ実装。音源は後日 `src/assets/audio/bgm.mp3` に配置して差し替え(未配置時はBGMボタンを非活性表示) |
| 公開 | GitHub Pages 既定ドメイン(`<user>.github.io/<repo>/`)。GitHub Actions で main への push 時に自動ビルド&デプロイ |
| 占い文生成 | ハイブリッド方式(§5) |

## 2. 技術スタック

- Vite + Vanilla TypeScript(フレームワーク不使用)、静的サイト
- 画面遷移は単一ページ内の状態切替。URL hash(`#/`, `#/themes`, `#/draw/<themeId>`, `#/result/<themeId>`)で戻る操作に対応
- テスト: Vitest(ロジック・データ整合性)
- Vite `base` はリポジトリ名に合わせて設定

## 3. ディレクトリ構成

```
/src
  /assets
    /audio        … bgm.mp3(後日配置)
    /svg          … 装飾用SVG(魔法陣背景等)
  /data
    cards.json    … 78枚(要件5.2スキーマ)
    themes.json   … 5テーマ(id/名前/アイコン/テーマカラー)
    fortunes.json … 780パターン(生成済み成果物をコミット)
  /scripts
    seed.ts       … FNV-1aハッシュ + mulberry32 PRNG
    draw.ts       … 抽選 + localStorage日次キャッシュ
    share.ts      … X intent URL生成
    audio.ts      … BGM再生/ミュート(状態をlocalStorageに保存)
    router.ts     … hashベースの画面切替
    card-svg.ts   … カードSVG合成(共通フレーム + シンボル)
  /views
    top.ts / themes.ts / draw.ts / result.ts
  /styles
    theme.css     … パレット・フォント・共通装飾
  main.ts
/tools
  generate-fortunes.ts … 小アルカナ占い文の合成スクリプト(開発時のみ実行)
index.html
```

## 4. コアロジック

### 4.1 日替わりシード
- シード文字列 = `YYYYMMDD + themeId`(クライアントのローカル日付。タイムゾーンずれは仕様として許容)
- FNV-1aで32bitハッシュ化 → mulberry32 に投入
- 乱数1回目: カードindex(0–77)、乱数2回目: 正逆(<0.5 で正位置)

### 4.2 抽選と当日キャッシュ
- `localStorage["na:draw:<YYYYMMDD>:<themeId>"]` に結果(cardId/orientation)を保存
- 同日同テーマ再訪時はシャッフル演出をスキップし「本日の託宣はすでに下されている」と表示して結果を即時再表示
- 古い日付のキーは起動時に掃除

### 4.3 シェア
- X intent URL(`https://x.com/intent/post?text=...`)。文言 = カード名 + 正逆 + 一言 + サイトURL。バックエンド不要

### 4.4 BGM
- ユーザー操作(トップの「儀式を始める」または常設のBGMボタン)を起点にループ再生
- ミュート/再生トグルを全画面右上に常時表示。`aria-label` 必須
- 音源未配置時はボタンを非活性にしフォールバック(エラーを出さない)

## 5. コンテンツ生成(占い文 780パターン)

- **大アルカナ 22枚 × 5テーマ × 正逆 = 220本**: 個別執筆(60〜120字程度、示唆的・警句的な不気味トーン。※実装時に文量を精査し、100〜150字の当初案から短めの完結した警句調に調整済み)
- **小アルカナ 56枚 × 5テーマ × 正逆 = 560本**: `tools/generate-fortunes.ts` がカードキーワード × テーマ別文型テンプレートを合成して生成。文型はテーマごとに複数用意し、カード番号で分散させて重複感を抑える
- 生成結果は `fortunes.json` にコミットし、実行時は静的読込のみ(実行時生成なし)
- 文体ガイド: 断定しすぎない/二人称「あなた」/暗示・警句で締める/ですます調は使わず文語寄りの常体

## 6. カードビジュアル(SVG)

- 共通の額縁フレーム(ゴールド細線の装飾枠 + 四隅の紋様)1種
- 中央シンボル: 大アルカナ22種は個別の幾何・記号意匠(例: 愚者=崖と星、死神=鎌と砂時計)。小アルカナはスート記号(杖/杯/剣/金貨)× 数字配置の幾何構成、コートカード(P/N/Q/K)は冠・兜等の記号差分
- `card-svg.ts` がカードIDからSVG文字列を合成。逆位置は180度回転表示

## 7. デザイン

- パレット: 背景 `#0d0713` / 深紅 `#6e0d25` / ゴールド `#a8892f` / テキスト `#e8e3da`(CSSカスタムプロパティで定義)
- フォント: 和文 Noto Serif JP、欧文ディスプレイ Cinzel 系(Google Fonts。読み込み失敗時は serif フォールバック)
- 演出: 魔法陣SVGの微回転、ロウソクの揺らぎ(box-shadowアニメ)、結果表示時のフェードイン+グリッチ(`prefers-reduced-motion` で無効化)
- モバイルファースト。ブレークポイントは 768px を基準に1段階

## 8. 画面フロー

1. **トップ**: 魔法陣背景 + サービス名 + キャッチコピー +「儀式を始める」
2. **テーマ選択**: 5枚の護符風カード(テーマ色差分 + SVGアイコン)
3. **抽選演出**: カードシャッフル → 3Dフリップで1枚公開(既出の日はスキップ)
4. **結果**: カードSVG・カード名(和英)・正位置/逆位置・占い文・Xシェア・「別の問いを立てる」(テーマ選択へ戻る)

## 9. 非機能・アクセシビリティ

- 自動再生なし、ミュート常設、SVGに `role="img"` + `aria-label`
- OGPメタタグ(og:title/description/image ※og:imageは静的PNG1枚を用意)
- 主要モダンブラウザ対応、外部依存は最小(フォント以外CDN不使用)

## 10. テスト方針

- `seed.ts`: 同一シード→同一結果、日付・テーマ差で分布が偏らないこと
- `draw.ts`: localStorageキャッシュの読み書き・日付切替
- データ整合性: cards.json 78枚・fortunes.json 780件・全cardId×themeId網羅をテストで検証

## 11. デプロイ

- `.github/workflows/deploy.yml`: main push → `npm ci && npm run build` → `actions/deploy-pages` でPages公開
- リポジトリ作成・Pages有効化はユーザー操作(手順をREADMEに記載)

## 12. スコープ外(将来拡張)

- 複数枚スプレッド、独自ドメイン、BGMの画面連動エフェクト、他SNSシェア
