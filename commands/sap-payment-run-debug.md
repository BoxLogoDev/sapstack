---
description: F110 지급실행(Payment Run) 에러를 단계별로 진단. 벤더 마스터 → 지급방법 → 하우스뱅크 → 은행결정 → DME 순서로 탐색. 한국 ACH 연동 특화.
argument-hint: [벤더번호 또는 Run ID]
---

# F110 Payment Run 디버그

입력: `$ARGUMENTS`

## 🎯 목표
F110 지급실행 실패 시 파라미터부터 DME 생성까지 단계별 원인 탐색.

## 진단 순서

### Step 1. Run 상태 확인
1. **F110 → Status 탭**: Proposal / Payment / Printout 단계별 상태
2. **S_P99_41000099**: Payment Run 로그
3. 체크:
   - Proposal 미실행?
   - Proposal 실행했으나 "No items selected"?
   - Payment 단계에서 DME 생성 실패?

### Step 2. 벤더 마스터 확인
- **XK03 / BP** (S/4): 벤더 조회
- **LFB1.ZWELS**: 지급방법 (payment method) 등록 여부
- **LFB1.ZAHLS**: 지급 블록 해제 상태
- **LFBK**: 은행 정보 (IBAN, 계좌번호, Swift)
- 체크:
  - 한국 국내 계좌는 IBAN 대신 은행코드+계좌번호
  - 국세청 세금계산서용 사업자등록번호 (STCD1)

### Step 3. Open Items 선택 조건
- **FBL1N**: 벤더 Open Items
- 체크:
  - Due date가 Run date 이내인가?
  - Payment block 없는가?
  - Special GL indicator가 선택에서 제외됐는지?
  - Document 분할 설정 — 일부만 지급 대상일 수 있음

### Step 4. 지급방법 & House Bank
- **FBZP**: 전체 Payment 설정
  - **Paying company codes**: 지급 회사코드 설정
  - **Payment methods in country**: 국가(KR) 내 지급방법 (C=수표, T=이체)
  - **Payment methods in company code**: 회사코드별 활성화
  - **Bank determination**:
    - Ranking order
    - Amounts (한도)
    - Accounts (하우스뱅크 + Account ID)
    - Available amounts
    - Value date

### Step 5. House Bank / Bank Account
- **FI12** (ECC) / **NWBC → Bank Account Management** (S/4):
  - House bank ID
  - Account ID
  - Bank key (한국 은행 코드 — 국민/신한/우리/하나 등)
- 체크:
  - Bank account balance 적정한가 (FF.5 — Bank Statement)
  - Outgoing payments 계정 매핑

### Step 6. Payment Medium (DME)
- **DMEE**: DME Engine Tree
- 한국 특화:
  - **KEB 국민은행 전용 포맷** 커스텀 사례 다수
  - 은행별 XML/Flat file 구조 다름
  - 환경은행 ACH (자동이체) 연동 시 별도 Tree
- 체크:
  - Payment method에 DMEE format 할당됐는지
  - OBPM1/OBPM4 — Payment Medium Format 설정

### Step 7. 환율 / 통화
- **OBA1**: 환율 유형
- 체크:
  - KRW 외 통화 지급 시 환율 적용일
  - FF_5 / F.05 환율 변환 검증

### Step 8. 한국 특화
- **원천세 (Withholding Tax)**:
  - 벤더 마스터에 WT type 등록 (`LFBW`)
  - 지급 시 자동 원천 분개 확인
- **전자세금계산서 역방향**: 벤더 매입 송장이 e-Tax Invoice 기반이면 승인번호 검증
- **K-IFRS**: 지급 관련 분개가 IFRS 공시 대상인지

### Step 9. 감사 흔적
- **F110 → Additional logs**: 상세 로그
- **SM21**: 시스템 로그
- K-SOX: 지급실행자 ≠ 승인자 로그

## 📤 출력 형식

```
## 🔍 진단 결과
- 증상: (사용자 보고)
- Run 단계: (Proposal / Payment / Printout)
- 확률 높은 원인:
  1. ...
  2. ...
  3. ...

## 🛠 수정 단계
1. ...

## 🛡 재발 방지
- ...

## 📖 SAP Note / T-code
- ...
```

## 참조
- `plugins/sap-fi/skills/sap-fi/SKILL.md`
- `plugins/sap-tr/skills/sap-tr/SKILL.md` (Treasury·은행 관리)
- `plugins/sap-bc/skills/sap-bc/SKILL.md` (STRUST 인증서, 한국 은행 연동)
- `agents/sap-fi-consultant.md`
