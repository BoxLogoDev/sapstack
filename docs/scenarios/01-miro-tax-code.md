# 시나리오 1 — MIRO 세금코드 미할당 에러

## 🎬 상황
S/4HANA 2023, 한국 법인. 사용자가 벤더 송장 입력(MIRO)을 시도하는데 **"세금코드가 필요합니다"** 에러가 발생합니다. PO에는 세금 정보가 있어 보이는데 왜 막힐까요?

## 💬 사용자 질문
```
MIRO에서 세금코드 에러가 나요. 
PO는 ME23N으로 보면 세금 필드가 있는데 MIRO에서 자동으로 안 잡혀요.
```

## 🤖 sapstack 답변 과정

### 1단계 — SKILL 자동 활성화
키워드 `MIRO`, `세금코드`, `ME23N` → `sap-fi` + `sap-mm` 동시 활성화

### 2단계 — 환경 인테이크
`.sapstack/config.yaml` 있으면:
```yaml
system.release: S4HANA_2023
korea.e_tax_invoice: true
preferences.language: ko
```
→ 환경 질문 생략, 바로 진단

없으면 질문:
- SAP 릴리스? 회사코드? 에러 메시지 번호?

### 3단계 — 구조화된 답변

```markdown
## 🔍 Issue
MIRO 포스팅 시 세금코드(MWSKZ)가 자동 결정되지 않아 차단됨

## 🧠 Root Cause (확률 순)
1. **PO Item에 세금코드 미설정** — Vendor/Material 결정 규칙 미작동
2. **회사코드에 Tax Procedure 미할당** (TAXKR 등)
3. **Info Record 세금 정보 누락** — 자동 제안 실패
4. **전자세금계산서 연동 설정** — J_1BNFE 필수 필드 누락 (한국)

## ✅ Check (T-code + Table.Field)
1. **ME23N** → 선택한 PO → Invoice 탭 → MWSKZ 필드 값
2. **FTXP** → 해당 세금코드 존재 + 회사코드 할당 확인
3. **OBBG** → 회사코드 → Tax Procedure 할당 (TAXKR for Korea)
4. **ME13** → Info Record → Conditions → Tax 조건
5. 테이블 레벨: EKPO.MWSKZ (PO item), LFB1.MINDK (vendor default tax)

## 🛠 Fix (단계별)
### Case A: PO 세금코드 누락
1. ME22N → PO 변경 → Invoice tab → 세금코드 수동 입력
2. Save → 재시도 MIRO

### Case B: Info Record 재설정
1. ME12 → Info Record → Conditions → Tax 섹션 확인
2. 기본 세금코드 설정
3. 향후 PO 자동 상속

### Case C: 회사코드 Tax Procedure
1. OBBG → 한국 회사코드 → TAXKR 할당 (SPRO: Financial Accounting → Tax on Sales/Purchases → Basic Settings → Assign Country to Calculation Procedure)
2. Transport → QAS 테스트 → 운영 이동

## 🛡 Prevention
- Vendor 마스터 생성 시 기본 세금코드 설정 (LFB1-MINDK)
- Info Record 생성 시 세금 조건 필수 입력
- K-SOX: MIRO 입력 담당자 교육 매뉴얼

## 📖 SAP Note (data/sap-notes.yaml)
- **3092819** — Country Version Korea S/4HANA Localization Roadmap
- **2645815** — Korea Withholding Tax Configuration Guide
```

## 📚 배운 것
- **키워드 기반 자동 활성화**: 여러 모듈이 동시에 관련되면 여러 SKILL.md가 함께 주입됨
- **Root Cause는 확률 순**: 가장 흔한 원인을 먼저
- **회사코드 절대 추정 금지** — 사용자가 제공한 값만 사용
- **한국 특화**: 전자세금계산서·CVI KR 맥락이 자동으로 포함됨

## 🔗 관련
- `/commands/sap-korean-tax-invoice-debug.md` — 전자세금계산서 전용 디버그
- `/agents/sap-mm-consultant.md` — 더 복잡한 MM 이슈 위임
- `plugins/sap-fi/skills/sap-fi/references/ko/SKILL-ko.md` — FI 한국어 전문
