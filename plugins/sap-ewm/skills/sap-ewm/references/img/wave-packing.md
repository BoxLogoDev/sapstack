# Wave 및 Packing 구성 (Wave/Packing) IMG 구성 가이드

## SPRO 경로

```
SPRO → SCM Extended Warehouse Management → Outbound Processing → Wave Management
또는 T-code: /SCWM/WAVE (Wave Template), /SCWM/PACK (Packing Spec)
```

## 필수 선행 구성

- [ ] Outbound Process Type 설정 — T-code: /SCWM/MDEF
- [ ] Storage Location & Bin 정의 — T-code: /SCWM/LOCL
- [ ] Picking Strategy 설정 — T-code: /SCWM/STRAT

## 구성 단계

### 1단계: Wave Management (Wave 관리)

```
T-code: /SCWM/WAVE — Wave Template Configuration
```

#### Wave 개념 및 목적

```
Wave = 출고 작업의 배치 (Batch)

프로세스:
1. 여러 Sales Order 수집
2. Wave Template 기준으로 그룹화
3. Warehouse Task 자동 생성
4. Picking 작업 시작

목적:
- Picking 효율성 증대 (여러 주문 동시 처리)
- 배송 시간 단축
- 운송비 절감 (Truck Consolidation)

Wave 생성 규칙:
└─ Grouping Criteria:
   ├─ Time (시간별): 08:00~10:00, 10:00~12:00, 14:00~16:00
   ├─ Route (경로/배송지): 서울, 경기, 인천
   ├─ Carrier (배송사): CJ, 한진, 우체국
   ├─ Priority (우선순위): 당일배송 > 일반배송
   └─ Destination (지역): 수도권, 부산, 대구
```

#### Wave Template 설정

```
T-code: /SCWM/WAVE → Create Wave Template

Template Name: WAVE_KOREA_STANDARD
Description: Standard Daily Wave (Korea)

1. 기본 정보
   ├─ Warehouse: 01 (서울 본사 창고)
   ├─ Process Type: GIPO (Goods Issue + Picking)
   ├─ Wave Priority: Standard
   └─ Validity: 2024-01-01 ~ 9999-12-31

2. 그룹화 기준 (Grouping Criteria)
   ├─ Primary: Time Window
   │  └─ Release Window: 08:00 ~ 10:00 (오전반)
   │     Release Window: 10:00 ~ 14:00 (오후반)
   │     Release Window: 14:00 ~ 18:00 (저녁반)
   │
   ├─ Secondary: Delivery Area
   │  ├─ Seoul (서울): +10% 수금
   │  ├─ Gyeonggi (경기): 배송 2~3일
   │  ├─ Incheon (인천): 배송 2일
   │  └─ Others (기타): 배송 3~5일
   │
   └─ Tertiary: Carrier
      ├─ CJ (당일 가능): Priority 높음
      ├─ Hanjin (일반): Priority 중간
      └─ Korea Post (경제): Priority 낮음

3. Wave Release 규칙
   ├─ Automatic Release: Yes (자동 릴리즈)
   │  └─ Trigger: Time-based (시간 기반)
   │     Release Time: 10:00, 14:00, 18:00
   │
   ├─ Manual Release: Yes (수동 가능)
   │  └─ Min Orders to Release: 5건 이상
   │
   └─ Backorder Handling: Include (미납주문 포함)

4. Task 생성 설정
   ├─ Create Tasks: Automatic (자동)
   ├─ Task Sequence: By Line Item (라인별)
   ├─ Picking Route: Optimized (최적화된 동선)
   └─ Consolidation: Yes (배송 단위 통합)

5. 출력/라벨
   ├─ Print Picking List: Yes (피킹 리스트)
   ├─ Print Packing List: Yes (포장 리스트)
   ├─ Print Shipping Label: Yes (배송라벨)
   └─ Language: Korean (한국어)

6. 모니터링
   ├─ Wave Status Tracking: Yes
   ├─ Alert Threshold:
   │  ├─ Processing Time > 30분: Alert
   │  ├─ Error Rate > 1%: Alert
   │  └─ Backlog > 100 orders: Alert
   └─ Report Generation: Daily (일일 보고)
```

