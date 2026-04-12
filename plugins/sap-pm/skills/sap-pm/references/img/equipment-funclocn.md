# 장비(Equipment) 및 기능위치(Functional Location) IMG 구성 가이드

## SPRO 경로
```
SPRO → Plant Maintenance → Master Data
├── Equipment
│   ├── Define Equipment Categories (IM02)
│   ├── Equipment Master (IM01)
│   └── Equipment Hierarchies
└── Functional Location
    ├── Define Functional Location Categories (IL02)
    ├── Edit Mask — Functional Location (IL01)
    └── Functional Location Master (IL01)
```

## 필수 선행 구성
- [ ] Plant 정의 (일반 설정, SPRO > Basic Settings)
- [ ] Maintenance Planning Plant 할당 (일반 설정)
- [ ] Cost Centers 정의 (FI > 일반) — 장비 default cost center
- [ ] 자재 그룹 정의 (MM > Purchasing) — 예비부품 분류

## 구성 단계

### 1단계: 장비 카테고리 정의 (Equipment Categories)

**T-code: IM02**

- **카테고리명**: 예) ROTATING (회전 기계), STATIC (정적 설비), BUILDING (건물 설비)
- **필드**:
  - Category = `ROTATING`
  - Description = `Rotating Machinery` 또는 `회전기계`
  - Equipment Type = `001` (기본 설비)

**ECC vs S/4**:
- ECC: 카테고리별 제약사항 명확 (Restriction = 1/2/3)
- S/4: 더 유연한 분류 가능 (Cloud 기반 속성)

**한국 현장 권장**:
- MOTOR — 모터/펌프
- COMPRESSOR — 공기압축기
- PUMP — 펌프류
- VALVE — 밸브
- HEATING — 가열 설비

### 2단계: 장비 마스터 생성 (Equipment Master)

**T-code: IM01** (신규: IM01_CREATE, 변경: IM01)

| 탭 | 필드 | 입력 값 | 비고 |
|----|------|--------|------|
| Basic Data | Equipment Number | `MOT-PRESS-01` | 수동 또는 자동 채번 |
| | Description | `메인 프레스 모터` | 한국어 허용 |
| | Equipment Category | `ROTATING` | IM02에서 정의 |
| | Manufacturer | `SIEMENS` | 부품 구성 시 필요 |
| | Manufacturer Serial Number | `SN12345` | warranty 추적용 |
| Organization | Plant | `1000` | Maintenance Plant 필수 |
| | Maintenance Plant | `1000` | MM/PM 통합점 |
| | Cost Center | `6500` | 장비 유지비 계정화 |
| | Work Center | `PM01` | 보전 작업중심 (선택) |
| Accounting | Acquisition Value | `50000000` | KRW (자산 가치) |
| | Acquisition Date | `2023-01-01` | 감가상각 시작 |
| | Useful Life | `60` | 월 단위 (5년) |

**필드 설명**:
- **Equipment Number**: 고정 자산 번호와 일치 권장 (FI Asset Master)
- **Cost Center**: 장비 유지비 추적의 핵심 → PM 오더 자동 할당
- **Useful Life**: 예방보전 주기 계산에 영향

**ECC vs S/4**:
- ECC: 제조업체 정보(Manufacturer)는 선택
- S/4: 다중 제조업체 지원, 부품 추적 강화

### 3단계: 기능위치 카테고리 (Functional Location Categories)

**T-code: IL02**

| 카테고리 | 설명 | 예시 |
|---------|------|------|
| PLANT | 생산설비 | PLANT-01 (메인 생산 라인) |
| AREA | 작업영역 | AREA-01 (용접영역) |
| LINE | 생산라인 | LINE-PRESS (프레스 라인) |
| STATION | 작업국 | STN-01 (팔레타이징 국) |

**필드**:
- Category = `PLANT`
- Description = `Production Equipment`
- Edit Mask Pattern (다음 단계 IL01 참조)

### 4단계: 기능위치 Edit Mask 설정 (IL01 → Edit Mask)

**T-code: IL01** (범위: Edit Mask)

기능위치 번호 형식을 정의하여 자동 채번 및 계층 구조 지원

**예시 마스크** (한국 자동차 부품업체):

