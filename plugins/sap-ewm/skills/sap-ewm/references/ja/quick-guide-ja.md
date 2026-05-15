<!-- Claude-authored draft (community review welcome) -->

# sap-ewm クイックガイド (日本語)

## 🔑 環境ヒアリング

SAP EWM (Enhanced Warehouse Management) 作業前に確認:

### 1. SAP プラットフォームとデプロイ
- **S/4HANA On-Premise**: EWM 2020+ 推奨
- **RISE (Private Cloud)**: 完全 EWM + 自動更新
- **Cloud Public Edition**: 制限 EWM (基本のみ)

### 2. EWM デプロイアーキテクチャ
- **Embedded**: S/4HANA 同一インスタンス (中小)
- **Decentralized**: 独立インスタンス + RFC (大規模, > 5,000 行/日推奨)

### 3. DC 規模と複雑度
- 日次処理量 (入出庫行)
- 複数保管戦略 (FIFO/LIFO)、クロスドック、返品センター
- MM/SD/TM 統合度

### 4. ローカル要件
- **EC**: 当日/翌日配送 → 自動ピッキング/仕分け
- **規制**: 配送先暗号化、電子受領証 (配送業者連携)
- **運用**: 夜間/24h → システム安定性 critical

## 📚 主要 T-code と役割

### モニタリング
| T-code | 機能 |
|--------|------|
| **/SCWM/MON** | 統合モニタリングダッシュボード |
| **/SCWM/ACT** | アクティビティ照会 |
| **/SCWM/AREA** | ゾーン・bin 状況 |

### 入庫
| T-code | 機能 |
|--------|------|
| **/SCWM/GOODS_IN** | 入庫 |
| **/SCWM/PUT_AWAY** | 格納指示 |
| **/SCWM/PUTAWAY_MON** | 格納モニタリング |

フロー: MM PO → EWM → /SCWM/GOODS_IN inbound delivery → スキャン + QC → /SCWM/PUT_AWAY 自動 bin → RF 確認。

### 出庫
| T-code | 機能 |
|--------|------|
| **/SCWM/WAVE** | ウェーブ計画・実行 |
| **/SCWM/PICK** | ピッキング |
| **/SCWM/PACK** | パッキング・ラベル |
| **/SCWM/SHIP** | 出荷確定 |

フロー: SD SO → EWM → /SCWM/WAVE グループ化 → /SCWM/PICK (バーコード) → /SCWM/PACK 箱サイズ提案 → /SCWM/SHIP 配送業者受領証。

### RF / モバイル
| T-code | 機能 |
|--------|------|
| **/SCWM/RFUI** | RF 端末基本 |
| **/SCWM/RFUI_WAVE** | RF ピッキング (ウェーブ) |
| **/SCWM/MOBILE** | モバイルアプリ (Fiori) |

### 決済 / インターフェース
| T-code | 機能 |
|--------|------|
| **/SCWM/PI** | Physical interface (受領証) |
| **/SCWM/TM_INTERFACE** | 輸送管理連携 |
| **/SCWM/CONF** | 出荷確認 + FI 転記 |

## 🇯🇵 日本ローカル

### オンラインフルフィルメントセンター日常運用
- 午前(06-12): 入庫集中 — /SCWM/GOODS_IN + /SCWM/PUT_AWAY (目標: 受領→bin < 2h)
- 正午(12-17): ピッキング集中 — /SCWM/WAVE を 3-4 ウェーブ分割, 並行 /SCWM/PICK + /SCWM/PACK (300-500 行/h)
- 夕方(17-22): 配送業者集荷 — /SCWM/SHIP + /SCWM/PI (受領証 API → 顧客追跡)

### 自動化統合
- Sorter: /SCWM/PACK ソータ出口指示
- AS/RS: /SCWM/PUT_AWAY 自動 bin 割当

### 返品センター
- /SCWM/GOODS_IN (返品ゾーン専用 bin) → QC → 再出庫 or 廃棄
- EC 返品率高 (セール後) → 専用追跡必須

### 住所プライバシー
- 配送先暗号化; ピッキングチームは受領証番号のみ閲覧
- 保管期間経過後に住所削除

## ⚠️ Embedded vs Decentralized

| | Embedded | Decentralized |
|---|---|---|
| 利点 | シンプル, 低コスト | 高スループット, 独立, 拡張容易 |
| 欠点 | システム負荷高, 拡張制限 | 構成複雑, RFC 管理 |
| 推奨 | DC < 2,000 行/日 | DC > 5,000 行/日 |

参照アーキ: S/4HANA (Core) → RFC/OData → EWM (Decentralized) → API/EDI → TM → Sorter/RF/配送業者システム。

## よくある問題

| 症状 | 原因 | 診断 | 解決 |
|-----|------|------|-----|
| ピッキング遅延 (ウェーブ滞留) | bin 不足/アイテム配置 | /SCWM/MON | 格納最適化 (FIFO) |
| 受領証未連携 | /SCWM/PI 失敗/配送 API | /SCWM/PI ログ | 配送 API 確認 |
| RF エラー (品目なし) | スキャンデータ不一致 | RF ログ | バーコード再確認 |
| 在庫不一致 | 未確認入出庫 | /SCWM/MON | 循環棚卸 |
| 性能低下 | 量 > 容量 | /SCWM/MON 性能タブ | ウェーブ調整/増設 |

## 📊 KPI
- 入庫スループット (100-200/h)
- ピッキング精度 (/SCWM/PICK エラー < 0.5%)
- 配送時間 (受注→受領証 < 30 分)
- 在庫精度 (> 99.5%)
- システム可用度 (99.9% SLA)

## プロセスフロー詳細 (Process Flows)

Inbound:
```
MM PO → EWM 自動転送
/SCWM/GOODS_IN: inbound delivery 登録
スキャン + QC → 異常時は返品指示
/SCWM/PUT_AWAY: 自動 bin 割当 → RF 確認
```

Outbound:
```
SD SO → EWM 自動転送
/SCWM/WAVE: 3-4 ウェーブに分割
/SCWM/PICK: ピッキング (バーコード) → RF スキャン確認
/SCWM/PACK 箱サイズ提案 → /SCWM/SHIP 配送業者受領証
```

RF 作業:
```
1. ログイン → 作業タイプ選択 (GOODS_IN/PICK/PACK)
2. 製品バーコードスキャンまたは場所入力
3. システムが予想数量と比較 → 確認または警告
4. 確認: RF ボタン → サーバ即時更新
```

日常運用:
```
06-12 入庫: /SCWM/GOODS_IN + /SCWM/PUT_AWAY
12-17 ピッキング: /SCWM/WAVE + /SCWM/PICK + /SCWM/PACK
17-22 出荷: /SCWM/SHIP + /SCWM/PI 配送業者集荷
```

参照アーキテクチャ:
```
S/4HANA (Core) → RFC/OData
  → EWM (Decentralized) → API/EDI
  → TM → Sorter / RF / 配送業者システム
```

返品:
```
顧客返品 → /SCWM/GOODS_IN (返品ゾーン bin)
QC → 良品: 再出庫 / 不良: 廃棄またはメーカ返送
/SCWM/MON 追跡; 保管期間経過後に住所削除
```

## 関連
- `../../SKILL.md` — 完全 EWM ガイド
- `references/img/ewm-configuration.md` — IMG 設定
- `docs/enterprise/ewm-operations-korea.md` — 運用ガイド