#### Wave Release 시나리오

```
예: 오전 Wave Release (08:00 ~ 10:00)

1. 주문 수집 (08:00 ~ 09:59)
   Order 1: [SKU_001 × 2, SKU_002 × 1] → Seoul, CJ
   Order 2: [SKU_001 × 3, SKU_003 × 2] → Seoul, CJ
   Order 3: [SKU_002 × 1, SKU_004 × 5] → Gyeonggi, Hanjin
   Order 4: [SKU_001 × 1, SKU_005 × 3] → Seoul, CJ
   Order 5: [SKU_003 × 2, SKU_005 × 1] → Incheon, CJ

2. Wave Grouping (10:00 자동 실행)
   Wave_2024_001_AM: Seoul + CJ Carrier
   ├─ Order 1, Order 2, Order 4 (총 3건)
   ├─ Total Items: 7 units (SKU_001 × 6, SKU_002 × 1)
   ├─ Estimated Pick Time: 15분
   └─ Expected Shipment: 10:30 (CJ 배송사 집하)

   Wave_2024_002_AM: Gyeonggi + Hanjin
   ├─ Order 3 (총 1건)
   ├─ Total Items: 6 units
   ├─ Estimated Pick Time: 10분
   └─ Expected Shipment: 11:00

   Wave_2024_003_AM: Incheon + CJ
   ├─ Order 5 (총 1건)
   ├─ Total Items: 3 units
   ├─ Estimated Pick Time: 8분
   └─ Expected Shipment: 10:45

3. Warehouse Task 생성
   Wave_2024_001_AM:
   ├─ Task 1: Pick SKU_001 (6 units from BIN_A_001)
   ├─ Task 2: Pick SKU_002 (1 unit from BIN_A_005)
   ├─ Task 3: Consolidate for Order 1, 2, 4
   └─ Task 4: Generate Shipping Labels

4. 피킹 실행 (10:00 이후)
   ├─ Picker 1: Task 1 (SKU_001 × 6) - 5분
   ├─ Picker 2: Task 2 (SKU_002 × 1) - 2분
   ├─ QA: Verify All Items - 3분
   └─ Packer: Pack & Label - 5분
   총 처리 시간: 15분 (예상 대비 정확)

5. 배송 (10:30 예정)
   ├─ CJ 택배사 수령: Wave_2024_001_AM (3 packages)
   ├─ 당일 배송 출발
   └─ Tracking: 시스템에서 자동 기록
```

### 2단계: Packing Specification (포장 규격)

```
T-code: /SCWM/PACK — Packing Specification Configuration
```

#### 포장 자재 정의 (Packing Material Types)

```
한국 전자상거래 표준:

1. Box Type: Cardboard Box (골판지 상자)
   ├─ Type Code: PKG_BOX_S (Small)
   │  ├─ Dimensions: 20 × 15 × 10 cm
   │  ├─ Volume: 3,000 cm³
   │  ├─ Max Weight: 2 kg
   │  ├─ Material: Kraft Cardboard (환경친화)
   │  ├─ Unit Cost: 500 KRW
   │  └─ Usage: 소형 전자제품, 소품
   │
   ├─ Type Code: PKG_BOX_M (Medium)
   │  ├─ Dimensions: 30 × 20 × 15 cm
   │  ├─ Volume: 9,000 cm³
   │  ├─ Max Weight: 5 kg
   │  ├─ Unit Cost: 1,200 KRW
   │  └─ Usage: 중형 제품, 일반 상품
   │
   └─ Type Code: PKG_BOX_L (Large)
      ├─ Dimensions: 40 × 30 × 25 cm
      ├─ Volume: 30,000 cm³
      ├─ Max Weight: 10 kg
      ├─ Unit Cost: 2,500 KRW
      └─ Usage: 대형 전자제품, 가구

2. Protective Materials (완충재)
   ├─ Bubble Wrap (에어캡)
      ├─ Type: Recycled Polyethylene
      ├─ Unit: Roll (롤)
      ├─ Size: 50cm × 100m
      ├─ Unit Cost: 3,000 KRW/roll
      └─ Usage: 충격 보호
   │
   └─ Paper Cushion (종이 쿠션)
      ├─ Type: Recycled Paper
      ├─ Unit: Sheet (장)
      ├─ Size: 50 × 50 cm
      ├─ Unit Cost: 100 KRW/sheet
      └─ Usage: 가벼운 완충

3. Sealing Materials (밀폐재)
   ├─ Packing Tape (포장 테이프)
      ├─ Type: Brown Paper Tape, 50mm × 100m
      ├─ Unit Cost: 800 KRW
      └─ Usage: 상자 밀폐
   │
   └─ Sticker/Seal (스티커)
      ├─ Type: Tamper-Evident
      ├─ Custom Print: Company Logo
      ├─ Unit Cost: 200 KRW/pcs
      └─ Usage: 보안 봉인

4. Labeling (라벨링)
   ├─ Shipping Label (배송라벨)
      ├─ Size: 100 × 150 mm
      ├─ Print: 수취인, 송장번호, QR Code
      ├─ Unit Cost: 150 KRW
      └─ Carrier Integration: CJ, Hanjin API
   │
   └─ Content Label (내용물 라벨)
      ├─ Size: 50 × 50 mm
      ├─ Print: 상품명, 수량, 주의사항
      ├─ Unit Cost: 80 KRW
      └─ Language: Korean (한글)
```

