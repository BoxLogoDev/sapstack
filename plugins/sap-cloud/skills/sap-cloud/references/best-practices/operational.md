# Cloud PE 일상 운영 Best Practices

## 일일 운영 (Daily Operations)

### 1. 아침 시작 체크리스트 (9:00 AM)

**ERP 담당자 기준**

- [ ] **시스템 헬스 체크** (5분)
  - Cloud PE 대시보드 접속 (Fiori Launchpad)
  - 어제 오류 알림 확인 (System notifications)
  - 기간마감 모드 (period opening/closing status) 확인

- [ ] **미처리 프로세스 확인** (10분)
  - PR (구매요청) pending approval count
  - PO pending GR
  - Invoice pending 3-way match
  - Payment run ready status

- [ ] **기술 알림** (5분)
  - 실패한 배치 작업 (scheduled jobs)
  - 통합 에러 (Cloud ALM integration logs)
  - 커스텀 코드 에러 (Custom Logic 실행 이력)

**도구:**
- SAP Fiori Launchpad (custom tiles for monitoring)
- Manage Your Solution (configuration status)
- Alert Management (Cloud ALM)

### 2. 주간 운영 (Weekly Operations)

**월요일 (또는 회사 기간마감 다음날)**

- PO 미완료 항목 정리 (60d old POs 확인)
  - Fiori: Material Request → Purchase Order list
  - Filter: Created date > 60 days ago, status ≠ closed
  - Action: Clean up or deactivate obsolete POs

- PR approval workflow 체크
  - Pending approval count by approver
  - Alert approvers if > 20 items pending
  - Escalation if > 5 days old

- 구매 contract management
  - Contracts expiring next month
  - Renewal required?
  - 새 contract 계약 조건 확인

**목요일**

- Payment run 준비 (Friday 지급 권장)
  - Open invoices (not yet matched/cleared)
  - F110 dry-run 실행 (test mode)
  - Payment method verification (bank details, check stock)
  - Due date calculation accuracy

- Goods Receipt shortage check
  - GR posted but Invoice not received (3-way mismatch)
  - Follow up with vendors

**금요일**

