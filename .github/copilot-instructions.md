# GitHub Copilot Instructions for sapstack

This file provides project-wide instructions to GitHub Copilot Chat and Copilot Edits when working in the sapstack repository. Copilot reads this file automatically.

> For Claude Code users: use `plugins/*/skills/*/SKILL.md` directly.
> For Codex CLI users: see `AGENTS.md` in repo root.
> This file is the Copilot-compatible instruction layer.

---

## Project Purpose

**sapstack** is a SAP operations advisory plugin collection for AI coding assistants, covering 13 SAP modules (FI, CO, TR, MM, SD, PP, HCM, SFSF, ABAP, S4-Migration, BTP, BASIS, BC). Every answer must follow universal SAP advisory rules regardless of which AI assistant loads it.

Repository: https://github.com/BoxLogoDev/sapstack

---

## Universal Rules (Apply to ALL SAP Answers)

When the user asks any SAP-related question in this repo:

1. **NEVER hardcode** company codes, G/L accounts, cost centers, or organizational units. Ask the user or use `.sapstack/config.yaml` values.
2. **ALWAYS ask for environment** before answering:
   - SAP Release (ECC 6.0 EhP / S/4HANA release year)
   - Deployment model (On-Premise / RISE with SAP / Public Cloud)
   - Industry sector
   - Company code (user provides — never guess)
3. **ALWAYS distinguish ECC vs S/4HANA** behavior where they differ.
4. **Transport request** required for any config change.
5. **Simulate before actual run** — AFAB, F.13, FAGL_FC_VAL, KSU5, MR11, F110 must start with Test Run.
6. **Never recommend SE16N** data edits in production.
7. **Always provide T-code + menu path** for every action.

---

## Response Format (Mandatory for SAP Issues)

```
## 🔍 Issue
(Restate the symptom)

## 🧠 Root Cause
(Probable causes, probability-ordered)

## ✅ Check
1. [T-code] — what to check
2. [Table.Field] — data-level verification

## 🛠 Fix
1. Step-by-step

## 🛡 Prevention
(Config / process improvement)

## 📖 SAP Note
(Only if verified in data/sap-notes.yaml)
```

---

## Where to Find Knowledge

When you need SAP module knowledge in this repo, look in:

- `plugins/sap-<module>/skills/sap-<module>/SKILL.md` — English source of truth per module
- `plugins/sap-<module>/skills/sap-<module>/references/` — English detailed references
- `plugins/sap-<module>/skills/sap-<module>/references/ko/` — Korean quick guides and (for sap-fi, sap-abap) full Korean translations
- `data/tcodes.yaml` — authoritative T-code registry. **Never mention a T-code not listed here unless you verify it.**
- `data/sap-notes.yaml` — verified SAP Note catalog. **Never cite a Note number not listed here.** If the user needs one and it's absent, say "I need to verify this Note on SAP Support Portal" rather than guessing.
- `agents/*.md` — specialized role prompts (FI consultant, ABAP reviewer, S4 migration advisor, Basis troubleshooter, MM consultant)
- `commands/*.md` — slash-command workflows (closing checklist, payment debug, MIGO debug, etc.)
- `.sapstack/config.example.yaml` — environment profile template

---

## The 13 Modules

| Plugin | Topic | Use When User Mentions |
|--------|-------|----------------------|
| sap-fi | Financial Accounting | FB01, F110, MIRO, period close, AP, AR, GL, AA, tax, GR/IR |
| sap-co | Controlling | cost center, KSU5, KO88, CK11N, CO-PA, settlement |
| sap-tr | Treasury & Cash Management | FF7A, FF7B, liquidity, cash position, bank statement |
| sap-mm | Materials Management | MIGO, MIRO, ME21N, GR/IR, purchasing, inventory |
| sap-sd | Sales & Distribution | VA01, VF01, billing, pricing, credit, delivery |
| sap-pp | Production Planning | MRP, MD01, CO01, BOM, routing |
| sap-hcm | HCM On-Premise | PA30, infotype, payroll, PC00, time, H4S4 |
| sap-sfsf | SuccessFactors | EC, ECP, Recruiting, LMS, RBP, OData |
| sap-abap | ABAP Development | SE38, BAdI, CDS, RAP, ST22, clean core, ATC |
| sap-s4-migration | ECC → S/4HANA Migration | brownfield, greenfield, readiness, SUM, ATC |
| sap-btp | SAP Business Technology Platform | CAP, Fiori, OData, XSUAA |
| sap-basis | BASIS Administration (Global) | STMS, transport, PFCG, SM50, kernel, authorization |
| **sap-bc** | **Korean BC Consultant Specialization** | Korean environment, 한글, 망분리, 전자세금계산서, K-SOX |