#### Handling Unit (HU) 관리

```
HU = 취급단위 (한 번에 옮기는 단위)

정의:
├─ HU_TYPE_BOX: 1 Box = 1 Shipment
│  └─ Contents: 1~10 items
│
├─ HU_TYPE_PALLET: 1 Pallet = 40 Boxes
│  └─ Contents: 100~500 items (대량 주문)
│
└─ HU_TYPE_HAND: Hand-Picked Items
   └─ Contents: 1~3 items (소량, 즉시배송)

HU 추적 (Tracking):
1. GR (입고) 시: HU 생성 및 바코드 부여
   └─ HU_00000001: [SKU_001 × 100]
2. WH Movement: HU 스캔으로 이동 추적
   └─ BIN_A_001 → BIN_A_005 (자동 기록)
3. Picking: HU에서 개별 상품 추출
   └─ HU_00000001: -1 item → HU_00000001 (99 units remain)
4. Packing: 배송용 새 HU 생성
   └─ HU_00000002 (Shipment): [Order_0001, Order_0002]
5. Shipping: 최종 HU 배송
   └─ Tracking Number: CJ_20240115_12345
```

#### Packing Process Specification

```
T-code: /SCWM/PACK → Packing Process

Process: PACK_KOREA_STD (한국 표준 포장)

Step 1: Picking Completion
├─ Verify All Items Picked (모든 상품 피킹 확인)
├─ QA Check:
│  ├─ Item Count Match (수량 일치)
│  ├─ Expiry Date Check (유통기한)
│  ├─ Visual Inspection (외관 검사)
│  └─ Damage Assessment (손상 여부)
└─ Status: Ready for Packing

Step 2: Packing Material Selection
├─ Automatic:
│  └─ System Algorithm:
│     ├─ Total Item Volume → Box Size 선택
│     ├─ Total Item Weight → Check Max Weight
│     ├─ Fragility Level → Protective Material 선택
│     └─ Recommended: PKG_BOX_M (예시)
│
└─ Manual Override: Allowed (작업자 선택)

Step 3: Packing Execution
├─ Prepare Box (상자 준비)
├─ Add Protective Material (완충재 추가)
├─ Place Items (상품 배치)
│  └─ Sequence: Heaviest First (무거운 것부터)
├─ Add Filler (빈 공간 채우기)
└─ Close & Seal (밀폐)

Step 4: Labeling & Verification
├─ Scan Items (배송 아이템 스캔)
├─ Generate Shipping Label (배송라벨 생성)
├─ Print & Attach (출력 및 부착)
├─ Content Label (내용물 라벨)
├─ Weight Verification (최종 무게 확인)
│  └─ Target: ± 100g (오차 범위)
└─ System Update: HU 생성 (배송용)

Step 5: Quality Control
├─ Random Sample Check: 5% (표본 검사)
├─ Verification:
│  ├─ Label Readability (라벨 가독성)
│  ├─ Box Integrity (상자 무결성)
│  ├─ Packaging Quality (포장 품질)
│  └─ Weight Accuracy (무게 정확도)
└─ Defect Recording: Auto-Report to QA

Step 6: Staging & Loading
├─ Move to Shipping Area (배송 영역 이동)
├─ Consolidate by Carrier (배송사별 정렬)
├─ Load to Truck (트럭에 탑재)
└─ Generate Manifest (송장 생성)
```

