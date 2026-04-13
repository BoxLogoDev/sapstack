<div align="center">

# 🏛 sapstack

### SAP 運用エンタープライズ プラットフォーム（AI コーディング アシスタント専用）

**20 プラグイン · 16 エージェント · 18 コマンド · 55+ IMG ガイド · 43+ ベストプラクティス · 6 言語 · SAP AI 対応**

🌐 **Languages**: [🇰🇷 한국어](README.md) · [🇬🇧 English](README.en.md) · [🇨🇳 中文](README.zh.md) · [🇯🇵 日本語](README.ja.md) · [🇩🇪 Deutsch](README.de.md) · [🇻🇳 Tiếng Việt](README.vi.md)


<p>
  <a href="docs/tutorial.md"><b>チュートリアル</b></a> ·
  <a href="docs/faq.md"><b>FAQ</b></a> ·
  <a href="docs/glossary.md"><b>用語集</b></a> ·
  <a href="docs/multi-ai-compatibility.md"><b>マルチ AI ガイド</b></a> ·
  <a href="docs/roadmap.md"><b>ロードマップ</b></a>
</p>

</div>

---

## ⚡ 30秒紹介

sapstack は **AI コーディング アシスタントを SAP 運用コンサルタントに変える** — SAP 運用ライフサイクル全体をカバーするエンタープライズ プラットフォームです。v1.6.0 では構成 → 実装 → 運用 → 診断 → 最適化をカバーします。

- 🎯 **18 個の SAP モジュール + Evidence Loop オーケストレーター** — FI/CO/TR/MM/SD/PP/PM/QM/WM/EWM/HCM/SFSF/ABAP/S4 移行/BTP/BASIS/BC/GTS
- 🤖 **15 エージェント** — 14 モジュール コンサルタント + **SAP チューター**（新入社員研修）
- ⚙️ **18 スラッシュ コマンド** — 決算、デバッグ、Evidence Loop、IMG、ベストプラクティス、診断
- 🏗 **52 IMG 構成ガイド** — SPRO パス、段階的セットアップ、ECC vs S/4 差異、検証方法
- 📋 **40+ ベストプラクティス** — 3 層フレームワーク（運用・決算・ガバナンス）
- 🏢 **エンタープライズ ドキュメント** — 複数会社コード、SSC、内部取引、グローバル展開、システム構成
- 🏭 **業界別ガイド** — 製造、小売、金融サービス
- 🌐 **7 つの AI ツール対応** — Claude Code、Codex CLI、Copilot、Cursor、Continue.dev、Aider、Kiro
- 🇰🇷 **韓国現場言語レイヤー** — 80+ 同義語、62 症状インデックス、41 T-code 発音（韓国企業重点）
- 📊 **340+ T-codes · 57 SAP Note · 8 データ資産**
- 🔁 **Evidence Loop** — インテーク → 仮説 → 収集 → 検証（反証条件 + 強制ロールバック必須）
- 🛡 **11 品質ゲート** — IMG、ベストプラクティス、業界チェック、厳密な CI

---

## 🚀 クイック スタート

### 1️⃣ Claude Code
```bash
/plugin marketplace add https://github.com/BoxLogoDev/sapstack
/plugin install sap-fi@sapstack sap-session@sapstack sap-bc@sapstack
```

### 2️⃣ Amazon Kiro IDE ⭐ 新規
```bash
git submodule add https://github.com/BoxLogoDev/sapstack sapstack
cd sapstack/mcp && npm install && npm run build && cd ../..
cp sapstack/.kiro/settings/mcp.json .kiro/settings/mcp.json
cp sapstack/.kiro/steering/*.md .kiro/steering/
```
Kiro チャット内で：「最近変更したコスト センターを見つけて」→ 自動同義語展開マッチング。
詳細：**[docs/kiro-quickstart.md](docs/kiro-quickstart.md)** · **[docs/kiro-integration.md](docs/kiro-integration.md)**

### 3️⃣ OpenAI Codex CLI
```bash
git submodule add https://github.com/BoxLogoDev/sapstack sapstack
cd sapstack && git checkout v1.5.0 && cd ..
codex "F110 支払い実行を診断：ベンダーが「支払い方法なし」エラーを表示"
```

