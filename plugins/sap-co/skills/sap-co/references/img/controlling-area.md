# 관리회계영역(Controlling Area) IMG 구성 가이드

## SPRO 경로
```
SPRO → Controlling → Organization and Basic Data
    → Controlling Area → Define Controlling Areas
```

## 필수 선행 구성

- [ ] OX02: 회사코드 정의 (복수 회사 포함)
- [ ] OB29: 회계연도 변형 정의
- [ ] OB07: 통화 정의 (기본)

## 관리회계영역의 개념

**Controlling Area (관리회계영역)**:
- CO의 최상위 조직 단위
- 여러 회사코드를 포함 (통합 관리)
- 독립적 원가 정책 및 마스터 데이터 보유
- 일대일 또는 일대다 관계 가능

### 일반적 구조 (한국식):

```
Controlling Area "KOR" (한국 사업)
  ├─ Company Code "1000" (서울 본사)
  ├─ Company Code "1100" (부산 공장)
  └─ Company Code "1200" (대구 물류센터)

Controlling Area "CHN" (중국 사업)
  ├─ Company Code "2000" (상하이 공장)
  └─ Company Code "2100" (선전 지사)
```

---

## 관리회계영역 구성 (T-code: OKKP)

**SPRO 경로**: `SPRO → Controlling → Organization and Basic Data → Controlling Area → Maintain Controlling Areas`

### 구성 단계 1: 관리회계영역 생성

**T-code: OKKP 실행**

```
화면:
  영역 코드 (Area): KOR
  설명 (Description): Korea Operations
  통화 (Currency): KRW
  회계연도 변형 (Fiscal Year Variant): K1 (1월~12월)
```

**필드 설명**:

| 필드 | 설명 | 값 | 비고 |
|------|------|-----|------|
| Controlling Area | 영역 코드 | KOR, CHN 등 | 고유, 4자리 |
| Description | 영역 설명 | Korea Operations | 관리 편의성 |
| Currency | 기본 통화 | KRW | FI와 일관성 |
| Fiscal Year Variant | 회계연도 변형 | K1 | OB29와 동일 |
| Char. of Accounts | 계정과목표 | IFRS | 선택 (S/4) |
| Profit Center | 이익센터 이용 | X | 체크 여부 |

**구성 저장** (Ctrl+S)

### 구성 단계 2: 회사코드 할당 (T-code: OX06)

**SPRO 경로**: `SPRO → Controlling → Organization and Basic Data → Assign Company Codes to Controlling Area`

**T-code: OX06 실행**

```
화면:
  관리회계영역 (Controlling Area): KOR
  회사코드 (Company Code): 1000
```

**표 형식**:

| 관리회계영역 | 회사코드 | 회사명 | 통화 | 회계연도변형 |
|---------|---------|--------|------|---------|
| KOR | 1000 | 서울 본사 | KRW | K1 |
| KOR | 1100 | 부산 공장 | KRW | K1 |
| KOR | 1200 | 대구 물류 | KRW | K1 |

**주의**:
```
- 하나의 회사코드는 정확히 하나의 관리회계영역에만 할당 가능
- 다중 할당 불가
- 변경 후 이전 거래에 영향 없음 (신규부터 적용)
```

---

## 원가요소 유형 정의

### 원가요소의 두 가지 타입

| 타입 | 설명 | 예시 | GL 계정 | 특징 |
|------|------|------|--------|------|
| Primary (1차) | 외부 구매 | 자재비, 용역비 | 501000~599999 | 공급업체 송장 |
| Secondary (2차) | 내부 배분 | 간접비, 배분비 | 또는 별도 | 내부 이전 |

### ECC에서 원가요소 생성 (T-code: KA06)

**SPRO 경로**: `SPRO → Controlling → Cost Planning → Cost Elements → Create Cost Elements`

```
T-code: KA06 실행

Cost Element: 510000
Description: 직재료비 (Raw Materials)
Element Category: 11 (1차 원가요소)
G/L Account: 501000 (자재 비용)
Controlling Area: KOR
```

**필드 설명** (ECC):

