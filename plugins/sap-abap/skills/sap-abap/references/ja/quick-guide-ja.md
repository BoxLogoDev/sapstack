<!-- Claude-authored draft (community review welcome) -->

# sap-abap クイックガイド (日本語)

> SAP ABAP 開発のクイックリファレンス. 詳細は `SKILL.md` および `references/clean-core-patterns.md` を参照.

## 🔑 環境ヒアリング

1. ABAP プラットフォーム (ECC リリース / S/4HANA リリース年)
2. HANA ネイティブ開発の範囲 (CDS, AMDP, RAP)
3. ATC チェックバリアントの設定

## 📚 主要な開発トピック

### Clean Core 原則
- 標準 SAP オブジェクトの直接修正は禁止
- **BAdI** / **Enhancement Point** / **CDS View 拡張** を使用
- Access Key の使用は **警告サイン** (監査ログ)

### HANA 最適化 SQL
- ❌ `SELECT * FROM ...`
- ✅ 必要なカラムのみ SELECT + `INTO TABLE`
- `FOR ALL ENTRIES` の注意点:
  - 使用前に空テーブルチェック
  - `SORT ... DELETE ADJACENT DUPLICATES` で重複排除
  - 小規模 lookup → **JOIN** を推奨
- **Push-down** — CDS View, AMDP で HANA に処理委譲

### CDS Views
- **@ObjectModel.text.element** — 言語独立テキスト
- **@Semantics.amount.currencyCode** — 通貨フィールド注釈
- **@EndUserText.label** — i18n サポート

### RAP (RESTful ABAP Programming)
- Business Object → Service Definition → Service Binding
- Behavior Implementation
- Fiori Elements 自動生成

### パフォーマンス分析
- **ST05** — SQL トレース
- **SAT** — ランタイム分析 (SE30 の後継)
- **ST22** — ダンプ分析
- **SM50 / SM66** — ワークプロセス監視

## 🇯🇵 日本ローカル

- **電子帳簿保存法** 対応 — 7年保存・改ざん検知要件
- **インボイス制度 (適格請求書)** — 登録番号管理 (2023年10月開始)
- **Shift-JIS / UTF-8** 混在環境のエンコード変換注意
- **日本語メッセージクラス** 翻訳漏れで MESSAGE_TYPE_X 多発

## ⚠️ 禁止事項

- ❌ 標準 SAP オブジェクト修正 (Clean Core 違反)
- ❌ 本番環境で SE38 直接実行 (一部レポート除く)
- ❌ `AUTHORITY-CHECK` 漏れ (J-SOX 監査対象)
- ❌ Dynamic SQL にユーザー入力を直接連結 (SQL Injection)

## 🤖 コードレビュー委譲
```
/sap-abap-review <ファイルパスまたはオブジェクト名>
```
→ `sap-abap-developer` サブエージェントが Clean Core + HANA + ATC 基準でレビュー

## 📖 参照
- `../clean-core-patterns.md`
- `../code-review-checklist.md`