- 주간 종합 보고서
  - PO volume (# of new POs)
  - Invoice volume & match rate
  - Payment processed amount
  - Approval SLA compliance (% approved within 2 days)

### 3. 월간 운영 (Monthly Operations)

**기간마감 준비 (Month-End -5 days, e.g., 25th for 30-day month)**

- [ ] GR/IV 정산 (Reconciliation)
  - T-code: F.13 (GR/IV clearing program)
  - Select: material type, company code, period
  - Result: Identify unmatched GR without IV
  - Action: Contact vendor or post accrual

- [ ] Foreign Currency Valuation
  - Fiori: Manage Exchange Rates (update daily rates)
  - T-code: FAGL_FC_VAL (if Cloud PE version supports)
  - Revaluation method: Actual vs. Planned
  - Run: Create FX gain/loss postings

- [ ] Open Invoice Aging
  - AR: Customer invoices > 60 days past due
  - Action: Initiate dunning (F150) or follow-up calls
  - AP: Vendor invoices ready to pay (use F110)

- [ ] Commitments vs. Actuals
  - PO commitments (not yet invoiced)
  - Invoice not yet GR received
  - Budget remaining vs. spent (compare to approved annual budget)

**기간마감 실행 (Month-End, 1-3일)** — 한국 회사는 월 5~7일차

- [ ] **Period Closing Start**
  - Fiori: Manage Period Opening/Closing
  - Lock previous period (prevent new postings to prior month)
  - Open current period (for reversals/accruals only)

- [ ] **Auto-Closings**
  - CLOSE process execution (if configured):
    - Accruals (payroll, utilities)
    - Amortization (prepaid expenses)
    - FX revaluation (if applicable)
    - Intercompany settlements (if multi-company)

- [ ] **Manual Adjustments**
  - FB01 (document posting) for correction entries
  - Examples:
    - Write-off old receivables (AR)
    - Accrual for services not yet invoiced
    - Inventory adjustments (if applicable)

- [ ] **Reporting & Review**
  - Trial Balance (T-code: FS10)
  - P&L statement (T-code: KKAX or Fiori Report)
  - Balance Sheet
  - Cash Flow
  - Review with finance controller (sign-off)

- [ ] **Final Close**
  - Lock all posting periods (no further changes allowed)
  - Document close sign-off (date, approver initials)
  - Archive documentation (SAP DMS or local repository)

---

## Cloud PE 특화 운영 포인트

### 1. Quarterly Release 영향도 관리

**Release 발표 받으면 (SAP에서 1개월 전 공지)**

- [ ] FSD (Feature Scope Description) 다운로드
- [ ] 귀사에 영향을 줄 만한 변경사항 검토
  - New features (activation needed?)
  - Deprecations (우리가 쓰는 기능 deprecated?)
  - Breaking changes (custom code 호환성?)

- [ ] Custom code backward compatibility 검증
  - Dev tenant에서 먼저 테스트
  - Tier 1 custom logic (CDS Views) → 대부분 영향 없음
  - Tier 2 BTP apps → API changes check
  - Tier 3 on-stack ABAP → released APIs 재확인

- [ ] Upgrade day 준비
  - Test tenant에서 dry-run (기존 CSP 재배포)
  - Regression test 계획 수립
  - Backup 전략 확인 (SAP가 자동 backup)
  - Rollback 계획 수립 (Cloud PE는 instant rollback 가능)

**Release day (보통 첫 화요일)**

- UTC 자정경 업그레이드 실행 (zero downtime)
- 한국시간: 09:00 AM (다음날 아침)
- 05:00~06:00 AM에 완료 (typically)

**Release day +1 (다음날 아침)**

- [ ] Smoke test (basic functionality)
  - PO create, GR, Invoice, Payment 각 1건씩 테스트
  - Custom logic 작동 확인
  - Report 데이터 정확성 확인
- [ ] User communication (release notes 공지)
- [ ] Production 모니터링 강화 (일주일간)

### 2. Cloud PE 자동화 활용 (표준 기능)

**기간마감 자동화 (CLOSE Process)**

표준 SAP Cloud PE는 다음을 자동 실행 가능 (커스텀 불필요):

- Accruals (payroll, utilities, interest)
- Depreciation (고정자산 감가상각)
- Currency revaluation (외화평가)
- Intercompany clearing (연결결산 준비)

**실행 방식:**
- SPRO (on-prem) 대신 Fiori: Manage CLOSE Process
- 실행 schedule: "월 말 22시" 자동 실행 가능
- 결과: GL 자동 posting

→ **효과:** 월마감 시간 30% 단축 (한국 회사 기준 3일→2.5일)

### 3. Cloud PE에서 불가능한 작업 (주의)

❌ **Do NOT Try (불가능 또는 금지)**

- SE38 (classic ABAP program) 작성
- SMOD / CMOD (function exit) 추가
- SPRO 직접 접속 (read-only 모드만 허용)
- TMS (transport request) 생성 (Cloud ALM 사용)
- Direct table modification (Z-tables 포함)
- IDOCs 또는 RFC 호출
- Classic workflow (SWDD) 생성 — 표준 workflow 사용

### 4. 권한 관리 (Segregation of Duty, K-SOX 대비)

Cloud PE에서 반드시 설정할 것:

**이중 승인 (Dual Control)**

- PO creation (구매팀) ≠ PO approval (관리팀) ≠ GR/IV posting (회계팀)
- 같은 사람이 3개 모두 할 수 없음

**구현:**
- Fiori: Manage Segregation of Duty Rules
- 예: User cannot have "Create PO" + "Approve PO" simultaneously
- System automatically enforces (prevents user assignment)

**감사 추적 (Audit Trail)**

- 모든 document 변경사항 자동 기록 (Change log)
- 변경자, 변경일시, 변경 전/후 값 저장
- 3년 보관 (법적 요구)

조회:
- Fiori: Manage Audit Logs
- Filter: Document type, user, date range
- Export: Excel (for audit reports)

---

## 일상 트러블슈팅 (Common Issues)

### Issue 1: PO creation 화면에서 특정 필드 입력 불가 (Field disabled)

**증상:** "원가센터 (Cost Center)" 필드가 회색(disabled)

**원인:**
1. Field status configuration (OBC4 on-prem, Cloud PE: Manage Your Solution)
   - 필드가 "Suppressed" 상태 (숨겨짐)
2. User role 부족 (특정 필드 입력 권한 없음)
3. Custom Logic validation (CDS rule이 필드 비활성화)

**해결:**
1. 관리자: Manage Your Solution → PO (header) → Field Status → Cost Center
   - 설정: "Optional" 또는 "Required"로 변경
   - Save & activate

2. User role 확인:
   - User: Manage Your User → Check roles
   - Look for: "PURCHASING_MASTER" 또는 유사 role
   - Contact admin if missing

3. Custom Logic 확인:
   - ABAP 컨설턴트: CDS validation rule (ZC_PO_CUSTOM)에서 해당 필드 제약 있는지 체크
   - 필요시 validation rule 수정 (CSP → Cloud ALM 배포)

### Issue 2: Invoice posting (MIRO) 실패 — "Tax code not maintained"

**증상:** Invoice post 시 에러: "Tax code XX not assigned to company code YY"

**원인:**
- Tax configuration 누락 (회사코드별 세금코드 할당 미완료)

**해결:**
1. Fiori: Manage Tax Configuration
2. Select: Company code, Country (KR for Korea)
3. Assign tax codes (VAT standard, VAT zero, etc.)
4. Retry invoice posting

**한국 특수:**
- 부가세코드 3단계 (standard 10%, zero 0%, reversal -10%)
- 원천세 포함 (근로소득 3%, 이자 14%, 배당 15%)

### Issue 3: Payment run (F110) 실행되지 않음 — "No items selected"

**증상:** F110 dry-run → "0 invoices processed"

**원인:**
1. Open invoices 없음 (모두 이미 지급됨)
2. Payment method 미설정 (vendor master)
3. House bank / account ID 미할당
4. Due date 미도래 (payment date < due date)

**해결:**
1. 미지급 invoices 확인:
   - Fiori: Manage Accounts Payable → Open Items
   - Filter: Status = "Open", Date range = "last 60 days"

2. Vendor 설정 확인:
   - Fiori: Manage Vendor Master (FD02 equivalent)
   - Tab: Purchasing Data → Payment Terms
   - Check: "Payment Method" (ÜBW = bank transfer, SCHECK = check)

3. House bank 할당:
   - Fiori: Manage Purchasing Organization
   - Assign: Default house bank + account ID for payment

4. Retry F110

### Issue 4: GR/IV 3-Way Match 실패 — Invoice과 GR qty 불일치

**증상:** MIRO 화면에서 "Quantity variance: PO 100, GR 95, IV 100"

**원인:**
- Goods Receipt 누락 (partial GR만 post됨)
- Over-invoicing (vendor invoice qty > GR qty)

**해결:**
1. GR 확인 (MIGO):
   - Check: GR posted for 95 units?
   - Check: 나머지 5개는 "open" status (not yet received)?

2. Invoice 문제 해결:
   - If over-invoicing: Contact vendor (invoice 수정 요청)
   - If partial GR acceptable: Tolerance check
     - Fiori: Manage Tolerance Keys (OMR6)
     - Set: 금액/수량 tolerance % (e.g., ±5%)

3. Post invoice with tolerance override (if approved by finance controller)

---

## 분기별 운영 체크리스트

**분기 초 (1월, 4월, 7월, 10월 초)**

- [ ] Quarterly release 영향도 분석 완료
- [ ] Custom code 호환성 테스트 완료
- [ ] DEV tenant에서 dry-run 완료
- [ ] Release note 공지 (사용자 대상)

**분기 말 (3월, 6월, 9월, 12월 말 + 월마감)**

- [ ] Period closing 성공 (all sign-offs)
- [ ] Audit trail 검토 (재무감시, 부정거래)
- [ ] Custom code 성능 검증 (CDS views, RAP logic)
- [ ] Production 용량 모니터링 (storage, API quota)

**연 1회 (12월)**

- [ ] Fit-to-Standard 점검 (custom code footprint가 증가했는가?)
- [ ] Disaster Recovery 테스트 (SAP-managed이지만, 귀사 복구 계획 확인)
- [ ] Security review (Segregation of duty, audit logs)
- [ ] Contract renewal (SLA, support plan)

---

## 참고

- `fit-to-standard.md` — 초기 구현 best practice
- `governance.md` — Release & extension 거버넌스
- `period-end.md` — 기간마감 상세 절차
