<!-- Claude-authored draft (community review welcome) -->

# sap-session 快速指南 (简体中文)

> Evidence Loop 编排器。在无法直连 SAP 的环境中, 以 "确认 → 假设 → 证据收集 → 验证" 4 轮异步循环执行运维诊断的上层技能。详见 `SKILL.md` 与 `references/turn-formats.md`。

## 🔑 何时使用 sap-session

| 情况 | 模式 |
|---|---|
| "FB01 是什么?" 类简单查询 | **Quick Advisory** — 无需 sap-session, 模块顾问直接答 |
| "F110 跑了但某供应商显示 'No payment method'" | **Evidence Loop** — 启动 sap-session |
| 期末关账预检 / 事后复盘 | Evidence Loop |
| 跨模块变更影响 (FI 配置 → MM/SD) | Evidence Loop |
| 2+ 假设需用证据收窄 | Evidence Loop |
| 操作员无法直连 SAP, AI 只能建议 | Evidence Loop (核心场景) |

## 🔁 4 个回合

```
Turn 1 INTAKE      (操作员)  初始症状 + 1 个 Evidence Bundle
Turn 2 HYPOTHESIS  (AI)      2-4 假设 + 反证条件 + Follow-up Request
Turn 3 COLLECT     (操作员)  在 SAP 执行 follow-up 清单, 追加 Bundle
Turn 4 VERIFY      (AI)      确认/驳回; 确认则 Fix + Rollback
```

- 每个假设必须含反证条件。"不可证伪假设" 不允许。
- 有 Fix 计划必须有 Rollback 计划 (Rollback-or-no-Fix)。
- 所有状态变更 append-only 记录于 `session.audit_trail` (禁改删)。

## 📦 会话文件结构

1 会话 = 1 个 `.sapstack/sessions/{id}/` 目录:

| 文件 | 何时 |
|---|---|
| `state.yaml` | 每回合 (当前状态, 下一动作) |
| `bundles/evb-*.yaml` | Turn 1, 3 — 操作员上传证据 |
| `hypotheses/h-*.yaml` | Turn 2 — AI 假设 |
| `requests/flr-*.yaml` | Turn 2 — AI follow-up 清单 |
| `verdicts/vdc-*.yaml` | Turn 4 — 确认/驳回判定 |

会话 ID 格式: `sess-YYYYMMDD-XXXXXX`

## 🚀 操作员流程示例

```bash
# Turn 1 INTAKE
/sap-session-start "F110 Proposal 失败 — 供应商 100234, 'No valid payment method'"
/sap-session-add-evidence sess-20260514-m2p9xt ./f110-log.txt ./lfb1-dump.csv

# Turn 2 HYPOTHESIS (AI 生成假设 + follow-up)
/sap-session-next-turn sess-20260514-m2p9xt
#   H1: LFB1.ZWELS 为空 (最常见)
#   H2: FBZP 银行确定缺少 T/C 方式
#   H3: 公司代码级付款方式未激活

# Turn 3 COLLECT (操作员执行清单并上传)
/sap-session-add-evidence sess-20260514-m2p9xt ./xk03-zwels-check.txt

# Turn 4 VERIFY (AI 确认/驳回, Fix + Rollback)
/sap-session-next-turn sess-20260514-m2p9xt
#   H1 确认, Fix: XK02 设 ZWELS, Rollback: XK02 清空 ZWELS

/sap-session-handoff sess-20260514-m2p9xt --to web_triage
```

## 🧰 自动路由

按假设 `impacted_modules` 并行自动调用模块顾问: FI→`sap-fi-consultant`, MM→`sap-mm-consultant`, SD→`sap-sd-consultant`, PP→`sap-pp-consultant`, HCM→`sap-hcm-consultant`, TR→`sap-tr-consultant`, CO→`sap-co-consultant`, PM→`sap-pm-consultant`, QM→`sap-qm-consultant`, WM/EWM→`sap-ewm-consultant`, ABAP→`sap-abap-developer`, BASIS→`sap-basis-consultant`, Cloud PE→`sap-cloud-consultant`, S/4 迁移→`sap-s4-migration-advisor`, BTP/CPI→`sap-integration-advisor`, 新手→`sap-tutor`。多模块 → 并行调用, 综合 verdict。

## 🌍 现场用语原则

sapstack 用 SAP 现场用语而非词典直译:
- 现场用语优先 (T-code/缩写保留原形: F110, MIGO, ST22, PO, GR, TR)
- 允许口语表达
- 本地业务日历标记
- 完整指南: `references/korean-field-language.md`; 同义词: `data/synonyms.yaml`

## ⚠️ 明确非目标
- 无直连 SAP (无 RFC/OData/Fiori 直接调用)
- 不自动改生产数据 — 操作员执行所有修复
- 不自动 transport — 需人工审批
- 不对终端用户强制 CLI — 其用 web 门户

## 🚦 与其他模块关系

| | Quick Advisory | sap-session (Evidence Loop) |
|---|---|---|
| 回合 | 1 | 多回合 (异步) |
| 适合 | "X 是什么?" | "X 不工作" |
| 假设 | 单一答案 | 2-4 + 反证 |
| 证据 | 无 | 明确 follow-up 清单 |
| 状态 | 无 | `.sapstack/sessions/...` |
| Rollback | 可选 | **必须** |

规则: 预计 2+ 回合 或 2+ 假设候选 → sap-session。

## 📚 延伸阅读
- `references/turn-formats.md`, `references/evidence-bundle-guide.md`
- `references/session-state-lifecycle.md`, `references/korean-field-language.md`
- `../../../schemas/` — 5 个 JSON Schema; `../../../CLAUDE.md` — Universal Rules
