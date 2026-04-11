# sapstack — SAP Skills & Agents for AI Coding Assistants

Production-ready plugin collection covering **all SAP modules**, applicable to **any company** running SAP ECC 6.0 or S/4HANA.

**Works with**: Claude Code (native) · OpenAI Codex CLI · GitHub Copilot · Cursor — 동일한 지식을 여러 AI 도구에서 일관되게 활용 가능합니다. 자세히는 [`docs/multi-ai-compatibility.md`](docs/multi-ai-compatibility.md) 참조.

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
| `sap-basis` | BASIS, STMS, transport, PFCG, SM50, performance | BASIS Administration — **Global / English** |
| `sap-bc` 🇰🇷 | BC, 베이시스, 한국, Solman, 전자세금계산서, 망분리, KISA, K-SOX | **Basis — 한국 버전** (동일 영역, 한국 현장 맥락) |

> **💡 sap-basis vs sap-bc 관계**
>
> **BC = Basis 입니다.** 한국 SAP 업계에서 "BC 컨설턴트"는 "Basis Consultant"와 완전히 같은 의미로 쓰이며, SAP 공식 모듈 코드 체계에서도 BC = Basis Components입니다. 즉 **sap-bc는 sap-basis의 한국 현장 특화 버전**입니다.
>
> | 구분 | `sap-basis` | `sap-bc` |
> |------|-----------|----------|
> | 언어 | 영문 | 한국어 (본문), 영문 키워드 병기 |
> | 대상 | 글로벌 Basis 컨설턴트 | 한국 BC 컨설턴트 |
> | 주제 | Transport, 권한, 성능, Kernel 등 공통 Basis | 공통 Basis + **한글 Unicode·망분리·전자세금계산서·K-SOX·한국 SAPNet OSS** |
> | 자동 활성화 | `BASIS`, `STMS`, `PFCG` 등 영문 키워드 | `BC`, `베이시스`, `한국`, `Solman`, `망분리` 등 |
>
> 두 파일은 **서로 배타적이지 않고 보완적**입니다. 글로벌 프로젝트면 `sap-basis`만, 한국 현장이면 `sap-bc`를 추가로 설치하면 됩니다. 같은 Basis 이슈에 대해 한국 Localization 맥락이 필요할 때 `sap-bc`가 자동으로 보강됩니다.

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

#### 📍 서브에이전트 9개 (`agents/`) — v1.3.0
복잡한 다단계 분석이 필요한 작업은 **독립 컨텍스트**의 서브에이전트에 위임됩니다.

| 에이전트 | 역할 | 추가된 버전 |
|---------|------|-------------|
| `sap-fi-consultant` | FI 이슈 체계적 진단 | v1.1.0 |
| `sap-abap-reviewer` | ABAP 코드 리뷰 (Clean Core·HANA·ATC·K-SOX) | v1.1.0 |
| `sap-s4-migration-advisor` | Brownfield/Greenfield/Selective 경로 추천 | v1.1.0 |
| `sap-basis-troubleshooter` | Basis 장애 증상별 라우팅 | v1.2.0 |
| `sap-mm-consultant` | MM 전반 (구매·재고·GR/IR·외주) | v1.2.0 |
| **`sap-sd-consultant`** | SD Order-to-Cash 전체 진단 | **v1.3.0** |
| **`sap-co-consultant`** | CO 전반 (CCA/PCA/IO/CO-PC/CO-PA) | **v1.3.0** |
| **`sap-pp-analyzer`** | PP 생산계획 + 한국 제조업 특화 | **v1.3.0** |
| **`sap-integration-advisor`** | RFC/IDoc/OData/CPI + 한국 SaaS 연동 | **v1.3.0** |

#### 📍 슬래시 커맨드 10개 (`commands/`) — v1.3.0
반복 작업을 원샷 워크플로로 실행합니다.