### 4️⃣ GitHub Copilot（VS Code）
リポジトリをクローンするか、`.github/copilot-instructions.md` をコピー → 自動検出

### 5️⃣ Cursor / Continue.dev / Aider
自動ロード `.cursor/rules/sapstack.mdc` / `.continue/config.yaml` / `CONVENTIONS.md`

詳細：**[docs/multi-ai-compatibility.md](docs/multi-ai-compatibility.md)**

---

## 🏛 アーキテクチャ — 5 軸構造（v1.6.0）

```
┌─────────────────────────────────────────────────────────────────┐
│                     sapstack v1.6.0                              │
│              SAP 運用エンタープライズ プラットフォーム             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [構成]  →  [実装]  →  [運用]  →  [診断]  →  [最適化]           │
│  52 IMG    エンタープライズ 15 エージェント  Evidence    40+ BP  │
│  SPRO      6 ドキュメント  18 コマンド      Loop 62     3 層    │
│  パス      3 業界         340+ T-codes     症状       フレーム  │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│  ① アクティブ アドバイザー    ② コンテキスト永続性              │
│  • 19 SKILL.md              • .sapstack/config.yaml             │
│  • 15 サブエージェント      • .sapstack/sessions/*/state.yaml   │
│  • 18 コマンド              • 5 JSON スキーマ                   │
│  • 80+ 同義語               • 監査証跡（追記のみ）             │
│                                                                  │
│  ③ Evidence Loop             ④ 品質ゲート（11 種類 CI）         │
│  • 4 ターン診断ループ        • lint / マーケットプレイス / HC  │
│  • 反証可能性必須            • tcodes / references / links      │
│  • Fix + Rollback ペア       • ecc-s4-split / マルチ AI 構築   │
│                              • img-refs / best-practices        │
│  ⑤ エンタープライズ層 🆕                                       │
│  • IMG 構成（52 ガイド）                                       │
│  • ベストプラクティス（3 層：運用/決算/ガバナンス）           │
│  • エンタープライズ シナリオ（複数 CC、SSC、IC、グローバル）  │
│  • 業界ガイド（製造、小売、金融）                              │
└─────────────────────────────────────────────────────────────────┘
```

詳細：[docs/architecture.md](docs/architecture.md) · Evidence Loop：[plugins/sap-session/skills/sap-session/SKILL.md](plugins/sap-session/skills/sap-session/SKILL.md)

---

## 🔁 Evidence Loop — アドバイス ボットから診断パートナーへ（v1.5.0）

sapstack v1.5.0 は**シングル ターン アドバイス**から**ターン認識診断パートナー**に転換します。ライブ SAP アクセスなしでも、「確認 → 修正 → 再確認」ループが非同期で動作します。

### 4 ターン構造
```
ターン 1 インテーク    → 運用者が初期症状 + 証拠を提供
ターン 2 仮説          → AI が 2-4 個の仮説（反証必須）+ 後続リクエスト生成
ターン 3 収集          → 運用者が SAP から証拠を収集（AI は待機）
ターン 4 検証          → 仮説確認/却下 + 修正計画 + 強制ロールバック
```

### 3 つのアクセス サーフェス
| サーフェス | ユーザー | ツール |
|---|---|---|
| **A — CLI** | 運用者 | `/sap-session-{start,add-evidence,next-turn}` |
| **B — IDE** | 運用者 | VS Code 拡張機能（v1.6 計画） |
| **C — Web** | エンド ユーザー | `web/triage.html` + `web/session.html`（静的、サーバーレス） |

3 つのサーフェスは**同じセッション ID** で接続され、ハンドオフが可能です。典型的なフロー：エンド ユーザーが Web で診断を開始し、運用者が CLI で継続します。

### 核心原則
- **反証可能性**：すべての仮説に反証条件が必須
- **ロールバックまたはなし修正**：確認された修正にはロールバック ペアが必須
- **監査証跡**：すべての状態変更を記録（追記のみ）
- **ライブ SAP なし**：運用者が実行者として機能（ヒューマン イン ザ ループ非同期ループ）

