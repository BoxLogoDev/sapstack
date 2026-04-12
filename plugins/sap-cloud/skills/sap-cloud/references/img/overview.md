# Cloud ALM — SAP S/4HANA Cloud PE 구성 가이드 개요

## Cloud PE와 SPRO의 근본적 차이

**ECC / On-Premise S/4HANA:**
- SPRO (Customizing) → T-code로 설정 → Transport로 배포

**Cloud PE:**
- SPRO 없음 (수정 불가)
- 대신 "Manage Your Solution" (Fiori 앱) → 제한된 설정만 가능
- 기본 설정 대부분 제조/판매/회계 표준 프로세스에 맞춰 미리 구성됨

---

## Cloud PE "IMG" 개념 재정의

Cloud PE에서는 classic IMG (SPRO) 개념이 없습니다. 대신:

### 1. **Pre-Configured Settings** (SAP가 설정, 수정 불가)
- Company code 정의
- Chart of Accounts
- Tax codes (국가별 기본값)
- Product categories
- Sales/Purchasing processes

→ 이들은 **Fit-to-Standard 워크숍에서 검토하지만 변경 불가**.

### 2. **Customizable Settings** (고객이 설정 가능, "Manage Your Solution" 사용)
- Cost center / Profit center 정의
- User roles & authority (권한)
- Period opening/closing (기간 제어)
- Approval workflows (표준 워크플로우)
- Report configuration

→ 이들은 **Cloud PE에서 제한적으로 수정 가능**.

### 3. **Non-Modifiable Items** (절대 수정 불가, Clean Core)
- GL account master (추가만, 구조 변경 불가)
- Customer/Vendor master fields (Custom Fields로 확장만 가능)
- Standard tables (수정 불가)
- Posting logic (SE38 / SMOD / CMOD 금지)

→ 이들은 **Fit-to-Standard 재설계 또는 Tier 1/2/3 커스텀만 가능**.

---

## Cloud PE 설정 흐름

### Phase 1: Pre-Go-Live (Fit-to-Standard 워크숍)

```
1. SAP 표준 프로세스 검토 (Fiori: Manage Your Solution 데모)
   ↓
2. 고객 현재 프로세스와 gap 분석 (Delta Design)
   ↓
3. 결정: Fit (변경 없음) / Extend (커스텀) / Workaround (수동)
   ↓
4. 커스텀 필요한 항목만 개발 (Tier 1/2/3)
   ↓
5. 시스템 설정 (Manage Your Solution에서 제한된 범위)
   ↓
6. 테스트 및 Go-live
```

### Phase 2: Operations (Post Go-Live)

```
Monthly Regression Test (Quarterly Release 대비)
   ↓
FSD (Feature Scope Description) 검토 (새 기능, deprecation, breaking changes)
   ↓
Feature 활성화 여부 결정
   ↓
CSP (Custom Software Package) 재검증 (backward compatible인지)
   ↓
Upgrade 실행 (SAP가 자동, UTC 자정경)
```

---

## 주요 설정 항목 (Cloud PE에서 변경 가능한 것)

### Financial Accounting (FI)

| 항목 | Fiori 앱 | 설정 가능? | 설명 |
|------|----------|----------|------|
| 회사코드 (Company Code) | Manage Company Code | △ 제한적 | 기본값 자동 설정, 명칭 정도만 수정 |
| Cost Center | Manage Cost Center | ✓ | 신규 생성, 수정, 계층 구조 정의 |
| Profit Center | Manage Profit Center | ✓ | 신규 생성, P&L 책임 배분 |
| GL 계정 (General Ledger) | Manage GL Accounts | △ | 표준 계정은 수정 불가, 신규는 생성 가능 |
| 기간 제어 | Period Opening/Closing | ✓ | 어느 기간까지 입력 가능한지 제어 |
| 환율 (Exchange Rate) | Manage Exchange Rates | ✓ | Daily exchange rate 입력 (수동 또는 자동) |
| 부가세 (Tax Code) | Tax Configuration | △ | 국가별 기본값 자동 설정, 커스텀 불가 |
| 이중승인 (Dual Control) | Segregation of Duty Rules | ✓ | 권한 분리 (Create ≠ Approve ≠ Post) |

### Materials Management (MM)

| 항목 | Fiori 앱 | 설정 가능? | 설명 |
|------|----------|----------|------|
| 구매 조직 (Purchasing Organization) | Manage Purchasing Org | △ | 기본값 자동, 수정 제한적 |
| Material 분류 (Material Type) | Material Master | △ | 표준 분류만 사용 가능 |
| 창고 (Warehouse) | Manage Warehouse | ✓ | 신규 생성, 로케이션 관리 |
| 구매 방침 | Purchasing Policy | △ | 표준 정책 수정 불가, 신규 정책 제한적 |
| 가격 조건 (Pricing Terms) | Manage Pricing | △ | 기본 조건 자동 설정 |

### Sales & Distribution (SD)

| 항목 | Fiori 앱 | 설정 가능? | 설명 |
|------|----------|----------|------|
| 판매 조직 (Sales Organization) | Manage Sales Org | △ | 기본값 자동, 수정 제한적 |
| 배송 지점 (Distribution Channel) | Manage Distribution Channel | △ | 표준만 사용 |
| 납기 일정 (Delivery Schedule) | Shipping Configuration | △ | 표준 프로세스 수정 불가 |
| 선적 조건 (Incoterms) | Manage Incoterms | ✓ | 신규 추가 가능 |
| 배송비 규칙 (Freight Rules) | Shipping Rules | △ | 표준 규칙만 사용 |

