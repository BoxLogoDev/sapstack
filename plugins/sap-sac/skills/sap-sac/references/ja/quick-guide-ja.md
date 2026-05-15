<!-- Claude-authored draft (community review welcome) -->

# sap-sac クイックガイド (日本語)

> SAP Analytics Cloud — クラウド BI/計画/予測統合プラットフォーム。

## 🔑 環境ヒアリング

1. **テナントリージョン** — kr/eu/us/ap どこ?
2. **エディション** — BI / Planning / Smart Predict?
3. **接続方式** — Live (HANA · S4 CDS) vs Import (Datasphere · ファイル)
4. **データソース** — S/4HANA / BW / Datasphere / 外部 DB
5. **ユースケース** — Story / Analytic App / Planning / Predict

## 📚 主要コンセプト

| 項目 | 意味 |
|---|---|
| Live Connection | リアルタイムクエリ (データコピーなし) |
| Import Connection | 定期ロード (コピー保持) |
| Story | ダッシュボード (ドラッグ&ドロップ) |
| Analytic Application | スクリプト可能アプリ (JS) |
| Planning Model | 入力可能 · バージョン · 配分 |
| Predictive Model | 回帰 · 分類 · 時系列 |

## 🇯🇵 日本ローカル

### よくあるシナリオ
- **役員ダッシュボード**: KPI カード + drill-down (月/四半期/年)
- **財務報告**: Planning Model + S/4 actuals + 予算比較
- **営業分析**: Geo Map + 顧客·製品マトリクス
- **需要予測**: Smart Predict + IBP 連携
- **公共報告**: データ所在地/ネットワーク分離考慮, データマスキング

### ローカライズ UI
- Story タイトル/ラベル/テキストはローカライズ可
- Dimension name は英語推奨 (クロステナント互換)
- 日付形式: 地域標準 (YYYY-MM-DD)

## 🚨 よくある問題

### 「Story 画面が空」
- 権限確認: Story → Sharing → Role
- モデル権限確認: Modeler permission
- Filter 確認: メンバー変更されたか

### 「S/4 の数字と合わない」
- Live vs Import 差異 (cache タイミング)
- 通貨/単位換算
- 会計年度バリアント (K4 vs K1)

### 「Live 接続が失敗」
- Cloud Connector GREEN
- TLS 証明書 (STRUST) 期限切れ
- BTP destination 設定

### 「Planning が保存できない」
- バージョン状態 (Public Locked?)
- Dimension Lock 設定
- Write 権限不足

## 🔧 推奨パターン

### S/4 → SAC 連携
1. S/4: Released CDS View 公開 (`I_*`)
2. BTP Cloud Connector 設定
3. SAC: Live Connection → Cloud Connector
4. Story で CDS View → Model 作成

### データモデリング
- Time Dimension: 四半期/月/週/日 hierarchy
- Currency/Unit conversion
- Account dimension: 符号規則 (Income vs Expense)

## 📚 参照

- `references/connectivity-guide.md` — 接続パターン (TBD)
- `references/planning-best-practices.md` — Planning ベストプラクティス (TBD)
- `../../../sap-btp/skills/sap-btp/SKILL.md` — BTP 環境
- `../../../sap-cloud/skills/sap-cloud/SKILL.md` — Cloud PE 連携

## ⚠️ 対象外

- BW データフロー設計 (BW/4HANA)
- Datasphere モデリング (sap-integration-cloud)
- 非 SAC BI ツール (Tableau, Power BI)