詳細：[plugins/sap-session/skills/sap-session/SKILL.md](plugins/sap-session/skills/sap-session/SKILL.md) · 実例：[aidlc-docs/sapstack/f110-dog-food.md](aidlc-docs/sapstack/f110-dog-food.md)

---

## 📦 20 プラグイン カタログ（18 ドメイン + 2 メタ）

### 💰 コア ファイナンス
| プラグイン | トピック | キーワード |
|--------|-------|----------|
| [`sap-fi`](plugins/sap-fi/) | 財務会計 | FB01, F110, MIRO, 決算, GR/IR, 税務 |
| [`sap-co`](plugins/sap-co/) | コスト コントロール | コスト センター, KSU5, KO88, CK11N, CO-PA |
| [`sap-tr`](plugins/sap-tr/) | 資金管理・キャッシュ | FF7A, FF7B, 流動性, MT940, DMEE |

### 📦 ロジスティクス・サプライ チェーン
| プラグイン | トピック | キーワード |
|--------|-------|----------|
| [`sap-mm`](plugins/sap-mm/) | 材料管理 | MIGO, ME21N, MB52, GR/IR, MR11 |
| [`sap-sd`](plugins/sap-sd/) | 販売・流通 | VA01, VF01, FD32, 価格, 信用 |
| [`sap-pp`](plugins/sap-pp/) | 生産計画 | MRP, MD01/MD04, CO01, BOM, ルーティング |
| [`sap-pm`](plugins/sap-pm/) 🆕 | 設備保全 | IE01, IW31, IP01, MTBF/MTTR |
| [`sap-qm`](plugins/sap-qm/) 🆕 | 品質管理 | QA01, QP01, QA11, QM01, ISO/GMP/HACCP |
| [`sap-wm`](plugins/sap-wm/) 🆕 | 倉庫管理（ECC） | LT01, LS01N, ⚠️ S/4 非推奨 |
| [`sap-ewm`](plugins/sap-ewm/) 🆕 | 拡張倉庫管理 | /SCWM/MON, Wave, RF |

### 👥 人的資源
| プラグイン | トピック | キーワード |
|--------|-------|----------|
| [`sap-hcm`](plugins/sap-hcm/) | HCM オンプレミス（ECC + H4S4） | PA30, PC00_M46, 給与, 税務 |
| [`sap-sfsf`](plugins/sap-sfsf/) | SuccessFactors | EC, ECP, 採用, LMS, RBP |

### 💻 テクノロジー
| プラグイン | トピック | キーワード |
|--------|-------|----------|
| [`sap-abap`](plugins/sap-abap/) | ABAP 開発 | SE38, BAdI, CDS, RAP, ST22 |
| [`sap-s4-migration`](plugins/sap-s4-migration/) | ECC → S/4HANA | ブラウンフィールド、グリーンフィールド、SUM、ATC |
| [`sap-btp`](plugins/sap-btp/) | ビジネス テクノロジー プラットフォーム | CAP, Fiori, OData, XSUAA |
| [`sap-basis`](plugins/sap-basis/) | BASIS 管理 | STMS, SM50, PFCG, Kernel |

### 🇰🇷 韓国特化 + 🌍 グローバル 貿易
| プラグイン | トピック | キーワード |
|--------|-------|----------|
| [`sap-bc`](plugins/sap-bc/) 🇰🇷 | BASIS — 韓国版 | BC, ネットワーク分離, e-税務, K-SOX |
| [`sap-gts`](plugins/sap-gts/) 🌍 | グローバル 貿易 サービス | HS code, UNI-PASS, FTA, 輸出入 |

### 🔁 メタ — Evidence Loop オーケストレーター（v1.5.0 実験）
| プラグイン | トピック | ロール |
|--------|-------|------|
| [`sap-session`](plugins/sap-session/) 🔁 | Evidence Loop オーケストレーター | 18 プラグインと 15 エージェントをターン認識診断ループに統合。オーケストレーション レイヤーのみ。 |

---

## 🤖 15 エージェント

