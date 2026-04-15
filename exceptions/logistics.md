# Logistics Exception Classes (MM/SD / 물류)

SAP Materials Management(MM) 및 Sales & Distribution(SD)에서 발생하는 예외들. GR/GI, 수불, 판매 주문, 배송 등이 주요 영역입니다.

---

## CX_MD_MATERIAL_NOT_FOUND
**카테고리**: MM / 자재 관리  
**발생 버전**: ECC 5.0+ (S/4HANA)

**발생 조건**:
- GR(입고) 또는 GI(출고) 시 존재하지 않는 자재번호 입력
- 자재가 특정 공장(Plant)에 할당되지 않음
- 자재의 View(Basic, Sales, Purchasing, MRP 등) 미생성

**증상**:
```
Material [MATNR] does not exist
Message Type: E
Location: MIGO (자재이동), MMBE (자재 보유), MB1C(입고)
```

**진단**:
1. **MM03**: 자재 마스터 조회
   - Material Number 입력 → 존재 여부 확인
   - Plant tab: 해당 공장 할당 확인

2. **SE16N: MARA 테이블** (자재 기본정보)
   - MATNR (자재번호) 필터 → 기본 정보 확인
   - MAKTX (자재 설명) 한글 확인

3. **MMBE**: 자재 재고 조회
   - Plant + Storage Location + Material 조합

**흔은 원인**:
- [35%] 자재번호 오입력 (5자리 ↔ 10자리 혼동)
- [30%] 신규 자재 생성 후 해당 공장에 할당 미흡
- [20%] 구형 시스템에서 이관 후 자재 매핑 오류
- [15%] 자재 View 미생성 (Sales View 없음 → SD 거래 불가)

**해결**:
```
1. 자재번호 확인
   - 구매 주문(PO) 또는 BOM에서 올바른 자재번호 확인
   - 수정 가능: MM02 (자재 수정) 또는 자재번호 변경 요청

2. 신규 자재 생성 (필요시)
   - MM01: Create Material
   - Segment: Basic Data (필수)
   - Plants: 해당 공장 선택
   - Views: Sales, Purchasing, MRP 등 생성
   - Save

3. 자재 할당 확인
   - MM03: 해당 공장이 "Plants" 탭에 나열되어 있는지 확인
```

**예방**:
- 자재 마스터 list: 부서별 자재번호 reference card 배포
- FB01/MIGO 입력 전: autocomplete 또는 dropdown 활용
- 월 1회: MM03에서 "inactive" 자재 정리

**관련 Note**: 156066 (Material Master)

---

## CX_MD_STORAGE_LOCATION_NOT_FOUND
**카테고리**: MM / 창고 관리  
**발생 버전**: ECC 5.0+

**발생 조건**:
- MIGO에서 존재하지 않는 저장소(Storage Location) 입력
- Storage Location이 Material과의 조합에서 미할당
- Warehouse Management (WM) 구조 미연동

**증상**:
```
Storage location [LGORT] not defined for plant [WERKS]
Message Type: E
```

**진단**:
1. **MMBE**: Storage Location 목록 조회
   - Plant + Material → Available Storage Locations

2. **SPRO**: Customizing → Logistics → MM → Storage Location 확인
   - Path: Materials Management → Valuation → Storage Location

3. **LS01N**: Warehouse Storage Location 정의
   - Storage Location Code (LGORT) → 물리적 위치 매핑

**흔은 원인**:
- [40%] 신규 공장/창고 오픈 시 Storage Location 정의 누락
- [30%] WM(Warehouse Management) 미활성화 → 기본 저장소만 사용 가능
- [20%] Batch 관리 자재: 특정 저장소만 허용
- [10%] Hazmat/위험물: 특수 저장소 필수

**해결**:
```
1. LS01N: Storage Location 생성 (필요시)
   - Plant (WERKS)
   - Storage Location (LGORT)
   - Description
   - Capacity (선택)
   - Save

2. MIGO 재입력: 생성된 저장소 선택

3. WM 활성화 (필요시)
   - SPRO → WM Configuration
   - LQ01N: Warehouse Number + Location
```

**예방**:
- 공장 오픈 시 Customizing Checklist: Storage Location 포함
- MMBE: 자주 사용 Storage Location을 Favorite로 저장

**관련 Note**: 109903 (Storage Location)

---

## CX_MD_GR_BLOCK
**카테고리**: MM / 입고(GR) 차단  
**발생 버전**: ECC 5.0+

**발생 조건**:
- MIGO에서 GR(입고) 시 자재/품질 차단 플래그 활성화
- Quality Inspection(QI) 필수인데 미완료
- Goods Receipt Blocking (자재 마스터의 MIGO_PRCTYP)

**증상**:
```
Goods receipt blocked for material [MATNR]
Reason: Quality Inspection required
Message Type: E
```

**진단**:
1. **MM03**: 자재 마스터 → Quality Management 탭
   - "Inspection Type" 필드: Receiving Inspection 필수 여부