### 3단계: 택배사 연동 (Carrier Integration)

```
T-code: /SCWM/SHPD 또는 /SCWM/CARR (Carrier Customizing)
```

#### 한국 택배사 연동

```
주요 택배사 (Korea):

1. CJ Logistics (CJ 택배)
   ├─ Integration: API (REST)
   ├─ Interface: CJ_API_001
   ├─ Services:
   │  ├─ Same-day Delivery (당일배송)
   │  ├─ Next-day Delivery
   │  └─ Economy Delivery (경제 배송)
   ├─ Rate Card: Dynamic (날짜/무게 기반)
   │  └─ 기본료: 3,000 KRW (서울 내)
   │  └─ 추가료: 무게별 (1kg당 500 KRW)
   └─ Integration:
      ├─ T-code: /SCWM/CARR_CJ
      ├─ Fields:
      │  ├─ API Endpoint: https://api.cj.com/v2/shipment
      │  ├─ API Key: ******* (보안)
      │  ├─ Cutoff Time: 15:00 (15시 마감)
      │  └─ Service Mode: REALTIME
      └─ Tracking: Auto-update in EWM

2. Hanjin Logistics (한진택배)
   ├─ Integration: API + EDI
   ├─ Service: Standard (2~3일)
   └─ Rate Card: Fixed (지역별)

3. Korea Post (우체국)
   ├─ Integration: Batch Upload (일일 1회)
   ├─ Service: Economy (3~5일)
   └─ Rate Card: Weight-based
```

## 구성 검증

```
T-code: /SCWM/WAVE (Wave Monitoring)
- Wave 생성 현황
- 평균 Wave Processing Time
- Exception 주문 (예: 미재고)

T-code: /SCWM/PACK (Packing Quality Report)
- 포장 품질 점수
- 라벨 부착률
- 불량품 발견율

T-code: /SCWM/MONI (Outbound Monitor)
- 일일 출고량
- 배송사별 통계
- 배송 딜레이 분석

Pilot Test:
1. 100 주문 Wave Release
2. Picking & Packing 처리
3. 평균 처리시간 측정 (목표: 1~2시간)
4. 품질 검증 (손상/오류 < 0.5%)
5. 배송 추적 확인
```

## 주의사항

### 공통 실수

1. **Wave 과다 그룹화**
   - 예: 서울/경기/인천을 모두 1 Wave로 처리
   - 결과: 처리 시간 급증 (2~3시간), 당일배송 미달성
   - 해결: 배송지역별 분리 Wave 생성

2. **포장 자재 미관리**
   - 예: 재고 예측 없이 자재 보관
   - 결과: 자재 부족 또는 과잉 (창고 낭비)
   - 해결: 주문량 예측 기반 자재 조달 계획

3. **Carrier API 미통합**
   - 예: 수동으로 CJ 시스템에 주문 입력
   - 결과: 오류 증가, 처리 시간 배로 증가
   - 해결: Carrier API 자동화 (T-code: /SCWM/CARR)

4. **HU 추적 오류**
   - 예: HU 바코드 중복/누락 기록
   - 결과: 배송 추적 실패, 클레임 증가
   - 해결: RF 터미널 HU 스캔 필수화

### EWM 특정 주의사항 (S/4HANA)

- Wave 대량 릴리즈: 성능 테스트 필수 (1,000+ orders/day)
- Carrier Integration: HTTPS + 토큰 기반 인증 (보안)
- Real-time Tracking: EDI → API 마이그레이션 권장

---

**연관 문서**: [프로세스 유형](warehouse-process-type.md) | [RF 프레임워크](rf-framework.md)
