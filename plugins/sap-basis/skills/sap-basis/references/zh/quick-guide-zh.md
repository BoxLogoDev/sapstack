<!-- Claude-authored draft (community review welcome) -->

# sap-basis 快速指南 (简体中文)

> 全球 Basis 主题。区域特定 BC 问题 → 参见 `sap-bc` 插件。

## 🔑 环境信息收集
1. SAP 版本 (ECC EhP / S/4HANA)
2. DB (HANA / Oracle / DB2 / MSSQL)
3. OS (Linux SLES/RHEL / Windows / AIX)

## 📚 要点

### System Administration
- **SM50/SM66**: Work Process
- **ST22**: ABAP 运行时错误 (dump)
- **SM21**: System Log
- **SM12**: Lock Table
- **SM13**: Update Requests

### Transport Management
- **STMS**: Transport Management System
- **SE09/SE10**: Transport Organizer
- **tp** 命令 (OS 层)

### Performance
- **ST05**: SQL Trace
- **SAT**: Runtime Analysis
- **ST06**: OS 资源
- **ST02**: Memory (Buffer)

### Security / Authorization
- **SU01/SU10**: 用户管理
- **PFCG**: Role 管理
- **SUIM**: 权限信息系统
- **SU53**: 最近权限失败

### Job Management
- **SM36**: Job 定义
- **SM37**: Job 监控

### RFC / Integration
- **SM59**: RFC Destination
- **SMQR/SMQS**: qRFC Monitor
- **BD54**: Logical System

## 🇨🇳 中国本地化
区域特定主题 — 网络隔离、Unicode 处理、金税电子发票 STRUST、SOX 权限管理 — 参见 `sap-bc` 插件 `SKILL.md`。`sap-basis` 提供全球基线；`sap-bc` 补充本地上下文。

## ⚠️ 禁止事项
- ❌ 生产环境 SE16N 直接改数据
- ❌ STMS 强制 push (tp 强制 import)
- ❌ SAP Kernel 升级无备份
- ❌ PRD client 405 (SCC4 保护解除)

## 📖 相关插件
- `sap-bc` — 本地 BC 顾问深化
- `sap-s4-migration` — Kernel/DB 升级规划
- `sap-abap` — ABAP dump 深度分析
