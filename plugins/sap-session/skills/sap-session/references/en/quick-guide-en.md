<!-- Claude-authored draft (community review welcome) -->

# sap-session Quick Guide (English)

> Evidence Loop orchestrator. Higher-level skill running a 4-turn async loop ("intake → hypothesis → evidence collection → verify") for operational diagnosis in environments where live SAP access is blocked. Details in `SKILL.md` and `references/turn-formats.md`.

## 🔑 When to use sap-session

| Situation | Mode |
|---|---|
| Simple query like "What is FB01?" | **Quick Advisory** — no sap-session, module consultant answers directly |
| "F110 ran but one vendor shows 'No payment method'" | **Evidence Loop** — start sap-session |
| Period-close pre-check / retrospective | Evidence Loop |
| Cross-module change impact (FI config → MM/SD) | Evidence Loop |
| 2+ hypotheses to narrow with evidence | Evidence Loop |
| Operator can't access SAP directly, AI advises only | Evidence Loop (core use case) |

## 🔁 The 4 Turns

```
Turn 1 INTAKE      (operator)  initial symptom + 1 Evidence Bundle
Turn 2 HYPOTHESIS  (AI)        2-4 hypotheses + falsification + Follow-up Request
Turn 3 COLLECT     (operator)  run follow-up checklist in SAP, add Bundle
Turn 4 VERIFY      (AI)        confirm/reject; if confirmed Fix + Rollback
```

- Each hypothesis MUST include falsification criteria. "Unfalsifiable hypothesis" is not allowed.
- If a Fix plan exists, a Rollback plan MUST exist (Rollback-or-no-Fix).
- All state changes append-only in `session.audit_trail` (no edit/delete).

## 📦 Session File Structure

One session = one `.sapstack/sessions/{id}/` directory:

| File | When |
|---|---|
| `state.yaml` | every turn (current state, next action) |
| `bundles/evb-*.yaml` | Turn 1, 3 — operator-uploaded evidence |
| `hypotheses/h-*.yaml` | Turn 2 — AI hypotheses |
| `requests/flr-*.yaml` | Turn 2 — AI follow-up checklist |
| `verdicts/vdc-*.yaml` | Turn 4 — confirm/reject verdict |

Session ID format: `sess-YYYYMMDD-XXXXXX`

## 🚀 Operator Flow Example

```bash
# Turn 1 INTAKE
/sap-session-start "F110 Proposal fails — vendor 100234, 'No valid payment method'"
/sap-session-add-evidence sess-20260514-m2p9xt ./f110-log.txt ./lfb1-dump.csv

# Turn 2 HYPOTHESIS (AI generates hypotheses + follow-up)
/sap-session-next-turn sess-20260514-m2p9xt
#   H1: LFB1.ZWELS empty (most common)
#   H2: FBZP bank determination missing T/C method
#   H3: payment method not active per company code

# Turn 3 COLLECT (operator runs checklist, uploads)
/sap-session-add-evidence sess-20260514-m2p9xt ./xk03-zwels-check.txt

# Turn 4 VERIFY (AI confirms/rejects, Fix + Rollback)
/sap-session-next-turn sess-20260514-m2p9xt
#   H1 confirmed, Fix: XK02 set ZWELS, Rollback: XK02 clear ZWELS

/sap-session-handoff sess-20260514-m2p9xt --to web_triage
```

## 🧰 Auto Routing

By hypothesis `impacted_modules`, module consultants are auto-invoked in parallel: FI→`sap-fi-consultant`, MM→`sap-mm-consultant`, SD→`sap-sd-consultant`, PP→`sap-pp-consultant`, HCM→`sap-hcm-consultant`, TR→`sap-tr-consultant`, CO→`sap-co-consultant`, PM→`sap-pm-consultant`, QM→`sap-qm-consultant`, WM/EWM→`sap-ewm-consultant`, ABAP→`sap-abap-developer`, BASIS→`sap-basis-consultant`, Cloud PE→`sap-cloud-consultant`, S/4 migration→`sap-s4-migration-advisor`, BTP/CPI→`sap-integration-advisor`, beginner→`sap-tutor`. Multi-module → parallel invocation, synthesized verdict.

## 🌍 Field-Language Principle

sapstack uses real-world SAP field language, not dictionary translation:
- Field-language first (keep T-codes/abbreviations as-is: F110, MIGO, ST22, PO, GR, TR)
- Conversational patterns allowed
- Local business-calendar markers
- Full guide: `references/korean-field-language.md`; synonyms: `data/synonyms.yaml`

## ⚠️ Explicit Non-Goals
- No live SAP connection (no RFC/OData/Fiori direct call)
- No auto-edit of production data — operator runs all fixes
- No auto transport — human approval required
- No CLI forced on end users — they use the web portal surface

## 🚦 Relation to Other Modules

| | Quick Advisory | sap-session (Evidence Loop) |
|---|---|---|
| Turns | 1 | multi-turn (async) |
| Fit | "What is X?" | "X doesn't work" |
| Hypotheses | single answer | 2-4 + falsification |
| Evidence | none | explicit follow-up checklist |
| State | none | `.sapstack/sessions/...` |
| Rollback | optional | **mandatory** |

Rule: if 2+ turns expected OR 2+ hypothesis candidates → sap-session.

## 📚 Further Reading
- `references/turn-formats.md`, `references/evidence-bundle-guide.md`
- `references/session-state-lifecycle.md`, `references/korean-field-language.md`
- `../../../schemas/` — 5 JSON Schemas; `../../../CLAUDE.md` — Universal Rules