| 필드 | 설명 | 값 | 용도 |
|------|------|-----|------|
| Cost Element | 원가요소 코드 | 510000 | GL 계정과 동기화 |
| Description | 설명 | 직재료비 | 관리 |
| Element Category | 원가요소 유형 | 11 (1차) | 계산 방식 |
| G/L Account | GL 계정 | 501000 | FI 연계 |
| Valuation Class | 평가클래스 | 3100 | 자재 추적 |

### S/4HANA에서 원가요소 (T-code: FS00)

**SPRO 경로**: `SPRO → General Ledger Accounting → Master Records → G/L Accounts → Maintain → Create (FS00)`

```
T-code: FS00 실행

G/L Account: 501000
Account description: 직재료비
Type: Expense (P&L 계정)
Cost Element: 510000 (자동 생성)
```

**S/4HANA 특징**:
- 원가요소 = GL 계정 (일대일 매핑)
- 별도 KA06 불필요
- ACDOCA에 자동 기록

---

## 원가요소 계층 구조

### 한국식 원가요소 분류

```
1차 원가요소 (Primary):
  ├─ 501000~509999: 자재비
  │   ├─ 501000: 직재료비 (직접)
  │   ├─ 502000: 구매 간접비 (간접)
  │   └─ 509000: 재고 평가 조정
  │
  ├─ 510000~519999: 인건비
  │   ├─ 510000: 정직 임금
  │   ├─ 511000: 비정규직 임금
  │   ├─ 512000: 복리후생비
  │   └─ 519000: 급여 조정
  │
  ├─ 520000~529999: 제조 경비
  │   ├─ 520000: 소모품
  │   ├─ 521000: 유지비
  │   ├─ 522000: 감가상각비
  │   └─ 529000: 기타 경비
  │
  └─ 530000~599999: 판매/관리비
      ├─ 530000: 판매비
      ├─ 540000: 관리비
      └─ 590000: 기타

2차 원가요소 (Secondary):
  ├─ 621000~629999: 배분비
  ├─ 631000~639999: 할당비
  └─ 641000~649999: 대체비
```

### 각 원가요소의 성질

| 원가요소 | 행동 | ECC 설정 | S/4 설정 |
|---------|------|---------|---------|
| 501000 (직재료비) | 변동 | Category 11 | Cost Type: V (Variable) |
| 510000 (임금) | 혼합 | Category 11 | Cost Type: M (Mixed) |
| 522000 (감가상각) | 고정 | Category 11 | Cost Type: F (Fixed) |
| 621000 (배분비) | 배분 | Category 21 | Cost Type: S (Secondary) |

---

## 원가센터와의 연계

### 원가센터 정의 (T-code: KS01)

**SPRO 경로**: `SPRO → Controlling → Cost Center Accounting → Master Data → Cost Centers → Create`

```
T-code: KS01 실행

Cost Center: 1001
Name: 생산부 (제1공장)
Controlling Area: KOR
Company Code: 1100
Responsible Person: 부장 김과장
```

**필드 설명**:

| 필드 | 설명 | 값 | 비고 |
|------|------|-----|------|
| Cost Center | 원가센터 코드 | 1001 | 고유 |
| Name | 이름 | 생산부 | 조직 구조 반영 |
| Controlling Area | 관리회계영역 | KOR | 필수 |
| Company Code | 회사코드 | 1100 | OKKP에서 할당된 것 |
| Cost Center Type | 유형 | S (Standard) | 또는 H (Hierarchy) |
| Department | 부서 | DEP-001 | SAP HR 연계 (선택) |

### 원가센터 계층 구조 (Hierarchy)

```
생산부 (1001)
  ├─ 1차 공정 (1010)
  │   ├─ A 라인 (1011)
  │   └─ B 라인 (1012)
  │
  └─ 2차 공정 (1020)
      ├─ 조립 (1021)
      └─ 검사 (1022)

각 센터는:
  - 독립적 기표 (거래 기록)
  - 독립적 배분 (상위로 전가)
  - 독립적 예산 (성과 측정)
```

---

## 원가요소와 원가센터의 교집합

### 원가센터 × 원가요소 매트릭스