2. **QM01**: 품질 검사 정의
   - Inspection Plan (QPLAN) 확인
   - Incoming Goods: 입고검사 필수 자재 목록

3. **MIGO**: 현재 상태 확인
   - "Goods Receipt Blocking Reason" 메시지 읽기

**흔은 원인**:
- [45%] 신규 공급사 제품: 입고검사 요구사항
- [30%] 변경관리(ECN): 변경사항 품질 검증 필수
- [15%] Batch 관리 자재: 자동 검사 필수
- [10%] 구매 주문에서 "Inspection Required" 수동 체크

**해결**:
```
옵션 1) 입고검사 완료 후 GR 진행
  - QM03: Goods Receipt Inspection 확인
  - QM02: 검사 결과 입력 (합격/불합격)
  - MIGO: GR 진행 (자동 활성화됨)

옵션 2) 입고검사 면제 (예외 처리)
  - MM03: "Inspection Type" 변경 → Save (Transport)
  - SPRO: QM 설정에서 자동 bypass 규칙 추가
  - 권한: 구매/품질 담당자 승인 필수

옵션 3) 구매 주문 수정 (향후)
  - ME23N: PO 조회
  - "No Inspection" 필드 체크
  - 다음 입고부터 적용
```

**예방**:
- 공급사 평가: 입고검사 필요 여부 사전 결정
- PO 생성 시: "Inspection Required" 자동 체크 (품질정책)
- QM01: 정기 감사 → 불필요한 검사항목 정리

**관련 Note**: 161456 (QM Integration with MM)

---

## CX_MD_INVENTORY_VARIANCE
**카테고리**: MM / 재고 불일치  
**발생 버전**: ECC 5.0+

**발생 조건**:
- Physical Inventory(PI, MMBE) 결과가 System Inventory(MIEG/MIEZ)와 불일치
- GR/GI 오입력으로 누적된 오류
- 자재이동(Movement Type) 오류

**증상**:
```
Inventory variance detected: Physical [QTY] vs System [QTY]
Message Type: W (경고) → E (에러, 수동 처리)
```

**진단**:
1. **MMBE**: 현재 시스템 재고
   - Material + Plant + Storage Location
   - 재고 유형: Free Stock, Quality Stock, Return Stock, Blocked Stock

2. **MIEG**: 입고 전표 조회
   - Date Range + Material + Movement Type (101=GR, ...)
   - Quantity 누계

3. **MIEZ**: 출고 전표 조회
   - 동일 범위에서 출고 누계

4. **MI01**: Physical Inventory 문서
   - Difference Report: 실제 - 시스템

**흔은 원인**:
- [40%] GI(출고) 오입력: 수량 초과, 저장소 오기재
- [30%] GR(입고) 중복: RFC/수동 재입력
- [15%] Movement Type 오류: 101(GR) 대신 201(Adjustment) 사용
- [15%] Cycle Count 미실행: 연중 누적 오류

**해결**:
```
1. MMBE: 오류 원인 추적
   - Movements 탭: 최근 GR/GI 내역 확인
   - 오입력 된 항목 필터

2. MIGO: 수정 전표 입력
   - Movement Type 309 (재고 수정)
   - 차이액 입력 (예: +50 초과입고, -100 과다출고)

3. MMBE 재확인
   - 수정 후 Free Stock 일치 여부 확인

4. Physical Inventory
   - MI01N: 주기적 실사로 누적 오류 정기 정정
```

**예방**:
- GI 입력 전: MMBE에서 Available Stock 확인 (과다출고 방지)
- 월 1회: MIEG/MIEZ 감시 (이상 거래량 감지)
- 분기: Physical Inventory (Cycle Count) 정기 실시

**관련 Note**: 183522 (Physical Inventory)

---

## CX_MD_BATCH_EXPIRED
**카테고리**: MM / Batch 관리  
**발생 버전**: ECC 5.0+ (특히 Batch Management 모듈)

**발생 조건**:
- GI(출고) 시 유효기한 초과 Batch 선택
- MMBE에서 Batch 정보 조회 → Expiration Date < System Date
- Quality Inspection 완료 안 된 Batch

**증상**:
```
Batch [CHARG] expired as of [VFDAT]
Message Type: E
Location: MIGO, MB1A (Transfer Posting)
```

**진단**:
1. **MMBE**: Batch 조회 → Expiration Date (VFDAT) 확인

2. **MSC2N**: Batch Report
   - Material + Batch → Remaining Shelf Life 확인

3. **QM02**: Batch 품질 상태
   - Batch Status: 합격/불합격/검사대기

**흔은 원인**:
- [50%] FIFO 오류: 신규 Batch 먼저 출고 (오래된 Batch 미사용)
- [30%] Expiration Date 오입력: 납입 시 Batch 생성 오류
- [15%] Storage 오류: 부적절한 보관 환경 → 유효기한 단축
- [5%] System Date 설정 오류