### Important — sap-basis vs sap-bc
**BC = Basis in the Korean SAP industry.** "BC Consultant" in Korean equals "Basis Consultant" in English. The `sap-bc` plugin covers the same foundational topics as `sap-basis` but layered with Korea-specific context:
- Korean Unicode / 한글 dump issues (CONVT_CODEPAGE)
- Closed-network (망분리) kernel upgrade procedures
- STRUST for Korean electronic tax invoice certificate
- K-SOX authorization recertification
- Korean SAP OSS support channels

If the user writes in Korean or mentions Korea-specific scenarios, prefer `sap-bc`. Otherwise use `sap-basis`.

---

## Code Assistance Patterns

### When generating ABAP code

1. **Read `plugins/sap-abap/skills/sap-abap/SKILL.md` first** — it contains approved patterns for BAdI, ALV, BAPI, CDS, RAP, ABAP Unit.
2. **Never use deprecated patterns** listed in the S/4HANA deprecated table (BSEG SELECT, CALL TRANSACTION in background, old BAdI CL_EXITHANDLER, etc.).
3. **Performance first** — no `SELECT *`, use targeted fields, no SELECT inside LOOP, FOR ALL ENTRIES with empty check.
4. **Error handling** — all BAPI calls check RETURN table for E/A types.
5. **Clean Core** — no modifications to SAP standard objects. Use BAdI / Enhancement Spot / CDS extension.
6. **Security** — AUTHORITY-CHECK on sensitive data. No hardcoded credentials.
7. **Korean context** — mask personal data (주민번호, 연락처) in logs and UI.

### When suggesting SAP configuration

1. **Require Transport Request** for any config change.
2. **Distinguish ECC vs S/4HANA paths** explicitly.
3. **Provide SPRO menu path** alongside T-code.
4. **Recommend Test Run first** for destructive operations.

### When debugging

1. **Reproduce first** — ask how often, which user, which T-code.
2. **Check logs** before suggesting fixes: ST22 (dumps), SM21 (system), SM13 (update), tp logs (transport).
3. **Root cause over workaround** — a restart is the last option.

---

## Quality Gates

Before committing changes to this repo:

```bash
./scripts/lint-frontmatter.sh       # YAML frontmatter validation
./scripts/check-marketplace.sh      # marketplace.json integrity
./scripts/check-hardcoding.sh --strict  # hardcoding detection (STRICT in v1.2.0+)
./scripts/check-tcodes.sh           # T-code registry validation
./scripts/resolve-note.sh <keyword> # SAP Note lookup
```

GitHub Actions (`.github/workflows/ci.yml`) runs all gates on push/PR.

---

## Contribution

- Follow `CONTRIBUTING.md` (Korean) for adding new plugins/agents/commands.
- Every new plugin needs: `SKILL.md` with frontmatter, `marketplace.json` entry, and passes quality gates.
- Korean references in `references/ko/` are welcome but optional — keep English SKILL.md body as-is for keyword matching.

---

## See Also

- `README.md` — General user guide
- `CLAUDE.md` — Claude Code Universal Rules (English)
- `AGENTS.md` — Codex CLI compatibility layer
- `docs/architecture.md` — Three-axis architecture explanation
- `docs/multi-ai-compatibility.md` — Using sapstack with Copilot, Cursor, Codex, Claude Code
- `docs/environment-profile.md` — `.sapstack/config.yaml` guide
- `docs/roadmap.md` — Future plans
