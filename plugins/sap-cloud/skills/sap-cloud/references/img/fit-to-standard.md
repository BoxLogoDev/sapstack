# Fit-to-Standard 방법론 — Cloud PE 구현 워크숍 절차

## Fit-to-Standard의 핵심 목표

"아무것도 커스터마이징하지 말고, 프로세스를 SAP 표준에 맞춰라"

- **최소 확장**: 꼭 필요한 것만 Tier 1/2/3 추가
- **장기 유지보수성**: 확장이 적을수록 quarterly release 영향도 낮음
- **빠른 구현**: 표준 프로세스는 pre-configured → 설정만 하면 됨
- **낮은 비용**: 커스텀 개발 최소화

---

## Fit-to-Standard 워크숍 구조 (3일)

### **Day 1: Current State Assessment (현재 상태 분석)**

#### Phase 1.1: 고객 프로세스 맵핑 (2시간)

**목표:** 현재 프로세스를 도식화 (swimlane diagram)

**참여자:**
- Business Owner (finance/procurement/supply chain director)
- Process Owner (team lead)
- SAP 컨설턴트 (facilitator)
- IT (technical feasibility check)

**방법:**
1. "Purchase-to-Pay (P2P)" 프로세스 그리기
2. 각 단계의 책임자 표시 (department / role)
3. 시스템 호출 (ERP, legacy system, manual, email)
4. 현재 pain points 기록

**예 (Korean PO Process):**
```
구매팀 → 구매요청 입력 (PR)
   ↓
예산팀 → 예산 확인 & 승인 (manual email or workflow?)
   ↓
구매팀 → PO 생성 (SAP or legacy MAPICS?)
   ↓
공급자 → Invoice 제출 (EDI, email, web portal?)
   ↓
회계팀 → 인수/검품 및 Invoice match
   ↓
회계팀 → Payment (F110 자동 또는 manual?)
   ↓
경영진 → Monthly Close (cash flow report 필요?)
```

#### Phase 1.2: 커스터마이징 목록화 (2시간)

**목표:** 현재 사용 중인 모든 커스텀 항목 리스트업

**체크리스트:**

| 영역 | 확인 항목 | 예시 |
|------|---------|------|
| **Custom Tables** | Z-table 존재? | ZEMPLOYEE_CUSTOM, ZPROJECT_COST, ... |
| **Custom Fields** | 표준 테이블에 추가 필드? | 예: ZSUPPLIER_ID in EKKO (PO header) |
| **ABAP Programs** | Custom reports / interfaces? | ZMM_PO_ANALYSIS (monthly report) |
| **Function Exits (SMOD/CMOD)** | Standard function 후킹? | EXIT_SAPLMMPO_001 (PO validation) |
| **Workflows (SWDD)** | Custom workflow? | 3단 승인 (draft→manager→cfo) |
| **Interfaces/Integrations** | External system calls? | Legacy MAPICS → SAP via EDI/IDOCs |
| **Data Validation** | Custom checks? | "PO qty <= contract qty" |
| **Reports** | Custom Fiori apps? | "Monthly spend by cost center" |

**Output:** Spreadsheet

```
Priority | Component      | Current Tech  | Cloud PE Possible? | Gap (Fit/Extend/WA)
---------|------------------|---------------|-------------------|------------------
High    | 3-Tier PO Approval | SWDD workflow | YES (std workflow) | FIT
High    | GR from PO auto  | Custom exit   | YES (std config)   | FIT
Medium  | Vendor scorecard | ABAP report   | YES (CDS analytics)| Extend (Tier 1 CDS)
Low     | Email to vendor  | custom Z-func | NO (use Tier 2)    | Extend (Tier 2)
```

#### Phase 1.3: 현재 상태 요약 문서 작성 (1시간)

**작성:**

