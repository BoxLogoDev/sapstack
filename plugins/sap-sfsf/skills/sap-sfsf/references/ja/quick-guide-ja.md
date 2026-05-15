<!-- Claude-authored draft (community review welcome) -->

# sap-sfsf クイックガイド (日本語)

## 🔑 環境ヒアリング
1. SuccessFactors モジュール (EC / ECP / Recruiting / LMS / Performance)
2. データセンター (リージョン — 例 APJ/EU/US)
3. ECC/H4S4 連携 (ハイブリッド / フルクラウド)

## 📚 要点

### Employee Central (EC)
- **Admin Center → Manage Employee Files**
- Foundation Objects: Legal Entity, Business Unit, Division, Department
- MDF (Metadata Framework): カスタムオブジェクト作成
- Business Rules: 宣言的ロジック (workflow トリガ, 値計算)

### Role-Based Permissions (RBP)
- **Manage Permission Roles**
- **Permission Groups** — 動的グループ (クエリベース)
- 大企業特性: 階層型承認 (CEO→本部長→チームリーダ→メンバ) が複雑

### ECP (Employee Central Payroll)
- 国別 HR 給与ロジックをクラウドホストで実行
- H4S4 オンプレ給与とコードベース共有

### Recruiting
- Job Requisition Templates
- Application Form Templates
- Candidate Data Model

### Integration
- **Integration Center** — SFSF 内蔵統合ツール
- **SAP Cloud Integration (CPI)** — BTP ベース
- OData API (Query + Upsert)

## 🇯🇵 日本ローカル
- **マイナンバー** — リージョン DC 保存可否は法務レビュー必要
- **社会保険** — ECP へルーティングした場合のみ計算
- **ローカライズ UI** — SFSF 標準 i18n サポート
- **年末調整** — ECP またはオンプレ H4S4 で処理 (SFSF 自体は計算しない)

## ⚠️ 注意
- **Admin Center 権限変更** — Preview instance で先にテスト
- **データモデル変更** (XML import/export) — バックアップ必須
- ローカライズ項目 — Picklist 活用 (ハードコード禁止)

## 📖 移行ガイド
`../migration-path.md` 参照。
