<div align="center">

# 🏛 sapstack

<img src="docs/assets/mascot/standard-en.png" alt="スタンダードさん — sapstack マスコット" width="280" />

_「SAP では標準仕様なのでできません。」 — スタンダードさん（[ブランドガイド](MASCOT.md)）_

### SAP 運用のための AI デスクトップ

**インストールして、そのまま質問 — 標準プロセスから自社カスタム（Z/Y）プログラムまで。**

[![npm](https://img.shields.io/npm/v/@boxlogodev/sapstack-mcp?label=npm&color=cb3837)](https://www.npmjs.com/package/@boxlogodev/sapstack-mcp)
[![release](https://img.shields.io/github/v/release/BoxLogoDev/sapstack?label=release&color=2ea043)](https://github.com/BoxLogoDev/sapstack/releases)
[![license](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![languages](https://img.shields.io/badge/languages-6-orange)](#)

**Windows デスクトップアプリ v2.6.0 · 24 プラグイン · 21 エージェント · 23 コマンド · CBO スナップショット · 閉域網対応 · 6 言語 · コンプライアンス対応**

🌐 [🇰🇷 한국어](README.md) · [🇬🇧 English](README.en.md) · [🇨🇳 中文](README.zh.md) · [🇯🇵 日本語](README.ja.md) · [🇩🇪 Deutsch](README.de.md) · [🇻🇳 Tiếng Việt](README.vi.md)

</div>

---

## sapstack とは？

**sapstack** は、SAP の業務ユーザーとコンサルタントのための **SAP 専用 AI デスクトップアプリ**です。
ADT も開発権限も自分の API キーも不要 — アプリを開いて質問を入力するだけ。

```
「F110 を実行するとエラーになります」   → 4 ターンの Evidence Loop 診断（仮説→証拠→検証→ロールバック）
「月次決算の手順を教えてください」       → 決算シーケンス + T-code／メニューパス
「ZFI0042 は何をするプログラムですか？」 → 自社カスタムコード（CBO スナップショット）を読んで業務言語で説明
```

土台には SAP 運用の全ライフサイクル（**Configure → Implement → Operate → Diagnose → Optimize**）を
カバーする 24 モジュールの知識・IMG ガイド・ベストプラクティス・コンプライアンスがあり、
同じ知識を Claude Code・MCP・VS Code からも使えます
（→ [開発者・パワーユーザー向け統合](#-開発者パワーユーザー向け統合)）。

> 意思決定の原則は [**ETHOS.md**](ETHOS.md) — Ground-truth · 証拠優先 · ハードコーディング禁止 · ECC≠S/4 · 現場用語 · オペレーターが決める。

---

## 👥 こんな方へ

| あなたは… | sapstack デスクトップはこう役立つ |
|---|---|
| **SAP 業務ユーザー**（決算に追われ、開発権限なし） | ホーム画面に質問を入力するだけ — 障害は **4 ターンの Evidence Loop** へ、事実確認は即答へ自動ルーティング。**自社の Z/Y プログラム**もスナップショット基準で説明（推測禁止、基準日を必ず明示）。 |
| **管理者 / IT 担当** | `provision.yaml` 1 つで**設定レス展開** — ユーザーは ZIP を解凍して exe を実行するだけ。CBO スナップショットは夜間自動収集 → 共有フォルダ公開 → アプリが自動更新。閉域網は同梱ローカル LLM で。 |
| **SAP コンサルタント / パートナー** | 24 モジュールの知識 + IMG 構成 + 3 層ベストプラクティス + コンプライアンスをデスクトップと AI ツールの両方で — クライアント環境ごとに素早く適用。 |

---

## 🖥 デスクトップができること

### 💬 質問ひとつで始まる
ホーム画面に入力するだけ — 障害・エラーは **Evidence Loop**
（INTAKE→HYPOTHESIS→COLLECT→VERIFY、反証条件とロールバックのペア必須）へ、
事実確認は **Quick Advisory** へ自動分岐。質問例チップで最初の質問を写せます。

### 🗂 CBO スナップショット — 自社カスタムコードに質問
管理者がカスタム ABAP（Z/Y）ソースをスナップショットとしてエクスポートすると、アプリは
**SAP に接続せず**にそのコピーを読み、「このプログラムは何をするもの？」に業務言語で答えます。
配布チャネルは 3 つ — 配布 ZIP 同梱 · 共有フォルダ自動更新 · 設定の「ZIP からインポート」。
すべての回答に**スナップショット基準日**を明示。→ [docs/cbo-snapshot.md](docs/cbo-snapshot.md)

### 📦 設定レス大量展開（管理者プロビジョニング）
`provision.yaml` を exe の隣に同梱すれば、初回起動時に LLM 接続（会社キー・ゲートウェイ・
ローカルモデル）・SAP 環境・業務ユーザーモードが自動設定 — **ユーザーは設定画面を一切見ません。**
キーのローテーションは version を上げて再配布するだけ。→ [docs/provisioning.md](docs/provisioning.md)

### 🙋 業務ユーザーモード
質問中心のシンプルなホーム（カード 3 枚 + 質問例チップ）、開発者向けメニュー非表示、
ツール承認プロンプトなし（既定で読み取り専用）。設定 → 外観で切り替え。

### 🔒 閉域網（ネットワーク分離）対応
ローカル推論エンジン `llama-server`（llama.cpp）を同梱 — GGUF モデルパックを USB で持ち込めば
インターネットなしで動作。`air_gapped: true` ならクラッシュレポートと更新ポーリングも遮断。
→ [docs/compliance/air-gapped-deployment.md](docs/compliance/air-gapped-deployment.md)

### 📚 土台の SAP 知識（すべての回答の根拠）
- **24 モジュール**：FI · CO · TR · MM · SD · PP · HCM · PM · QM · WM · EWM · ABAP · BASIS · BTP · SFSF · S4Mig · GTS · BC · Cloud PE · Session ほか
- **21 エージェント**：16 モジュールコンサルタント + ABAP developer + Integration/S4 migration advisor + SAP tutor（新人教育） + **CBO explainer**（業務ユーザー向けカスタムコード解説）
- **IMG 構成フレームワーク**：SPRO ベースのガイド 76 本（ECC vs S/4 の差異・検証方法つき）
- **3 層ベストプラクティス**：Operational · Period-End · Governance
- **6 言語**：한국어 · English · 中文 · 日本語 · Deutsch · Tiếng Việt（24 モジュール × 5 言語 quick-guide）
- **コンプライアンス**：K-SOX · SOC 2 · ISO 27001 · GDPR · PII 自動マスキング

---

## ✅ 実際の使用例

**シナリオ 1**：_「MIGO で入庫転記が何度やっても失敗します。」_ — Evidence Loop は断定せず証拠で絞り込みます。

```
Turn 1 · INTAKE      まず環境確認：ECC(EhP?) / S/4(リリース?)、移動タイプ(MvT)、
                     エラーメッセージ全文(M7 xxx)。
Turn 2 · HYPOTHESIS  仮説 A：転記期間未オープン — 確認：MMRV の現行期間は転記日と
                     一致するか？（一致すれば A を棄却）
                     仮説 B：移動タイプ／勘定決定(OBYC)の問題 — 確認：…
Turn 3 · COLLECT     （オペレーターが MMRV を照会して結果を共有）
Turn 4 · VERIFY      期間不一致を確定 → Fix：MMPV で期間繰越（まずシミュレーション、
                     Transport 経由）。ロールバック計画 + 関連 SAP Note のポインタつき。
```

**シナリオ 2**：_「ZFI0042 は何をするもの？」_ — CBO スナップショット（架空の例）からこの形式で答えます：

```
一行サマリ   （スナップショットのソースヘッダ・カタログから導いたプログラムの目的）
どこで使うか  実行画面・ボタン機能（T-code マッピングがスナップショット範囲外ならその旨明示）
処理フロー   権限チェック → 照会 → 一覧／出力 など、ソースから読み取った実際の流れ
注意点       業務ユーザーが目にするメッセージと対処（推測禁止 — スナップショットに
             なければ「ない」と答える）
基準日       この回答は YYYY-MM-DD スナップショット基準です。
```

> どの仮説にも**反証基準**、どの修正にも**ロールバック計画**。本番を直接変更せず案内のみ — 決めるのはオペレーターです。（→ [ETHOS](ETHOS.md)）

---

## クイックスタート

### 🖥 デスクトップ（推奨 — 業務ユーザー・コンサルタント）

**配布 ZIP を受け取った場合**：解凍して `sapstack-Desktop-*-Portable-x64.exe` を実行 — 以上。
（管理者が provision.yaml を同梱していれば、設定画面なしですぐ質問できます。）

**自分でインストール**：[GitHub Releases](https://github.com/BoxLogoDev/sapstack/releases) から
`sapstack-Desktop-<バージョン>-Setup-x64.exe`（NSIS、per-user、管理者権限不要）または Portable 版を
取得。Git for Windows（Git Bash）必須、約 249MB（v2.4.1 実測）。
→ インストール：[docs/desktop-install.md](docs/desktop-install.md) · 配布パッケージング：[docs/provisioning.md](docs/provisioning.md)

**SAP データの 3 経路** — いずれも SAP を変更しません：
① 既定はコピペ ② ADT 読み取り専用ブリッジ（設定 > SAP 接続、[docs/adt-bridge.md](docs/adt-bridge.md)）
③ CBO スナップショット（オフラインコピー、[docs/cbo-snapshot.md](docs/cbo-snapshot.md)）

### ⚡ 5 分オンボーディング（リポジトリベース）
```bash
git clone https://github.com/BoxLogoDev/sapstack.git && cd sapstack
./setup.sh        # Windows: ./setup.ps1   ·   チェックのみ: ./setup.sh --check
```
詳細：[docs/quickstart-5min.md](docs/quickstart-5min.md)

---

## 🔧 開発者・パワーユーザー向け統合

同じ SAP 知識を使う別の入口です。

### Claude Code
```bash
/plugin marketplace add https://github.com/BoxLogoDev/sapstack
/plugin install sap-fi@sapstack sap-session@sapstack
```

### NPM（MCP サーバー）— 23 ツール + 12 プロンプト + 9 リソース
```bash
npm install -g @boxlogodev/sapstack-mcp
sapstack-mcp --sessions-dir ~/.sapstack/sessions
```

### VS Code 拡張
VS Code Marketplace で「sapstack」を検索 → Install ·（または [GitHub Release](https://github.com/BoxLogoDev/sapstack/releases) の `.vsix` を直接インストール）

### Amazon Kiro IDE
```bash
git submodule add https://github.com/BoxLogoDev/sapstack sapstack
cp sapstack/.kiro/settings/mcp.json .kiro/settings/
cp sapstack/.kiro/steering/*.md .kiro/steering/
```

### その他（Codex / Copilot / Cursor / Continue.dev / Aider）
リポジトリを clone → 自動認識。詳細：[docs/multi-ai-compatibility.md](docs/multi-ai-compatibility.md)

### 🧭 Golden Path — どの状況で何を使うか
全体ガイド：[docs/workflow.md](docs/workflow.md)

| やりたいこと | 行き先 |
|---|---|
| 素早い事実確認 | **Quick Advisory** — そのまま質問 |
| 障害診断 | **Evidence Loop**（4 ターン）→ モジュールコンサルタント / 症状コマンド |
| カスタム（Z/Y）プログラムを知りたい | デスクトップのホームでそのまま質問 / `/sap-cbo-explain` |
| モジュールが分からない | `sap-tutor`（分類して専門家へ委任） |
| 設定（IMG）の問題 | `/sap-img-guide` |
| 期末決算 | `/sap-fi-closing` → `/sap-quarter-close` → `/sap-year-end` |

---

## Universal Rules

1. **ハードコーディング絶対禁止** — 会社コード・G/L 勘定・組織単位の固定値使用禁止
2. **環境インテーク優先** — SAP リリース・デプロイモデル・会社コードの確認が先
3. **ECC vs S/4HANA を明示区別** — バージョン別の動作差異を明確に
4. **Transport 必須** — 本番環境の変更は常に Transport 経由
5. **シミュレーション先行** — AFAB、F.13、FAGL_FC_VAL、MR11、F110 など
6. **SE16N 編集禁止** — 本番データの直接修正は推奨しない
7. **T-code + SPRO パス** — すべての対処に両方を提示
8. **韓国語は現場語優先** — 「코스트 센터 (원가센터, KOSTL)」の二重表記

> ルールの*なぜ*は [**ETHOS.md**](ETHOS.md)、運用ルール全体は [CLAUDE.md](CLAUDE.md) を参照。

---

## 学習パス

| レベル | パス |
|------|------|
| 🆕 **入門** | [チュートリアル（15 分）](docs/tutorial.md) → [FAQ](docs/faq.md) |
| 🖥 **デスクトップ運用** | [インストール](docs/desktop-install.md) → [プロビジョニング](docs/provisioning.md) → [CBO スナップショット](docs/cbo-snapshot.md) |
| 📘 **実践** | [シナリオ 5 本](docs/scenarios/) → [用語集](docs/glossary.md) |
| 🧭 **ワークフロー** | [Golden Path](docs/workflow.md) → [完成度ギャップ分析](docs/gstack-gap-analysis.md) |
| 🏗 **深掘り** | [アーキテクチャ](docs/architecture.md) → [Multi-AI ガイド](docs/multi-ai-compatibility.md) |
| 🔒 **セキュリティ** | [SECURITY.md](SECURITY.md) → [コンプライアンス](docs/compliance/) |
| 🤝 **コントリビュート** | [CONTRIBUTING](CONTRIBUTING.md) → [ロードマップ](docs/roadmap.md) |

---

## データ資産

| 資産 | 数量 | ファイル |
|------|------|------|
| 確定 T-code | 472 | [`data/tcodes.yaml`](data/tcodes.yaml) |
| 自然言語シンプトムインデックス | 90（6 言語） | [`data/symptom-index.yaml`](data/symptom-index.yaml) |
| 確定 SAP Note/KBA | 112 | [`data/sap-notes.yaml`](data/sap-notes.yaml) |
| 多言語シノニム | 80+ 用語 × 6 言語 | [`data/synonyms.yaml`](data/synonyms.yaml) |
| 期末決算シーケンス | 24 ステップ | [`data/period-end-sequence.yaml`](data/period-end-sequence.yaml) |
| 業種マトリクス | 7 業種 | [`data/industry-matrix.yaml`](data/industry-matrix.yaml) |

---

## プラグインカタログ

| 領域 | プラグイン |
|------|----------|
| 💰 **財務** | [sap-fi](plugins/sap-fi/) · [sap-co](plugins/sap-co/) · [sap-tr](plugins/sap-tr/) |
| 📦 **ロジスティクス** | [sap-mm](plugins/sap-mm/) · [sap-sd](plugins/sap-sd/) · [sap-pp](plugins/sap-pp/) · [sap-pm](plugins/sap-pm/) · [sap-qm](plugins/sap-qm/) · [sap-wm](plugins/sap-wm/) · [sap-ewm](plugins/sap-ewm/) |
| 👥 **人事** | [sap-hcm](plugins/sap-hcm/) · [sap-sfsf](plugins/sap-sfsf/) |
| 💻 **技術** | [sap-abap](plugins/sap-abap/) · [sap-s4-migration](plugins/sap-s4-migration/) · [sap-btp](plugins/sap-btp/) · [sap-basis](plugins/sap-basis/) · [sap-cloud](plugins/sap-cloud/) |
| ☁️ **クラウド/統合** | [sap-ibp](plugins/sap-ibp/) · [sap-sac](plugins/sap-sac/) · [sap-ariba](plugins/sap-ariba/) · [sap-integration-cloud](plugins/sap-integration-cloud/) |
| 🇰🇷 **韓国/グローバル** | [sap-bc](plugins/sap-bc/) · [sap-gts](plugins/sap-gts/) |
| 🔁 **メタ** | [sap-session](plugins/sap-session/)（Evidence Loop） |

---

## 多言語レビューへの貢献

5 言語（en/zh/ja/de/vi）の quick-guide は **Claude 作成のドラフト**です。各言語のネイティブスピーカー + SAP ドメイン専門家によるレビューを歓迎します。

- 手順・評価基準・PR 形式：**[docs/TRANSLATION-REVIEW.md](docs/TRANSLATION-REVIEW.md)**
- フィードバック：[Translation Feedback イシュー](https://github.com/BoxLogoDev/sapstack/issues/new?template=translation-feedback.md)
- T-code/Note 番号は翻訳対象外（原文のまま）

---

## ライセンス & コントリビュート

**MIT License** — 商用・非商用とも自由に利用可。著作権表記は維持。

- 🐛 [バグ報告](https://github.com/BoxLogoDev/sapstack/issues/new?template=bug_report.md)
- ✨ [機能リクエスト](https://github.com/BoxLogoDev/sapstack/issues/new?template=feature_request.md)
- 💬 [ディスカッション](https://github.com/BoxLogoDev/sapstack/discussions)
- 📖 [コントリビュートガイド](CONTRIBUTING.md)

---

<div align="center">

**Made with 🇰🇷 by [@BoxLogoDev](https://github.com/BoxLogoDev)**
Built for Korean SAP consultants · Shared with the global community

</div>
