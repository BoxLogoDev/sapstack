<div align="center">

# 🏛 sapstack

### AI コーディング アシスタント向け SAP 企業運用プラットフォーム

**20 プラグイン · 16 エージェント · MCP ランタイム · VS Code 拡張 · 6 言語 · コンプライアンス対応**

🌐 [🇰🇷 한국어](README.md) · [🇬🇧 English](README.en.md) · [🇨🇳 中文](README.zh.md) · [🇯🇵 日本語](README.ja.md) · [🇩🇪 Deutsch](README.de.md) · [🇻🇳 Tiếng Việt](README.vi.md)

</div>

---

## sapstack とは？

**sapstack** は、Claude、Copilot、Cursor などの AI ツールに **SAP 専門知識を注入**するオープンソース プラットフォームです。SAP 運用のライフサイクル全体——**構成 → 実装 → 運用 → 診断 → 最適化**——をカバーし、エビデンスベースの診断を提供します。

```
┌──────────────────────────────────────────────────────────────┐
│ SAP オペレータ ──┐                                          │
│               ├─→ [AI ツール] ←── sapstack ──→ SAP 専門知識  │
│ トレーナー ─────┤      ↓                      + IMG ガイド   │
│               ├─ エビデンス ループ         + ベスト プラク  │
│ コンサルタント ─┘   (4 ターン診断)           + コンプライアン│
└──────────────────────────────────────────────────────────────┘
```

---

## 主要機能

### 🎯 完全 SAP モジュール対応
FI · CO · TR · MM · SD · PP · HCM · PM · QM · WM · EWM · ABAP · BASIS · BTP · SFSF · S4 移行 · GTS · BC · **Cloud PE** · Session

### 🤖 15 名のスペシャリスト + 1 名の SAP チューター
11 モジュール コンサルタント + ABAP 開発者 + BASIS コンサルタント + 統合アドバイザー + S/4 移行アドバイザー + **SAP チューター**（新入社員研修）

### 🔁 エビデンス ループ (v1.5+)
ライブ SAP アクセスなしの診断——**インテーク → 仮説 → 収集 → 検証**4 ターン構造、反証条件必須、ロールバック ペア必須

### 🏗 IMG 構成フレームワーク (v1.6+)
55+ SPRO ベースの構成ガイド——セットアップ ステップ、ECC vs S/4 違い、検証方法を含む

### 📋 3 層ベスト プラクティス
**運用**（日常）· **期末**（決算）· **ガバナンス**（監査）——11 モジュール全体に体系的に適用

### 🌐 6 言語対応 (v1.7+)
한국어 · English · 中文 · 日本語 · Deutsch · Tiếng Việt

### ☁️ S/4HANA Cloud PE 対応
Clean Core · キー ユーザー 拡張性 · 3 層 拡張 · Fit-to-Standard · Cloud ALM

### 🚀 MCP ランタイム (v2.0+)
`@boxlogodev/sapstack-mcp` — Claude Desktop で完全エビデンス ループを実行。5 つの読み込みツール + 3 つの書き込みツール。

### 💻 VS Code 拡張 (v2.0+)
セッション サイドバー · YAML 検証 · Webview レンダリング · ファイル ウォッチャー

### 🛡 コンプライアンス対応 (v2.0+)
K-SOX · SOC 2 · ISO 27001 · GDPR · エアギャップ配置 · 自動 PII マスキング

---

## クイック スタート

### Claude Code
```bash
/plugin marketplace add https://github.com/BoxLogoDev/sapstack
/plugin install sap-fi@sapstack sap-session@sapstack
```

### NPM (MCP サーバー)
```bash
npm install -g @boxlogodev/sapstack-mcp
sapstack-mcp --sessions-dir ~/.sapstack/sessions
```

### VS Code 拡張
VS Code Marketplace で「sapstack」を検索 → インストール

### Amazon Kiro IDE
```bash
git submodule add https://github.com/BoxLogoDev/sapstack sapstack
cp sapstack/.kiro/settings/mcp.json .kiro/settings/
cp sapstack/.kiro/steering/*.md .kiro/steering/
```

### その他のプラットフォーム (Codex / Copilot / Cursor / Continue.dev / Aider)
リポジトリをクローン → 自動検出。詳細: [docs/multi-ai-compatibility.md](docs/multi-ai-compatibility.md)

---

## ユニバーサル ルール