```
Format: PPPP-AAAA-LLLL-SS-EE
├── PPPP: Plant (Plant-01)
├── AAAA: Area (AREA-01, AREA-02, ...)
├── LLLL: Line (LINE-01, LINE-02, ...)
├── SS: Station/Zone (S01, S02, S03, ...)
└── EE: Equipment (E01, E02, ...)

예: Plant-01-AREA-01-LINE-01-S01-E01
```

**설정 단계**:
1. SPRO > PM > Master Data > Functional Location > Edit Mask
2. Segment Definition: 각 구간별 문자 수, 유형 정의
3. Separator: 하이픈(-)으로 구분
4. Automatic Number Range: 체크 (S01~S99, E01~E99 자동 채번)

### 5단계: 기능위치 마스터 생성 (IL01)

**T-code: IL01** (신규: IL01, 변경: IL02)

| 필드 | 입력 값 | 설명 |
|------|--------|------|
| Functional Location | `Plant-01-AREA-01-LINE-01-S01-E01` | Edit Mask 따름 |
| Description | `메인 프레스 기계` | 한국어 가능 |
| Category | `PLANT` | IL02에서 정의 |
| Plant | `1000` | 설비 소재 공장 |
| Superior FL | `Plant-01-AREA-01-LINE-01` | 상위 기능위치 (선택) |
| Asset Number | `100000001` | FI Asset와 link (권장) |
| Cost Center | `6500` | 유지비 계정화 |

**필드 설명**:
- **Superior FL**: 계층 구조 형성 (예: 공장 > 영역 > 라인 > 설비)
- **Asset Number**: 고정자산 장부와 동기화 → 감가상각 자동 계산
- **Cost Center**: 설비별 보전 원가 추적

### 6단계: 장비 ↔ 기능위치 할당 규칙

**T-code: IM01 또는 IL01**

| 할당 방식 | 사용 시나리오 | 예시 |
|---------|------------|------|
| **Equipment Only** | 이동식 장비, 다목적 기계 | 포크리프트, 용접기 |
| **Functional Location Only** | 건설, 인프라 (이동 불가) | 생산라인, 파이프 시스템 |
| **Both** (권장) | 고정 설비 + 부품 추적 필요 | 프레스기계 (기계=FL, 모터=Equipment) |

**권장 구조** (한국 제조):
```
기능위치 (FL): Plant-01-AREA-01-LINE-PRESS
├── 장비 1: MOT-PRESS-01 (모터)
├── 장비 2: PUMP-PRESS-02 (유압펌프)
└── 장비 3: SENSOR-PRESS-03 (센서)
```

## 구성 검증

**T-code: IL10** (Functional Location List) 또는 **IM05** (Equipment List)

- 예상 결과: 생성된 FL 또는 Equipment 목록 확인
- 계층 구조 검증: 상위-하위 관계 정상 연결
- Cost Center 할당 확인: PM 오더 자동 흡수 테스트

**T-code: IM10**
```
Execute → Equipment List
├── Plant = 1000
├── Equipment Category = ROTATING
└── Display: 모든 회전기계 목록 확인
```

## 주의사항

### 1. 장비 번호 표준화
❌ **하지 말 것**: 수동 입력, 중복 허용, 특수문자 사용
✅ **권장**: 자동 채번 번호범위(Number Range) 설정, 대문자 + 하이픈만 사용

**설정**:
```
SPRO > General Settings > Numbers, Texts, Dates > Number Ranges
→ Equipment Number Range (예: MOT-000001 ~ MOT-999999)
```

### 2. 기능위치 계층 깊이 제한
❌ **하지 말 것**: 7단계 이상 깊은 계층 (성능 저하)
✅ **권장**: 최대 5단계 (Plant > Area > Line > Station > Equipment)

### 3. 자산 마스터(Fixed Assets) 동기화
❌ **하지 말 것**: Equipment와 Asset을 분리 관리
✅ **권장**: Asset Number를 Equipment/FL과 연결 → FI와 PM 자동 동기화

**T-code: AS01** (Asset Master)에서 사용자 필드에 Equipment 번호 입력:
```
Asset: 100000001
├── User Field "Equipment" = MOT-PRESS-01
└── Acquisition Value: 50,000,000 KRW (자동 계산)
```

