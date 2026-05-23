# Sourcegraph Cody Rules for sapstack

> This file provides project-wide instructions to **Sourcegraph Cody** when working in the sapstack repository. Cody reads `.cody/rules.md` automatically.
>
> For Claude Code users: use `plugins/*/skills/*/SKILL.md` directly.
> For Codex CLI users: see `AGENTS.md` in repo root.
> For GitHub Copilot users: see `.github/copilot-instructions.md`.
> This file is the Cody-compatible instruction layer.

---

## Project Purpose

**sapstack** is a SAP operations advisory plugin collection for AI coding assistants, covering 24 SAP modules (FI, CO, TR, MM, SD, PP, HCM, SFSF, ABAP, S4-Migration, BTP, BASIS, BC, PM, QM, EWM, GTS, IBP, SAC, Ariba, Integration Cloud, plus meta plugins).

Repository: https://github.com/BoxLogoDev/sapstack

<!-- BEGIN sapstack-auto: stats -->
- **sapstack 버전**: v2.3.1
- **플러그인**: 24개
- **서브에이전트**: 20개
- **슬래시 커맨드**: 22개
<!-- END sapstack-auto: stats -->

---

## Universal Rules (Apply to ALL SAP Answers)

1. **NEVER hardcode** company codes, G/L accounts, cost centers, or org units. Ask the user or use `.sapstack/config.yaml`.
2. **ALWAYS ask for environment** before answering:
   - SAP Release (ECC 6.0 EhP / S/4HANA release year)
   - Deployment (On-Premise / RISE / Public Cloud)
   - Industry sector
   - Company code (user-provided — never guess)
3. **ALWAYS distinguish ECC vs S/4HANA** behavior where they differ.
4. **Transport request** required for any config change.
5. **No production changes** without simulation/test run first.
6. **No SE16N data edits** in production.
7. **Always provide T-code AND menu path** for every action.

## Field Language (Korean responses)

Use field-language terminology, not dictionary Korean:
- Primary: 외래어 ("코스트 센터", "페이먼트 메소드", "트포", "미고")
- First occurrence annotation: "코스트 센터 (원가센터, KOSTL)"
- Conversational patterns: "돌렸는데", "뜨네요", "안 돼요", "박아주세요"
- Keep T-codes as-is (F110, MIGO, ST22)
- Keep abbreviations as-is (PO, GR, TR — never expand)

## Cody-Specific Tips

- Cody can read SKILL.md files directly when you @-mention them: `@plugins/sap-fi/skills/sap-fi/SKILL.md`
- Use `@data/tcodes.yaml` for T-code lookups
- Use `@data/symptom-index.yaml` for error symptom matching
- For Korean quick reference: `@plugins/sap-{module}/skills/sap-{module}/references/ko/quick-guide.md`

## Two Response Modes

| Signal | Mode |
|---|---|
| Factual question, knowledge lookup | **Quick Advisory**: Issue → Root Cause → Check → Fix → Prevention |
| Incident diagnosis, multi-turn | **Evidence Loop**: Turn 1 INTAKE → Turn 2 HYPOTHESIS → Turn 3 COLLECT → Turn 4 VERIFY |

See `plugins/sap-session/skills/sap-session/SKILL.md` for full Evidence Loop spec.

## References

- Full universal rules: `CLAUDE.md` (root)
- Codex/Kiro layer: `AGENTS.md`
- Cursor layer: `.cursor/rules/sapstack.mdc`
- Continue layer: `.continue/config.yaml`
- Aider layer: `CONVENTIONS.md`
- Copilot layer: `.github/copilot-instructions.md`
