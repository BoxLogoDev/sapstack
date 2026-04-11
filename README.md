<div align="center">

# 🏛 sapstack

### SAP Operations Advisory Platform for AI Coding Assistants

**14 modules · 9 subagents · 10 commands · 6 AI tools · 279 T-codes · 100% Korean**

[![Version](https://img.shields.io/badge/version-1.4.0-blue.svg)](https://github.com/BoxLogoDev/sapstack/releases/tag/v1.4.0)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![CI](https://img.shields.io/badge/CI-passing-brightgreen.svg)](https://github.com/BoxLogoDev/sapstack/actions)
[![Korean](https://img.shields.io/badge/Korean-100%25-red.svg)](docs/glossary.md)
[![Multi-AI](https://img.shields.io/badge/AI%20tools-6-purple.svg)](docs/multi-ai-compatibility.md)

<p>
  <a href="docs/tutorial.md"><b>튜토리얼</b></a> ·
  <a href="docs/faq.md"><b>FAQ</b></a> ·
  <a href="docs/glossary.md"><b>🇰🇷 용어집</b></a> ·
  <a href="docs/multi-ai-compatibility.md"><b>Multi-AI 가이드</b></a> ·
  <a href="docs/roadmap.md"><b>로드맵</b></a>
</p>

</div>

---

## ⚡ 30초 소개

sapstack은 **AI 코딩 어시스턴트를 SAP 운영 컨설턴트로 만드는 지식 플랫폼**입니다.

- 🎯 **14개 SAP 모듈** — FI/CO/TR/MM/SD/PP/HCM/SFSF/ABAP/S4Migration/BTP/BASIS/BC/GTS
- 🤖 **9개 서브에이전트** — 다단계 진단을 독립 컨텍스트에 위임
- ⚙️ **10개 슬래시 커맨드** — 월/분기/연 결산, 각종 디버그 파이프라인
- 🌐 **6개 AI 도구 호환** — Claude Code · Codex CLI · GitHub Copilot · Cursor · Continue.dev · Aider
- 🇰🇷 **한국어 100% 완성** — 14/14 모듈 한국어 퀵가이드 + 전문 번역
- 📊 **279개 확정 T-code** + **50+ 확정 SAP Note** 데이터셋
- 🛡 **8개 품질 게이트** — Strict 모드 CI

---

## 🚀 Quick Start

### 1️⃣ Claude Code
```bash
/plugin marketplace add https://github.com/BoxLogoDev/sapstack
/plugin install sap-fi@sapstack sap-abap@sapstack sap-bc@sapstack
```

### 2️⃣ OpenAI Codex CLI
```bash
git submodule add https://github.com/BoxLogoDev/sapstack sapstack
cd sapstack && git checkout v1.4.0 && cd ..
codex "sapstack 규칙에 따라 MIRO 세금코드 이슈 진단해줘"
```

### 3️⃣ GitHub Copilot (VS Code)
저장소 clone 또는 `.github/copilot-instructions.md` 복사 → 자동 인식

### 4️⃣ Cursor / Continue.dev / Aider
각각 `.cursor/rules/sapstack.mdc` / `.continue/config.yaml` / `CONVENTIONS.md` 자동 로드

상세: **[docs/multi-ai-compatibility.md](docs/multi-ai-compatibility.md)**

---

## 🏛 아키텍처 — 3축 구조

```
┌─────────────────────────────────────────────────────┐
│             sapstack v1.4.0                         │
├─────────────────────────────────────────────────────┤
│  ① Active Advisors      ② Context Persistence      │
│     (위임형 컨설턴트)        (환경 프로필)             │
│  • 14 SKILL.md          • .sapstack/config.yaml     │
│  • 9 subagents          • JSON Schema validation    │
│  • 10 commands          • 한국 Localization         │
│           ▲                        ▲                │
│           └──────────┬─────────────┘                │
│                      ▼                              │
│  ③ Quality Gates (8종 CI)                           │
│     • lint-frontmatter / marketplace                │
│     • check-hardcoding / check-tcodes (strict)      │
│     • check-ko-references / check-links (strict)    │
│     • check-ecc-s4-split (strict)                   │
│     • build-multi-ai (drift detection)              │
└─────────────────────────────────────────────────────┘
```

상세: [docs/architecture.md](docs/architecture.md)

---

## 📦 14개 플러그인 카탈로그

### 💰 Core Financials
| Plugin | 주제 | 트리거 키워드 |
|--------|------|-------------|
| [`sap-fi`](plugins/sap-fi/) | Financial Accounting | FB01, F110, MIRO, period close, GR/IR, tax |
| [`sap-co`](plugins/sap-co/) | Controlling | cost center, KSU5, KO88, CK11N, CO-PA |
| [`sap-tr`](plugins/sap-tr/) | Treasury &amp; Cash | FF7A, FF7B, liquidity, MT940, DMEE |

### 📦 Logistics
| Plugin | 주제 | 트리거 키워드 |
|--------|------|-------------|
| [`sap-mm`](plugins/sap-mm/) | Materials Management | MIGO, ME21N, MB52, GR/IR, MR11 |
| [`sap-sd`](plugins/sap-sd/) | Sales &amp; Distribution | VA01, VF01, FD32, pricing, credit |
| [`sap-pp`](plugins/sap-pp/) | Production Planning | MRP, MD01/MD04, CO01, BOM, routing |

### 👥 Human Resources
| Plugin | 주제 | 트리거 키워드 |
|--------|------|-------------|
| [`sap-hcm`](plugins/sap-hcm/) | HCM On-Premise (ECC + H4S4) | PA30, PC00_M46, 4대보험, 연말정산 |
| [`sap-sfsf`](plugins/sap-sfsf/) | SuccessFactors | EC, ECP, Recruiting, LMS, RBP |

### 💻 Technology
| Plugin | 주제 | 트리거 키워드 |
|--------|------|-------------|
| [`sap-abap`](plugins/sap-abap/) | ABAP Development | SE38, BAdI, CDS, RAP, ST22, Clean Core |
| [`sap-s4-migration`](plugins/sap-s4-migration/) | ECC → S/4HANA | Brownfield, Greenfield, SUM, ATC, BP |
| [`sap-btp`](plugins/sap-btp/) | Business Technology Platform | CAP, Fiori, OData, XSUAA, iFlow |
| [`sap-basis`](plugins/sap-basis/) | BASIS Administration (**Global**) | STMS, SM50, PFCG, Kernel |

### 🇰🇷 Korea Specialization + 🌍 Global Trade
| Plugin | 주제 | 트리거 키워드 |
|--------|------|-------------|
| [`sap-bc`](plugins/sap-bc/) 🇰🇷 | **Basis — 한국 버전** | BC, 베이시스, 망분리, 전자세금계산서, K-SOX |
| [`sap-gts`](plugins/sap-gts/) 🌍 | Global Trade Services | HS code, UNI-PASS, FTA, 수출입, 관세청 |

> **💡 BC = Basis**: 한국 SAP 업계에서 "BC 컨설턴트"는 "Basis Consultant"와 동의어입니다. `sap-bc`는 `sap-basis`의 한국 현장 특화 버전(한글 Unicode·망분리·전자세금계산서·K-SOX)입니다. **한국 프로젝트는 둘 다 설치 권장**.

---

## 🤖 9개 서브에이전트

| Agent | 역할 | 위임 시점 |
|-------|------|----------|
| `sap-fi-consultant` | FI 전반 체계적 진단 | 복잡한 FI 문제 |
| `sap-co-consultant` | CO 전반 | 원가·배부·CO-PA |
| `sap-mm-consultant` | MM 전반 | 구매·재고·GR/IR |
| `sap-sd-consultant` | SD Order-to-Cash | 주문·배송·빌링·여신 |
| `sap-pp-analyzer` | PP 생산계획 | MRP·BOM·생산오더 |
| `sap-abap-reviewer` | ABAP 코드 리뷰 | 코드 품질·Clean Core |
| `sap-basis-troubleshooter` | Basis 장애 라우팅 | 덤프·WP행·Transport |
| `sap-s4-migration-advisor` | S/4HANA 경로 추천 | 마이그레이션 질문 |
| `sap-integration-advisor` | 통합 아키텍처 | RFC·IDoc·OData·CPI |

---

## ⚙️ 10개 슬래시 커맨드

```bash
# 결산
/sap-fi-closing 월결산 <회사코드>         # 월결산 체크리스트
/sap-quarter-close <회사코드> <분기>      # 분기 결산 (K-IFRS + K-SOX)
/sap-year-end <회사코드> <연도>           # 연결산 (법인세·감사)

# 디버그
/sap-migo-debug <에러번호> <이동유형>     # MIGO 포스팅 에러
/sap-payment-run-debug <벤더번호>         # F110 지급실행
/sap-transport-debug <TR ID>              # STMS 실패 진단
/sap-korean-tax-invoice-debug <유형>      # 전자세금계산서
/sap-performance-check <대상>             # 성능 점검

# 분석
/sap-abap-review <파일경로>               # ABAP 리뷰 위임
/sap-s4-readiness --auto                  # S/4 마이그레이션 평가
```

---

## 🌐 Multi-AI 호환 (6개 도구)

| AI 도구 | 진입점 파일 | 추가된 버전 |
|---------|-----------|-------------|
| **Claude Code** | `plugins/*/skills/*/SKILL.md` (네이티브) | v1.0.0 |
| **OpenAI Codex CLI** | [`AGENTS.md`](AGENTS.md) | v1.2.0 |
| **GitHub Copilot** | [`.github/copilot-instructions.md`](.github/copilot-instructions.md) + [instructions/](.github/instructions/) | v1.2.0 (v1.3.0 split) |
| **Cursor** | [`.cursor/rules/sapstack.mdc`](.cursor/rules/sapstack.mdc) | v1.2.0 |
| **Continue.dev** | [`.continue/config.yaml`](.continue/config.yaml) | v1.3.0 |
| **Aider** | [`CONVENTIONS.md`](CONVENTIONS.md) | v1.3.0 |

**설계 원칙**: "원본 1개 (SKILL.md) + 얇은 호환 레이어 N개". 어떤 AI를 쓰든 **Universal Rules + Response Format + 지식 품질**이 일관됩니다.

v1.4.0 신규: **MCP server 매니페스트** ([mcp/sapstack-server.json](mcp/sapstack-server.json)) — Claude Desktop·Zed 등 MCP 클라이언트 지원 (v1.5.0 네이티브 구현 예정)

📖 **실전 예시**: [docs/examples/](docs/examples/) — 6개 도구별 실제 세션 스크린샷 & 사용법

---

## 🛡 Universal Rules

모든 SAP 답변이 **반드시** 따르는 8가지 규칙:

1. **NEVER hardcode** company codes, G/L accounts, or org units
2. **ALWAYS ask** for environment (release, deployment, company code)
3. **ALWAYS distinguish** ECC vs S/4HANA behavior
4. **Transport request** required for any config change
5. **Simulate before actual run** — AFAB, F.13, FAGL_FC_VAL, MR11, F110
6. **Never recommend SE16N** data edits in production
7. **Always provide T-code + SPRO menu path**
8. **Only cite verified SAP Notes** (from `data/sap-notes.yaml`)

---

## 🇰🇷 한국어 완전 지원 (100%)

- ✅ 14/14 모듈 **한국어 퀵가이드**
- ✅ 14/14 모듈 **한국어 전문 번역**
- ✅ **150+ SAP 한국어/영문 용어집** ([docs/glossary.md](docs/glossary.md))
- ✅ **sap-bc** — 한국 BC 컨설턴트 특화 (망분리·전자세금계산서·K-SOX·한글 Unicode)
- ✅ **한국 Note 카탈로그** — 전자세금계산서, 원천세, 연말정산, HSK
- ✅ `/sap-korean-tax-invoice-debug` — 전자세금계산서 디버그 커맨드
- ✅ 모든 신규 에이전트·커맨드·문서 **한국어 네이티브**

### 한국어 답변 활성화
```yaml
# .sapstack/config.yaml
preferences:
  language: ko
```

---

## 📊 데이터 자산

| Asset | 카운트 | 파일 |
|-------|-------|------|
| 확정 T-codes | **279개** | [`data/tcodes.yaml`](data/tcodes.yaml) |
| 확정 SAP Notes | **50+개** | [`data/sap-notes.yaml`](data/sap-notes.yaml) |
| Config schema | ✅ | [`.sapstack/config.schema.yaml`](.sapstack/config.schema.yaml) |

### 검색 도구
```bash
./scripts/resolve-note.sh korea            # 한국 Note 검색
./scripts/resolve-note.sh migration ACDOCA # 복합 키워드
grep -q "^FAGL_FC_VAL:" data/tcodes.yaml   # T-code 검증
```

🌐 **웹 UI**: [web/](web/) — 브라우저에서 SAP Note 검색 (GitHub Pages 배포 가능)

---

## ✅ 설치 후 검증

```bash
git clone https://github.com/BoxLogoDev/sapstack
cd sapstack

# 8개 품질 게이트 전부 실행
./scripts/lint-frontmatter.sh              # 프론트매터
./scripts/check-marketplace.sh             # marketplace.json
./scripts/check-hardcoding.sh --strict     # 하드코딩 금지
./scripts/check-tcodes.sh --strict         # T-code 레지스트리
./scripts/check-ko-references.sh --strict  # 한국어 references
./scripts/check-links.sh --strict          # 내부 링크
./scripts/check-ecc-s4-split.sh --strict   # ECC/S4 구분
./scripts/build-multi-ai.sh --check        # 호환 레이어 drift
```

모든 게이트가 통과하면 ✅. CI에서도 같은 스텝이 자동 실행됩니다.

---

## 🎓 학습 경로

| 레벨 | 경로 |
|------|------|
| 🆕 **처음** | [튜토리얼 — 15분](docs/tutorial.md) → [FAQ](docs/faq.md) |
| 📘 **중급** | [실전 시나리오 5개](docs/scenarios/) → [용어집](docs/glossary.md) |
| 🏗 **고급** | [아키텍처](docs/architecture.md) → [Multi-AI 가이드](docs/multi-ai-compatibility.md) |
| 🤝 **기여자** | [CONTRIBUTING](CONTRIBUTING.md) → [스캐폴딩 스크립트](scripts/new-plugin.sh) |
| 🔒 **보안** | [SECURITY](SECURITY.md) → [CoC](CODE_OF_CONDUCT.md) |

---

## 🧪 확장 도구 (v1.4.0 신규)

- 🤖 **MCP Server** ([mcp/](mcp/)) — Claude Desktop 등 MCP 클라이언트 지원 (매니페스트)
- 🎨 **VS Code Extension** ([extension/](extension/)) — 스텁 (v1.5.0 풀 구현)
- 🌐 **Web UI** ([web/](web/)) — SAP Note Resolver 정적 사이트
- 🏗 **Scaffolding Scripts** — `scripts/new-{agent,command,plugin}.sh`
- 🔄 **Reusable CI** — `.github/workflows/sapstack-ci-reusable.yml`

---

## 🏛 관련 프로젝트

- [Model Context Protocol](https://modelcontextprotocol.io/) — v1.5.0에서 네이티브 MCP server 구현 예정
- [SAP Help Portal](https://help.sap.com/) — 공식 문서
- [SAP Support Portal](https://launchpad.support.sap.com/) — SAP Notes 원본

---

## 📜 라이선스

MIT License — 자세한 내용은 [LICENSE](LICENSE) 참조.

**상업적 사용·수정·배포 모두 허용**, 저작권 표기 유지 필요.

---

## 🤝 기여하기

- 🐛 **버그 리포트**: [Issues](https://github.com/BoxLogoDev/sapstack/issues/new?template=bug_report.md)
- ✨ **기능 요청**: [Feature Request](https://github.com/BoxLogoDev/sapstack/issues/new?template=feature_request.md)
- 📦 **새 모듈 제안**: [New Module](https://github.com/BoxLogoDev/sapstack/issues/new?template=new_module.md)
- 💬 **토론**: [Discussions](https://github.com/BoxLogoDev/sapstack/discussions)
- 📖 **기여 가이드**: [CONTRIBUTING.md](CONTRIBUTING.md)

---

<div align="center">

**Made with 🇰🇷 by [@BoxLogoDev](https://github.com/BoxLogoDev)**

Built for Korean SAP consultants, shared with the global community.

[⬆ 맨 위로](#-sapstack)

</div>
