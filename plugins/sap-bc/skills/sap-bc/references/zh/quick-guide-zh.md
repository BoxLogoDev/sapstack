<!-- Claude-authored draft (community review welcome) -->

# sap-bc 快速指南 (简体中文)

> 本地化 BC 顾问视角。全球 Basis 主题 → 参见 `sap-basis`。

## 🔑 环境信息收集 (本地优先)
1. 部署形态: On-Prem / RISE / 网络隔离 (闭网)
2. 本地化: 国家 CVI / 金税电子发票 / e-Document
3. DB: HANA (区域设置) / Oracle (NLS_LANG)
4. SAPGUI 语言: 本地 / EN / 混用

## 🇨🇳 中国本地化 BC 问题 Top 10

### 1. 字符集 dump (CONVT_CODEPAGE)
- 症状: `CONVT_CODEPAGE` ABAP dump
- 原因: Unicode 转换失败 (遗留 non-Unicode)
- 解决: SNOTE 2452523 系列, `NLS_LANG=*.AL32UTF8`

### 2. STMS import 错误 8 (中文短文本)
- 原因: 中文对象名导致 tp 解析器异常
- 日志: `/usr/sap/trans/log/ULOG`, `ALOG`
- 解决: tp 版本升级, Unicode tp 转换

### 3. 金税电子发票集成 (STRUST)
- 注册 **国密/CA 证书**
- 根 CA: 国家认证机构
- **TLS 1.2+ 必须** (本地安全指引)
- 强化 Web Dispatcher `ssl/ciphersuites`

### 4. 网络隔离环境 Kernel 升级
1. 外网 SAP Launchpad 下载
2. SHA256 哈希校验
3. 信息安全团队审批
4. 加密 USB 传入
5. 内网替换 `/usr/sap/<SID>/SYS/exe/`

### 5. SAPGUI 中文乱码
- SAPGUI 770+ 补丁
- Windows "非 Unicode 程序语言"
- 检查 `NLSPATH`

### 6. SOX 权限再认证
- 季度 PFCG 角色审查审计
- SUIM / S_BCE_68001398
- SoD 矩阵管理 (FI/MM)

### 7. 本地 SAP 支持 (OSS)
- 本地 SAP 支持 (本地语言) 报单
- 本地化问题经本地支持团队
- Priority Very High (生产中断) → 24/7

### 8. HANA 区域
- 合适的 `COLLATION`
- CDS `@Semantics.text.languageCode`
- SAPGUI vs Fiori 渲染差异

### 9. ChaRM 工作流
- Urgent → Normal change 需内控文档
- 审批路径映射本地组织架构
- 周末/节假日自动审批绕过策略

### 10. 本地 SaaS 集成
- 国内财务 SaaS — 大量遗留连接器
- 防火墙/IP 白名单按客户安全策略
- 经 Proxy 时查 SMICM 日志

## 📚 常用 T-code
| T-code | 用途 |
|--------|------|
| STRUST | SSL 证书管理 |
| SMICM | ICM (HTTP) 监控 |
| STMS | Transport 管理 |
| PFCG | Role 管理 |
| SUIM | 权限信息系统 |
| SU53 | 权限失败追踪 |
| SM59 | RFC Destination |
| SM21 | System Log |
| ST22 | dump 分析 |
| RZ20 | CCMS (监控) |

## ⚠️ 禁止事项
- ❌ 生产 SE16N 直接编辑 (SOX 违规)
- ❌ STMS 强制 import (tp -i ignore)
- ❌ CA 证书存为 OS 文件 (用 STRUST)
- ❌ Kernel 升级无备份 + 重启测试

## 📖 相关
- `../../SKILL.md` — 详细本文
- `sap-basis` — 全球 Basis 主题
- `sap-s4-migration` — Kernel/Unicode 转换
