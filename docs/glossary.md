# SAP 용어집 (한국어 ↔ 영문)

> 한국 SAP 현장에서 자주 쓰이는 150+ 용어의 한국어/영문 매핑. 모듈별로 정리됐으며, 트랜잭션 코드는 `data/tcodes.yaml`에서 검색 가능.

## 📖 사용법
- Ctrl+F로 한국어 또는 영문 검색
- 굵은 글씨는 **공식 용어**, 일반 글씨는 업계 관용어
- [T-code]는 대표 트랜잭션

---

## 🏢 조직 구조 (Organizational Structure)

| 한국어 | English | 설명 |
|-------|---------|------|
| 회사코드 | **Company Code** (BUKRS) | 법률적 독립 회계 단위 |
| 계열사/법인 | Legal Entity | 회사코드와 1:1 대응 일반적 |
| 사업장 | Business Place (BUPLA) | 한국 세법 개념 — 사업자등록 단위 |
| 플랜트 | **Plant** (WERKS) | 물류·생산 조직 |
| 저장위치 | **Storage Location** (LGORT) | 창고 세부 구역 |
| 판매조직 | **Sales Organization** (VKORG) | SD 최상위 |
| 유통채널 | **Distribution Channel** (VTWEG) | B2B/B2C 등 |
| 사업부 | **Division** (SPART) | 제품 그룹핑 |
| 원가센터 | **Cost Center** (KOSTL) | CO 원가 수집 |
| 이익센터 | **Profit Center** (PRCTR) | PCA 수익성 단위 |
| 관리영역 | **Controlling Area** (KOKRS) | CO 최상위 |
| 평가영역 (FI-AA) | Valuation Area (BEREI) | 자산 평가 |
| 감가상각영역 | **Depreciation Area** | 자산 감가상각 |

---

## 💰 FI — Financial Accounting

| 한국어 | English | 비고 |
|-------|---------|------|
| 총계정원장 | **General Ledger** (GL) | 메인 원장 |
| 채권 | **Accounts Receivable** (AR) | 고객 채권 |
| 채무 | **Accounts Payable** (AP) | 벤더 채무 |
| 자산회계 | **Asset Accounting** (AA/FI-AA) | 유형자산 |
| 재무제표 | Financial Statements | F.01/F.08 |
| 재무상태표 | **Balance Sheet** | 자산·부채·자본 |
| 손익계산서 | **P&L Statement** / Income Statement | 수익·비용 |
| 원가요소 | Cost Element | 원가 분류 |
| G/L 계정 | **G/L Account** (SAKNR) | 원장 계정 |
| 재집계 계정 | **Reconciliation Account** | 보조 원장 통합 |
| 특수원장 | **Special G/L** | 선수금·보증 등 |
| 선수금 | Down Payment | F-29/F-37 |
| 어음 | Bills of Exchange | 한국 거의 소멸 |
| 외화평가 | **Foreign Currency Valuation** | F.05/FAGL_FC_VAL |
| 원천세 | **Withholding Tax** (WT) | 한국 사업소득세 등 |
| 부가세 (부가가치세) | **VAT** (Value Added Tax) | Tax code MWSKZ |
| 전자세금계산서 | **Electronic Tax Invoice** / e-Tax Invoice | 한국 법정 의무 |
| 독촉 | **Dunning** | F150 |
| 여신 관리 | **Credit Management** | FD32/UKM_BP |
| 여신한도 | Credit Limit | |
| GR/IR | Goods Receipt / Invoice Receipt | MM-FI 연결 계정 |
| 기간 제어 | **Posting Period Control** | OB52 |
| 결산 | **Period-End Closing** | 월/분기/연 |
| 연결재무제표 | **Consolidated Financial Statements** | Group Reporting |
| K-IFRS | Korean IFRS | 한국채택국제회계기준 |
| K-SOX | Korean SOX | 내부회계관리제도 |

---

## 📊 CO — Controlling

| 한국어 | English | 비고 |
|-------|---------|------|
| 원가센터 회계 | **Cost Center Accounting** (CCA) | |
| 이익센터 회계 | **Profit Center Accounting** (PCA) | S/4에서 Universal Journal 통합 필수 |
| 내부주문 | **Internal Order** (IO) | KO01 |
| 제품원가 | **Product Costing** (CO-PC) | CK11N/CKMLCP |
| 수익성 분석 | **Profitability Analysis** (CO-PA) | KE30 |
| 배부 사이클 | **Assessment Cycle** | KSU5 |
| 분배 사이클 | **Distribution Cycle** | KSV5 |
| 내부주문 정산 | **Internal Order Settlement** | KO88 |
| 표준원가 | Standard Cost | CK24로 업데이트 |
| 실제원가 | Actual Cost / Actual Costing | S/4 필수 (Material Ledger) |
| 차이 | **Variance** | KKS1 |
| 자재원장 | **Material Ledger** | S/4 필수 |
| 활동유형 | **Activity Type** | KL01 |
| 통계 주요 수치 | **Statistical Key Figures** | KP46 |
| Universal Journal | Universal Journal | S/4 ACDOCA |

