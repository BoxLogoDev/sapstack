<!-- Claude-authored draft (community review welcome) -->

# sap-co クイックガイド (日本語)

## 🔑 環境ヒアリング
1. SAP リリース (ECC / S/4HANA) — S/4 は Account-based CO-PA がデフォルト
2. 会社コード + Controlling Area
3. 製品原価方式 (Standard / Actual / Mixed)
4. CO-PA タイプ (Costing-based / Account-based)

## 📚 モジュール要点

### CCA (Cost Center Accounting)
- **KS01/KS02**: 原価センタ作成/変更
- **KSU5**: Assessment (配賦)
- **KSV5**: Distribution (配分)
- Planning: **KP06** (原価要素別), **KP26** (活動タイプ)

### PCA (Profit Center Accounting)
- **KE51**: 利益センタ作成
- S/4HANA: PCA は新総勘定元帳と統合 — 独立 ledger ではない
- **KE5Z**: PCA 実績明細

### IO (Internal Order)
- **KO01**: 内部指図作成
- **KO88**: 決済 (Settlement)
- Real vs Statistical の区別に注意

### CO-PC (Product Costing)
- **CK11N**: 原価見積作成
- **CK24**: 価格更新 (標準原価反映)
- **KKS1/KKS2**: 差異分析
- **CKMLCP** (S/4): 実際原価計算ラン

### CO-PA (Profitability Analysis)
- **KE30**: レポート実行
- S/4HANA: **Account-based CO-PA** がデフォルト — ACDOCA 活用
- ECC: Costing-based CO-PA は別テーブル (CE1~CE4)

## 🇯🇵 日本ローカル
- **管理会計 + 税務調整** が同時要求 (大企業特に)
- **標準原価計算** が月次決算クリティカルパス — CK24 タイミング重要
- **材料費変動**: 原材料の為替変動大 → Actual Costing 検討

## 🤖 関連コマンド
- `/sap-fi-closing` (CO は FI 決算に依存)

## 📖 参照
- `../period-end.md`
