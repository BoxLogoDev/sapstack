<!-- Claude-authored draft (community review welcome) -->

# sap-sd クイックガイド (日本語)

## 🔑 環境ヒアリング
1. 販売組織 / 流通チャネル / 事業部 (ユーザー提供)
2. 与信管理方式 (ECC FD32 / S/4 FSCM UKM)
3. 収益認識 (Revenue Recognition) 方式

## 📚 要点

### Order-to-Cash
- **VA01/VA02**: 受注
- **VL01N**: 出荷 (Delivery)
- **VF01**: 請求 (Billing)
- **VF04**: 請求 Due List
- **VA05**: 受注リスト

### Pricing
- **V/08**: 価格設定手順
- **VK11/VK12**: 条件レコード
- **VOFM**: ルーチン (価格決定ロジック)

### Credit Management
- **ECC**: FD32 (与信限度) + VKM1 (受注ブロック) + VKM3 (出荷ブロック)
- **S/4 FSCM**: UKM_BP (与信セグメント) + rule-based check
- **FD33**: 限度照会

### Billing
- **VF03**: 請求伝票照会
- **VF11**: 請求取消
- Copy Control: **VTFA** (Order→Billing), **VTFL** (Delivery→Billing)

## 🇯🇵 日本ローカル
- **適格請求書 (インボイス制度) 発行** — VF01 転記時に自動連携 (DRC または 3rd-party)
- **税抜/税込** 混在 — B2C は税込価格表示が法定の場合あり
- **支払通知書 (買手発行請求)** プロセス対応はカスタム

## ⚠️ 注意
- VF01 取消 (VF11) は **条件が厳格** — 買手発行請求との競合に注意
- 与信は **本社保証** ケース多 (大企業) → 与信セグメント複雑