```
CURRENT STATE ASSESSMENT (고객사 OO)
===================================

1. Deployment Model
   - Current: SAP ECC 6.0 (on-premise, 2015년 구축)
   - Target: Cloud PE 2405

2. Organizational Structure
   - Companies: 한국(1), 미국(1) = 2개 회사코드
   - Plants: 서울, 경기 (2개 공장)
   - Cost Centers: 350개 (조직도 기반 3단계)

3. Key Modules in Scope
   ✓ MM (Materials Management) — Purchasing, Inventory
   ✓ FI (Financial Accounting) — GL, AP, AR, AA
   ✓ SD (Sales) — Orders, Billing, AR
   ✗ PM (Plant Maintenance) — out of scope
   ✗ PP (Production Planning) — future phase

4. Current Customizations (High Impact)
   a) Approval Workflow (3-level PO approval)
      - Draft by buyer → Manager approval → Finance approval → Posted
      - Current: SWDD classic workflow
      - Impact: MUST preserve in Cloud PE
   
   b) Vendor Scorecard (Procurement)
      - Monthly supplier rating (quality, delivery, cost)
      - Current: Custom Z-table + manual ABAP report
      - Impact: Can be replaced by CDS analytics
   
   c) EDI Interface (Purchasing)
      - PO transmitted to vendors via EDI
      - Current: IDOC-based (outbound, segments E1EDK1, E1EDP01)
      - Impact: Cloud PE does NOT support IDOCs
             → Need Tier 2 BTP integration

5. Pain Points (User Feedback)
   - Monthly close takes 7 days (slow compared to peers)
   - Vendor master updates delayed (approval process too strict)
   - Budget tracking not real-time (monthly batch process)
   - Legacy PO visibility (some vendors still on email system)

6. Initial Assessment
   Total Custom Components: 8
   Expected Reduction: 70% (via Cloud PE standard)
   Remaining Custom Effort: Tier 1 (40%), Tier 2 (60%)
```

---

### **Day 2: Future State & Gap Analysis**

#### Phase 2.1: SAP Cloud PE 표준 프로세스 데모 (3시간)

**목표:** "SAP는 어떻게 하는가?" 이해

**방법:**
- SAP 컨설턴트가 DEV 테넌트에서 live demo
- P2P (Purchase-to-Pay) end-to-end workflow 시연
  - PR creation (material request)
  - PO generation (sourcing, contract reference)
  - GR (goods receipt)
  - Invoice receipt & matching
  - Payment (F110 automatic payment run)

**Key Takeaway:** 고객이 "아, 우리와 다르지 않네" 또는 "이건 우리가 못 쓰겠어" 깨달음

**예 (Standard SAP PO Workflow):**

```
1. Material Request (MR) — requisitioner creates
2. PR (Purchasing Request) — system auto-converts from MR
3. PO (Purchase Order) — buyer creates from PR
   ├─ Approval workflow (if configured, 1-3 levels)
   └─ GR-based Invoicing flag (invoice only after GR)
4. Goods Receipt (GR) — warehouse confirms receipt
5. Invoice Receipt (FI document FB60 / MIRO)
   ├─ Three-way match: PO ↔ GR ↔ Invoice (auto or manual)
   └─ Tolerance check (amount, qty, %)
6. Payment (F110) — automatic payment run by finance
   ├─ Due date calculation
   ├─ Discount opportunity check
   └─ Payment method selection (bank transfer, check, etc.)
```

#### Phase 2.2: Delta Design — Gap Analysis (2시간)

**방법:** Spreadsheet로 고객 요구사항 vs. SAP 표준 비교

| 요구사항 / 프로세스 | 고객 현재 | Cloud PE 표준 | 차이? | 분류 | Tier |
|----------|---------|-----------|------|------|------|
| **PO Approval** | 3단 (구매→관리→회계) | 1~N단 configurable | 동일 | FIT | - |
| **GR-based IV** | GR 필수 후 Invoice | Invoice dependent on GR | 동일 | FIT | - |
| **Vendor Performance** | 월별 scorecard (Z-table) | No standard report | 부족 | EXTEND | Tier 1 (CDS) |
| **EDI Integration** | Outbound PO to vendor | No IDOC in Cloud PE | 불가 | EXTEND | Tier 2 (BTP) |
| **Budget Check** | Monthly batch 실행 | Real-time (standard config) | 향상 | FIT | - |
| **Tax Reporting** | Monthly VAT summary | Auto (standard) | 동일 | FIT | - |
| **Fixed Asset Tagging** | Custom asset ID prefix | Flexible asset numbering | 동일 | FIT | - |
| **Cost Center Split** | Multi-CC per PO item | Split capability (standard) | 동일 | FIT | - |

#### Phase 2.3: Delta Design 문서 작성 (1시간)

**문서 포맷:**

