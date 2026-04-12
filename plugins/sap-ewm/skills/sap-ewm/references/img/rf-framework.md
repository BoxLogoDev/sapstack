# RF 프레임워크 (Radio Frequency Framework) IMG 구성 가이드

## SPRO 경로

```
SPRO → SCM Extended Warehouse Management → RF Framework
또는 T-code: /SCWM/RFUI (RF Interface), /SCWM/TRANS (Transaction Config)
```

## 필수 선행 구성

- [ ] Warehouse Master Data (저장위치, Bin) 정의 — T-code: /SCWM/LOCL
- [ ] Warehouse Process Type 설정 — T-code: /SCWM/MDEF
- [ ] RF Terminal Hardware (바코드 스캐너, 터미널) 준비

## 구성 단계

### 1단계: RF 화면 설정 (RF Screen Configuration)

```
T-code: /SCWM/RFUI — RF User Interface Configuration
```

#### RF Menu 구조

```
RF Terminal 홈 화면:

┌─────────────────────────────────┐
│    EWM RF Main Menu             │
│  (작업자 로그인)                 │
└──────────────────┬──────────────┘
                   │
        ┌──────────┼──────────┐
        │          │          │
        ▼          ▼          ▼
    [Inbound]  [Outbound]  [Internal]
        │          │          │
    ┌───┴───┐  ┌───┴───┐  ┌───┴───┐
    │       │  │       │  │       │
    ▼       ▼  ▼       ▼  ▼       ▼
  [GR]  [QC]  [Pick] [Pack] [Replen] [Stock]
    │     │     │      │      │       │
  확인   검사  피킹   포장   보충    점검

예시: Inbound → GR (Goods Receipt) 선택
├─ Screen 1: PO Number Scan
│  └─ "123456" (PO 번호 입력)
├─ Screen 2: Material Verification
│  └─ "SKU_12345" (상품 확인)
├─ Screen 3: Quantity Input
│  └─ "100" (수량 입력)
├─ Screen 4: Storage Location Confirm
│  └─ "01-A-01" (위치 확인)
└─ Screen 5: Completion
   └─ "GR Completed" (완료 메시지)
```

#### RF Screen 커스터마이징

```
T-code: /SCWM/RFUI → Create RF Screen

예: 입하 검증 화면 (GR Verification)

1. Screen Name: SCWM_GR_001
2. Description: Goods Receipt - Verification
3. Screen Type: Input (입력 화면)
4. Fields:
   ├─ PO_NUMBER (T-code: PO 번호)
   ├─ MATERIAL (Material Code)
   ├─ QUANTITY (수량)
   ├─ STORAGE_LOCATION (저장위치)
   └─ REMARKS (특이사항)

5. Validation Rules:
   ├─ PO_NUMBER: Required, Numeric, Length 10
   ├─ QUANTITY: Required, Numeric, > 0
   └─ STORAGE_LOCATION: Required, Format XXX-X-XX

6. Error Handling:
   ├─ PO Not Found → Show "PO Not in System"
   ├─ Quantity Exceed → Confirm Qty (Over-receipt)
   └─ Location Invalid → Suggest Valid Locations

7. Success Message: "GR Confirmed, Task #123 Created"

한국 특화:
- 한글 라벨 지원 (화면 상단: "상품 입하")
- 수량 입력 단위 (개/박스/팔레트)
- 바코드 형식 (EAN-13, UPC-A 병행)
```

### 2단계: RF Menu 구성 (RF Menu Hierarchy)

```
T-code: /SCWM/TRANS or /SCWM/RFUI → Menu Configuration
```

#### 메뉴 계층

```
Process Type별 RF Menu 정의:

1. Inbound (입하) Menu
   ├─ GRIN: Goods Receipt Input
   │  ├─ Step 1: PO Scan
   │  ├─ Step 2: Qty Verification
   │  └─ Step 3: Location Assignment (자동)
   │
   ├─ PUAW: Putaway
   │  ├─ Step 1: Putaway Task Retrieve
   │  ├─ Step 2: Confirm Location
   │  └─ Step 3: Place Goods
   │
   └─ QAIN: QA Input (선택사항)
      ├─ Step 1: Sample Selection
      ├─ Step 2: Test Parameters
      └─ Step 3: Pass/Fail Decision

2. Outbound (출고) Menu
   ├─ PICK: Picking
   │  ├─ Step 1: Retrieve Picking Task
   │  ├─ Step 2: Scan Source Bin
   │  ├─ Step 3: Confirm Qty
   │  └─ Step 4: Scan Destination
   │
   ├─ PACK: Packing
   │  ├─ Step 1: Load Picking Docs
   │  ├─ Step 2: Scan Picked Items
   │  └─ Step 3: Generate Shipping Label
   │
   └─ SHPD: Shipping
      ├─ Step 1: Truck Dock Assignment
      └─ Step 2: Load Status Update

3. Internal Movement (내부) Menu
   ├─ RPLN: Replenishment
   │  ├─ Step 1: Retrieve Replenish Task
   │  ├─ Step 2: Scan Source Qty
   │  └─ Step 3: Place in Target Location
   │
   └─ ISTR: Inventory Count
      ├─ Step 1: Select Bin
      ├─ Step 2: Physical Count
      └─ Step 3: Variance Report
```

