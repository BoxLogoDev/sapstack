# sapstack — SAP Skills & Agents for Claude Code

Production-ready Claude Code plugin collection covering **all SAP modules**,
applicable to **any company** running SAP ECC 6.0 or S/4HANA.

No company-specific hardcoding — every skill dynamically adapts to the user's environment.

---

## Installation

Add to Claude Code in one command:

```bash
/plugin marketplace add https://github.com/BoxLogoDev/sapstack
```

Install individual plugins:

```bash
/plugin install sap-fi@sapstack
/plugin install sap-abap@sapstack
```

Install all plugins at once:

```bash
/plugin install sap-fi@sapstack sap-co@sapstack sap-tr@sapstack \
  sap-mm@sapstack sap-sd@sapstack sap-pp@sapstack \
  sap-hcm@sapstack sap-sfsf@sapstack sap-abap@sapstack \
  sap-s4-migration@sapstack sap-btp@sapstack sap-basis@sapstack
```

**Team setup** — add to `.claude/settings.json` for automatic availability:

```json
{
  "extraKnownMarketplaces": [
    { "name": "sapstack", "url": "https://github.com/BoxLogoDev/sapstack" }
  ]
}
```

---

## Available Plugins (13)

### Core Financials

| Plugin | Trigger Keywords | Description |
|--------|----------------|-------------|
| `sap-fi` | FB01, F110, MIRO, period close, AP, AR, GL, AA, tax, GR/IR | Financial Accounting — GL, AP, AR, Asset Accounting |
| `sap-co` | cost center, KSU5, KO88, CK11N, CO-PA, settlement | Controlling — CCA, PCA, IO, Product Costing, CO-PA |
| `sap-tr` | FF7A, FF7B, liquidity, FLQDB, cash position, bank statement | Treasury & Cash Management |

### Logistics

| Plugin | Trigger Keywords | Description |
|--------|----------------|-------------|
| `sap-mm` | MIGO, MIRO, ME21N, GR/IR, purchasing, inventory | Materials Management |
| `sap-sd` | VA01, VF01, billing, pricing, credit, delivery | Sales & Distribution |
| `sap-pp` | MRP, MD01, CO01, BOM, routing, production order | Production Planning |

### Human Resources

| Plugin | Trigger Keywords | Description |
|--------|----------------|-------------|
| `sap-hcm` | HCM, PA30, infotype, payroll, PC00, time, H4S4 | HCM On-Premise (ECC + H4S4) |
| `sap-sfsf` | SuccessFactors, EC, ECP, Recruiting, RBP, OData | SAP SuccessFactors — all modules |

### Technology

| Plugin | Trigger Keywords | Description |
|--------|----------------|-------------|
| `sap-abap` | ABAP, SE38, BAdI, CDS, RAP, ST22, clean core, ATC | ABAP Development — classic + RAP |
| `sap-s4-migration` | migration, brownfield, readiness check, BP migration, SUM | ECC → S/4HANA Migration |
| `sap-btp` | BTP, CAP, Fiori, OData, Integration Suite, XSUAA | SAP BTP Development |
| `sap-basis` | BASIS, STMS, transport, PFCG, SM50, performance | BASIS Administration (Global) |
| `sap-bc` 🇰🇷 | BC, 베이시스, 한국, Solman, 전자세금계산서, 망분리, KISA, K-SOX | **한국 BC 컨설턴트 특화** — Basis 심화 + 한국 현장 |

---

## How Skills Activate

Once installed, skills activate automatically based on conversation context.
No manual invocation needed:

- *"Why is MIRO blocking on invoice amount?"* → `sap-fi` activates
- *"Write an ABAP BAdI for MM goods receipt"* → `sap-abap` activates
- *"Our FF7A is missing vendor payments"* → `sap-tr` activates
- *"How do I migrate vendors to Business Partner?"* → `sap-s4-migration` activates
- *"Employee Central field not visible in RBP"* → `sap-sfsf` activates

You can also invoke directly with a slash command:

