<!-- Claude-authored draft (community review welcome) -->

# sap-basis クイックガイド (日本語)

> グローバル Basis トピック。地域特化 BC 問題 → `sap-bc` プラグイン参照。

## 🔑 環境ヒアリング
1. SAP リリース (ECC EhP / S/4HANA)
2. DB (HANA / Oracle / DB2 / MSSQL)
3. OS (Linux SLES/RHEL / Windows / AIX)

## 📚 要点

### System Administration
- **SM50/SM66**: Work Process
- **ST22**: ABAP ランタイムエラー (dump)
- **SM21**: System Log
- **SM12**: Lock Table
- **SM13**: Update Requests

### Transport Management
- **STMS**: Transport Management System
- **SE09/SE10**: Transport Organizer
- **tp** コマンド (OS レベル)

### Performance
- **ST05**: SQL Trace
- **SAT**: Runtime Analysis
- **ST06**: OS リソース
- **ST02**: Memory (Buffer)

### Security / Authorization
- **SU01/SU10**: ユーザー管理
- **PFCG**: Role 管理
- **SUIM**: 権限情報システム
- **SU53**: 直近の権限失敗

### Job Management
- **SM36**: Job 定義
- **SM37**: Job モニタ

### RFC / Integration
- **SM59**: RFC Destination
- **SMQR/SMQS**: qRFC Monitor
- **BD54**: Logical System

## 🇯🇵 日本ローカル
地域特化トピック — ネットワーク分離、Unicode 処理、電子インボイス STRUST、SOX 権限管理 — は `sap-bc` プラグイン `SKILL.md` 参照。`sap-basis` はグローバルベースライン、`sap-bc` がローカル文脈を追加。

## ⚠️ 禁止事項
- ❌ 本番環境 SE16N データ直接編集
- ❌ STMS 強制 push (tp 強制 import)
- ❌ SAP Kernel アップグレード without バックアップ
- ❌ PRD client 405 (SCC4 保護解除)

## 📖 関連プラグイン
- `sap-bc` — ローカル BC コンサルタント観点深化
- `sap-s4-migration` — Kernel/DB アップグレード計画
- `sap-abap` — ABAP dump 深層分析
