# SAP CO 한국어 전문 가이드

> 이 문서는 `plugins/sap-co/skills/sap-co/SKILL.md`의 한국어 병렬 버전입니다. 퀵가이드는 `quick-guide.md` 참조.

## 1. 환경 인테이크

CO 이슈 보고 시 답변 전 수집:
- SAP 릴리스 (ECC / S/4HANA — CO-PA 구조 차이)
- Controlling Area + 회사코드
- 원가 계산 방식 (Standard / Actual / Mixed)
- CO-PA 유형 (Costing-based / Account-based)
- Material Ledger 활성화 여부 (S/4는 필수)

---

## 2. CCA — 원가센터 회계

### 마스터 데이터
- **KS01/KS02/KS03**: 원가센터 생성/변경/조회
- 계층: **OKEON** (표준 계층), **KSH1** (그룹)
- 유효 기간 관리 — 조직 변경 시 주의

### 계획
- **KP06**: 원가요소별 원가센터 계획
- **KP26**: 활동유형 가격 계획
- **KP46**: 통계 주요 수치

### 실적
- **KSB1**: 원가센터 실제 라인 아이템
- **KSB5**: 원가센터 계획 라인 아이템
- **S_ALR_87013611**: 계획/실적 비교

### 배부 (Allocation)
- **KSU5**: Assessment Cycle 실행
  - 정의: **KSU1/KSU2**
  - Secondary Cost Element 사용
- **KSV5**: Distribution Cycle 실행
  - 정의: **KSV1/KSV2**
  - Primary Cost Element 유지

### 한국 현장 특이점
- 한국 대기업은 원가센터가 수백~수천 개 — 계층 관리가 핵심
- 월결산 crit path — 배부 사이클 실행 순서 표준화

---

## 3. PCA — 이익센터 회계

### ECC vs S/4HANA
- **ECC**: EC-PCA 별도 ledger (선택 구성요소)
- **S/4HANA**: **Profit Center가 Universal Journal(ACDOCA)에 통합되어 필수**

### 트랜잭션
- **KE51/KE52/KE53**: 이익센터 생성/변경/조회
- **KE5Z**: PCA 라인 아이템 리포트
- **KE5X**: 이익센터 잔액

### 전표 분리 (Document Splitting — S/4)
- S/4HANA 신원장은 문서 분리 활성화 시 이익센터 자동 분해
- **GSP_DOC_SPLIT**: 분리 로그 조회

---

## 4. IO — 내부주문

### 유형
- **Real Order**: 실제 원가 수집 → KO88 정산
- **Statistical Order**: 보고용만, 정산 없음

### 트랜잭션
- **KO01/KO02/KO03**: IO 생성/변경/조회
- **KO88**: 내부주문 정산
- **KO8G**: Collective Settlement
- **KOB1**: IO 라인 아이템

### 한국 현장
- **프로젝트 원가 집계**: 개별 프로젝트를 IO로 관리 (PS 모듈 없는 경우)
- **마케팅 비용 수집**: 캠페인별 IO
- **교육 비용**: 교육 과정별 IO

---

## 5. CO-PC — 제품 원가

### 표준 원가
- **CK11N**: Cost Estimate 생성 (신규)
- **CK13N**: Cost Estimate 조회
- **CK24**: Price Update — Standard Price 반영
- **CK40N**: Costing Run (집합)

### 흐름
```
CK11N → 시뮬레이션
     → CK24 → Standard Price 반영 (MBEW.STPRS)
           → 다음 달 자재 기표에 영향
```

### Actual Costing (Material Ledger)
- **CKMLCP**: Periodic Actual Costing Run
- **S/4HANA**: Material Ledger **필수**
- Variance를 자재에 back-flush하여 Actual Price 계산

### Variance 분석
- **KKS1**: 개별 Variance Calculation
- **KKS2**: 선택적 Variance Calculation
- 변동 카테고리: Input Price, Input Quantity, Resource Usage, Output Price, Output Quantity, Mixed Price, Remaining, Scrap

---

## 6. CO-PA — 수익성 분석

### Account-based CO-PA (S/4 기본)
- ACDOCA를 소스로 사용
- 별도 테이블 없음
- 실시간 데이터

### Costing-based CO-PA (ECC 기본, S/4 optional)
- CE1xxxx (line items), CE2xxxx (summarized), CE3xxxx (totals), CE4xxxx (segment level)
- 독립 테이블 구조
- Value Field 기반

### 트랜잭션
- **KE30**: CO-PA 보고서 실행
- **KEU5**: Top-down Distribution
- **KE24**: 라인 아이템 조회
- **KEPM**: Planning

---

## 7. 기간 마감 (Period-End)

표준 순서 (S/4HANA 기준):

| Step | 활동 | T-code | 비고 |
|------|------|--------|------|
| 1 | Material Ledger Run | CKMLCP | S/4 필수 |
| 2 | WIP 계산 | KKAO / KKAX | 생산오더 |
| 3 | Variance 계산 | KKS1 / KKS5 | |
| 4 | Order Settlement | KO88 / CO88 | 정산 |
| 5 | Assessment/Distribution | KSU5 / KSV5 | 배부 |
| 6 | CO-PA Top-down | KEU5 | (Costing-based) |
| 7 | CO → FI 조정 | S/4는 자동 | ECC는 KALC |

---

## 8. ECC vs S/4HANA 핵심 차이

| 주제 | ECC | S/4HANA |
|------|-----|---------|
| Profit Center | EC-PCA (선택) | **Universal Journal에 필수 통합** |
| Material Ledger | 선택 | **필수** |
| CO-PA 기본 | Costing-based | **Account-based** |
| CO-FI 실시간 조정 | KALC 수동 | **자동** |
| Cost Element | OKB1 별도 마스터 | **G/L Account Type 속성** |
| Line Item Storage | COEP | **ACDOCA** |

---

## 9. 한국 현장 특이사항

- **관리회계 + 세무조정** 동시 요구 (K-IFRS + 세법)
- **표준원가 계산** 타이밍이 월결산 crit path
- **환율 변동** 큰 영향 — 원자재 수입 제조업 특히
- **재료비 회계 기준**: 기준 원가 차이 분석이 월결산 핵심

## 자주 참조하는 SAP Note
- **2214213** — FI/CO Conversion in S/4HANA
- **2269324** — Simplification List

## 관련
- `../period-end.md` — 기간 마감 상세
- `quick-guide.md` — 퀵가이드
- `/agents/sap-co-consultant.md` — CO 컨설턴트 에이전트 (v1.3.0 신규)
- `/commands/sap-quarter-close.md` — 분기 결산 커맨드 (v1.3.0 신규)