#### Menu 매핑 예

```
T-code: /SCWM/TRANS → Transaction Configuration

Transaction: GRIN (Goods Receipt Input)
├─ RF Menu Code: GRIN
├─ Process Type: GRPO (또는 GRPI)
├─ Activity Area: 01_INBOUND
├─ Default Screen: SCWM_GR_001
├─ Screens Sequence:
│  1. SCWM_GR_001 (PO 스캔)
│  2. SCWM_GR_002 (상품 확인)
│  3. SCWM_GR_003 (수량 입력)
│  4. SCWM_GR_004 (위치 선택)
│  └─ Confirmation
├─ Error Handling: Skip or Repeat
└─ Audit Trail: Log All Transactions
```

### 3단계: 검증 프로필 (Verification Profile)

```
T-code: /SCWM/RFUI → Verification Profile Maintenance
또는 T-code: /SCWM/VERF
```

#### 검증 수준 정의

```
Profile 1: NONE (바코드 검증 없음)
- 사용 시나리오: 신뢰할 수 있는 공급업체, 빠른 입하
- 프로세스: 바코드 스캔 → 바로 저장 (검증 생략)
- 오류율: 1~2% (리스크 높음)

Profile 2: PARTIAL (선택적 검증)
- 사용 시나리오: 표준 공급업체, 중간 신뢰도
- 프로세스:
  1. 바코드 스캔
  2. 시스템 정보와 비교 (PO 데이터)
  3. 불일치 시 경고, 사용자 재확인
- 오류율: 0.5~1%

Profile 3: FULL (완전 검증)
- 사용 시나리오: 새 공급업체, 의약품, 고가 제품
- 프로세스:
  1. 바코드 스캔 (상품 코드)
  2. PO와 상품 정보 비교
  3. 수량 확인 (PO vs 실제)
  4. 보안 검사 (해쉬 코드)
  5. 시스템 데이터 재검증 (DB 조회)
  6. 사용자 확인 (Y/N)
- 오류율: < 0.1%

T-code: /SCWM/VERF → Verification Profile 설정

Profile: VP_PARTIAL
├─ Verification Level: 2 (PARTIAL)
├─ Check Material Code: Yes
├─ Check UOM: Yes
├─ Check Qty Deviation Tolerance: ±5% (허용 범위)
├─ Check Lot/Serial: Conditional (조건부)
├─ Message Type: Warning (경고)
└─ Override Required: No (스킵 가능)

Profile: VP_FULL
├─ Verification Level: 3 (FULL)
├─ Check Material Code: Yes (필수)
├─ Check UOM: Yes (필수)
├─ Check Qty Deviation Tolerance: ±2% (엄격)
├─ Check Lot/Serial: Yes (필수)
├─ Check Expiry Date: Yes (유통기한)
├─ Message Type: Error (오류, 진행 불가)
└─ Override Required: Yes (관리자 승인 필요)
```

#### 검증 프로필 적용 예

```
예: 바코드 스캔 불일치

화면 1: PO Number Scan
└─ 입력: "123456" (정상)

화면 2: Material Verification
└─ 스캔 바코드: "SKU_99999" (PO의 SKU_12345와 다름!)

Profile: PARTIAL (허용 범위 큼)
├─ 시스템: "Material Mismatch! Scanned SKU_99999, Expected SKU_12345"
├─ Action: "Continue or Cancel?" (선택)
└─ 작업자: Continue 클릭 → 진행 (리스크 있음)

Profile: FULL (엄격함)
├─ 시스템: "ERROR: Material Mismatch! Cannot proceed"
├─ Action: Cancel Only (진행 불가)
├─ Escalation: 창고 감시자에게 알림
└─ 결과: PO 재확인 또는 입고 거부

한국 적용:
- 의약품: Profile FULL (완전 검증)
- 식품: Profile FULL (유통기한 + Lot 번호)
- 전자제품: Profile PARTIAL (빠른 처리)
- 일반 부품: Profile NONE (신뢰도 높은 공급업체)
```

### 4단계: RF 트랜잭션 커스터마이징 (RF Transaction Customization)

```
T-code: /SCWM/TRANS → RF Transaction Detail
```

#### 비표준 RF 거래 추가