---

## 📦 MM — Materials Management

| 한국어 | English | 비고 |
|-------|---------|------|
| 구매 | **Procurement** / Purchasing | |
| 구매요청 | **Purchase Requisition** (PR) | ME51N |
| 구매발주 | **Purchase Order** (PO) | ME21N |
| 정보레코드 | **Info Record** | ME11 |
| 계약 | **Contract** | ME31K |
| 납품 스케줄 | **Scheduling Agreement** | ME31L |
| 입고 | **Goods Receipt** (GR) | MIGO 101 |
| 출고 | **Goods Issue** (GI) | MIGO 201 |
| 이고 | **Transfer Posting** | MIGO 301/311 |
| 송장검증 | **Invoice Verification** | MIRO |
| 재고 | **Inventory** / Stock | |
| 자재마스터 | **Material Master** | MM01 |
| 벤더마스터 | **Vendor Master** | XK01 (ECC) / BP (S/4) |
| 재고실사 | **Physical Inventory** | MI01~MI07 |
| 특수재고 | **Special Stock** | 위탁·프로젝트·판매오더 등 |
| 외주 / 하도급 | **Subcontracting** | Item Category L |
| 평가 클래스 | **Valuation Class** | MBEW.BKLAS |
| 이동 유형 | **Movement Type** | 101, 201, 301 등 |
| 릴리스 전략 | **Release Strategy** | 결재 워크플로 |
| 가용성 체크 | **Availability Check** | ATP |
| 계정 결정 | **Account Determination** | OBYC |

---

## 🛒 SD — Sales and Distribution

| 한국어 | English | 비고 |
|-------|---------|------|
| 판매오더 | **Sales Order** | VA01 |
| 출하 | **Outbound Delivery** | VL01N |
| 빌링 | **Billing** / Invoice | VF01 |
| 반품오더 | **Return Order** | VA01 + Type RE |
| 가격결정 | **Pricing** | V/08 |
| 조건 유형 | **Condition Type** | PR00, K004, MWST |
| 조건 레코드 | **Condition Record** | VK11 |
| 고객마스터 | **Customer Master** | XD01 (ECC) / BP (S/4) |
| 여신관리 | Credit Management | FD32 / UKM_BP |
| 리베이트 | **Rebate** | VB01~VB07 |
| 출하 Due List | **Delivery Due List** | VL10A |
| 빌링 Due List | **Billing Due List** | VF04 |
| Copy Control | Copy Control | VTFA/VTFL |
| 파트너 기능 | **Partner Function** | Sold-to, Ship-to, Bill-to, Payer |
| 수익 인식 | **Revenue Recognition** | IFRS 15 대응 |
| Incomplete Log | Incompletion Log | VOV0 |

---

## 🏭 PP — Production Planning

| 한국어 | English | 비고 |
|-------|---------|------|
| 자재 소요량 계획 | **MRP** (Material Requirements Planning) | MD01 |
| MRP Live (S/4) | MRP Live | MD01N HANA push-down |
| BOM (자재명세서) | **Bill of Materials** | CS01 |
| 작업순서 | **Routing** | CA01 |
| 작업장 | **Work Center** | CR01 |
| 생산오더 | **Production Order** | CO01 |
| 공정오더 | **Process Order** | COR1 (PP-PI) |
| 확정 | **Confirmation** | CO11N |
| 백플러시 | **Backflush** | MFBF (REM) |
| 칸반 | **KANBAN** | 신호 기반 |
| 능력 계획 | **Capacity Planning** | CM01~CM50 |
| 독립 요구 | **Planned Independent Requirement** (PIR) | MD61 |
| 종속 요구 | **Dependent Requirement** | BOM 폭발 |
| 낮은 수준 코드 | **Low Level Code** | OMIW |
| 리드타임 | Lead Time | |
| Recipe (공정산업) | **Master Recipe** | PP-PI |

---

## 👥 HCM — Human Capital Management

| 한국어 | English | 비고 |
|-------|---------|------|
| 인사정보 | Personnel Administration (PA) | |
| 조직관리 | **Organizational Management** (OM) | |
| 급여 | **Payroll** | PC00_M46_CALC (Korea) |
| 근태관리 | **Time Management** | PT60 |
| 인포타입 | **Infotype** | 0001~9999 |
| 포지션 | **Position** | PO13 |
| 조직단위 | **Organizational Unit** | O-object |
| 직무 | **Job** | C-object |
| 조치 | **Action** | PA40 (입사/퇴사/승진) |
| 근로소득세 | Income Tax (Korea) | 간이세액표 |
| 4대보험 | Four Social Insurances (Korea) | 국민연금/건강/고용/산재 |
| 연말정산 | Year-End Tax Adjustment | 한국 매년 1~2월 |
| 퇴직연금 | Retirement Pension | DB/DC/IRP |
| Wage Type | Wage Type | 급여 구성 요소 |
| Schema / PCR | Schema / Personnel Calculation Rule | PE01/PE02 |

