# sapstack FAQ — 자주 묻는 질문

> 30개의 흔한 질문과 답변. 찾는 답이 없으면 [Issues](https://github.com/BoxLogoDev/sapstack/issues)에 등록해주세요.

---

## 📦 설치 & 시작

### Q1. sapstack이 지원하는 AI 도구는?
Claude Code (네이티브), OpenAI Codex CLI, GitHub Copilot, Cursor, Continue.dev, Aider — 6개 도구. 자세한 내용은 [`multi-ai-compatibility.md`](multi-ai-compatibility.md).

### Q2. Claude Code가 아니면 어떻게 쓰나요?
각 도구의 진입점 파일을 프로젝트에 복사하거나 git submodule로 추가합니다:
- Codex: `AGENTS.md`
- Copilot: `.github/copilot-instructions.md`
- Cursor: `.cursor/rules/sapstack.mdc`
- Continue: `.continue/config.yaml`
- Aider: `CONVENTIONS.md`

### Q3. Windows에서 동작하나요?
예. Git Bash 필요. 일부 bash 스크립트는 Windows Git Bash에서 느리지만 기능은 동일. CI는 Ubuntu Linux에서 실행됩니다.

### Q4. 유료인가요?
**무료 MIT 라이선스**입니다. AI 도구 자체(Claude API, OpenAI, Copilot 구독 등)는 별도입니다.

### Q5. SAP 시스템과 직접 연결되나요?
**아니요**. sapstack은 **지식 참조** 전용입니다. 실제 SAP에 쓰기 작업을 하지 않습니다. 운영 시스템 접근은 사용자가 SAPGUI/Fiori 등을 통해 직접 수행합니다.

---

## 🧩 13개 모듈

### Q6. 어떤 모듈이 포함되나요?
FI, CO, TR (재무) / MM, SD, PP (물류) / HCM, SFSF (HR) / ABAP, S4-Migration, BTP, BASIS, **BC** (기술) — 총 13개.

### Q7. IS-Retail, IS-U 같은 Industry Solution은요?
v1.3.0에는 미포함. [`roadmap.md`](roadmap.md)의 v1.4+ 후보입니다. 기여 환영.

### Q8. `sap-basis`와 `sap-bc`의 차이는?
**BC = Basis의 한국 버전**입니다. 같은 Basis 영역(Transport·권한·성능)이지만 `sap-bc`는 한국 현장 특화(한글 Unicode·망분리·전자세금계산서·K-SOX)를 다룹니다. 한국 프로젝트는 **둘 다 설치 권장**. [자세히](../README.md#sap-basis-vs-sap-bc-관계).

### Q9. SuccessFactors는 어떻게 되나요?
`sap-sfsf` 플러그인이 EC/ECP/Recruiting/LMS/Performance를 통합합니다. 개별 분리는 v1.4+에서 검토.

### Q10. BTP CAP/Fiori/Integration Suite는?
`sap-btp` 플러그인에 통합 수록. 통합 아키텍처 주제는 `sap-integration-advisor` 에이전트에 위임 가능.

---

## 💬 사용법

### Q11. SKILL은 어떻게 활성화되나요?
Claude Code에서는 **키워드 기반 자동 활성화**. 질문에 "MIRO", "FB01", "ABAP dump" 같은 트리거가 있으면 해당 SKILL.md가 system prompt에 자동 주입됩니다. `description` 필드의 키워드가 매칭 기준.

### Q12. 에이전트와 커맨드는 어떻게 다른가요?
- **에이전트** (`agents/*.md`): 독립 컨텍스트에서 복잡한 다단계 분석을 수행하는 "누가"
- **커맨드** (`commands/*.md`): 반복 워크플로의 "어떻게" (Step 1, 2, 3...)
- **SKILL.md**: 참조 지식 "무엇"

### Q13. 한국어 답변을 받으려면?
`.sapstack/config.yaml`에 `preferences.language: ko` 또는 질문을 한국어로 입력.

### Q14. SAP Note 번호를 어떻게 검증하나요?
`./scripts/resolve-note.sh <keyword>` 실행. `data/sap-notes.yaml`에 등록된 번호만 반환됩니다. 추측 Note는 금지.

### Q15. T-code가 존재하는지 확인하려면?
```bash
grep -q "^FAGL_FC_VAL:" data/tcodes.yaml && echo "유효"
./scripts/check-tcodes.sh --strict
```

---

## 🛡 품질 & 규칙

### Q16. 하드코딩 금지 규칙이란?
회사코드·G/L 계정·원가센터·조직 단위를 고정값으로 쓰지 말라는 것. `./scripts/check-hardcoding.sh --strict`가 자동 탐지.

### Q17. ECC와 S/4HANA 구분을 왜 강조하나요?
동작이 다른 경우가 많기 때문입니다 (BSEG vs ACDOCA, FD32 vs UKM_BP, F.05 vs FAGL_FC_VAL). 구분하지 않으면 잘못된 답변이 나옵니다.

### Q18. "Simulate before actual run"은 어떤 T-code에 적용?
AFAB, F.13, FAGL_FC_VAL, KSU5, MR11, F110 등 대부분의 결산 자동화 트랜잭션. "Test Run" 체크박스가 있는 트랜잭션은 전부.

### Q19. SE16N 금지가 뭔가요?
운영 환경에서 `SE16N`으로 테이블 데이터를 **직접 수정**하는 것을 금지합니다. K-SOX 감사 대상이고, 무결성을 파괴할 수 있습니다. 조회는 허용.

### Q20. 왜 Transport Request가 항상 필요한가요?
SAP의 변경 관리 표준이기 때문. Transport 없이 Dev→QAS→PRD 이동이 불가능하고, 변경 이력·롤백·감사가 모두 Transport 기반입니다.

---

## 🇰🇷 한국 특화

### Q21. K-SOX가 뭔가요?
한국 상장사 내부회계관리제도. 분개 입력자 ≠ 승인자, 분기 권한 재인증, 감사 흔적 보존 등이 요구됩니다.

### Q22. 전자세금계산서 연동은 어떻게 지원하나요?
`sap-fi`와 `sap-bc` 플러그인이 다룹니다. `/sap-korean-tax-invoice-debug` 커맨드로 체계적 진단. SAP DRC / 이카운트 / 비즈플레이 / SmartBill 등 다양한 provider 지원.

### Q23. 망분리 환경에서 sapstack 쓸 수 있나요?
예. sapstack 자체는 외부 연결 불필요 (로컬 파일 참조만). 다만 AI 도구(Claude API 등)는 인터넷 필요. 망분리 현장 SAP 지식은 `sap-bc` 플러그인이 특화.

### Q24. 한국 급여(Payroll)도 지원하나요?
`sap-hcm` 플러그인에 한국 Payroll 섹션 포함. 4대보험, 연말정산, 근로소득세 주제.

### Q25. 주민등록번호 같은 민감정보는?
**절대 로그/예시에 쓰지 마세요**. 개인정보보호법 위반. sapstack 문서에도 실제 주민번호·사업자등록번호는 등록되어 있지 않습니다.

---

## 🤝 기여 & 확장

### Q26. 새 모듈을 추가하고 싶어요
[`CONTRIBUTING.md`](../CONTRIBUTING.md)의 "새 플러그인 추가" 섹션 참조. SKILL.md 프론트매터 규칙과 `marketplace.json` 등록이 필수.

### Q27. 데이터셋(tcodes.yaml, sap-notes.yaml)에 기여하려면?
PR로 새 엔트리 추가. 확인된 정보만 (SAP Help Portal 또는 SAP Support Portal 참조 가능).

### Q28. 내 회사 전용 커스텀은 어떻게 관리?
sapstack은 **회사 중립(vendor-neutral)**입니다. 회사별 설정은 `.sapstack/config.yaml`로만 전달하세요. 회사 특화 SKILL이 필요하면 **private fork**를 권장.

### Q29. CI가 실패했어요
`scripts/lint-frontmatter.sh`, `scripts/check-marketplace.sh`, `scripts/check-hardcoding.sh --strict`, `scripts/check-tcodes.sh --strict`를 로컬에서 실행해 어느 게이트가 실패했는지 확인하세요. `docs/troubleshooting.md`도 참조.

### Q30. 라이선스가 MIT인데 상업적 이용 가능한가요?
예. MIT는 상업적 사용·수정·배포 모두 허용합니다. 단 저작권 표기는 유지.

---

## 🔗 더 알아보기
- [튜토리얼](tutorial.md) — 15분 안에 시작
- [시나리오](scenarios/) — 실전 5개 사례
- [용어집](glossary.md) — SAP 한국어/영문 용어
- [트러블슈팅](troubleshooting.md) — sapstack 자체 문제 해결
- [아키텍처](architecture.md) — 3축 구조
- [로드맵](roadmap.md) — v1.4+ 계획
