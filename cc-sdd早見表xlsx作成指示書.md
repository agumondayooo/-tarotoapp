# 指示書: cc-sdd（CCSDD）フェーズ・コマンド早見表 xlsx の作成

## あなた（Claude Code）へのタスク

以下の仕様に従って、cc-sdd v3 の開発フェーズ・コマンドの早見表 Excel ファイルを **`cc-sdd_cheatsheet.xlsx`** として作成してください。

- **Web検索は不要**。必要なデータはすべてこの指示書に埋め込んであります（cc-sdd v3.0.2 / Claude Code スキル版・全17スキル準拠）。
- Python + openpyxl（無ければ `pip install openpyxl`）で作成すること。
- すべて日本語で記載すること。
- 作成後、各シートのヘッダーとデータ件数を読み戻して検証し、結果を報告すること。

## 目的（背景）

開発中に「今どのフェーズにいるのか」「次に何のコマンドを打つべきか」で迷わないための、手元に置いておく早見表。特に `/kiro-discovery` 後の分岐（Path A〜E）が一目で分かることが重要。

---

## ブック構成（シート4枚）

### シート1: 「全体フロー」

上から順に読めば開発の流れが分かるシート。以下の内容を表形式（列: 順序 / フェーズ / やること / 使うコマンド / 完了条件・承認）で記載する。

| 順序 | フェーズ | やること | 使うコマンド | 完了条件・承認 |
|---|---|---|---|---|
| 0 | Phase 0: 準備（任意） | 既存コードベースがある場合のみ、プロジェクト前提（技術スタック・構成・方針）をメモリ化 | `/kiro-steering`、必要なら `/kiro-steering-custom` | 新規プロジェクトならスキップしてよい |
| 1 | Discovery（入口） | やりたいことを自然言語で渡し、進め方（Path A〜E）を仕分けてもらう | `/kiro-discovery "アイデア"` | brief.md / roadmap.md が生成され、次に打つコマンドが提示される |
| 2 | Phase 1: 仕様策定 | 要件 → 設計 → タスクを1段ずつ生成し、**各段階で人間がレビュー・承認** | `/kiro-spec-init` → `/kiro-spec-requirements` → `/kiro-spec-design` → `/kiro-spec-tasks` | 各フェーズの成果物（requirements.md / design.md / tasks.md）を承認するまで次へ進めない |
| 3 | Phase 2: 実装 | tasks 承認後、TDDで実装 | `/kiro-impl {feature} [tasks]` | 実装中は review / debug / verify-completion が自動適用される |
| 4 | 最終検証 | feature 全体の統合検証 | `/kiro-validate-impl {feature}` | 完了 |

表の下に補足として以下を記載:
- 迷ったら `/kiro-discovery` から始めればよい（discoveryが毎回次のコマンドを案内してくれる）
- 各 spec の状態は `.kiro/specs/{feature}/spec.json` で管理される。進捗確認はいつでも `/kiro-spec-status`
- 原因調査・「何が起きてるか分からない」段階では kiro コマンドは使わず、普通に自然言語で調べさせる。方針が見えた時点で `/kiro-discovery` に渡す

### シート2: 「全17スキル一覧」

列: フェーズ / スキル名 / コマンド / 用途 / 備考（任意・自動適用など）

| フェーズ | スキル名 | コマンド | 用途 | 備考 |
|---|---|---|---|---|
| Phase 0: 準備 | kiro-steering | `/kiro-steering` | プロジェクト全体のルールをメモリ化 | 任意。既存コードがある場合に有効 |
| Phase 0: 準備 | kiro-steering-custom | `/kiro-steering-custom` | ドメイン特化のカスタムsteering追加 | 任意 |
| 入口 | kiro-discovery | `/kiro-discovery "アイデア"` | 進め方の仕分け＋アイデア整理 | 自動起動しない（明示的に打つ） |
| Phase 1: 仕様策定 | kiro-spec-init | `/kiro-spec-init "説明"` | specを初期化 | `.kiro/specs/{feature}/` が作られる |
| Phase 1: 仕様策定 | kiro-spec-requirements | `/kiro-spec-requirements {feature}` | EARS形式で要件生成 | 承認ポイント① |
| Phase 1: 仕様策定 | kiro-validate-gap | `/kiro-validate-gap {feature}` | 既存コードとの差分分析 | 任意 |
| Phase 1: 仕様策定 | kiro-spec-design | `/kiro-spec-design {feature} [-y]` | 要件→設計 | 承認ポイント②。`-y` は承認スキップ |
| Phase 1: 仕様策定 | kiro-validate-design | `/kiro-validate-design {feature}` | 設計レビュー | 任意 |
| Phase 1: 仕様策定 | kiro-spec-tasks | `/kiro-spec-tasks {feature} [-y]` | 設計→タスク分解 | 承認ポイント③。`-y` は承認スキップ |
| Phase 1: 仕様策定 | kiro-spec-quick | `/kiro-spec-quick "説明" [--auto]` | 要件〜タスクを一括生成 | 急ぎ用。初回は個別コマンド推奨 |
| Phase 1: 仕様策定 | kiro-spec-batch | `/kiro-spec-batch` | 複数specを並列一括作成 | Path D（大きめ機能）で使用 |
| Phase 1: 仕様策定 | kiro-spec-status | `/kiro-spec-status [feature]` | 進捗・フェーズ・承認状況の確認 | いつでも使える |
| Phase 2: 実装 | kiro-impl | `/kiro-impl {feature} [tasks]` | タスクをTDDで実装 | tasks承認済みでないと開始しない。自動起動しない |
| Phase 2: 実装 | kiro-review | （自動適用） | タスク単位のレビュー | 実装中に自動適用 |
| Phase 2: 実装 | kiro-debug | （自動適用） | 詰まった時の原因調査 | 実装中に自動適用 |
| Phase 2: 実装 | kiro-verify-completion | （自動適用） | 「完了」主張前の証拠確認 | 完了報告前に自動適用 |
| Phase 2: 実装 | kiro-validate-impl | `/kiro-validate-impl {feature}` | feature全体の最終統合検証 | 手動で実行 |