```
예: 한국 특화 검사 프로세스 추가

T-code: /SCWM/TRANS → Create New Transaction

Transaction: QAIN_KR (QA Input - Korea Version)
├─ Description: Quality Inspection (한국식)
├─ Process Type: GRPI
├─ Activity Area: 01_INBOUND (Quality Check)
├─ Screens:
│  1. SCWM_QA_001: PO/Material Scan
│  2. SCWM_QA_002: Sample Selection (샘플 수량 입력)
│  3. SCWM_QA_003: Test Performed (검사 항목 선택)
│  └─ Items:
│     ├─ Visual Inspection (외관 검사)
│     ├─ Weight Verification (중량 검사)
│     ├─ Temperature Check (온도 측정, 의약품용)
│     ├─ Color/Odor (색/냄새, 식품용)
│     └─ Documentation Check (서류 검증, 수입품)
│  4. SCWM_QA_004: Result Input (합격/불합격)
│  5. SCWM_QA_005: Approval (검사자 승인)
│
├─ Conditional Logic:
│  If Result = PASS → Allow Putaway
│  If Result = FAIL → Hold Stock (검사 재고로 분류)
│  If Result = PARTIAL → Flag Review (부분 불합격 시 재검토)
│
├─ Audit Trail: Complete Log
└─ Integration: Automatic Update to Lot Status
```

### 5단계: 프레젠테이션 프로필 (Presentation Profile - RF 화면 레이아웃)

```
T-code: /SCWM/RFUI → Presentation Profile (또는 /SCWM/PRES)
```

#### 화면 레이아웃 설정

```
Profile: DEFAULT (기본 프레젠테이션)
├─ Resolution: 320x240 (레거시 터미널)
├─ Font Size: 16px (가독성 높음)
├─ Input Method: Keyboard + Barcode Scanner
├─ Navigation: Numeric Keys (1~9)
└─ Message: Text + Beep Sound

Profile: MODERN (현대식)
├─ Resolution: 800x600 (안드로이드 기반)
├─ Font Size: 12px (상세 정보 표시)
├─ Input Method: Touch Screen + Barcode
├─ Navigation: Soft Keys (터치 버튼)
├─ Message: Text + Visual Icon + Sound
└─ Graphics: Product Images, Bin Maps

한국 한글 지원:
Profile: KOREAN
├─ Font: Noto Sans CJK (한글 지원)
├─ Language: Korean (한국어)
├─ Format: Date (YYYY-MM-DD), Time (24H)
├─ Currency: KRW (원화)
├─ Encoding: UTF-8 (멀티바이트)
└─ Screen Example:
   ┌──────────────────┐
   │ 상품 입하        │  ← 한글 라벨
   ├──────────────────┤
   │ PO번호: [입력]   │
   │ 상품코드: [입력] │
   │ 수량: [입력]     │
   │ 위치: [자동]     │
   ├──────────────────┤
   │ [확인] [취소]    │
   └──────────────────┘
```

## 구성 검증

```
T-code: /SCWM/MONI (RF Monitoring)
- RF 터미널 접속 상태
- 활성 Transaction 모니터링
- 오류 로그 확인

T-code: /SCWM/TRANS (Transaction Log)
- 모든 RF 거래 기록
- 시간당 평균 거래 수
- 오류율 분석

Pilot Test:
1. RF 터미널 테스트 (5~10대)
2. 실제 입하/출고 거래 처리
3. 속도 측정 (평균 거래 시간)
   ├─ GR: 3~5분 (목표)
   ├─ Picking: 1~2분 per item (목표)
   └─ Putaway: 2~3분 (목표)
4. 오류율 측정 (목표 < 0.5%)
5. 작업자 만족도 조사
```

## 주의사항

### 공통 실수

1. **검증 프로필 설정 오류**
   - 예: FULL Profile 적용했는데 작업 속도 급격히 하락
   - 결과: 처리량 40% 감소, 작업자 불만
   - 해결: 상품 유형별 Profile 차등 적용

2. **메뉴 구조 복잡성**
   - 예: 메뉴 깊이 5단계 이상 (선택지 너무 많음)
   - 결과: 작업자 혼동, 오류 증가
   - 해결: 메뉴 2~3단계 유지, 자주 쓰는 것 상단 배치

3. **한글 입력 미지원**
   - 예: RF 터미널이 기본 프로필 (한글 X)
   - 결과: 특수 문자/한글 입력 불가
   - 해결: KOREAN 프레젠테이션 프로필로 업그레이드

4. **바코드 형식 불일치**
   - 예: SAP는 EAN-13 기대, 공급업체는 UPC-A 제공
   - 결과: 스캔해도 인식 안 됨
   - 확인: Barcode Profile에서 지원 형식 명시

### EWM 특정 주의사항 (S/4HANA)

- RF Terminal Integration: HTTPS 기반 (보안 강화)
- Mobile App: Fiori RF 앱 권장 (하드웨어 독립적)
- Real-time Sync: RF 터미널 ↔ Backend 즉시 동기화

---

**연관 문서**: [프로세스 유형](warehouse-process-type.md) | [Wave/Packing](wave-packing.md)