### モジュール コンサルタント（14）
| エージェント | ロール | エスカレーション時期 |
|-------|------|---|
| `sap-fi-consultant` | 財務会計 | 仕訳、決算、税務、GR/IR |
| `sap-co-consultant` | コスト コントロール | コスト センター、配分、CO-PA、製品原価 |
| `sap-tr-consultant` 🆕 | 資金管理 | 流動性、銀行対応、DMEE |
| `sap-mm-consultant` | 材料管理 | 購買、在庫、GR/IR、MIGO |
| `sap-sd-consultant` | 販売・流通 | 注文、配送、請求、信用 |
| `sap-pp-consultant` | 生産計画 | MRP、BOM、製造オーダー |
| `sap-hcm-consultant` 🆕 | 人的資源 | 給与、就業時間、税務、年末 |
| `sap-pm-consultant` 🆕 | 設備保全 | 設備、保全オーダー、MTBF/MTTR |
| `sap-qm-consultant` 🆕 | 品質管理 | 検査、不合格判定、ISO/GMP |
| `sap-ewm-consultant` 🆕 | 倉庫管理 | Wave、ピッキング、RF、WM 移行 |
| `sap-abap-developer` | ABAP コード レビュー | コード品質、Clean Core |
| `sap-basis-consultant` | Basis 分類分け | ダンプ、WP 行、トランスポート |
| `sap-s4-migration-advisor` | S/4HANA 準備 | 移行の質問 |
| `sap-integration-advisor` | 統合 アーキテクチャ | RFC, IDoc, OData, CPI |

### 🎓 SAP チューター（1）🆕
| エージェント | ロール | エスカレーション時期 |
|-------|------|---|
| `sap-tutor` 🆕 | 新入社員研修 | SAP 基礎、モジュール入門、用語 |

---

## ⚙️ 18 スラッシュ コマンド

```bash
# 決算
/sap-fi-closing monthly <company-code>     # 月次決算 チェックリスト
/sap-quarter-close <cc> <quarter>          # 四半期決算（IFRS + SOX）
/sap-year-end <cc> <year>                  # 年度決算（税務 + 監査）

# デバッグ
/sap-migo-debug <error-code> <mv-type>     # MIGO 転記エラー
/sap-payment-run-debug <vendor-code>       # F110 支払い実行
/sap-transport-debug <TR-id>               # STMS 失敗診断
/sap-tax-invoice-debug <type>              # e-税務 請求書の問題
/sap-performance-check <target>            # パフォーマンス診断

# 分析・レビュー
/sap-abap-review <file-path>               # ABAP コード レビュー
/sap-s4-readiness --auto                   # S/4 移行評価

# Evidence Loop
/sap-session-start "<symptom>"             # ターン 1 インテーク
/sap-session-add-evidence <id> <files...>  # ターン 1/3
/sap-session-next-turn <session-id>        # 自動ターン 2/4 進行

# v1.6.0 🆕 — IMG / ベストプラクティス / 診断
/sap-img-guide <module> <area>             # IMG 構成ガイド
/sap-master-data-check [vendor|material]   # マスター データ事前検証
/sap-bp-review <module> [operational|all]  # ベストプラクティス準拠チェック
/sap-pm-diagnosis [equipment|symptom]      # 設備障害診断
/sap-qm-inspection [inspection-lot|material] # 品質検査分析
```

---

## 🌐 マルチ AI 対応（7 ツール）

| AI ツール | エントリー ファイル | 追加バージョン |
|---------|-----------|-------|
| **Claude Code** | `plugins/*/skills/*/SKILL.md`（ネイティブ） | v1.0.0 |
| **OpenAI Codex CLI** | [`AGENTS.md`](AGENTS.md) | v1.2.0 |
| **GitHub Copilot** | [`.github/copilot-instructions.md`](.github/copilot-instructions.md) | v1.2.0 |
| **Cursor** | [`.cursor/rules/sapstack.mdc`](.cursor/rules/sapstack.mdc) | v1.2.0 |
| **Continue.dev** | [`.continue/config.yaml`](.continue/config.yaml) | v1.3.0 |
| **Aider** | [`CONVENTIONS.md`](CONVENTIONS.md) | v1.3.0 |
| **Amazon Kiro IDE** 🆕 | [`AGENTS.md`](AGENTS.md) + [`.kiro/steering/`](.kiro/steering/) | **v1.5.0** |

