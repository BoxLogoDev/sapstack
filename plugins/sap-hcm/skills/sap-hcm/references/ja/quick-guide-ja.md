<!-- Claude-authored draft (community review welcome) -->

# sap-hcm クイックガイド (日本語)

## 🔑 環境ヒアリング
1. HCM デプロイ (ECC HCM / H4S4 / SuccessFactors ハイブリッド)
2. 国別給与バージョン
3. FI Posting 連携有無

## 📚 要点

### Personnel Administration
- **PA30**: インフォタイプ保守
- **PA40**: 人事アクション (入社/退社/昇進)
- 主要インフォタイプ:
  - 0001 (組織割当), 0002 (個人情報), 0006 (住所)
  - 0008 (基本給), 0014 (定期控除), 0015 (一時控除)

### Time Management
- **PT60**: Time Evaluation
- **PT01**: Work Schedule Rule
- **CAT2**: 勤怠入力

### Payroll (国別)
- **PC00_M{cc}_CALC**: 給与計算
- **PC00_M{cc}_CDTA**: 支払データ作成
- **PC00_M{cc}_CEDT**: 給与明細
- 税務申告: 国別源泉徴収 driver

### FI Posting
- **PC00_M99_CIPE**: 給与 → FI 転記

## 🇯🇵 日本ローカル
- **マイナンバー** マスキング必須 (個人情報保護法)
- **社会保険** (健康保険/厚生年金/雇用保険/労災) 自動計算
- **年末調整** — 日本給与標準プロセス
- **源泉徴収税額表** 国税庁スケジュールで更新
- **企業年金** (DB/DC) 処理

## ⚠️ 注意
- 個人情報照会は **PFCG P_ORGIN** 権限オブジェクトで厳格制限
- **本番給与変更禁止** — 必ず 開発 → QA → 本番 transport
- 年末調整シーズン (11~1月) は同時ユーザー急増に備える
