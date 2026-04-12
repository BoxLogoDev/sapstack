# sapstack 튜토리얼 — 15분 안에 시작하기

> 신규 사용자를 위한 단계별 가이드. 설치부터 첫 SAP 질문까지 따라하면 sapstack의 3축 구조를 모두 체험할 수 있습니다.

## 🎯 이 튜토리얼에서 할 일

1. **설치** — Claude Code에 sapstack 플러그인 추가
2. **환경 프로필** — `.sapstack/config.yaml` 1회 설정
3. **첫 질문** — FI 이슈를 자연어로 물어보기 → 키워드 자동 활성화 확인
4. **에이전트 위임** — 복잡한 질문을 서브에이전트로
5. **슬래시 커맨드** — 반복 워크플로 원샷 실행
6. **Multi-AI** — Codex/Copilot/Cursor 중 하나로 같은 질문

**소요 시간**: ~15분

---

## Step 1 — 설치 (2분)

### Claude Code 사용자

```bash
# Claude Code 열고 아래 입력
/plugin marketplace add https://github.com/BoxLogoDev/sapstack
/plugin install sap-fi@sapstack
/plugin install sap-bc@sapstack  # 한국 사용자는 이것도 추천
```

### 기타 AI 도구 사용자
각 도구의 설치 가이드: [`docs/multi-ai-compatibility.md`](multi-ai-compatibility.md)

설치 확인:
```bash
git clone https://github.com/BoxLogoDev/sapstack
cd sapstack
./scripts/lint-frontmatter.sh      # 0 errors
./scripts/check-marketplace.sh     # 13 plugins
```

---

## Step 2 — 환경 프로필 (3분)

이 단계는 선택이지만 **강력 추천**입니다. 하면 매 질문마다 "ECC인가요 S/4인가요?" 반복을 없앨 수 있습니다.

### 2-1. 템플릿 복사
```bash
mkdir -p .sapstack
curl -o .sapstack/config.example.yaml \
  https://raw.githubusercontent.com/BoxLogoDev/sapstack/main/.sapstack/config.example.yaml
cp .sapstack/config.example.yaml .sapstack/config.yaml
echo ".sapstack/config.yaml" >> .gitignore
```

### 2-2. 주요 값 편집
`.sapstack/config.yaml`을 에디터로 열어 다음 7개만 채웁니다:

```yaml
system:
  release: S4HANA_2023           # 또는 ECC_6_EHP8
  deployment: on_premise          # rise / cloud_pe

organization:
  primary_company_code: "<YOUR_CODE>"   # 실제 회사코드
  local_currency: KRW
  accounting_standard: K_IFRS

korea:
  e_tax_invoice: true            # 한국 프로젝트면 true
  k_sox: true                    # 상장사면 true

preferences:
  language: ko                    # 한국어 답변 원하면
```

상세: [`docs/environment-profile.md`](environment-profile.md)

---

## Step 3 — 첫 질문 (자동 활성화 확인, 3분)

Claude Code 세션에서 자연어로:

```
MIRO에서 세금코드가 안 잡혀서 포스팅이 막혀요.
```

**무슨 일이 일어나는가?**
1. `MIRO` 키워드 → `sap-fi` + `sap-mm` SKILL.md 자동 활성화
2. Claude가 Universal Rules 적용 (환경 인테이크 → Issue → Root Cause → Fix → Prevention → SAP Note)
3. `config.yaml`을 읽었으면 환경 질문 생략
4. 한국어로 답변 (preferences.language: ko 설정 시)

**예상 답변 형식:**
```markdown
## 🔍 Issue
MIRO 송장 입력 시 세금코드(MWSKZ)가 자동으로 결정되지 않음

## 🧠 Root Cause
1. 세금 절차(Tax Procedure)가 회사코드에 할당되지 않음
2. PO 항목의 세금코드 필드가 빈 값
3. Vendor Master의 Tax indicator 누락

## ✅ Check
1. FTXP → 해당 세금코드 존재 여부 + 회사코드 할당
2. ME23N → PO 항목 → Invoice 탭 → 세금코드 확인
3. XK03 → Vendor → Control tab → Tax indicator
...
```

---

## Step 4 — 에이전트 위임 (4분)

단순 질문을 넘어 **체계적 다단계 분석**이 필요할 때는 서브에이전트에 위임합니다.

```
이 ABAP 코드 리뷰해줘: Z_SALES_REPORT.abap
```

Claude가 `sap-abap-developer` 에이전트에 자동 위임:
1. 독립 컨텍스트에서 코드 읽기
2. Clean Core · HANA 최적화 · ATC 기준 체크리스트
3. Critical / Warning / Good 분류 결과

또는 명시적 위임:
```
Task 도구로 sap-fi-consultant에 이 결산 이슈를 위임해줘: ...
```

### 사용 가능한 9개 에이전트 (v1.3.0)
| 에이전트 | 주제 |
|---------|------|
| `sap-fi-consultant` | FI 전반 |
| `sap-co-consultant` | CO 전반 |
| `sap-mm-consultant` | MM 전반 |
| `sap-sd-consultant` | SD 전반 |
| `sap-pp-analyzer` | PP 생산계획 |
| `sap-abap-developer` | ABAP 코드 리뷰 |
| `sap-basis-consultant` | Basis 장애 |
| `sap-s4-migration-advisor` | S/4 마이그레이션 |
| `sap-integration-advisor` | RFC/IDoc/OData/CPI |

---

## Step 5 — 슬래시 커맨드 (2분)

반복 워크플로를 원샷으로:

```
/sap-fi-closing 월결산 <회사코드>
```

→ `commands/sap-fi-closing.md`의 7 Phase 체크리스트가 자동 실행되며 각 단계에서 사용자 승인을 받습니다.

### v1.3.0에서 사용 가능한 10개 커맨드
- `/sap-fi-closing` — 월결산 체크리스트
- `/sap-quarter-close` — 분기 결산 (K-IFRS 공시)
- `/sap-year-end` — 연결산 (법인세·감사)
- `/sap-abap-review` — ABAP 코드 리뷰 위임
- `/sap-s4-readiness` — S/4 마이그레이션 평가
- `/sap-migo-debug` — MIGO 포스팅 에러
- `/sap-payment-run-debug` — F110 디버그
- `/sap-transport-debug` — STMS 실패 진단
- `/sap-korean-tax-invoice-debug` — 전자세금계산서 이슈
- `/sap-performance-check` — 성능 점검

---

## Step 6 — Multi-AI 체험 (1분)

같은 질문을 Codex CLI로:
```bash
git submodule add https://github.com/BoxLogoDev/sapstack sapstack
codex "sapstack의 Universal Rules를 따라 MIRO 세금코드 이슈를 진단해줘"
```

Copilot Chat에서:
```
@workspace sap-fi-consultant 프롬프트 스타일로 MIRO 세금 이슈를 진단해줘.
```

Cursor에서는 자동으로 `.cursor/rules/sapstack.mdc`가 적용됩니다.

---

## 🎉 완료!

이제 sapstack의 3축 구조를 모두 체험하셨습니다:
- **Active Advisors** (skills + agents + commands)
- **Context Persistence** (`.sapstack/config.yaml`)
- **Multi-AI Compatibility** (4+ 호환 레이어)

## 다음에 무엇을?

- [`docs/scenarios/`](scenarios/) — 5가지 실전 시나리오
- [`docs/faq.md`](faq.md) — 흔한 질문 30개
- [`docs/glossary.md`](glossary.md) — SAP 용어집 (한국어/영문)
- [`CONTRIBUTING.md`](../CONTRIBUTING.md) — 기여 가이드
