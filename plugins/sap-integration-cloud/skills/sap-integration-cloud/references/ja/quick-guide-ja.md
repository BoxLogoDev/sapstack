<!-- Claude-authored draft (community review welcome) -->

# sap-integration-cloud クイックガイド (日本語)

> SAP BTP 統合プラットフォーム — Integration Suite (CPI) + Datasphere + API Management + Event Mesh + Open Connectors。

## 🔑 環境ヒアリング

1. **統合範囲** — CPI / Datasphere / API Mgmt / Event Mesh?
2. **Source/Target** — S/4 / SuccessFactors / Ariba / 外部システム?
3. **プロトコル** — REST / SOAP / OData / IDoc / SFTP / JDBC?
4. **認証** — OAuth / Basic / Cert / SAML?

## 📚 主要コンポーネント

### Integration Suite
| コンポーネント | 用途 |
|---|---|
| **CPI** | クラウド統合 (旧 HCI) — iFlow メッセージルーティング/変換 |
| **API Mgmt** | ゲートウェイ · throttling · セキュリティ |
| **Event Mesh** | pub/sub メッセージング |
| **Open Connectors** | 非 SAP プリビルトコネクタ |

### Datasphere
- 旧 DWC (Data Warehouse Cloud)
- Space (隔離) + Local Table + View + Federation
- Data Provisioning Agent でオンプレ接続

## 🇯🇵 日本ローカル

### よくあるパターン

#### 政府システム連携
- **電子インボイス**: CPI iFlow + 認証局証明書
- **社会保険 EDI**: SFTP + 政府標準
- **国税庁ポータル**: 専用 API + 認証

#### 銀行連携
- **MT940 パース**: 全銀標準 + 銀行別 dialect
- **振込ファイル生成**: DMEE Japan 形式 + 銀行コード

#### 社内統合
- **本社 ↔ 子会社**: 多国データ統合 (Datasphere)
- **レガシー ERP ↔ S/4**: 移行期 hybrid

### ネットワーク分離環境
- Cloud Connector + DMZ Proxy
- 外部通信はセキュリティゲートウェイ経由
- 証明書: STRUST (S/4) + BTP Keystore

## 🚨 よくある問題

### 「iFlow がメッセージを処理しない」
- Sender adapter 状態 (REST·SFTP·OData)
- Polling スケジュール
- 証明書期限切れ
- メッセージ形式 (schema 不一致)
→ Monitor → Messages → ステータス別確認

### 「マッピングエラー」
- Source/Target schema 不一致
- 必須項目欠落
- 型変換 (String → Integer)
- Groovy script 構文

### 「メモリ超過」
- 大 payload (10MB+ 単一メッセージ)
- Splitter 追加推奨
- streaming モード活用

### 「証明書期限切れ」
- BTP Keystore で期限間近を特定
- 30 日前に更新手続き開始
- 国内認証局の専用手順

### 「Cloud Connector が接続できない」
- アウトバウンド 443 ポートファイアウォール
- リージョン endpoint (kr/eu/us)
- Virtual Host マッピング (internal vs external)

## 🔧 推奨パターン

### S/4 → SuccessFactors 同期
1. S/4 ABAP CDS view 公開
2. CPI iFlow: S/4 OData → mapping → SFSF OData
3. SFSF write API
4. Error → email/Slack 通知 + Reprocess

### MT940 銀行ファイルパース
1. SFTP polling (Sender adapter)
2. MT940 → XML (Standard adapter)
3. Mapping → S/4 FF.5 input
4. RFC call to S/4

### Datasphere → SAC
1. Datasphere Space で分析モデル設計
2. SAC Live Connection
3. Story でモデル consume

## 📚 参照

- `references/iflow-patterns.md` — iFlow デザインパターン (TBD)
- `references/datasphere-modeling.md` — Datasphere モデリング (TBD)
- `../../../sap-btp/skills/sap-btp/SKILL.md` — BTP 環境
- `../../../sap-sac/skills/sap-sac/SKILL.md` — SAC 連携
- `../../../sap-sfsf/skills/sap-sfsf/SKILL.md` — SFSF 統合

## ⚠️ 対象外

- BW/4HANA オンプレデータウェアハウス (BW)
- 非 SAP iPaaS (Boomi, MuleSoft, Workato)
- PO/PI (旧 SAP 統合 — 非推奨; CPI へ移行)
