# GL 계정결정(GL Account Determination) IMG 구성 가이드

## SPRO 경로
```
SPRO → Financial Accounting (FI) → General Ledger Accounting (GL) 
  → Accounts → Account Determination → GL Account Determination
```

## 필수 선행 구성
- [x] Chart of Accounts (T-code: OB13) — 계정과목표 생성 완료
- [x] Account Groups (T-code: OBD4) — 계정그룹 정의 완료
- [x] Fiscal Year Variant (T-code: OB29) — 회계연도변형 정의 완료

## 자동 계정결정 주요 T-codes

### 1. MM(Inventory Management) — OBYC

**SPRO 경로**: `SPRO → Materials Management → Valuation and Account Assignment → Account Determination → Maintain Table OBVMC`

**목적**: 재고 거래(입고/출고/이동)의 GL 계정 자동 결정

**필수 마스터**:
- 평가클래스 (Valuation Class) — 자재마스터 MM02
- 거래유형 그룹 (Transaction Type Group) — 자재마스터
- 이익센터 (Profit Center)

**주요 필드**:

| 필드 | 설명 | 예시 |
|------|------|------|
| Material Type | 자재유형 | ERLA(완제품), HALB(반제품), ROHB(원재료) |
| Valuation Class | 평가클래스 | 3100, 3200, 3300 |
| Account Modification | 거래유형 | BSX(입고), WA0(출고), UMB(이동) |
| Offsetting Account | 상대계정 | 100000(현재고계정) |

**구성 단계**:

1. **OBYC T-code 실행**
   - Material Type 선택: ERLA
   - Valuation Class 선택: 3100 (완제품)
   - 저장
   
2. **계정 매핑 정의**
   ```
   Material Type  | Val.Class | Acct.Mod | G/L Account
   ERLA           | 3100      | BSX      | 130000 (상품)
   ERLA           | 3100      | WA0      | 510000 (매출원가)
   HALB           | 3200      | BSX      | 131000 (반제품)
   ROHB           | 3300      | BSX      | 132000 (원재료)
   ```

3. **필드상태그룹 연계 (OBC4)**
   - 필드 ACDOCA-ACCT_TYPE 상태: Required (필수)
   - 필드 ACDOCA-PROFIT_CTR 상태: Optional

**구성 검증** (T-code: MB1C):
```
자재입고 → MBST 리포트 → GL 계정 확인
- Expected: 130000 (상품계정)
```

**ECC vs S/4**:
- **ECC**: MARA-MTART (자재유형), MARA-BKLAS (평가클래스) 기반
- **S/4**: ACDOCA-ACCT_TYPE (계정유형) + ACDOCA-SEGMENT (영역) 필수

---

### 2. SD(Sales & Distribution) — VKOA

**SPRO 경로**: `SPRO → Sales and Distribution → Sales → Account Assignment → Maintain Table VKOA`

**목적**: 판매 거래(송장/청구/환불)의 GL 계정 자동 결정

**필수 마스터**:
- 판매조직 (Sales Organization) — MM01
- 판매담당자 영역 (Sales Area)
- 제품 그룹 (Product Group) — 자재마스터 MARA-PRDHA

**주요 필드**:

| 필드 | 설명 | 예시 |
|------|------|------|
| Sales Organization | 판매조직 | 1000 |
| Distribution Channel | 유통채널 | 10(도매) |
| Division | 사업부 | 00(모든) |
| Account Type | 거래유형 | R (매출), K (환불) |
| GL Account | 결정될 계정 | 400000(매출) |

**구성 단계**:

1. **VKOA T-code 실행**
   - 판매조직: 1000
   - 유통채널: 10
   - 거래유형: R (Regular Sales)

2. **계정 매핑 정의**
   ```
   SalesOrg | Channel | Division | AcctType | G/L Account
   1000     | 10      | 00       | R        | 400000 (매출)
   1000     | 10      | 00       | K        | 400100 (환불)
   1000     | 20      | 00       | R        | 400200 (수출매출)
   ```

3. **거래처 계정연계 (OB45)**
   - 거래처마스터 XK01/XD01 입력
   - 필드: KTOKD (거래처타입) → 계정범위 결정

**구성 검증** (T-code: VF02 — 송장):
```
VF02 → 배송 실행 → F-28 청구 생성 → FBL5N(거래처 항목) 확인
- Expected: 400000 (매출 계정 차변)
```

**ECC vs S/4**:
- **ECC**: VBRK-SPART (사업부), VBRK-BUKRS (회사코드)
- **S/4**: ACDOCA-DIVISION (사업부) 명시적 입력 필수

---

### 3. 자산 계정결정 — OAY2

**SPRO 경로**: `SPRO → Financial Accounting → Fixed Assets → Valuation → Depreciation Areas → Account Determination for Fixed Assets`

**목적**: 자산 취득/감가상각/폐기의 GL 계정 자동 결정

**주요 T-codes**:
- **OAY2**: 자산계정 결정 (acquisition, depreciation, disposal)
- **AO90**: 자산 계정결정 테이블 유지