---

## 💻 ABAP / Technology

| 한국어 | English | 비고 |
|-------|---------|------|
| ABAP 프로그램 | **ABAP Program** | Report/Module Pool |
| 함수모듈 | **Function Module** (FM) | SE37 |
| 클래스 | **Class** | SE24 |
| 메서드 | Method | |
| 오브젝트 | Object | Instance of class |
| Global 변수 | Global Variable | |
| Internal Table | Internal Table | itab |
| Work Area | Work Area | |
| BAPI | BAPI | Business API |
| 확장 | **Enhancement** / Extension | |
| BAdI | BAdI | SE19 |
| User Exit | User Exit | SMOD/CMOD (Classic) |
| CDS View | **Core Data Services** View | S/4 신형 |
| RAP | RESTful ABAP Programming | |
| OData | OData | V2 / V4 |
| Short Dump | **Short Dump** / Runtime Error | ST22 |
| SQL Trace | SQL Trace | ST05 |
| Runtime Analysis | Runtime Analysis | SAT / SE30 |
| ATC | ABAP Test Cockpit | |
| Clean Core | Clean Core | 표준 수정 금지 원칙 |
| Unicode | Unicode | UTF-16 기반 |

---

## 🖥 Basis / BC

| 한국어 | English | 비고 |
|-------|---------|------|
| Transport | Transport Request | STMS |
| 권한 | **Authorization** | PFCG |
| 역할 | **Role** | PFCG |
| 권한 객체 | Authorization Object | S_TCODE, F_BKPF_BUK 등 |
| 프로파일 | Profile | |
| 클라이언트 | **Client** | SCC4 |
| 시스템 복사 | System Copy | |
| 시스템 로그 | System Log | SM21 |
| 성능 튜닝 | Performance Tuning | |
| Kernel | Kernel | SAP 엔진 |
| 프로파일 파라미터 | Profile Parameter | RZ10/RZ11 |
| Work Process | Work Process (WP) | SM50/SM66 |
| Dialog Process | Dialog (DIA) | 대화 실행 |
| Background Job | Background Job | SM36/SM37 |
| Update | Update (UPD) | SM13 |
| Enqueue | Enqueue / Lock | SM12 |
| Spool | Spool / Print | |
| RFC Destination | RFC Destination | SM59 |
| IDoc | IDoc | WE02 |
| Solution Manager | Solution Manager (Solman) | |
| ChaRM | Change Request Management | Solman 기능 |
| 공인인증서 | **Public Key Certificate** | STRUST |
| 망분리 | **Closed Network** / Air-gapped | 한국 금융·공공 |
| KISA | Korea Internet & Security Agency | 한국인터넷진흥원 |

---

## 🔄 Integration

| 한국어 | English | 비고 |
|-------|---------|------|
| 통합 | Integration | |
| 미들웨어 | Middleware | PI/PO, CPI |
| 인터페이스 | Interface | |
| 비동기 | Asynchronous | qRFC, IDoc |
| 동기 | Synchronous | sRFC, OData |
| 큐 | Queue | SMQ1/SMQ2 |
| 오류 큐 | Error Queue | SM58 |
| iFlow | Integration Flow | CPI |
| Adapter | Adapter | HTTP/SFTP/SOAP 등 |
| Mapping | Mapping | 데이터 변환 |
| EDI | Electronic Data Interchange | |
| OAuth | OAuth | 인증 표준 |
| mTLS | Mutual TLS | 양방향 인증서 |
| API Management | API Management | Rate limit, Policy |
| Cloud Connector | SAP Cloud Connector (SCC) | BTP ↔ on-prem |

---

## 🌐 S/4HANA / BTP / Cloud

| 한국어 | English | 비고 |
|-------|---------|------|
| S/4HANA | SAP S/4HANA | 차세대 ERP |
| HANA | SAP HANA | In-memory DB |
| Fiori | SAP Fiori | UX 프레임워크 |
| BTP | SAP Business Technology Platform | 클라우드 플랫폼 |
| CAP | Cloud Application Programming Model | 개발 프레임워크 |
| Integration Suite | SAP Integration Suite | 통합 제품군 |
| Universal Journal | Universal Journal | ACDOCA 테이블 |
| Simplification | **Simplification** | S/4 구조 변경 |
| Brownfield | **Brownfield Conversion** | 기존 시스템 in-place 변환 |
| Greenfield | **Greenfield Implementation** | 신규 구축 |
| Selective | **Selective Data Transition** | 선택적 이관 |
| SUM | Software Update Manager | 마이그레이션 도구 |
| DMO | Database Migration Option | SUM 내장 |
| RISE with SAP | RISE with SAP | Private Cloud 서비스 |
| Readiness Check | SAP Readiness Check | 마이그레이션 사전 진단 |

---

## 📝 참여하기
새 용어 제안 또는 오역 수정은 [Issues](https://github.com/BoxLogoDev/sapstack/issues) 또는 PR로 환영합니다.