1. **会社コードを絶対ハードコードしない** — 固定会社コード、GL 勘定、コスト センター、組織単位なし
2. **環境インテーク優先** — SAP リリース、デプロイメント モデル、会社構造を最初に確認
3. **ECC vs S/4HANA を明確に区別** — バージョン固有の動作を明確に区別する必要あり
4. **トランスポート リクエスト必須** — すべての本番変更にはトランスポート リクエストが必須
5. **実行前にシミュレーション** — AFAB, F.13, FAGL_FC_VAL, MR11, F110 をテストで先に実行
6. **SE16N 編集なし** — 本番データの直接修正は推奨されない
7. **T-code + SPRO パス** — 各操作で両方を提供
8. **エビデンスベースの診断** — すべての仮説に反証条件が必要

---

## 学習パス

| レベル | パス |
|-------|------|
| 🆕 **初級** | [チュートリアル (15 分)](docs/tutorial.md) → [よくある質問](docs/faq.md) |
| 📘 **実践** | [5 つのシナリオ](docs/scenarios/) → [用語集](docs/glossary.md) |
| 🏗 **上級** | [アーキテクチャ](docs/architecture.md) → [Multi-AI ガイド](docs/multi-ai-compatibility.md) |
| 🔒 **セキュリティ** | [SECURITY.md](SECURITY.md) → [コンプライアンス](docs/compliance/) |
| 🤝 **貢献** | [CONTRIBUTING](CONTRIBUTING.md) → [ロードマップ](docs/roadmap.md) |

---

## データ資産

| 資産 | 数量 | ファイル |
|-------|------|------|
| 検証済み T-codes | 340+ | [`data/tcodes.yaml`](data/tcodes.yaml) |
| 自然言語症状インデックス | 62 (6 言語) | [`data/symptom-index.yaml`](data/symptom-index.yaml) |
| SAP ノート | 57+ | [`data/sap-notes.yaml`](data/sap-notes.yaml) |
| 多言語同義語 | 80+ 個の用語 × 6 言語 | [`data/synonyms.yaml`](data/synonyms.yaml) |
| 期末シーケンス | 24 ステップ | [`data/period-end-sequence.yaml`](data/period-end-sequence.yaml) |
| 業界マトリックス | 3 業界 | [`data/industry-matrix.yaml`](data/industry-matrix.yaml) |

---

## プラグイン カタログ

| ドメイン | プラグイン |
|-------|---------|
| 💰 **財務** | [sap-fi](plugins/sap-fi/) · [sap-co](plugins/sap-co/) · [sap-tr](plugins/sap-tr/) |
| 📦 **ロジスティクス** | [sap-mm](plugins/sap-mm/) · [sap-sd](plugins/sap-sd/) · [sap-pp](plugins/sap-pp/) · [sap-pm](plugins/sap-pm/) · [sap-qm](plugins/sap-qm/) · [sap-wm](plugins/sap-wm/) · [sap-ewm](plugins/sap-ewm/) |
| 👥 **人的資本** | [sap-hcm](plugins/sap-hcm/) · [sap-sfsf](plugins/sap-sfsf/) |
| 💻 **テクノロジー** | [sap-abap](plugins/sap-abap/) · [sap-s4-migration](plugins/sap-s4-migration/) · [sap-btp](plugins/sap-btp/) · [sap-basis](plugins/sap-basis/) · [sap-cloud](plugins/sap-cloud/) |
| 🌍 **グローバル** | [sap-bc](plugins/sap-bc/) · [sap-gts](plugins/sap-gts/) |
| 🔁 **メタ** | [sap-session](plugins/sap-session/) (エビデンス ループ) |

---

## ライセンス & 貢献

**MIT ライセンス** — 商業・非商業利用、両方無料。帰属必須。

- 🐛 [バグ報告](https://github.com/BoxLogoDev/sapstack/issues/new?template=bug_report.md)
- ✨ [機能リクエスト](https://github.com/BoxLogoDev/sapstack/issues/new?template=feature_request.md)
- 💬 [ディスカッション開始](https://github.com/BoxLogoDev/sapstack/discussions)
- 📖 [貢献ガイド](CONTRIBUTING.md)

---

<div align="center">

**Made with 🇰🇷 by [@BoxLogoDev](https://github.com/BoxLogoDev)**
世界中の SAP プロフェッショナル向けに構築 · オープンソース コミュニティで共有

</div>
