<!-- Claude-authored draft (community review welcome) -->

# sap-btp クイックガイド (日本語)

> SAP Business Technology Platform クイックリファレンス. 詳細は `SKILL.md` と `references/cap-patterns.md` を参照.

## 🔑 環境ヒアリング

1. BTP ランタイム (Cloud Foundry / Kyma / ABAP Environment)
2. リージョン (レイテンシ考慮)
3. サブスクリプション種別 (Free / Trial / Standard / Enterprise)

## 📚 主要ビルディングブロック

### CAP (Cloud Application Programming)
- **cds init** — プロジェクト初期化
- **db/schema.cds** — データモデル
- **srv/*.cds** — サービス定義
- **srv/*.js** — カスタムロジック
- Fiori Elements 自動生成

### Fiori / UI5
- **Launchpad** 構成
- **OData V2 / V4** サービスバインディング
- i18n リソースバンドル対応

### Integration Suite
- **iFlow 設計** — Open Connectors, Cloud Integration
- 主要 Adapter: HTTP/REST, SFTP, SOAP, OData, IDoc
- **API Management** — Rate limiting, ポリシー適用

### Security
- **XSUAA** — OAuth2 認証/認可
- **Destination Service** — バックエンドシステム接続
- **Cloud Connector** — オンプレミス接続

## 🇯🇵 日本ローカル

- **Tokyo リージョン** 可用性 — 国内利用者向けレイテンシ最適化
- **個人情報保護法** 改正対応 — 越境移転制限
- **LINE/Yahoo! ID 連携** — XSUAA カスタム IdP
- **国内決済 (NP 後払い / PayPay)** — Integration Suite iFlow カスタム

## 🤖 開発ワークフロー
1. `cds init` + ローカルモデリング
2. Git push → Cloud Foundry / Kyma デプロイ
3. Fiori Launchpad 登録
4. XSUAA role-collection マッピング

## ⚠️ 注意事項
- **Cloud Foundry Space** 分離 — Dev/Test/Prod
- **Destination** 認証情報は暗号化を有効化
- **XSUAA xs-security.json** 変更は再デプロイ必須

## 📖 参照
- `../cap-patterns.md`
- `../btp-security.md`
