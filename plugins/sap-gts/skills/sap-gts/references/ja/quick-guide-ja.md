<!-- Claude-authored draft (community review welcome) -->

# sap-gts クイックガイド (日本語)

> SAP GTS (Global Trade Services) — 輸出入貿易コンプライアンス要約。

## 🔑 環境ヒアリング
1. GTS デプロイ (Standalone / Embedded in S/4)
2. 税関電子通関連携の有無
3. 取引タイプ (輸出 / 輸入 / 双方向)
4. FTA 対象国

## 📚 主要領域

### Compliance
- **SPL Screening** — 制裁対象者検索
- **Embargo Check** — 禁輸国
- **Legal Control** — 許可要否

### Customs
- **輸出申告** (Export Declaration)
- **輸入申告** (Import Declaration)
- **Transit** — 通過 / 積替

### Risk
- **L/C Management** — 信用状
- **Preference** — 原産地 / FTA
- **Restitution** — 輸出還付

## 🇯🇵 日本ローカル
- **NACCS** (輸出入・港湾関連情報処理システム — 税関電子通関)
- **HS コード** — 日本輸出統計品目番号
- **外為法 / 安全保障輸出管理** — リスト規制・キャッチオール
- **FTA/EPA ネットワーク** — 原産地証明 (多数の協定)

## 📋 T-code
- `/SAPSLL/*` ネームスペース
- 例: `/SAPSLL/MENU_LEGALR3`, `/SAPSLL/COMPLR3`, `/SAPSLL/PRODUCT_R3`

## ⚠️ 注意
- CA 証明書 (STRUST) 登録必須
- HS コード誤り → 関税追徴
- FTA ごとに原産地基準が異なる

## 🤖 関連
- `/plugins/sap-sd` — 輸出
- `/plugins/sap-mm` — 輸入
- `/agents/sap-integration-advisor.md` — 税関電子通関連携