```
        | 직재료비 | 임금 | 경비 | 배분비 |
        | 501000 | 510000 | 520000 | 621000 |
--------|--------|--------|--------|--------|
생산부  | O      | O      | O      | O      |
(1001)  |        |        |        |        |
--------|--------|--------|--------|--------|
관리부  | X      | O      | O      | O      |
(2001)  |        |        |        |        |
--------|--------|--------|--------|--------|
판매부  | X      | O      | O      | O      |
(3001)  |        |        |        |        |
--------|--------|--------|--------|--------|

O = 거래 발생 가능
X = 거래 발생 불가능 (정책)
```

### 거래 기록 예시

```
예시 1: 생산부의 임금 지급
Debit  510000 (임금) — Cost Element
Debit  1001 (생산부) — Cost Center
Credit 200000 (채무)

예시 2: 간접비 배분
Debit  2001 (관리부) — Cost Center
Debit  621000 (배분비) — Cost Element
Credit 1001 (생산부) — 상대 원가센터
```

---

## ECC vs S/4HANA 비교

| 항목 | ECC | S/4 |
|------|-----|-----|
| **원가요소 정의** | KA06 (별도) | FS00 (GL) |
| **원가센터** | KS01 (동일) | KS01 (동일) |
| **관리회계영역** | OKKP (동일) | OKKP (동일) |
| **통화** | 단일 | 다중 (글로벌 설정) |
| **회계연도변형** | OB29 공유 | OB29 공유 |
| **실시간 조회** | 배치 기반 | ACDOCA 실시간 |

---

## 월별 관리회계영역 운영

### 월초
```
1. 원가센터별 예산 공고
2. 배분 주기 확인 (KSU1, KSV1)
3. 원가요소 마스터 업데이트 (필요시)
```

### 월중
```
1. 거래 자동 기록 (FI → CO 연계)
   - GL 전기 → 자동으로 원가센터/원가요소 할당
2. 원가요소 발생 추적
3. 중간 검증 (KS03 보고)
```

### 월말
```
1. 배분 실행
   - Assessment (KSU1): 원가요소 → 원가센터
   - Distribution (KSV1): 원가센터 → 제품/오더
2. 원가 집계
3. 성과 분석 (KS03, KE30)
4. 차이 분석 (Variance Analysis)
```

---

## 주의사항

1. **관리회계영역과 회사코드 일관성**
   - OKKP와 OX06이 일치해야 함
   - 누락된 회사코드는 CO 거래 불가

2. **회계연도 변형 통일**
   - OKKP의 회계연도 변형 = OB29의 변형
   - 다를 경우 기간 불일치 (심각한 오류)

3. **원가요소 중복 생성 방지**
   - KA06 (ECC) 또는 FS00 (S/4) 중 하나만 사용
   - 혼용 시 데이터 불일치

4. **거래처 필드 필수**
   - 원가센터 생성 시 "Responsible Person" 지정 권장
   - 나중에 보고서에서 담당자 추적 가능

5. **S/4HANA 마이그레이션**
   - ECC의 KA06 원가요소 → S/4의 FS00 GL 계정으로 변환
   - 자동 마이그레이션 도구 제공 (FI/CO 통합 프로세스)

---

## 관련 T-codes 정리

| T-code | 기능 | 사용 시기 |
|--------|------|---------|
| **OKKP** | 관리회계영역 생성 | 초기 설정 |
| **OX06** | 회사코드 할당 | 초기 설정 |
| **KA06** | 원가요소 정의 (ECC) | 초기 설정 |
| **FS00** | GL 계정 (S/4) | 초기 설정 |
| **KS01** | 원가센터 생성 | 일상 |
| **KS02** | 원가센터 변경 | 필요시 |
| **KS03** | 원가센터 보고 | 월말 분석 |
| **KSU1** | Assessment 주기 | 초기 설정 |
| **KSV1** | Distribution 주기 | 초기 설정 |

## 체크리스트

- [ ] OKKP: 관리회계영역 생성 완료
- [ ] OX06: 전체 회사코드 할당 확인
- [ ] 통화: 모든 회사코드 통화 일치 확인
- [ ] 회계연도변형: OB29와 동일 확인
- [ ] 원가요소: KA06(ECC) 또는 FS00(S/4) 생성
- [ ] 원가센터: KS01로 주요 센터 생성
- [ ] 마스터: 테스트 거래 생성 후 검증
