<!-- Claude-authored draft (community review welcome) -->

# sap-s4-migration クイックガイド (日本語)

> ECC → S/4HANA 移行のクイックリファレンス. 詳細は `SKILL.md` と `references/simplification-items.md` を参照.

## 🔑 環境ヒアリング

1. 現行 ECC バージョン (EhP) + DB + Unicode 状態
2. ターゲット S/4HANA リリース (2022/2023/2024)
3. デプロイモデル (オンプレ / RISE / Cloud PE)
4. 日本ローカライズ依存度

## 🛣 3 つの移行パス

| パス | 説明 | 適合度 |
|------|------|--------|
| **Brownfield (システム変換)** | 既存システムを in-place 変換 | プロセス維持の大企業 |
| **Greenfield (新規構築)** | 新規構築 + データ移行 | プロセス刷新の中堅 |
| **Selective (選択的移行)** | 組織/期間/機能を選択的に移行 | 多拠点段階移行 |

## ⚠️ 主要リスク

### Brownfield
- カスタムコード大量改修 (ACDOCA 対応)
- BSEG 直接参照の Z プログラム → ACDOCA への移行必須
- 日本 CVI カスタム再検証

### Greenfield
- データ移行範囲と戦略
- マスタデータ整備 (品質が低いほど移行困難)
- プロセス再設計の意思決定スピード

### Selective
- スコープ定義の複雑性
- 中間データの一貫性検証

## 📚 主要ツール

- **Readiness Check**: `/SDF/RC_START_CHECK` — Simplification Item 影響を自動分析
- **SUM (Software Update Manager)**: Brownfield 主要ツール
- **DMO (Database Migration Option)**: DB + SW 同時変換
- **SUMCT**: Unicode 変換 (ECC non-Unicode → Unicode)
- **SAP Note Analyzer**: ターゲットリリース Note 影響分析

## 🇯🇵 日本ローカルリスク

- **電子帳簿保存法 / インボイス制度** — 適格請求書要件 (2023年10月開始)
- **JP CVI Simplification Item** — 日本固有勘定科目構造変更
- **Country Version Japan Note** — 日本専用ローカリゼーション Note 多数
- **国内 SI 依存** — NTT データ・アクセンチュア・アビーム等の加速ツール

## ⚠️ 必須ステップ
1. **Readiness Check** 実行 (AS-IS 影響分析)
2. **Custom Code ATC** 実行 (`S4HANA_READINESS` バリアント)
3. **デュアル Cutover シミュレーション** — 最低 2 回
4. **業務ユーザー UAT** — STG 環境推奨

## 🤖 関連エージェント / コマンド
- `agents/sap-s4-migration-advisor.md`
- `/sap-s4-readiness --auto`

## 📖 参照
- `../simplification-items.md`
- `../atc-readiness-check.md`
