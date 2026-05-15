<!-- Claude-authored draft (community review welcome) -->

# sap-session クイックガイド (日本語)

> Evidence Loop オーケストレータ。ライブ SAP アクセス不可環境で「確認 → 仮説 → 証拠収集 → 検証」4 ターン非同期ループで運用診断を行う上位スキル。詳細は `SKILL.md` と `references/turn-formats.md`。

## 🔑 いつ sap-session を使うか

| 状況 | モード |
|---|---|
| 「FB01 とは?」のような単純照会 | **Quick Advisory** — sap-session 不要, モジュールコンサルが直接回答 |
| 「F110 実行したが特定仕入先で 'No payment method'」 | **Evidence Loop** — sap-session 開始 |
| 期末締め事前点検 / 事後レビュー | Evidence Loop |
| クロスモジュール変更影響 (FI 設定 → MM/SD) | Evidence Loop |
| 仮説 2+ で証拠による絞込みが必要 | Evidence Loop |
| 運用者が SAP 直接アクセス不可, AI は助言のみ | Evidence Loop (中核ユースケース) |

## 🔁 4 つのターン

```
Turn 1 INTAKE      (運用者)  初期症状 + Evidence Bundle 1 個
Turn 2 HYPOTHESIS  (AI)      2-4 仮説 + 反証条件 + Follow-up Request
Turn 3 COLLECT     (運用者)  SAP で follow-up チェックリスト実行, Bundle 追加
Turn 4 VERIFY      (AI)      確定/棄却; 確定時 Fix + Rollback
```

- 各仮説は必ず反証条件を含む。「反証不能仮説」は提案不可。
- Fix プランがあれば必ず Rollback プランも (Rollback-or-no-Fix)。
- 全状態変化は `session.audit_trail` に append-only 記録 (修正・削除禁止)。

## 📦 セッションファイル構造

1 セッション = 1 つの `.sapstack/sessions/{id}/` ディレクトリ:

| ファイル | いつ |
|---|---|
| `state.yaml` | 毎ターン (現在状態, 次アクション) |
| `bundles/evb-*.yaml` | Turn 1, 3 — 運用者アップロード証拠 |
| `hypotheses/h-*.yaml` | Turn 2 — AI 仮説 |
| `requests/flr-*.yaml` | Turn 2 — AI follow-up チェックリスト |
| `verdicts/vdc-*.yaml` | Turn 4 — 確定/棄却判定 |

セッション ID 形式: `sess-YYYYMMDD-XXXXXX`

## 🚀 運用者フロー例

```bash
# Turn 1 INTAKE
/sap-session-start "F110 Proposal 失敗 — 仕入先 100234, 'No valid payment method'"
/sap-session-add-evidence sess-20260514-m2p9xt ./f110-log.txt ./lfb1-dump.csv

# Turn 2 HYPOTHESIS (AI が仮説生成 + follow-up)
/sap-session-next-turn sess-20260514-m2p9xt
#   H1: LFB1.ZWELS 空 (最も一般的)
#   H2: FBZP 銀行決定に T/C 方式欠落
#   H3: 会社コード別支払方式未有効

# Turn 3 COLLECT (運用者がチェックリスト実行しアップロード)
/sap-session-add-evidence sess-20260514-m2p9xt ./xk03-zwels-check.txt

# Turn 4 VERIFY (AI 確定/棄却, Fix + Rollback)
/sap-session-next-turn sess-20260514-m2p9xt
#   H1 確定, Fix: XK02 で ZWELS 設定, Rollback: XK02 で ZWELS クリア

/sap-session-handoff sess-20260514-m2p9xt --to web_triage
```

## 🧰 自動ルーティング

仮説の `impacted_modules` により並列でモジュールコンサル自動呼出: FI→`sap-fi-consultant`, MM→`sap-mm-consultant`, SD→`sap-sd-consultant`, PP→`sap-pp-consultant`, HCM→`sap-hcm-consultant`, TR→`sap-tr-consultant`, CO→`sap-co-consultant`, PM→`sap-pm-consultant`, QM→`sap-qm-consultant`, WM/EWM→`sap-ewm-consultant`, ABAP→`sap-abap-developer`, BASIS→`sap-basis-consultant`, Cloud PE→`sap-cloud-consultant`, S/4 移行→`sap-s4-migration-advisor`, BTP/CPI→`sap-integration-advisor`, 初心者→`sap-tutor`。複数モジュール → 並列呼出, 統合 verdict。

## 🌍 現場用語原則

sapstack は辞書直訳でなく SAP 現場用語を使用:
- 現場用語優先 (T-code/略語は原形維持: F110, MIGO, ST22, PO, GR, TR)
- 口語表現許容
- ローカル業務カレンダーマーカ
- 完全ガイド: `references/korean-field-language.md`; 同義語: `data/synonyms.yaml`

## ⚠️ 明示的非目標
- ライブ SAP 接続なし (RFC/OData/Fiori 直接呼出なし)
- 本番データ自動編集なし — 運用者が全 Fix を実行
- Transport 自動移動なし — 人の承認必要
- エンドユーザに CLI 強制なし — web ポータル使用

## 🚦 他モジュールとの関係

| | Quick Advisory | sap-session (Evidence Loop) |
|---|---|---|
| ターン | 1 | 多ターン (非同期) |
| 適合 | 「X とは?」 | 「X が動かない」 |
| 仮説 | 単一回答 | 2-4 + 反証 |
| 証拠 | なし | 明示的 follow-up チェックリスト |
| 状態 | なし | `.sapstack/sessions/...` |
| Rollback | 任意 | **必須** |

判断: 2+ ターン予想 または 2+ 仮説候補 → sap-session。

## 📚 さらに読む
- `references/turn-formats.md`, `references/evidence-bundle-guide.md`
- `references/session-state-lifecycle.md`, `references/korean-field-language.md`
- `../../../schemas/` — 5 つの JSON Schema; `../../../CLAUDE.md` — Universal Rules