```
DELTA DESIGN DOCUMENT
====================
Customer: OO Corporation
Date: 2024-04-20
Workshop Lead: SAP Consultant A, Functional Lead B, IT Lead C

1. PROCESSES FITTING STANDARD (0 EXTENSIONS NEEDED)
   ==========================================
   
   Process: Purchase Order Processing
   Current State: 3-level approval (buyer → manager → finance)
   SAP Standard: Configurable approval (1-N levels) ✓
   Decision: FIT — Use standard SAP workflow
   Effort: 0 (already in Cloud PE)
   Release: Available immediately
   Risk: NONE
   
   Process: Goods Receipt & Invoice Matching
   Current State: GR required before IV posting
   SAP Standard: Three-way match + tolerance checks ✓
   Decision: FIT — Use standard MIRO (Invoice Receipt)
   Effort: 0
   Release: Available immediately
   Risk: NONE
   
   Process: Automatic Payment Run
   Current State: Manual F110 selection by finance
   SAP Standard: F110 (fully automated) ✓
   Decision: FIT — Use standard payment automation
   Effort: Configuration only (2 days)
   Release: Available immediately
   Risk: NONE (can run in test mode first)

2. REQUIRED EXTENSIONS (TIER 1/2/3)
   =============================
   
   a) VENDOR PERFORMANCE SCORECARD
      Current Tech: Custom Z-table + ABAP report
      Cloud PE Path: Tier 1 Custom CDS Analytics
      SAP Alternative: No standard report (thus custom needed)
      
      Scope:
      - Create CDS View: Z_VENDOR_SCORECARD
        Dimensions: Vendor, Month, Category (Quality/Delivery/Cost)
        Measures: Rating, Weighted Score
      - Create Fiori Analytical App (template-based)
      
      Effort: 1 week (CDS design + testing + UAT)
      Deployment: CSP → Cloud ALM → Prod
      Risk: LOW (read-only analytics, no transactional logic)
      Business Impact: HIGH (critical for procurement decisions)
      Rollback: Easy (rollback via Cloud ALM instant)
      
      Recommended: YES (value-add feature)
      Go/No-Go: GO (execute after PO process stabilized)
      Timeline: Week 3 of implementation
   
   b) EDI INTEGRATION (Outbound PO to Vendors)
      Current Tech: IDOC (MM02 message type)
      Cloud PE Path: NOT POSSIBLE via standard IDOC
                     Tier 2 required (BTP integration)
      Alternative Approaches:
        Option 1: PDF email (manual) → workaround, slow
        Option 2: BTP CAP app → vendor portal (web-based)
        Option 3: 3rd-party EDI provider (e.g., GXS, OpenText)
      
      Scope (BTP Option):
      - Create BTP Node.js app (CAP)
      - Consume Cloud PE OData (PO API)
      - Transform to EDI format (EDIFACT)
      - Transmit to vendor (SFTP or REST API)
      - Create vendor dashboard (Fiori)
      
      Effort: 6-8 weeks (includes BTP setup, vendor onboarding)
      Cost: High (BTP licensing + development)
      Risk: MEDIUM (3rd-party dependency, vendor readiness)
      Business Impact: HIGH (affects 80% of vendors)
      Timeline: Phase 2 (post go-live stabilization)
   
   c) SUBSIDY TRACKING (Government Support)
      Current Tech: Manual tracking, spreadsheet
      Cloud PE Path: Tier 1 Custom Fields + Custom Logic
      Scope:
      - Add Custom Field on PO: ZZ_SUBSIDY_CODE (dropdown)
      - Add Custom CDS View: Z_SUBSIDY_MONTHLY_REPORT
      
      Effort: 3-5 days (custom field + analytics)
      Deployment: Immediate (via Fiori Manage Custom Fields)
      Risk: LOW
      Business Impact: MEDIUM (regulatory requirement for K-SOX)
      Timeline: Pre-go-live (Week 1)

3. WORKAROUNDS (MANUAL STEPS — NOT IDEAL)
   ====================================
   
   Process: Legacy Budget System Integration
   Current: Real-time sync with budgeting tool (on-prem)
   Cloud PE Path: Not feasible (requires Tier 2 BTP + custom API)
   Workaround: Weekly batch export (PO data) → email to budget team
   Impact: 1-2 day lag in budget visibility (acceptable interim solution)
   Timeline: Phase 2 (Phase 1 uses manual budget tracking)

4. IMPLEMENTATION ROADMAP
   ======================
   
   PHASE 1 (GO-LIVE PREPARATION) — 12 weeks
   ├─ Weeks 1-4: Design & configuration (standard Cloud PE setup)
   ├─ Weeks 5-8: Custom development (Vendor scorecard, subsidy tracking)
   ├─ Weeks 9-11: Testing (SIT, UAT)
   └─ Week 12: Go-live (Cutover & data migration)
   
   PHASE 2 (POST GO-LIVE) — Months 2-4
   ├─ Stabilization (production support)
   ├─ EDI Tier 2 development
   └─ Legacy system decommissioning

5. EFFORT & COST SUMMARY
   ====================
   
   | Component | Tier | Effort | Cost | Timeline |
   |-----------|------|--------|------|----------|
   | Standard Config | - | 4 weeks | $80K | W1-4 |
   | Vendor Scorecard (CDS) | Tier 1 | 1 week | $15K | W5 |
   | Subsidy Tracking | Tier 1 | 5 days | $8K | W6 |
   | EDI Integration | Tier 2 | 6 weeks | $120K | W13+ |
   | **TOTAL** | - | **16 weeks** | **$223K** | **Phase 1+2** |
   
   **Comparison:**
   - If NO Fit-to-Standard (full customization): $500K+, 6+ months
   - With Fit-to-Standard: $223K, 4 months → **55% cost savings**

6. GOVERNANCE & DECISION GATES
   ===========================
   
   Gate 1 (Week 4): Standard config complete → UAT sign-off
   Gate 2 (Week 8): Tier 1 custom dev complete → QA testing
   Gate 3 (Week 11): Regression testing passed → Ready for go-live
   Gate 4 (Month 1): Production stable (no critical issues) → Phase 2 kickoff

7. RISK ASSESSMENT
   ================
   
   Risk | Likelihood | Impact | Mitigation |
   -----|------------|--------|------------|
   EDI vendor resistance | Medium | High | Early vendor communication, test program |
   Subsidy tracking complexity | Low | Medium | Custom field is simple, easy to adjust |
   Quarterly release impact | Low | Low | Cloud PE backward-compatible, test in advance |
   Budget system lag | Low | Medium | Use workaround, plan Tier 2 integration |
```

