<!-- Claude-authored draft (community review welcome) -->

# sap-tr クイックガイド (日本語)

## 🔑 環境ヒアリング
1. SAP リリース + TRM (Treasury Risk Management) 有効化有無
2. 取引通貨 (JPY/USD ...)
3. 銀行インターフェース方式 (MT940 / H2H / SaaS)

## 📚 要点

### Cash Management
- **FF7A**: 資金ポジション
- **FF7B**: 流動性予測
- **FLQDB / FLQITEM**: Liquidity Item マスタ
- 銀行明細アップロード: **FF_5**, **FEBAN**

### Payment
- **F110**: 支払実行 (FI と共有)
- **DMEE**: 支払メディアフォーマット (銀行別)
- **FI12 / BAM (S/4)**: ハウスバンク管理

### 銀行連携
- 主要銀行は **独自ファームバンキング形式** を持つことが多い
- MT940 でない **XML/EDI** 利用が多い
- 全銀協 (全国銀行協会) 電子金融標準を参照
- 口座振替・バーチャル口座は別途カスタム多数

### TRM (オプション)
- **FTR_CREATE**: 金融商品取引作成
- デリバティブ (為替予約、IRS、CRS) 会計処理が複雑 — IFRS 開示注意

## 🇯🇵 日本ローカル
- **円流動性予測** が最も一般的な use case
- 外部為替レート (TTM/市場レート) 取込プロジェクト多数
- **外為法報告**: クロスボーダー取引報告義務 (閾値)

## ⚠️ 注意
- 本番環境ハウスバンク変更は必ず Transport + シミュレーション
- MT940 テスト環境必須 — 本番 first try 禁止