```
/sap-fi How do I clear open items at year-end?
/sap-abap Create a CDS view for FI line items
```

---

## Universal Rules (All Skills Follow These)

1. **Never hardcode** company codes, G/L accounts, or org units
2. **Always ask** for environment (ECC / S/4HANA / release / industry) before answering
3. **Always distinguish** ECC vs S/4HANA behavior where they differ
4. **Transport request required** for any configuration change
5. **Simulate before actual run** — AFAB, F.13, FAGL_FC_VAL, KSU5, MR11, etc.
6. **Never recommend** SE16N data changes in production
7. **Provide T-code + menu path** for every action

---

## 🚀 고급 사용법 (v1.1.0 신규) — 한국어 가이드

sapstack v1.1.0부터 **3축 구조** — Active Advisors + Context Persistence + Quality Gates — 로 재구축되었습니다.

### 축 1. Active Advisors — 위임 가능한 컨설턴트

#### 📍 서브에이전트 (`agents/`)
복잡한 다단계 분석이 필요한 작업은 **독립 컨텍스트**의 서브에이전트에 위임됩니다.

| 에이전트 | 역할 | 자동 위임 트리거 |
|---------|------|-----------------|
| `sap-fi-consultant` | FI 이슈 체계적 진단 (환경 인테이크 → Issue → Root Cause → Fix) | 복잡한 FI 문제, 월결산 이슈 |
| `sap-abap-reviewer` | ABAP 코드 리뷰 (Clean Core, HANA 최적화, ATC, K-SOX 보안) | 코드 리뷰 요청 |
| `sap-s4-migration-advisor` | Brownfield/Greenfield/Selective 경로 추천 + Risk 분석 | S/4HANA 전환 질문 |

#### 📍 슬래시 커맨드 (`commands/`)
반복 작업을 원샷 워크플로로 실행합니다.

```bash
/sap-fi-closing 월결산 <회사코드>       # FI 월결산/연결산 체크리스트 단계별 실행
/sap-abap-review <파일경로>             # ABAP 코드를 reviewer 서브에이전트에 위임
/sap-s4-readiness --auto                # S/4HANA 마이그레이션 Readiness 평가
/sap-migo-debug <에러번호> <이동유형>   # MIGO 포스팅 에러 진단 파이프라인
/sap-payment-run-debug <벤더번호>       # F110 지급실행 디버그
```

### 축 2. Context Persistence — 환경 프로필

**문제**: "ECC인가요 S/4인가요?", "회사코드는요?" 같은 질문을 매 세션 반복하는 UX 고통.

**해결**: 프로젝트 루트에 `.sapstack/config.yaml` **1회 설정** → 모든 산출물이 자동 참조.

```bash
# 프로젝트 루트에서
mkdir -p .sapstack
curl -o .sapstack/config.example.yaml \
  https://raw.githubusercontent.com/BoxLogoDev/sapstack/main/.sapstack/config.example.yaml
cp .sapstack/config.example.yaml .sapstack/config.yaml
echo ".sapstack/config.yaml" >> .gitignore   # 민감정보 보호
```

상세: [`docs/environment-profile.md`](docs/environment-profile.md)

### 축 3. Quality Gates — 품질 보증

13개 모듈을 유지보수 가능한 품질로 관리하기 위한 **자동 검증** 파이프라인.

```bash
./scripts/lint-frontmatter.sh      # name/description/tools 검증
./scripts/check-marketplace.sh     # marketplace.json 무결성
./scripts/check-hardcoding.sh      # 회사코드/계정 하드코딩 탐지
```

GitHub Actions CI (`.github/workflows/ci.yml`)가 main 푸시·PR에서 자동 실행합니다.

---

## 🇰🇷 한국어 사용자 가이드

### 각 모듈의 한국어 퀵가이드
13개 모든 모듈에 **한국 현장 관점 요약**이 포함되어 있습니다.

```
plugins/<module>/skills/<module>/references/ko/quick-guide.md
```

