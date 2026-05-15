<!-- Claude-authored draft (community review welcome) -->

# sap-mm クイックガイド (日本語)

> SAP MM (購買管理) — 購買・在庫・請求書照合・GR/IR.

## 🔑 環境インテーク

1. SAP リリース (ECC EhPx / S/4HANA 19xx-23xx)
2. 展開モデル (オンプレ / RISE / Cloud PE)
3. 購買種別 (サービス / 間接 / 直接 / 外注 / 委託)
4. プラント / 会社コード (ユーザー提供)
5. エラーメッセージ + T-code

## 📚 コア領域

### 購買依頼
- **ME51N / ME52N / ME53N** — 作成 / 変更 / 表示 PR
- 勘定設定: コストセンター (K)、内部指図 (F)、資産 (A)、プロジェクト (P)
- リリース戦略: T-code OMGS (設定), CL30 (リリースグループ/戦略)

### 購買オーダー
- **ME21N / ME22N / ME23N** — 作成 / 変更 / 表示 PO
- PO 種別: NB (標準)、FO (枠契約)、UB (在庫転送)、RA (返品)
- 出力 (印刷/メール): ME9F → 手動出力, NACE (設定)

### 入庫
- **MIGO** — 移動タイプ 101 (入庫)、102 (反対仕訳)、161 (返品)
- 入庫通知 (EWM 連携): VL31N → VL32N → MIGO
- 在庫種別: 自由 (Unrestricted)、品質 (Q)、ブロック (S)

### 請求書照合
- **MIRO** — 請求書受領 (3 way マッチ: PO/GR/Invoice)
- 許容差: OMR6 (会社コード単位)
- ブロック: 明細の支払ブロック → 解除 MRBR

### マスターデータ
- **MM01/MM02/MM03** — 品目マスター
- **XK01/XK02/XK03** — 仕入先マスター (ECC)
- **BP** — Business Partner (S/4 統合)
- **ME11/ME12/ME13** — 情報レコード

## 🚨 よくある問題

### "MIGO 入庫失敗 — M7 エラー"
- 期間クローズ済 (MMRV / MMPV)
- 品目仕訳ブロック (MM02 → プラントデータ)
- 勘定設定不足 (OBYC)
- 特別在庫 (E/Q/K) 要件

### "MIRO 3way マッチ失敗"
- 数量許容差超過 — OMR6
- 価格許容差超過 — OMR6
- PO 税コード ≠ 請求書 — 手動修正
- GR ベース IV フラグ不一致

### "MMBE 在庫不正"
- クロスチェック: MB52 (品目/プラント別)、MB5B (期間在庫)、MB51 (移動リスト)
- 引当 (MD04) で在庫占有?
- 品質在庫 (MB52 → 在庫種別 Q) 見落とし?

## 🔧 主要 T-code

| 領域 | T-code |
|---|---|
| PR | ME51N/52N/53N, ME54N (リリース) |
| PO | ME21N/22N/23N, ME9F (出力) |
| GR | MIGO (101/102/161), MB51 (リスト) |
| IV | MIRO, MRBR (ブロック解除) |
| 在庫 | MMBE, MB52, MB5B, MB5T (輸送中) |
| マスター | MM01/02/03, XK01/02/03 (ECC), BP (S/4) |
| 情報レコード | ME11/12/13 |
| 供給元リスト | ME01 |
| アウトライン契約 | ME31K (契約), ME31L (スケジューリング) |

## ECC vs S/4HANA

- **仕入先**: XK → BP (Business Partner 統合)
- **品目**: MM01-03 同じ。MARA 構造簡素化
- **EWM 連携**: S/4 で embedded EWM 強化
- **集中購買 (Centralized Sourcing)**: S/4 独自

## 🇯🇵 日本ローカル考慮

- **消費税**: 10% / 8% (軽減税率) — FTXP 設定
- **インボイス制度** (2023~): 適格請求書発行事業者番号 (T番号) — 仕入先マスターに格納
- **印紙税**: 高額契約書の印紙対応
- **通関 (Customs)**: 輸出入貿易 → sap-gts 連携推奨
- **JIT 調達**: 自動車・電機業界の頻繁な使用 — Scheduling Agreement (ME31L)

## ⚠️ スコープ外

- 販売 (SD 使用)
- 倉庫内移動 (WM/EWM)
- 戦略調達 / RFx (Ariba 使用)
- 製造材料投入 (PP 使用)

## 📚 参照

- `references/img/account-determination.md` — OBYC 設定
- `../../../sap-fi/skills/sap-fi/SKILL.md` — 請求書仕訳連携
- `../../../sap-ariba/skills/sap-ariba/SKILL.md` — 戦略調達