### 4. Maintenance Plant 오류
❌ **하지 말 것**: Plant ≠ Maintenance Planning Plant 설정 (혼란 야기)
✅ **권장**: 일반적으로 동일하게 설정 (1000 = 1000)

**분리 필요 시** (고급):
- Plant 1000 = 생산 담당 (MM, PP)
- Maintenance Planning Plant 1000 = 보전 담당 (PM, IA)
- T-code: OBU2 (Plant → Maintenance Plant 할당)

### 5. Cost Center 누락 시 오류
❌ **하지 말 것**: Cost Center 미할당 → PM 오더 생성 시 오류
✅ **권장**: Equipment 생성 시 반드시 Cost Center 할당

**오류 메시지**:
```
"No cost center assigned to Equipment XXX"
→ IM01 → Cost Center 필드 필수 입력
```

### 6. 한국 현장 특수성
- **사업자등록번호 연계**: Equipment Number에 부서 코드 prefix (예: `01-MOT-01`)
- **다국어**: Description은 한국어, Equipment Number는 영문 혼합 권장
- **납기관리**: Acquisition Date는 실제 설치 완료일 기준 (감가상각 정확성)

## 실습 시나리오 (한국 자동차 부품사)

### 상황
- Plant: 1000 (경주 공장)
- 생산 라인: 3개 (프레스, 용접, 팔레타이징)
- 각 라인당 핵심 장비: 5개

### 구성 순서

1. **자산 마스터 생성** (FI → AS01)
   - Asset 100000001: PRESS-LINE (구매가 500M KRW)
   - Asset 100000002: WELDING-ROBOT (구매가 300M KRW)

2. **기능위치 생성** (PM → IL01)
   ```
   Plant-01-AREA-PRESS
   ├── Plant-01-AREA-PRESS-LINE-01
   ├── Plant-01-AREA-PRESS-LINE-02
   └── Plant-01-AREA-PRESS-LINE-03
   ```

3. **장비 생성** (PM → IM01)
   ```
   MOT-PRESS-01, MOT-PRESS-02, MOT-PRESS-03 (모터)
   PUMP-PRESS-01, PUMP-PRESS-02, PUMP-PRESS-03 (유압펌프)
   ```

4. **할당 검증** (IL10, IM05)
   ```
   Plant-01-AREA-PRESS-LINE-01
   ├── MOT-PRESS-01 (Cost Center: 6500)
   ├── PUMP-PRESS-01 (Cost Center: 6500)
   └── Asset: 100000001
   ```

## 확장 기능

### 다중 레벨 BOM (Bill of Materials)
**T-code: CA01** (Create BOM)

프레스 기계 BOM:
```
Equipment: MOT-PRESS-01 (Header)
├── Component: MOTOR-3KW (수량: 1)
├── Component: BEARING-NSK (수량: 4)
├── Component: OIL-FILTER (수량: 1)
└── Component: HOSE-ASSEMBLY (수량: 2)

→ 부품 재고 연계, 자동 구매오더 생성 가능
```

### Measuring Points (측정점)
**T-code: IA41** (Create Measuring Point)

진동 모니터링:
```
Equipment: MOT-PRESS-01
├── Measuring Point: VIBRATION-X (수평 진동)
├── Measuring Point: VIBRATION-Y (수직 진동)
└── Measuring Point: TEMPERATURE (온도)

→ Counter-based 보전계획 기초
```

## S/4 HANA 신기능

### 1. 통합 장비 관리 (Asset Intelligence)
- IoT 센서 통합: 실시간 상태 모니터링
- 예측 보전: Machine Learning 기반 고장 예측
- T-app: SAP Fiori App "Asset Health" (추가 라이선스)

### 2. 모바일 지원
- T-app: SAP Fiori "Equipment List" (태블릿 기반 점검)
- 바코드 스캔: Equipment Number 빠른 입력

## 다음 단계
- 보전전략 정의 (IP11, IP12, IP13) — `preventive-maintenance.md` 참조
- 보전계획 및 일정 구성 (IA01, IA05)
- 보전 오더유형 정의 (PM01, PM02)