### Planning & Production

| 항목 | Fiori 앱 | 설정 가능? | 설명 |
|------|----------|----------|------|
| 수요 계획 | Demand Planning | ✓ | 예측 모델 설정, 파라미터 조정 |
| 생산 계획 | Production Scheduling | △ | 표준 MRP 로직, 커스텀 불가 |
| BOM (자재부스) | BOM Master | ✓ | BOM 신규 생성, 수정 |
| 라우팅 (Routing) | Manufacturing Routing | ✓ | 라우팅 생성, 작업 공정 정의 |

---

## Fit-to-Standard 워크숍에서 검토할 항목 (체크리스트)

### 1. Financial & Legal

- [ ] 회사코드 구조 (모회사 1개 vs. 자회사 여러 개)
- [ ] 회계연도 변형 (calendar vs. fiscal year)
- [ ] 통화 (단일 vs. multi-currency + parallel currency for reporting)
- [ ] 부가세 구조 (K-VAT 3단계 vs. 단순세)
- [ ] 원천세 (근로소득, 이자, 배당)
- [ ] 자산회계 영역 (GAAP vs. K-IFRS, 1개 vs. 2개 영역)

### 2. Organizational Setup

- [ ] 회사별 Cost Center 계층 (부서→팀→개인)
- [ ] Profit Center 할당 (BU별 P&L 책임)
- [ ] 구매 조직 (중앙집중식 vs. 분산식)
- [ ] 판매 조직 (지역별 vs. 제품별)
- [ ] 제조 공장 (다중 공장 vs. 단일 공장)

### 3. Process Workflows

- [ ] PO approval (1단 vs. 다단 승인)
- [ ] Invoice approval (자동 vs. 수동)
- [ ] PR (구매요청) 필수 vs. 선택
- [ ] GR (재고입고) 자동 vs. 수동
- [ ] AR/AP aging report 자동생성 여부

### 4. Customization Needs (문제가 될 만한 것)

- [ ] 현재 custom Z-tables (Customer-specific data model)
- [ ] 현재 custom workflows (classic SWDD)
- [ ] 현재 data validation (SMOD/CMOD exits)
- [ ] External integrations (legacy systems, EDI/IDOCs)
- [ ] Special reporting (ABAP custom reports)

→ 각각에 대해 **Fit (표준으로 해결) vs. Extend (Tier 1/2/3 커스텀)** 결정.

---

## Cloud ALM의 역할 (생명주기 관리)

Cloud PE는 classic TMS (Transport Management) 대신 **Cloud ALM** (웹 기반 생명주기 관리)을 사용합니다.

### 구성 항목별 배포 방식

| 변경 유형 | 배포 방식 | Approval |
|---|---|---|
| 표준 설정 (cost center, GL account) | Fiori 앱에서 직접 수정 (즉시 본 테넌트에 반영) | 일반 권한 |
| Custom Field 추가 | Fiori 앱 (Manage Custom Fields) → 즉시 반영 | 해당 비즈니스 오너 |
| Custom Logic (RAP / CDS) | ABAP Workbench → CSP Package → Cloud ALM 업로드 → 대상 테넌트 배포 | SAP Review (Tier 3만) + Tech Lead |
| Custom UI / BTP 앱 | BTP console에서 직접 배포 | Dev/Test → Prod 프로모션 |
| Quarterly Release (SAP) | SAP가 자동 적용 (zero downtime, UTC 자정) | 고객 No-Go 경우만 지연 가능 |

---

## Cloud PE 멀티 테넌트 환경

### 권장 테넌트 전략

```
DEV Tenant (개발, Custom Logic 작성)
   ↓ CSP 배포
TEST Tenant (기능테스트, 성능테스트, Quarterly Release 사전 검증)
   ↓ CSP 배포
PROD Tenant (운영, 실데이터)
```

**비용 최적화 (선택사항):**
- DEV 단독 보유 (PROD과 동일한 릴리즈 단계 사용)
- TEST는 필요시만 provision (월 1회 Quarterly Release 검증 때)

---

## 기간마감 자동화 (Korean Specific)

Cloud PE에서 월마감은 자동화된 **CLOSE Process**를 사용할 수 있습니다 (Tier 1 추가 커스텀 불필요):

| 마감 단계 | CLOSE Process | 소요시간 |
|---|---|---|
| 부가세 정산 (VAT settlement) | 자동 + 인계 계산 | 1시간 |
| 외화평가 (FX revaluation) | 자동 (매일 실행 가능) | 30분 |
| GR/IR 청소 | 자동 | 15분 |
| P&L 이월 (carryforward) | 반자동 (검증 후 실행) | 1시간 |
| Consolidation (연결결산) | 별도 Cloud Consolidation (옵션 모듈) | - |

→ 표준 Cloud PE만으로 월마감 D+5 달성 가능 (no custom code needed).

---

## 참고

- 자세한 Tier 1/2/3 구현: `key-user-extensibility.md`
- Fit-to-Standard 워크숍 진행: `fit-to-standard.md`
- Quarterly Release 관리: `../../best-practices/governance.md`
