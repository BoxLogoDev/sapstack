<!-- Claude-authored draft (community review welcome) -->

# sap-pp クイックガイド (日本語)

## 🔑 環境ヒアリング
1. 生産方式 (Discrete / Process / Repetitive / KANBAN)
2. MRP 方式 (Classic MRP / MRP Live — S/4)
3. プラントおよび生産組織 (ユーザー提供)

## 📚 要点

### Master Data
- **CS01/CS02**: BOM (部品表)
- **CA01/CA02**: Routing (作業手順)
- **CR01/CR02**: Work Center
- **MD04**: Stock/Requirements リスト

### MRP
- **MD01**: MRP Run (全社 — 一般的に非推奨)
- **MD02**: MRP Run (単一資材)
- **MD03**: MRP Run (単一資材マルチレベル)
- **MD41/MD43**: Planning Evaluation
- S/4HANA: **MRP Live** (CDS + HANA push-down)

### Production Orders
- **CO01/CO02**: 製造オーダ作成/変更
- **CO11N**: 確認 (Confirmation)
- **CO15**: 確認取消
- **COGI**: 自動 GR 失敗リスト処理

### Repetitive Manufacturing
- **MFBF**: Backflush
- **MF50**: Planning Table

## 🇯🇵 日本ローカル
- **製造業比率の高い現場** — PP は中核モジュール
- **外注処理** (Subcontracting) 複雑 — 受託/委託の区別に注意
- **納入管理** 要求が厳格 (OEM サプライヤ標準)

## ⚠️ 注意
- 全社 MRP (MD01) は **運用時間外のみ** 実行
- BOM 変更後は Low-level code 再計算必須 (**OMIW**)