**필수 마스터**:
- OADB: 감가상각 영역
- 자산클래스 (Asset Class) — OAYZ

**구성 단계**:

1. **자산클래스별 계정 정의 (OAYZ)**
   ```
   Asset Class | Description          | GL Account (취득)
   1000        | 건물                  | 100000
   1100        | 건설중자산            | 100100
   2000        | 기계장비              | 110000
   3000        | 차량                  | 120000
   4000        | 컴퓨터/IT             | 130000
   ```

2. **감가상각 영역별 계정 (OADB)**
   - 영역 01 (Book Depreciation): 계정 160000 (누적감가상각)
   - 영역 02 (Tax): 계정 160100 (세무감가상각)
   - 영역 15 (IFRS): 계정 160200 (IFRS 조정)

3. **거래유형별 계정 (OAY2)**
   ```
   Asset Class | Dep. Area | Trx Type | GL Account
   1000        | 01        | 100      | 510000 (감가상각비)
   1000        | 01        | 110      | 515000 (폐기손실)
   1000        | 01        | 120      | 450000 (폐기이익)
   ```

**구성 검증** (T-code: AS02 — 자산 변경):
```
AS02 → 자산 추가 → 월말 기간종료 → AFVV 리포트 (감가상각 결과)
- Expected: 160000 (누적감가상각) 차변, 510000 (감가상각비) 대변
```

---

### 4. 기타 자동 계정결정 — OBYX

**SPRO 경로**: `SPRO → Financial Accounting → General Ledger → Business Transactions → Maintain Table OBYX (기타)`

**용도별 T-codes**:

| 거래유형 | T-code | 설정 위치 | GL 계정 |
|---------|--------|---------|---------|
| 환율손익 | OBA1/OBA2 | FI → GL → Valuation | 재무수익/비용 |
| 현금할인 | OBD1/OBD3 | FI → AP/AR → 할인 | 할인/환입 |
| 상각 | OBD4 | FI → AP → 기타 | 기타비용 |
| 선급금 | OBD5 | FI → AP → 선급금 | 선급금 |
| 채권 반제 (Contra) | OB63 | FI → GL → 반제 규칙 | 자동반제 계정 |

---

## 계정결정 규칙 검증 및 트러블슈팅

### 검증 도구

1. **T-code: CASA — 자동 계정결정 Simulator**
   ```
   거래유형 입력 → 결정될 계정 미리 확인
   - 목적: 프로덕션 적용 전 테스트
   ```

2. **T-code: AOBJ — 자동 계정결정 체인 조회**
   ```
   계정결정 규칙 → 개별 단계 추적
   - 목적: 실패 원인 진단
   ```

3. **T-code: SM37 — Job Log (배치 처리)**
   ```
   자동 계정결정 배치 → 오류 로그 확인
   - 목적: 야간 배치 오류 분석
   ```

### 일반적 오류 및 해결책

| 오류 | 원인 | 해결책 |
|------|------|--------|
| **Account not found** | 계정결정 규칙에 계정 미지정 | SPRO에서 OBYC/VKOA 재확인 |
| **Multiple accounts found** | 중복 규칙 정의 | 우선순위 확인 (BPEB-BPRI) |
| **Permission denied** | 사용자 권한 부족 | SUIM에서 권한 추가 |
| **Posting blocked** | 필드상태 오류 | OBC4 필드 상태 재확인 |

---

## 주의사항

1. **필드상태그룹 일관성**
   - ACDOCA-ACCT_TYPE 필드는 계정결정과 필드상태그룹에서 모두 Mandatory로 설정
   - OBC4에서 필드 상태 변경 시 GL 계정별 영향도 검토

2. **회계연도 변형 연계**
   - OB29에서 회계연도 변형 선택 → IMG 규칙도 동일 변형 사용
   - 실수로 다른 변형으로 설정하면 기간 불일치 발생

3. **자산 계정결정과 AA 영역**
   - OADB에서 영역 정의 → AO90에서 계정 할당
   - 누락되면 자산 취득 불가

4. **S/4HANA 마이그레이션**
   - 신총계정원장(New GL) 활성화 필수 (S_BCE_68001658)
   - ACDOCA 테이블만 유효 (BSIS/BSAS 폐기)

5. **테스트 거래 생성**
   - IMG 완료 후 각 거래유형마다 테스트 거래 생성
   - FBL5N(AR), FBL1N(AP), MB51(Inventory) 리포트로 검증

---

## 관련 트랜잭션

| T-code | 기능 | 용도 |
|--------|------|------|
| **SPRO** | IMG 메뉴 | 계정결정 규칙 설정 |
| **CASA** | Simulator | 거래 전 계정 확인 |
| **AOBJ** | 규칙 체인 | 오류 진단 |
| **OBC4** | 필드상태 | GL 계정 필드 제어 |
| **MM02** | 자재마스터 | 평가클래스 입력 |
| **XD01** | 거래처(고객) | 계정 범위 할당 |
| **SM37** | 배치 로그 | 야간 배치 오류 확인 |