**해결**:
```
1. MMBE: 유효한 Batch 확인
   - VFDAT > System Date인 Batch 선택

2. FIFO 정책 수립
   - Storage Location별 FIFO 규칙
   - 선입선출 Batch 자동 제안 (WM FIFO Strategy)

3. 기한 경과 Batch 처리
   - 의약품/식품: 폐기 (Scrap Movement Type 221)
   - 기술 제품: 재검사 (QM02)
```

**예방**:
- MIGO 입고 시: Batch + Expiration Date 함께 입력 (PO 기반 자동 제안)
- 월 1회: MSC2N에서 "Near Expiry" Batch 모니터링
- 분기: Expiration Date 감시 → 선제적 소비 계획

**관련 Note**: 103471 (Batch Management)

---

## CX_SD_SALES_ORDER_BLOCKED
**카테고리**: SD / 판매 주문 차단  
**발생 버전**: ECC 5.0+

**발생 조건**:
- VA01/VA02에서 sales order 생성/수정 시 신용한도(Credit Limit) 초과
- 고객 status가 "Blocked" 설정
- 판매 조직(Sales Org) 또는 유통 채널(Distribution Channel) 미정의

**증상**:
```
Sales order blocked for customer [KUNNR]
Reason: Credit limit exceeded
Message Type: E
```

**진단**:
1. **FD03**: 고객 신용 정보
   - Credit Limit (CREDI) vs Total Exposure (현재 채무)
   - Payment Terms (ZTERM)

2. **VD02**: 판매 고객 마스터
   - Customer Status: Active/Blocked 확인
   - Sales Organization + Distribution Channel 할당 확인

3. **FD32**: 고객 Open Items
   - 미수금 누계

**흔은 원인**:
- [50%] 신용한도 초과: 미결제 채무 누적
- [30%] 신용도 저하: 연체 발생 → Credit Limit 자동 감소
- [15%] 고객 상태 변경: "Blocked" 설정됨
- [5%] 채널 미할당: 해당 판매 채널 미설정

**해결**:
```
옵션 1) 신용한도 증액 (고객이 신용도 양호할 경우)
  - FD02: 고객 신용한도 수정
  - Credit Limit 증액
  - Authorization: 금융 또는 영업 관리자

옵션 2) 선금/선수금 수령 (신용도 낮을 경우)
  - F-28: 선금 입금 처리
  - Clearing: 선금으로 이미 청구한 금액 상계
  - 그 후 new SO 생성

옵션 3) 고객 상태 변경 (차단 해제)
  - VD02: Customer → General tab → Status = "Active"

옵션 4) 신용 정책 예외 (긴급 소수 주문)
  - VA01: "Delivery Block" override
  - 권한: 영업 이사 서명 필요
```

**예방**:
- 월 1회: FD32에서 고령 채권(30일+) 모니터링
- 분기: FD03 신용한도 review → 신용도 변화 반영
- 고객 온보딩: 신용한도 사전 설정 (VA01 before sale)

**관련 Note**: 165432 (Credit Management)

---

## CX_SD_DELIVERY_SHORTAGE
**카테고리**: SD / 배송 부족  
**발생 버전**: ECC 5.0+

**발생 조건**:
- VL01N(배송 생성) 시 Available Stock < Order Quantity
- GI(출고) 전 다른 SO에서 재고 선점
- Safety Stock 미흡

**증상**:
```
Partial delivery: Material [MATNR] insufficient quantity
Available: [QTY_AVAIL] vs Ordered: [QTY_ORDERED]
Message Type: W (경고) → 부분 배송 진행 가능
```

**진단**:
1. **MMBE**: 실시간 재고 확인
   - Free Stock (자유재고) vs Reserved (예약재고)

2. **VA03**: Sales Order 조회
   - Ordered Qty vs Delivered Qty → Open Qty 계산

3. **MRP_Run**: 수요/공급 계획
   - MD04: Stock/Requirements List
   - 미래 수요/공급 일정

**흔은 원인**:
- [45%] Demand Surge: 예상 외 주문 급증
- [30%] Supply Delay: 공급사 납기 지연
- [15%] Forecast 오류: 생산 계획 미흡
- [10%] Cycle Time: 자재 이동 기간 미반영

**해결**:
```
1. 부분 배송 (Partial Delivery)
  - VL01N: Order qty의 일부만 배송
  - Outstanding qty는 다음 배송에 이월

2. 배송 지연 (Hold Delivery)
  - VL01N: 배송 생성하지 않음
  - 재고 입고 후 배송

3. 대체품 제안
  - 구매/엔지니어링 검토: 동등 자재 적용 가능 여부
  - 고객과 협의

4. Rush Order (긴급 조달)
  - PO 긴급 발주 (ME21N) → 공급사에 특급 요청
  - Cost-up: 긴급료 추가 가능
```

**예방**:
- Forecast Accuracy: 분기별 수요예측 review
- Safety Stock: MD11에서 최소재고량 설정 → MRP 자동 주문 트리거
- Supplier Reliability: 공급사별 Lead Time 통계 → Buffer 설정

**관련 Note**: 172334 (Delivery Planning)

---

**Last Updated**: 2026-04-13  
**Total Exceptions**: 8  
**Maintenance Cycle**: Quarterly
