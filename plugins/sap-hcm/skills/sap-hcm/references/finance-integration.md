# HCM ↔ FI/CO 연동 가이드

> HCM 모듈이 FI(재무회계)와 CO(원가회계)에 어떻게 데이터를 흘려보내는지 정리한 가이드. 페이롤 포스팅, 코스트 분배, 법정 보고 3축.

## 1. 페이롤 포스팅 (Payroll Posting to FI/CO)

급여 정산 결과가 FI/CO로 자동 전기되는 메커니즘.

### 1.1 핵심 T-code

| T-code | 용도 | 모듈 |
|---|---|---|
| **PC00_M99_CIPE** | Posting Run 생성 (실 운영) | HCM → FI/CO |
| **PCP0** | Posting Run 모니터링·삭제·재실행 | HCM |
| **PC00_M99_DKON** | 포스팅 검토용 시뮬레이션 | HCM |
| **FBL3N** | 포스팅 결과 GL 라인 아이템 확인 | FI |

### 1.2 표준 흐름

1. 페이롤 실행 (`PC00_M10_CALC` 또는 국가별 변형) → **클러스터 RT/CRT 생성**
2. Posting Run 생성 (`PC00_M99_CIPE`) — 결과는 **클러스터 PC** (Posting Cluster)
3. PCP0에서 검토 → "릴리스" → FI/CO 문서 생성
4. **상태 전이**: Created → Released → Posted

### 1.3 계정 결정 (Symbolic Account → GL Account)

페이롤 결과는 우선 **Symbolic Account** (HRPAYUS_S, HRPAYDE_S 등 국가별)로 분류된 후, IMG에서 GL Account로 매핑됨.

**SPRO 경로**: `Personnel Management → Payroll → Reporting for Posting Payroll Results to Accounting → Activities in the AC System → Account Assignment`

핵심 IMG 노드:
- `OH02` — Symbolic Account 정의
- `Position Status of Posting Items` — Debit/Credit
- `Account Determination` — Symbolic Account → GL Account

### 1.4 한국 특화

- **K-Payroll** (한국 페이롤): `PC00_M41_CALC` (4대보험·연말정산 포함)
- 4대보험 포스팅: 국민연금/건강보험/고용보험/산재보험 → 별도 Symbolic Account
- 원천세는 **Withholding Tax (FI)** 와 연계 — `WT2_KR` 키 사용
- 연말정산은 **PA70 + PE03 feature** 조합으로 일괄 처리

## 2. 코스트 분배 (Cost Distribution to CO)

급여비를 Cost Center / Internal Order / WBS Element로 분배.

### 2.1 분배 객체

- **Cost Center (KOSTL)** — 부서별 기본 할당, IT0001 (Organizational Assignment)
- **Internal Order** — 프로젝트성 페이롤
- **WBS Element** — PS 모듈 연동 시
- **Cost Distribution** — IT0027 (Cost Distribution)로 1인 다중 분배

### 2.2 결정 순서

1. IT0027 (있으면 우선) — 명시적 % 분배
2. IT0001 (마스터 데이터 cost center)
3. IT0315 (Default Cost Allocation) — 백업

### 2.3 검증 T-code

| T-code | 용도 |
|---|---|
| **KSB1** | Cost Center 라인 아이템 — 페이롤 비목 확인 |
| **KOB1** | Order 라인 아이템 |
| **PC_PAYRESULT** | 페이롤 결과 RT/CRT 보기 |

## 3. 법정 보고 (Statutory Reporting)

페이롤 데이터가 FI 보고로 연결되는 지점.

### 3.1 한국 법정 보고

- **원천세 신고**: 페이롤 결과 → WT_AT (FI) → 전자세금계산서 시스템 연동
- **4대보험 신고서**: 페이롤 결과 → 사회보험 EDI (별도 인터페이스)
- **연말정산**: PA70 일괄 입력 → 페이롤 → FI 정산 → 환급 처리

### 3.2 글로벌 법정 보고

- **W-2 (US)**, **Lohnsteuer (DE)**, **P60 (UK)** 등 국가별 form
- 페이롤 결과 → Year-End Adjustment → Reporting

## 4. ECC vs S/4HANA 차이

| 영역 | ECC | S/4HANA |
|---|---|---|
| Posting Document Type | 표준 SA, ZP | Universal Journal (ACDOCA) 직접 전기 |
| Real-time CO Integration | 배치 (cycles) | 실시간 (PCA Substream) |
| HR Mini Master | HCM 모듈 필수 | H4S4 또는 SuccessFactors로 대체 |
| Posting 단위 | 회사코드/페이롤 영역 | 동일 + Profit Center 연동 강화 |

## 5. 트러블슈팅 빈출 시나리오

### "포스팅 안 됨" / "Symbolic Account 미할당"

- IMG: Account Determination 누락 확인
- 클러스터 PC 비어있으면 → PC00_M99_CIPE 재실행
- PCP0에서 "에러" 상태 → 로그 클릭 → 원인 분석

### "Cost Center 비활성" 에러

- KS03으로 cost center 유효기간 확인
- IT0001의 cost center가 페이롤 기간 동안 유효한지
- 비활성이면 IT0027 또는 IT0315 fallback 필요

### "외환 환산 오류"

- 회사코드 통화 ≠ Payroll 통화 시 발생
- FI 환율 (OB08) 마스터 확인
- 페이롤 환산 규칙: Constants `WAERS`, `KURSF`

## 6. 연관 문서

- `payroll-guide.md` — 일반 페이롤 운영 가이드
- `img/payroll-area.md` — 급여 영역 IMG 구성
- `img/personnel-administration.md` — PA 마스터 데이터
- `best-practices/operational.md` — Tier 1 운영 가이드
- `../../../sap-fi/skills/sap-fi/SKILL.md` — FI 모듈 SKILL
- `../../../sap-co/skills/sap-co/SKILL.md` — CO 모듈 SKILL