---

### **Day 3: Delta Design Finalization & Recommendations**

#### Phase 3.1: 기술 리뷰 (1시간)

- Tier 1/2/3 선택 기준 재확인
- 각 커스텀의 기술 가능성 평가
- 아키텍처 (BTP integration, API usage, data flow) 검토

#### Phase 3.2: 비용/일정 추정 (1시간)

각 커스텀별:
- Development effort (days)
- Testing effort (days)
- Deployment risk (low/medium/high)
- Post-go-live support effort

#### Phase 3.3: Executive Recommendation (1시간)

최종 결정 매트릭스:

| Extension | Fit/Extend | Tier | Effort | Business Value | Recommendation |
|-----------|-----------|------|--------|---------------|-----------------|
| Vendor Scorecard | Extend | 1 | 5d | HIGH | GO |
| EDI Integration | Extend | 2 | 40d | HIGH | Defer to Phase 2 |
| Subsidy Tracking | Extend | 1 | 3d | MEDIUM | GO |

**최종 Go/No-Go Decision:**
✓ GO for Phase 1 with Tier 1 extensions (vendor scorecard + subsidy tracking)
- Defer Phase 2 for EDI Tier 2 (post-stabilization)
- Use workaround for budget sync (manual weekly export)

---

## Fit-to-Standard 성공 지표

| 지표 | 목표 | 측정 방법 |
|------|------|----------|
| **Custom Code Footprint** | < 20% of standard | # of CSP artifacts / total modules |
| **Time-to-Go-Live** | < 20 weeks | Project timeline |
| **Quarterly Release Readiness** | < 2 days to patch | Test cycle duration |
| **User Adoption** | > 90% within 30 days | Login/transaction frequency |
| **System Stability** | < 2 critical issues in Month 1 | Production incident count |

---

## 참고

- `overview.md` — Cloud ALM 설정
- `key-user-extensibility.md` — Tier 1/2/3 기술 상세
- `../../best-practices/governance.md` — Release governance
