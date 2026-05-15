<!-- Claude-authored draft (community review welcome) -->

# sap-bc クイックガイド (日本語)

> ローカル文脈 BC コンサルタント観点。グローバル Basis トピック → `sap-basis` 参照。

## 🔑 環境ヒアリング (ローカル優先)
1. デプロイ形態: On-Prem / RISE / ネットワーク分離 (閉域)
2. ローカライズ: 国別 CVI / 電子インボイス / e-Document
3. DB: HANA (ロケール設定) / Oracle (NLS_LANG)
4. SAPGUI 言語: ローカル / EN / 混在

## 🇯🇵 日本ローカル BC 問題 Top 10

### 1. 文字コード dump (CONVT_CODEPAGE)
- 症状: `CONVT_CODEPAGE` ABAP dump
- 原因: Unicode 変換失敗 (レガシー non-Unicode)
- 解決: SNOTE 2452523 系列, `NLS_LANG=*.AL32UTF8`

### 2. STMS import エラー 8 (日本語ショートテキスト)
- 原因: 日本語オブジェクト名で tp パーサ誤動作
- ログ: `/usr/sap/trans/log/ULOG`, `ALOG`
- 解決: tp バージョンアップ, Unicode tp 変換

### 3. 電子インボイス連携 (STRUST)
- **国内 CA 証明書** 登録
- ルート CA: 国内認証機関
- **TLS 1.2+ 必須** (国内セキュリティ指針)
- Web Dispatcher `ssl/ciphersuites` 強化

### 4. ネットワーク分離環境 Kernel アップグレード
1. 外部網で SAP Launchpad ダウンロード
2. SHA256 ハッシュ検証
3. 情報セキュリティチーム承認
4. 暗号化 USB 持込
5. 内部網 `/usr/sap/<SID>/SYS/exe/` 置換

### 5. SAPGUI 文字化け
- SAPGUI 770+ パッチ
- Windows 「Unicode 非対応プログラム言語」
- `NLSPATH` 確認

### 6. SOX 権限再認証
- 四半期 PFCG ロールレビュー監査
- SUIM / S_BCE_68001398
- SoD マトリクス管理 (FI/MM)

### 7. 国内 SAP サポート (OSS)
- 国内 SAP サポート (現地語) 起票
- ローカライズ問題は国内サポート経由
- Priority Very High (本番停止) → 24/7

### 8. HANA ロケール
- 適切な `COLLATION`
- CDS `@Semantics.text.languageCode`
- SAPGUI vs Fiori レンダリング差異

### 9. ChaRM ワークフロー
- Urgent → Normal change は内部統制文書必要
- 承認経路を国内組織図にマッピング
- 週末/祝日の自動承認バイパス方針

### 10. 国内 SaaS 連携
- 国内会計 SaaS — レガシーコネクタ多数
- 顧客セキュリティ方針に応じたファイアウォール/IP ホワイトリスト
- Proxy 経由時 SMICM ログ確認

## 📚 よく使う T-code
| T-code | 用途 |
|--------|------|
| STRUST | SSL 証明書管理 |
| SMICM | ICM (HTTP) モニタ |
| STMS | Transport 管理 |
| PFCG | Role 管理 |
| SUIM | 権限情報システム |
| SU53 | 権限失敗追跡 |
| SM59 | RFC Destination |
| SM21 | System Log |
| ST22 | dump 分析 |
| RZ20 | CCMS (モニタリング) |

## ⚠️ 禁止事項
- ❌ 本番 SE16N 直接編集 (SOX 違反)
- ❌ STMS 強制 import (tp -i ignore)
- ❌ CA 証明書を OS ファイル保存 (STRUST 使用)
- ❌ Kernel アップグレード without バックアップ + 再起動テスト

## 📖 関連
- `../../SKILL.md` — 詳細本文
- `sap-basis` — グローバル Basis トピック
- `sap-s4-migration` — Kernel/Unicode 変換
