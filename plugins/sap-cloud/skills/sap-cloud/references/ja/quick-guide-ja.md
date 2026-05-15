<!-- Claude-authored draft (community review welcome) -->

# sap-cloud クイックガイド (日本語)

> SAP S/4HANA Cloud Public Edition (Cloud PE) — Clean Core 強制, Key User 拡張, 四半期リリース。

## 🔑 環境ヒアリング
1. **Cloud PE バージョン** — 2401/2402/2403/2405 (月/年リリース)
2. **Extension Tier** — Tier 1 (Key User) / Tier 2 (Side-by-Side BTP) / Tier 3 (On-Stack ABAP Cloud)
3. **デプロイ** — Cloud PE のみ (オンプレ SE38/SE80/SMOD/CMOD 禁止)
4. **Change Control** — Fit-to-Standard 段階 vs Operations 段階

## 📚 要点

### Clean Core 原則 (交渉不可)
- SAP 標準コード/テーブル修正不可
- Transport (TMS/tp) なし → Cloud ALM 直接アップロード (CSP)
- 拡張は 3-Tier モデルのみ

### Key User Extensibility (Tier 1)
- **Custom Fields**: Manage Your Solution → Custom Fields (即時有効)
- **Custom Logic**: ABAP Cloud (RAP) — Key User フレンドリー入口
- **Custom CDS Views**: 読取専用分析
- **Custom Business Objects**: RAP BO

### Fit-to-Standard
- 標準プロセスに適合 — gap のみ Tier 1/2/3 拡張
- ワークショップ → scope 決定 → CBC 構成

### Cloud ALM
- 実装/運用ライフサイクル (Solution Manager 後継)
- CSP (Custom Software Package) デプロイ経路

## 🇯🇵 日本ローカル
- **四半期リリース強制** — アップグレード回避不可; FSD 事前レビュー
- **ローカライズ** — 電子インボイス/国別 CVI が Cloud PE 標準 scope か確認
- **Clean Core 教育** — カスタム Z 開発から Key User 拡張へ移行

## 🚨 よくある問題

### 「標準 T-code がない」
- 原因: Cloud PE は SE38/SE80/SMOD/CMOD 禁止
- 解決: Key User Extensibility で代替 (Custom Logic/Fields)

### 「四半期リリース後カスタムが壊れる」
- 原因: deprecated API 使用
- 解決: FSD 事前レビュー + Q-system 回帰テスト

## ⚠️ 禁止事項
- ❌ オンプレ T-code 前提 (SE38/SE80/SMOD/CMOD/SE16N)
- ❌ 標準オブジェクト修正 (Clean Core 違反)
- ❌ 四半期リリース回避の試み

## 📖 関連
- `../../SKILL.md` — 詳細本文
- `../img/fit-to-standard.md` / `../img/key-user-extensibility.md`
- `sap-btp` — Tier 2 Side-by-Side
- `sap-s4-migration` — On-Prem → Cloud PE 移行