### シート3: 「discovery分岐（Path A〜E）」

`/kiro-discovery` が判定する5つのPathの早見表。列: Path / 判定される状況 / discoveryが案内する次の一手 / メモ

| Path | 判定される状況 | 次の一手 | メモ |
|---|---|---|---|
| A | 既存specの範囲内の追加・改修（既存spec拡張） | `/kiro-spec-requirements {feature}` | initは不要、既存specに要件を追記する流れ |
| B | バグ修正・設定変更・些細な追加（spec不要） | そのまま直接実装 | specを作らない。typo修正等の自明なものはdiscoveryすら不要 |
| C | 新機能で1つのspecに収まる（新規・単一spec） | `/kiro-spec-init` | 一番よくあるパターン |
| D | 複数領域にまたがる大きめの機能（新規・複数spec） | `/kiro-spec-batch` | roadmap.md が生成される |
| E | 既存拡張＋新規specが混ざる（混在） | 内容に応じて init / batch | discoveryの案内に従う |

表の下に、discoveryの内部動作を補足として記載:
1. `.kiro/specs/` と `.kiro/steering/` の状態をスキャン
2. Path A〜E を自動判定
3. 対話で不明点を深掘り
4. 2〜3案を提示しておすすめを提案
5. brief.md（単一spec）/ roadmap.md（複数spec）を書き出す
6. 次に打つべきコマンドを教えて停止

### シート4: 「FAQ・注意点」

列: 疑問・状況 / 回答。以下を記載:

| 疑問・状況 | 回答 |
|---|---|
| 最初に何を打てばいい？ | 迷ったら `/kiro-discovery "やりたいこと"`。新規プロジェクトならsteeringは後回しでOK |
| Phase 0が「0」なのに任意なのはなぜ？ | 「0」は「やるなら一番最初」という順序ラベル。必須ではない。判断基準は「既存コードベースがあるか」 |
| バグ修正でもdiscoveryを使う？ | 使ってOK。Path B（spec不要）と即判定されるだけで重い処理は走らない。自明なら直接依頼でも可 |
| まず調査したい時は？ | kiroコマンドは使わず自然言語で依頼。方針が見えてから `/kiro-discovery` へ |
| spec-quickと個別コマンドどっち？ | 急ぎなら quick、初回・内容確認しながらなら個別（init→requirements→design→tasks）推奨 |
| discovery / impl が自動起動しない | 仕様（disable-model-invocation: true）。必ずスラッシュコマンドで明示的に打つ |
| `-y` / `--auto` は何？ | 承認の一時停止をスキップする早送りフラグ。内容未確認で通ることになるので理解した上で使う |
| 進捗が分からなくなった | `/kiro-spec-status [feature]` で現在のフェーズ・承認状況・タスク進捗を確認。実体は `.kiro/specs/{feature}/spec.json` |
| 承認フローで詰まった | 前フェーズの承認が完了しているか確認 → `/kiro-spec-status` で診断 → 必要なら spec.json を手動確認・編集 |

---

## 書式・体裁の指定

1. 各シートとも1行目はタイトル行（太字・フォントサイズ大きめ）、2行目を空け、3行目を表ヘッダーにする
2. 表ヘッダーは背景色付き（濃紺 #1F4E79 など）・白文字・太字、ウィンドウ枠固定（ヘッダー行で固定）
3. シート2は「フェーズ」列で色分けする（Phase 0=グレー系、入口=黄系、Phase 1=青系、Phase 2=緑系の薄い塗り）。シート1・3・4も行の縞模様（バンド）で見やすくする
4. 全表にオートフィルタを設定
5. 列幅は内容に合わせて調整し、コマンド列は等幅フォント（Consolas等）、長文セルは折り返して全体を表示
6. A4横で印刷してもレイアウトが崩れない程度の列幅を意識する
7. シート見出しタブにも色を付ける（シート順: 全体フロー → 全17スキル一覧 → discovery分岐 → FAQ・注意点）

## 検証（作成後に必ず実施）

- openpyxlでファイルを読み戻し、シート4枚の存在・各シートの行数（シート2は17スキル分あるか）を確認して報告する
- コマンド表記（`/kiro-` プレフィックス、ハイフン区切り）に誤りがないか目視確認する

## 注意

- この表は cc-sdd **v3系（スキル版、`/kiro-discovery` 等ハイフン区切り）** 前提。もしプロジェクトで旧版（`/kiro:spec-init` のようにコロン区切り）が入っている場合は、その旨を報告した上で、コマンド列の表記をプロジェクトの `.claude/commands/kiro/` または CLAUDE.md の実際の記載に合わせて修正すること
- 作成前にプロジェクト直下の CLAUDE.md（cc-sddのワークフロー定義）が存在すれば読み、記載と矛盾があればCLAUDE.md側を正として調整すること