```bash
# 결산
/sap-fi-closing 월결산 <회사코드>           # 월결산 체크리스트 (v1.1.0)
/sap-quarter-close <회사코드> <분기>        # 분기 결산 (K-IFRS + K-SOX) — v1.3.0
/sap-year-end <회사코드> <연도>             # 연결산 (법인세·감사) — v1.3.0

# 디버그
/sap-migo-debug <에러번호> <이동유형>       # MIGO 포스팅 에러 (v1.1.0)
/sap-payment-run-debug <벤더번호>           # F110 지급실행 (v1.1.0)
/sap-transport-debug <TR ID>                # STMS 실패 진단 — v1.3.0
/sap-korean-tax-invoice-debug <유형>        # 전자세금계산서 — v1.3.0
/sap-performance-check <대상>               # 성능 점검 파이프라인 — v1.3.0

# 분석 / 평가
/sap-abap-review <파일경로>                 # ABAP 리뷰 위임 (v1.1.0)
/sap-s4-readiness --auto                    # S/4HANA Readiness (v1.1.0)
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
./scripts/lint-frontmatter.sh          # name/description/tools 검증
./scripts/check-marketplace.sh         # marketplace.json 무결성
./scripts/check-hardcoding.sh --strict # 회사코드/계정 하드코딩 (STRICT — v1.2.0+)
./scripts/check-tcodes.sh              # T-code 레지스트리 검증 (v1.2.0+)
./scripts/resolve-note.sh <키워드>     # SAP Note 검색 도구 (v1.2.0+)
```

GitHub Actions CI (`.github/workflows/ci.yml`)가 main 푸시·PR에서 자동 실행합니다.

### 🗃 데이터 자산 (v1.2.0 신규)

v1.2.0부터 **확정된 데이터셋**을 모든 에이전트/커맨드가 공유하여 "추측 없이 답변"하는 근거를 제공합니다.

| 파일 | 역할 |
|------|------|
| `data/tcodes.yaml` | 확정된 T-code 레지스트리 — SKILL.md에서 미등록 T-code가 언급되면 `check-tcodes.sh`가 경고 |
| `data/sap-notes.yaml` | 확정된 SAP Note 카탈로그 — AI는 이 리스트에 없는 Note 번호를 추정 금지 |

```bash
# SAP Note 검색 예시
./scripts/resolve-note.sh korea         # 한국 localization 관련 Note
./scripts/resolve-note.sh migration     # 마이그레이션 관련
./scripts/resolve-note.sh CONVT_CODEPAGE  # 특정 덤프 유형
```

---

## 🇰🇷 한국어 사용자 가이드

### 각 모듈의 한국어 퀵가이드
13개 모든 모듈에 **한국 현장 관점 요약**이 포함되어 있습니다.

```
plugins/<module>/skills/<module>/references/ko/quick-guide.md
```

### sap-bc — 한국 BC 컨설턴트 특화 플러그인

**BC = Basis** (한국 업계 관용어)입니다. 글로벌 `sap-basis`는 영문 Basis 주제를 다루고, `sap-bc`는 **같은 Basis 영역의 한국 현장 특화 버전**입니다:
- Solution Manager Korea, HANA 한국 로케일
- 한글 Unicode 이슈, SAPGUI 한글 깨짐 (CONVT_CODEPAGE)
- 전자세금계산서 연동 (STRUST 공인인증서)
- 망분리(폐쇄망) 환경 Kernel 업그레이드 절차
- K-SOX 상장사 내부통제 권한 관리
- 한국 SAPNet OSS 한국어 지원 활용법

### 🇰🇷 본문 한국어 전문 번역 (v1.2.0 신규)
`sap-fi`와 `sap-abap`은 **전체 본문 한국어 번역**이 `references/ko/SKILL-ko.md`로 제공됩니다. 나머지 모듈은 `references/ko/quick-guide.md` 퀵가이드가 있습니다. 한국어 번역본 추가는 [CONTRIBUTING.md](CONTRIBUTING.md) 참조.

### 한국어 답변 설정
`.sapstack/config.yaml`에서 `preferences.language: ko`로 설정하면 모든 sapstack 산출물이 한국어로 응답합니다.

---

## 🤖 여러 AI 도구에서 sapstack 사용 (v1.3.0 업데이트: 6개 도구 지원)

sapstack은 Claude Code 전용이 아닙니다. **동일한 지식 베이스를 6개 AI 도구에서** 사용할 수 있도록 호환 레이어 파일을 제공합니다.

