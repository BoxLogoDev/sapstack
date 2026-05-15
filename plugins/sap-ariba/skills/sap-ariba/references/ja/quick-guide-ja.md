<!-- Claude-authored draft (community review welcome) -->

# sap-ariba クイックガイド (日本語)

> SAP Ariba — グローバル調達クラウド。Sourcing · Contracts · Procurement · Network (サプライヤ協業)。

## 🔑 環境ヒアリング

1. **Ariba エディション** — Sourcing / Procurement / SLP / Network?
2. **S/4 連携** — CIG (Cloud Integration Gateway)
3. **サプライヤエコシステム** — Ariba Network 接続サプライヤ数
4. **シナリオ** — ソーシングイベント / 契約 / PR-to-PO / Network 通信

## 📚 モジュール

| モジュール | 用途 |
|---|---|
| **Sourcing** | 戦略調達 — RFI/RFP/RFQ + e-Auction |
| **Contracts** | 契約管理 — template·redline·更新 |
| **Procurement** | 購買 — catalog·PR·PO·invoice |
| **SLP** | サプライヤライフサイクル — 適格性·リスク |
| **Spend Analysis** | 支出分類·削減追跡 |
| **Network** | サプライヤ協業 — 文書交換·ステータス |

## 🇯🇵 日本ローカル

### 調達フロー
```
S/4 PR (ME51N) → Ariba ソーシング (戦略カテゴリ)
   → RFx 送信 → 入札 → 落札
   → Ariba Contract 作成
   → カタログ登録 → ユーザー購買
   → S/4 PO (ME21N) → GR/IV → 支払
```

### よくあるパターン
- **国内サプライヤ**: Network 加入率低 → 段階的 onboarding
- **グローバルグループ**: 本社 Ariba + 子会社 → 共通カタログ/契約
- **公共入札**: 政府ポータル優先 (Ariba は民間)

### ローカル統合の論点
- **消費税**: 日本税コード → Ariba tax mapping
- **法人番号**: Ariba サプライヤマスタにカスタム項目追加
- **銀行/支払**: 全銀フォーマット → DMEE Japan 形式

## 🚨 よくある問題

### 「サプライヤが RFx を受け取れない」
- ANID (Ariba Network ID) 確認 — onboarding 済みか?
- メール到達確認 (迷惑メール)
- Network 接続正常 (サプライヤ側ログイン)

### 「PR が承認されない」
- Approver delegation 確認
- 組織変更後 approver 自動更新されない

### 「PO がサプライヤに送信されない」
- サプライヤ Network 状態 (Trading Relationship)
- 送信方式 (Network / Email / cXML)
- メッセージキュー (CIG monitor)

### 「Invoice mismatch」
- 3-way match (PO-GR-Invoice)
- 税コード mapping
- 為替レート (外貨請求書)

## 🔧 統合診断

CIG (Cloud Integration Gateway) フロー:
1. S/4: ERP Integration Add-on for Ariba 有効
2. CIG Worker (Cloud Connector) GREEN
3. Ariba Realm 設定
4. メッセージ mapping (Material, Vendor, PR, PO)

障害時:
- CIG monitor → Messages → ステータス別分類
- S/4 SLG1 → Application Log → CIG namespace
- Ariba Network → Buyer login → System Updates

## 📚 参照

- `references/sourcing-event-types.md` — RFx タイプ (TBD)
- `references/network-onboarding.md` — サプライヤ onboarding (TBD)
- `../../../sap-mm/skills/sap-mm/SKILL.md` — MM 連携
- `../../../sap-fi/skills/sap-fi/SKILL.md` — 消費税·支払
- `../../../sap-integration-cloud/skills/sap-integration-cloud/SKILL.md` — CIG/CPI

## ⚠️ 対象外

- 非 Ariba 調達システム (SRM, Coupa, Jaggaer)
- 詳細在庫管理 (MM)
- 公共調達ポータル