### sap-bc — 한국 BC 컨설턴트 특화 플러그인
글로벌 `sap-basis`는 영문 Basis 주제를 다루고, `sap-bc`는 **한국 현장**에 집중합니다:
- Solution Manager Korea, HANA 한국 로케일
- 한글 Unicode 이슈, SAPGUI 한글 깨짐
- 전자세금계산서 연동 (STRUST 공인인증서)
- 망분리 환경 Kernel 업그레이드
- K-SOX 내부통제 권한 관리
- 한국 SAPNet OSS 사용법

### 한국어 답변 설정
`.sapstack/config.yaml`에서 `preferences.language: ko`로 설정하면 모든 sapstack 산출물이 한국어로 응답합니다.

---

## Repository Structure

```
sapstack/
├── CLAUDE.md                              ← Universal rules for all skills
├── README.md                              ← This file
├── .claude-plugin/
│   └── marketplace.json                   ← Plugin catalog
└── plugins/
    ├── sap-fi/skills/sap-fi/
    │   ├── SKILL.md
    │   └── references/
    │       ├── tcode-reference.md
    │       └── closing-checklist.md
    ├── sap-co/skills/sap-co/
    │   ├── SKILL.md
    │   └── references/period-end.md
    ├── sap-tr/skills/sap-tr/
    │   ├── SKILL.md
    │   └── references/liquidity-guide.md
    ├── sap-mm/skills/sap-mm/SKILL.md
    ├── sap-sd/skills/sap-sd/SKILL.md
    ├── sap-pp/skills/sap-pp/SKILL.md
    ├── sap-hcm/skills/sap-hcm/
    │   ├── SKILL.md
    │   └── references/payroll-guide.md
    ├── sap-sfsf/skills/sap-sfsf/
    │   ├── SKILL.md
    │   └── references/migration-path.md
    ├── sap-abap/skills/sap-abap/
    │   ├── SKILL.md
    │   └── references/
    │       ├── clean-core-patterns.md
    │       └── code-review-checklist.md
    ├── sap-s4-migration/skills/sap-s4-migration/
    │   ├── SKILL.md
    │   └── references/simplification-items.md
    ├── sap-btp/skills/sap-btp/SKILL.md
    └── sap-basis/skills/sap-basis/SKILL.md
```

---

## Compatibility

| Plugin | ECC 6.0 | S/4HANA OP | RISE | Cloud PE |
|--------|---------|------------|------|----------|
| sap-fi | ✓ | ✓ | ✓ | ✓ |
| sap-co | ✓ | ✓ | ✓ | ✓ |
| sap-tr | ✓ | ✓ | ✓ | △ |
| sap-mm | ✓ | ✓ | ✓ | ✓ |
| sap-sd | ✓ | ✓ | ✓ | ✓ |
| sap-pp | ✓ | ✓ | ✓ | ✓ |
| sap-hcm | ✓ | ✓ (H4S4) | ✓ | ✗ |
| sap-sfsf | ✗ | ✓ | ✓ | ✓ |
| sap-abap | ✓ | ✓ | ✓ | ✗ (RAP only) |
| sap-s4-migration | ✓ | ✓ | ✓ | ✗ |
| sap-btp | ✗ | ✓ | ✓ | ✓ |
| sap-basis | ✓ | ✓ | △ | ✗ |

△ = Limited — some features managed by SAP in cloud environments

---

## Contributing

Contributions welcome! To add a new plugin:

1. Create directory: `plugins/sap-{module}/skills/sap-{module}/SKILL.md`
2. Follow the SKILL.md format (YAML frontmatter + markdown body)
3. Description must be in third person, include trigger keywords, max 1024 chars
4. No hardcoded company-specific values
5. ECC vs S/4HANA differences must be explicitly documented
6. Add entry to `.claude-plugin/marketplace.json`
7. Submit pull request with test scenario examples

---

## License

MIT License — see LICENSE file for details.

**Maintained by [@BoxLogoDev](https://github.com/BoxLogoDev).**
Last updated: 2026-04-11
