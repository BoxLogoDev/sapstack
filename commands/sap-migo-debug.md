---
description: MIGO(자재입고) 포스팅 에러를 체계적으로 진단. 재고/가용성/원가/계정결정/감사흔적 순서로 원인 탐색. 에러 메시지 번호와 이동유형 입력 권장.
argument-hint: [에러메시지번호] [이동유형(예:101)]
---

# MIGO 디버그 파이프라인

입력: `$ARGUMENTS`

## 🎯 목표
MIGO 포스팅 실패 시 체계적으로 원인을 추적합니다. 한국 현장에서 흔한 패턴을 우선 점검합니다.

## 진단 순서

### Step 1. 에러 메시지 파싱
- 사용자에게 전체 에러 메시지 (클래스.번호 형태) 요청
- 예: `M7 003` — "Document XXX cannot be posted in period YYY"
- 클래스별 해석 가이드:
  - **M7**: MM 포스팅 일반
  - **F5**: FI 계정 결정 / 기간
  - **ME**: PO/계약 관련
  - **MEPO**: PO 생성 관련

### Step 2. 재고/가용성
1. **MMBE**: 전체 재고 상황
2. **MB5B**: 전기간 재고 이력 (음수 재고 탐지)
3. **MB52**: 창고별 재고
4. 체크:
   - Negative stock 허용 여부 (OMJ1)
   - Batch 관리 자재의 Batch 선택
   - Serial Number 자재의 일련번호

### Step 3. 이동 유형 설정
- **OMJJ**: 이동 유형 설정 확인
- **OMWB**: 계정 결정
- 체크:
  - 이동 유형 101(GR) vs 103(GR Blocked Stock) vs 105(GR Release) 구분
  - Special Stock indicator (E, K, Q 등)
  - Reversal (102, 122) 시 원본 문서 추적

### Step 4. 계정 결정 (OBYC)
- **OBYC**: Transaction Key 별 G/L 계정
- 흔한 원인:
  - GBB-VBR 계정 누락
  - WRX (GR/IR Clearing) 계정 누락
  - BSX (Stock) 계정 누락
- 체크: **MM 계정 그룹이 FI 회사코드와 매핑되었는지**

### Step 5. 기간 제어
- **OMSY**: MM 기간 (현 기간 + 전기간 2개월만 허용)
- **OB52**: FI 기간 vs MM 기간 일치 여부
- 한국 현장 이슈: **MM 기간이 닫혔는데 FI만 열려 있는 경우** 흔함

### Step 6. 원가 / 가격
- **MBEW**: 자재 가격 레코드
- **CKMLCP** (S/4HANA): Actual Costing 실행 여부
- 체크:
  - Moving Average Price (V) vs Standard Price (S)
  - 가격 절대값이 0인 자재 — 포스팅 차단
  - CO-PC 활성화 시 Costing Variant

### Step 7. 한국 특화
- **CVI KR 관련**:
  - 부가세 자동 분리 설정 (`J_1BNFE`)
  - 전자세금계산서 발행 대상 플래그
- 부가세 코드 매핑 (MWSKZ) 유효성

### Step 8. 감사 흔적
- **SE38 → RM07MDOC**: 자재 문서 조회
- **MB51**: 자재 문서 리스트
- **CDHDR/CDPOS**: 변경 로그
- 한국 K-SOX — 이동 유형별 Dual Authorization 확인

## 📤 출력 형식

```
## 🔍 진단 결과
- 에러: (클래스.번호)
- 확률 높은 원인: (Top 3)

## 🛠 수정 단계
1. ...
2. ...

## 🛡 재발 방지
- ...

## 📖 관련 SAP Note
- (알려진 경우)
```

## 참조
- `plugins/sap-mm/skills/sap-mm/SKILL.md`
- `plugins/sap-fi/skills/sap-fi/SKILL.md` (계정 결정 이슈)
- `agents/sap-fi-consultant.md` (FI 측 깊은 분석 필요 시)
