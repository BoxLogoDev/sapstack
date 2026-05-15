<!-- Claude-authored draft (community review welcome) -->

# sap-ibp クイックガイド (日本語)

> SAP IBP (Integrated Business Planning) — S/4 時代のクラウドネイティブ需給計画プラットフォーム。APO 後継。

## 🔑 環境ヒアリング

1. **IBP リリース** — 四半期 (2402 / 2308 / 2305 など)
2. **デプロイ** — BTP SaaS のみ (オンプレなし)
3. **モジュール** — Demand / S&OP / Supply / Inventory / Response / Control Tower
4. **連携** — S/4HANA → CPI Integration Content、または BW
5. **Excel UI バージョン** — プランナー端末の IBP Excel Add-In
6. **Planning Area** — 標準 (SAP7, SAPIBP1) またはカスタム

## 📚 モジュール概要

| モジュール | 用途 |
|---|---|
| **Demand** | 統計予測 · デマンドセンシング (DS) |
| **S&OP** | 販売・業務 — 需要/供給/財務統合 |
| **Supply** | 多段サプライチェーン (heuristic/optimizer) |
| **Inventory** | 安全在庫 · 再発注最適化 |
| **Response & Supply** | ATP · 引当 · gating |
| **Control Tower** | KPI · 異常検知 |

## 🇯🇵 日本ローカル

### 需要予測パターン
- **年末年始・お盆・GW**: Time Event Master に登録
- **短消費期限品目**: 食品/化粧品/半導体 → 短 horizon
- **生産終了/新製品導入**: Product Lifecycle 明示 (NPI/EOL)
- **プロモーション影響分離**: baseline vs event lift

### 多工場運用
- 日本本社 + 海外子会社 → 多国モデル
- **通貨**: JPY + USD グローバル換算
- **移転価格**: S&OP に transfer pricing 統合

### よくあるシナリオ
- 「新モデル投入 → 部品サプライヤへ事前通知 (PIR リリース)」
- 「原材料輸入依存 → 為替シナリオ分析」
- 「短納期要求 → 在庫 vs 応答計画バランス」

## 🔧 主要 UI / T-code

IBP は BTP SaaS — SAP GUI T-code なし。代わりに:

| UI | 用途 |
|---|---|
| **IBP Web UI** | マスタデータ · 構成 · 実行 |
| **IBP Excel Add-In** | 日常計画 (プランナー) |
| **IBP App (Fiori)** | モバイル KPI |
| **SAP Cloud ALM** | モニタリング |

連携側 S/4 T-code:
- **MD01N/MD02** — MRP (PIR 受信後に実行)
- **CO40/CO41** — 製造オーダ変換 (PIR → Production Order)
- **VOFM/VFX3** — 受注 (Response & Supply 結果)

## 🚨 よくある問題

### 「予測が出ない」
- 原因: オペレータ定義漏れ、履歴不足、マスタマッピング誤り
- 診断:
  1. Planning Area Configuration → Forecast Model
  2. Planning Run ログ (Application Job Monitor)
  3. マスタマッピング (Product, Location)

### 「Excel UI が遅い」
- 原因: Planning View が大きすぎる、同時ユーザー多数
- 解決:
  1. Planning View 縮小 (≤ 10K cells)
  2. batch refresh 活用
  3. モジュール別にビュー分割

### 「CPI 連携が失敗」
- 原因: メッセージマッピング誤り、S/4 マスタ変更後の ID mismatch
- 診断: CPI tenant → Monitor → Messages → エラー分類
- 解決: IBP Configuration → External Codes 再マッピング

## 🔄 PP とのペア運用

S/4 PP が IBP の計画を実行:
- **PIR (Planned Independent Requirement)** — 需要 → S/4 PP へリリース
- **MRP Run (MD01N)** — PIR ベースの所要量計画
- **製造オーダ変換** — CO40/CO41

障害時にどの段で止まったか追跡:
1. IBP → PIR リリース正常? (IBP Application Job)
2. S/4 → MD63 で PIR 表示?
3. S/4 MRP 実行結果?

## 📚 参照

- `references/forecast-models.md` — 統計モデル比較 (TBD)
- `references/cpi-integration.md` — CPI メッセージマッピング (TBD)
- `../../../sap-pp/skills/sap-pp/SKILL.md` — PP 連携
- `../../../sap-integration-cloud/skills/sap-integration-cloud/SKILL.md` — CPI ガイド

## ⚠️ 対象外

- 短期生産スケジューリング (PP/DS, MES)
- 非 SAP ツール (Anaplan, o9, Kinaxis)
- APO 運用 (非推奨; APO ユーザーは IBP 移行ガイド参照)