| AI 도구 | 진입점 파일 | 설치 방식 | 추가된 버전 |
|---------|-----------|-----------|-------------|
| **Claude Code** | `plugins/*/skills/*/SKILL.md` | `/plugin marketplace add ...` | v1.0.0 |
| **OpenAI Codex CLI** | [`AGENTS.md`](AGENTS.md) | git submodule 자동 로드 | v1.2.0 |
| **GitHub Copilot** | [`.github/copilot-instructions.md`](.github/copilot-instructions.md) + [`.github/instructions/*.instructions.md`](.github/instructions/) | 저장소 복사 자동 인식 | v1.2.0 (v1.3.0 파일 분할) |
| **Cursor** | [`.cursor/rules/sapstack.mdc`](.cursor/rules/sapstack.mdc) | `alwaysApply: true` | v1.2.0 |
| **Continue.dev** | [`.continue/config.yaml`](.continue/config.yaml) | Continue 확장 설정 | **v1.3.0** |
| **Aider** | [`CONVENTIONS.md`](CONVENTIONS.md) | `aider --read CONVENTIONS.md` | **v1.3.0** |

자세한 설치·사용 예시는 [`docs/multi-ai-compatibility.md`](docs/multi-ai-compatibility.md)를 참조하세요. 핵심 아이디어는 **"원본 1개(Claude Code SKILL.md) + 호환 레이어 N개"**로, 어떤 AI를 쓰든 Universal Rules·Response Format·지식 품질이 일관됩니다.

### 빠른 시작 — Codex CLI 예시
```bash
# 1. sapstack을 프로젝트에 import
git submodule add https://github.com/BoxLogoDev/sapstack sapstack
cd sapstack && git checkout v1.2.0

# 2. Codex CLI로 질문 (AGENTS.md 자동 로드)
codex "sap-fi-consultant 프롬프트 규칙을 따라 MIRO 세금코드 이슈를 진단해줘.
환경: S/4HANA 2023, on-premise, 회사코드 KR01"
```

---

## ✅ 설치 후 빠른 검증 (v1.3.0)

```bash
# 1. 저장소 clone
git clone https://github.com/BoxLogoDev/sapstack
cd sapstack

# 2. 품질 게이트 7개 전부 실행
./scripts/lint-frontmatter.sh           # 0 errors
./scripts/check-marketplace.sh          # 13 plugins
./scripts/check-hardcoding.sh --strict  # 0 errors
./scripts/check-tcodes.sh --strict      # 273 T-codes, 0 unknown
./scripts/check-ko-references.sh        # 13 quick-guides
./scripts/check-links.sh                # 내부 링크 검증
./scripts/build-multi-ai.sh --check     # 6개 호환 레이어 검증

# 3. 데이터 자산 스모크 테스트
./scripts/resolve-note.sh korea         # Korea Note 검색
./scripts/resolve-note.sh migration     # 마이그레이션 Note
./scripts/validate-config.sh .sapstack/config.example.yaml  # config 검증

# 4. (Claude Code) Plugin 설치
# /plugin marketplace add https://github.com/BoxLogoDev/sapstack
# /plugin install sap-fi@sapstack sap-bc@sapstack
```

### 📚 도움말 문서 (v1.3.0 신규)

- **[docs/tutorial.md](docs/tutorial.md)** — 15분 튜토리얼 (설치 → 첫 질문 → 위임)
- **[docs/scenarios/](docs/scenarios/)** — 5개 실전 Q&A 사례
- **[docs/faq.md](docs/faq.md)** — 30개 자주 묻는 질문
- **[docs/glossary.md](docs/glossary.md)** — 🇰🇷 SAP 용어집 (한국어/영문 150+)
- **[docs/troubleshooting.md](docs/troubleshooting.md)** — sapstack 자체 문제 해결
- **[docs/multi-ai-compatibility.md](docs/multi-ai-compatibility.md)** — 6개 AI 도구 사용 가이드
- **[docs/environment-profile.md](docs/environment-profile.md)** — `.sapstack/config.yaml` 가이드
- **[docs/architecture.md](docs/architecture.md)** — 3축 구조 상세
- **[docs/roadmap.md](docs/roadmap.md)** — v1.4+ 계획

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
