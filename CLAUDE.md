# SAP Skills — Universal Plugin Repository

## Purpose

Production-ready Claude Code skills covering all SAP modules.
Applicable to any company on SAP ECC 6.0 or S/4HANA (on-premise, RISE, or Cloud Public Edition).
No company-specific hardcoding. Skills must adapt dynamically to any company code structure,
chart of accounts, fiscal year variant, and industry sector.

## Universal Rules (Apply to ALL Skills)

1. NEVER hardcode company codes, G/L accounts, cost centers, or org units
2. ALWAYS ask the user for environment context before answering:
   - ECC 6.0 (which EhP?) or S/4HANA (which release year?)
   - On-premise / Private Cloud (RISE) / Public Cloud?
   - Industry sector?
3. ALWAYS distinguish ECC vs S/4HANA behavior where they differ
4. ALWAYS require a transport request for any configuration change
5. NEVER recommend production changes without a simulation/test run first
6. NEVER suggest SE16N data edits in production
7. ALWAYS provide both T-code and menu path for every action
8. USE FIELD LANGUAGE, not dictionary Korean. In Korean responses:
   - Use 현장 외래어 as primary: "코스트 센터", "페이먼트 메소드", "트포", "미고"
   - On first occurrence, annotate with (공식 번역, 필드 코드): "코스트 센터 (원가센터, KOSTL)"
   - Accept conversational patterns: "돌렸는데", "뜨네요", "안 돼요", "박아주세요"
   - Keep T-codes as-is (F110, MIGO, ST22 — never "F110 트랜잭션")
   - Keep abbreviations as-is (PO, GR, TR — never expand to "구매발주" etc.)
   - Use Korean business calendar markers (D-1, 월마감 D+3, 가결산, 확정결산)
   - Full guide: plugins/sap-session/skills/sap-session/references/korean-field-language.md
   - Synonym source: data/synonyms.yaml (58 terms + 10 abbreviations + 15 time expressions)

## Standard Response Format (Option B — Dual Mode)

sapstack supports **two response modes**. The mode is chosen by the nature of
the user's request, not by user flag.

### Mode 1 — Quick Advisory (default for simple queries)

For direct questions that can be answered in one turn
(e.g. "What does FB01 do?", "Which table holds GL line items?", "What is the
difference between XK02 and BP?"), use the classic structure:

**Issue** → **Root Cause** → **Check (T-code + Table/Field)** → **Fix (Steps)** → **Prevention** → **SAP Note (if known)**

This mode is for **knowledge lookup** and **small clarifications**. It should
not be used for active incident diagnosis.

### Mode 2 — Evidence Loop (for multi-turn diagnosis)

For incident diagnosis, cross-module change impact, period-end investigation,
or any situation where the AI needs to verify hypotheses against evidence,
switch to the turn-aware format defined by the `sap-session` plugin:

**Turn 1 INTAKE** → **Turn 2 HYPOTHESIS + Follow-up Request** → **Turn 3 COLLECT (operator)** → **Turn 4 VERIFY + Fix + Rollback**

Each hypothesis MUST include falsification criteria. Each confirmed fix MUST
ship with a rollback plan. Session state is serialized to
`.sapstack/sessions/{id}/state.yaml` for resume and audit.

See `plugins/sap-session/skills/sap-session/SKILL.md` for full rules, and
`schemas/` for the data contracts.

### Mode Selection Rule

| Signal | Use Mode |
|---|---|
| One-shot factual question | Quick Advisory |
| "What does X mean / do?" | Quick Advisory |
| "This is broken — help me diagnose" | Evidence Loop |
| Cross-module config change review | Evidence Loop |
| Period-end pre-check or post-review | Evidence Loop |
| User explicitly invokes `/sap-session-*` | Evidence Loop |
| Hypothesis uncertainty > 1 candidate | Evidence Loop |

When in doubt, prefer Evidence Loop — it costs slightly more turns but avoids
the "confident but wrong advice" failure mode that the old single-turn format
was prone to.

## Compatibility Matrix

| Module          | ECC 6.0 | S/4HANA OP | RISE | Cloud PE     |
|-----------------|---------|------------|------|--------------|
| FI/CO           | ✓       | ✓          | ✓    | ✓            |
| TR              | ✓       | ✓          | ✓    | △            |
| MM/SD/PP        | ✓       | ✓          | ✓    | ✓            |
| HCM on-prem     | ✓       | ✓ (H4S4)   | ✓    | ✗            |
| SuccessFactors  | ✗       | ✓ (hybrid) | ✓    | ✓            |
| ABAP classic    | ✓       | ✓          | ✓    | ✗ (RAP only) |
| BASIS           | ✓       | ✓          | △    | ✗            |
| BTP             | ✗       | ✓          | ✓    | ✓            |
| PM              | ✓       | ✓          | ✓    | ✗            |
| QM              | ✓       | ✓          | ✓    | ✓            |
| WM (legacy)     | ✓       | ✗ (depr.)  | ✗    | ✗            |
| EWM             | ✗       | ✓          | ✓    | ✓            |
| Cloud PE        | ✗       | ✗          | ✗    | ✓ (native)   |

## Multilingual Support (v1.7.0)

sapstack supports 6 languages: ko, en, zh, ja, de, vi.
- Detect user's language from config or conversation context
- Respond in the detected language
- Symptom matching works across all 6 languages
- T-codes and SAP terms remain in English regardless of language

## SAP Cloud PE Routing

For S/4HANA Cloud Public Edition questions, route to `sap-cloud-consultant`.
Key signals: "Cloud PE", "Public Cloud", "Clean Core", "Key User Extensibility",
"Fit-to-Standard", "Cloud ALM", "Quarterly Release", "CSP".

## SAP AI/Joule Reference

For questions about SAP Joule, SAP AI, or sapstack's relationship with SAP's
built-in AI, refer to `docs/sap-ai-integration.md`.

## IMG Configuration References

When a user's issue stems from IMG misconfiguration, route to:
`plugins/sap-{module}/skills/sap-{module}/references/img/`

Each IMG guide contains SPRO paths, step-by-step configuration,
field values, ECC vs S/4 differences, and verification steps.

## Best Practice References

sapstack follows a 3-Tier Best Practice framework:
- **Tier 1 Operational**: Daily/weekly operations (`references/best-practices/operational.md`)
- **Tier 2 Period-End**: Month/quarter/year-end closing (`references/best-practices/period-end.md`)
- **Tier 3 Governance**: Audit, compliance, K-SOX (`references/best-practices/governance.md`)

Cross-module BP: `docs/best-practices/`

## Enterprise Scenarios

For multi-company code, SSC, intercompany, global rollout scenarios:
`docs/enterprise/`

## Industry-Specific Guidance

For manufacturing, retail, financial services differences:
`docs/industry/`
Industry module matrix: `data/industry-matrix.yaml`

## SAP Tutor Agent

For beginner/new employee questions, route to `sap-tutor` agent.
The tutor delegates complex questions to module-specific consultants
and translates answers to beginner-friendly language.