**設計原則**：「1 つの真実の源（SKILL.md）+ N 個の薄い互換レイヤー」。どの AI を使用しても、**通用ルール + レスポンス形式 + ナレッジ品質**が一貫しています。

---

## 🛡 通用ルール

すべての SAP 回答は**必須で** 8 つのコア ルールに従う必要があります：

1. **決してハードコードしない** 会社コード、G/L アカウント、または組織単位
2. **常に尋ねる** 環境情報（リリース、デプロイメント、会社コード）
3. **常に区別する** ECC vs S/4HANA の動作
4. **トランスポート リクエスト必須** 構成変更の場合
5. **実行前にシミュレーション** — AFAB, F.13, FAGL_FC_VAL, MR11, F110
6. **本番で SE16N データ編集をお勧めしない**
7. **常に T-code + SPRO メニュー パスを提供**
8. 🆕 **現場言語を使用** — ユーザーの言語で返信（ko/en/zh/ja/de/vi）；フィールド用語は英語のまま

---

## 🌐 多言語 + 韓国現場言語レイヤー

単なる翻訳ではなく、**実際の韓国 SAP 職場の言葉遣い** — 「코스트 센터」（コスト センター）などの現場ネイティブ表現を、二重記号「(코스트 센터, KOSTL)」で受け入れます。

- ✅ **19/19 モジュール**クイック ガイド + プロフェッショナル翻訳
- ✅ **80+ 用語同義語**（[data/synonyms.yaml](data/synonyms.yaml)）
- ✅ **略語 + ビジネス時間マーカー**
- ✅ **41 T-code 韓国語発音**
- ✅ **62 自然言語症状インデックス**（18 モジュール）
- ✅ 🆕 **現場言語スタイル ガイド**
- ✅ **sap-bc** — 韓国 BC コンサルタント専門性
- ✅ 🆕 **同義語マッチング エンジン** — 変形を自動統一

### 🌐 多言語サポート（v1.7.0 — 6 言語）
| 言語 | symptom-index | synonyms | ステータス |
|---|---|---|---|
| 🇰🇷 韓国語（ko） | 62/62 | 80+ | プライマリ |
| 🇬🇧 英語（en） | 62/62 | 80+ | 完全 |
| 🇨🇳 中国語（zh） | 62/62 | 40+ | 🆕 v1.7 |
| 🇯🇵 日本語（ja） | 62/62 | 40+ | 🆕 v1.7 |
| 🇩🇪 ドイツ語（de） | 62/62 | 40+ | 🆕 v1.7 |
| 🇻🇳 ベトナム語（vi） | 62/62 | 40+ | 🆕 v1.7 |

---

## 📊 データ資産

| 資産 | 数量 | ファイル | バージョン |
|-------|-------|------|---------|
| 確認済み T-codes | **340+** | [`data/tcodes.yaml`](data/tcodes.yaml) | v1.6.0 |
| 確認済み SAP Notes | **57** | [`data/sap-notes.yaml`](data/sap-notes.yaml) | v1.6.0 |
| 症状インデックス | **62**（ko/en 完全） | [`data/symptom-index.yaml`](data/symptom-index.yaml) | v1.6.0 |
| 同義語 | **80+ 用語** | [`data/synonyms.yaml`](data/synonyms.yaml) | v1.6.0 |
| T-code 発音 | **41**（韓国語） | [`data/tcode-pronunciation.yaml`](data/tcode-pronunciation.yaml) | v1.5.0 |
| Evidence Loop スキーマ | **5 JSON スキーマ** | [`schemas/`](schemas/) | v1.5.0 |
| 🆕 決算シーケンス | **24 ステップ** | [`data/period-end-sequence.yaml`](data/period-end-sequence.yaml) | **v1.6.0** |
| 🆕 マスター データ ルール | **5 マスター タイプ** | [`data/master-data-rules.yaml`](data/master-data-rules.yaml) | **v1.6.0** |
| 🆕 業界マトリックス | **3 業界** | [`data/industry-matrix.yaml`](data/industry-matrix.yaml) | **v1.6.0** |

### 🌐 Web UI（v1.5.0 拡張）
| ページ | 用途 |
|---|---|
| [`web/index.html`](web/index.html) | SAP Note リゾルバー — 50+ 確認済み Notes |
| 🆕 [`web/triage.html`](web/triage.html) | **エンド ユーザー自己診断** — 症状入力 → 同義語展開 → 運用者エスカレーション |
| 🆕 [`web/session.html`](web/session.html) | **Evidence Loop ビューアー** — state.yaml ビューアー |

すべて**静的サイト**（サーバー なし、SAP 接続 なし）— GitHub Pages にデプロイ可能。

---

## ✅ インストール検証

```bash
git clone https://github.com/BoxLogoDev/sapstack
cd sapstack

# すべての 11 品質ゲートを実行
./scripts/lint-frontmatter.sh              # Frontmatter 検証
./scripts/check-marketplace.sh             # marketplace.json 構造
./scripts/check-hardcoding.sh --strict     # ハードコード会社コード なし
./scripts/check-tcodes.sh --strict         # T-code レジストリ
./scripts/check-links.sh --strict          # 内部リンク検証
./scripts/check-ecc-s4-split.sh --strict   # ECC/S4 分離
./scripts/build-multi-ai.sh --check        # 互換レイヤー drift
./scripts/check-img-references.sh          # 🆕 IMG 構成ガイド
./scripts/check-best-practices.sh          # 🆕 ベストプラクティス 3-Tier
./scripts/check-industry-refs.sh           # 🆕 業界ガイド
```

すべてのゲートに合格 = ✅ 準備完了。CI で同じステップが自動実行されます。

---

## 🎓 学習パス

| レベル | パス |
|-------|------|
| 🆕 **初級** | [チュートリアル — 15 分](docs/tutorial.md) → [FAQ](docs/faq.md) |
| 📘 **中級** | [5 つの実例シナリオ](docs/scenarios/) → [用語集](docs/glossary.md) |
| 🏗 **上級** | [アーキテクチャ](docs/architecture.md) → [マルチ AI ガイド](docs/multi-ai-compatibility.md) |
| 🤝 **貢献者** | [CONTRIBUTING](CONTRIBUTING.md) → [プラグイン スキャフォルディング](scripts/new-plugin.sh) |
| 🔒 **セキュリティ** | [SECURITY](SECURITY.md) → [CoC](CODE_OF_CONDUCT.md) |

---

## 🏛 関連プロジェクト

- [Amazon Kiro IDE](https://kiro.dev/) — v1.5.0 以降ネイティブ sapstack 統合
- [Model Context Protocol](https://modelcontextprotocol.io/) — v1.5.0 スキャフォルディング
- [SAP ヘルプ ポータル](https://help.sap.com/) — 公式ドキュメント
- [SAP サポート ポータル](https://launchpad.support.sap.com/) — SAP Notes ソース
- [awesome-design-md](https://github.com/VoltAgent/awesome-design-md) — DESIGN.md インスピレーション

---

## 📜 ライセンス

MIT ライセンス — 詳細は [LICENSE](LICENSE) を参照してください。

**商業使用、修正、配布すべて許可** — 著作権表示の保持が必要です。

---

## 🤝 貢献

- 🐛 **バグ報告**：[Issues](https://github.com/BoxLogoDev/sapstack/issues/new?template=bug_report.md)
- ✨ **機能リクエスト**：[Feature Request](https://github.com/BoxLogoDev/sapstack/issues/new?template=feature_request.md)
- 📦 **新モジュール提案**：[New Module](https://github.com/BoxLogoDev/sapstack/issues/new?template=new_module.md)
- 💬 **ディスカッション**：[Discussions](https://github.com/BoxLogoDev/sapstack/discussions)
- 📖 **貢献ガイド**：[CONTRIBUTING.md](CONTRIBUTING.md)

---

<div align="center">

**Made with 🇰🇷 by [@BoxLogoDev](https://github.com/BoxLogoDev)**

Korean SAP consultants のために構築、グローバル コミュニティと共有。

[⬆ トップに戻る](#-sapstack)

</div>
