# 기간제어(Period Control) IMG 구성 가이드

## SPRO 경로
```
SPRO → Financial Accounting → General Ledger Accounting → 
       Period Control
```

## 필수 선행 구성
- [x] Fiscal Year Variant (T-code: OB29) — 회계연도변형 정의 완료
- [x] Company Code (T-code: OX02) — 회사코드 생성 완료

## 구성 단계

### 1단계: 회계연도변형(Fiscal Year Variant) 정의
**T-code: OB29**

```
메뉴: SPRO → Financial Accounting → General Ledger Accounting → 
      Fiscal Year and Period Variants → Define Fiscal Year Variant
```

회계연도변형 설정:

| 변형코드 | 명칭 | 기간수 | 시작월 | 용도 |
|---------|------|--------|--------|------|
| V4 | 역년도변형 | 12기 | 1월 | 표준 (Jan~Dec) |
| V3 | 회계연도변형 | 12기 | 4월 | 한국(Apr~Mar) |
| V2 | 4주변형 | 13기 | 1월 | 소매/유통업 |
| V1 | 월별변형 | 12기 | 7월 | 특수 (Jul~Jun) |

변형 필드:

| 필드 | 값 | 설명 |
|-----|-----|------|
| **Fiscal Year Variant** | `V4` | 변형 코드 (2자리) |
| **Fiscal Year Name** | `역년도변형` | 한글명 |
| **Number of Posting Periods** | `12` | 일반 기간 수 |
| **Number of Special Periods** | `4` | 특별 기간(13~16기) |
| **Posting Period** | | Period 1~12 정의 |

기간(Period) 정의 (V4 예시):

```
Period 1: 01.01 ~ 31.01 (January)
Period 2: 01.02 ~ 28/29.02 (February)
Period 3: 01.03 ~ 31.03 (March)
...
Period 12: 01.12 ~ 31.12 (December)

Special Period 1: 01.01 ~ 31.01 (사후 결산)
Special Period 2: 01.02 ~ 28/29.02 (사후 결산)
Special Period 3: 01.03 ~ 31.03 (사후 결산)
Special Period 4: 01.04 ~ 30.04 (개정 거래)
```

**ECC 6.0**: 모든 회사코드가 동일 변형 사용 강제  
**S/4HANA**: Company Code별 다른 변형 가능

### 2단계: 기간제어변형(Period Control Variant) 정의
**T-code: OBBO**

```
메뉴: SPRO → Financial Accounting → General Ledger Accounting → 
      Period Control → Maintain Variant Table TCODE
```

기간제어변형 설정 (회계연도변형과 1:1 연결):

| 기간제어변형 | 회계연도변형 | 기간 잠금 규칙 | 소급기간 |
|------------|----------|-----------|--------|
| V4 | V4 | 전월 종료(T+0) | 3개월 |
| V3 | V3 | 전월 종료(T+0) | 3개월 |

기간제어변형 필드:

| 필드 | 값 | 설명 |
|-----|-----|------|
| **Variant Name** | `V4` | 변형 코드 |
| **Fiscal Year Variant** | `V4` | OB29에서 정의한 변형 |
| **Posting Periods** | `1~12` | GL 전기 가능 기간 |
| **Special Periods** | `13~16` | 특별 기간 (사후 결산용) |
| **Account Types Allowed** | `* A D E L` | 계정유형별 전기 제어 |

**주의**: 
- Variant는 OB29(회계연도변형)과 동일하게 생성
- Company Code별로 OBBO 변형 할당 (OX02)

### 3단계: 기간잠금(Period Lock) 설정
**T-code: OB52**

```
메뉴: SPRO → Financial Accounting → General Ledger Accounting → 
      Period Control → Maintain Posting Period Lock
```

기간잠금 설정 (월별 마감 후):

| 회사코드 | 기간 | 연도 | GL 전기 | AP 전기 | AR 전기 | 자산 전기 |
|---------|------|------|--------|--------|--------|----------|
| 1000 | 12 | 2024 | ✓ Locked | ✓ Locked | ✓ Locked | ✓ Locked |
| 1000 | 13 | 2024 | ✓ Open | ✓ Open | ✓ Open | ✓ Open |
| 1000 | 1 | 2025 | ✓ Open | ✓ Open | ✓ Open | ✓ Open |

기간잠금 필드:

| 필드 | 값 | 설명 |
|-----|-----|------|
| **Company Code** | `1000` | 회사코드 |
| **Period** | `12` | 잠금 대상 기간 |
| **Year** | `2024` | 연도 |
| **GL Posting Lock** | `X` | GL 전기 잠금 (체크=잠김) |
| **AP Posting Lock** | `X` | AP 전기 잠금 |
| **AR Posting Lock** | `X` | AR 전기 잠금 |
| **Asset Posting Lock** | `X` | 자산 전기 잠금 |

**특별 기간(13~16)**: 
- 사후 결산용 (예: 검수 미완료 거래)
- 기본 기간과 동일 월에 전기되지만 별도 추적

### 4단계: 특별기간(Special Periods) 운영
**T-code: OB52 (Special Period용)**

특별 기간 사용 사례:

```
🔄 월말 마감 프로세스:

기간 12 (12월, 일반기간):
  - 자동 판매 거래 전기 ✓
  - 정산 거래 전기 ✓

기간 13 (특별기간 1):
  - 검수 대기 자재 입고 ✓ (아직 인보이스 미도착)
  - 거래처 미지급 조정 ✓

기간 14 (특별기간 2):
  - 은행 대사 조정 거래 ✓

기간 1 (1월, 새 연도):
  - 새 거래 정상 전기 ✓
  - 전년도 소급 거래 ✗ (OB52에서 년도 잠금)
```

**주의**: 특별기간은 각 월마다 반복되지 않음 (연중 1회 정의)

## 구성 검증

### 검증 1: 회계연도 기간 구조 확인
**T-code: OB29 (Display)**

```
1. OB29 실행
2. Fiscal Year Variant: V4 선택 → Enter
3. Period 탭 확인:
   - Period 1: 01.01 ~ 31.01 ✓
   - Period 12: 01.12 ~ 31.12 ✓
4. Special Period 탭:
   - Special Period 1~4 정의됨 ✓
```

### 검증 2: 기간제어변형과 회계연도변형 연결
**T-code: OBBO (Display)**

```
1. OBBO 실행
2. Variant: V4 선택
3. Fiscal Year Variant: V4 매칭 확인 ✓
4. Period Control Table:
   - 1~12 기간은 Green (전기 가능)
   - 13~16 기간은 Yellow (특별기간)
```

### 검증 3: Company Code에 변형 할당 확인
**T-code: OX02**

```
1. OX02 실행 (회사코드 선택)
2. Accounting → Fiscal Year Variant 탭
3. Fiscal Year Variant: V4 할당됨 ✓
4. Period Control Variant: V4 할당됨 ✓
```

### 검증 4: 기간잠금 동작 확인
**T-code: FB50 (Period Lock Test)**

```
1. FB50 실행
2. Posting Date: 2024-12-31 (기간 12, 잠김)
3. Document Date: 2024-12-31
4. 거래 입력 시도:
   ❌ 예상: 오류 메시지
      "Period 12 locked for GL posting"
5. Posting Date 변경: 2025-01-15 (기간 1, 오픈)
6. 재입력 시도:
   ✓ 예상: 성공
```

### 검증 5: 특별기간 전기 확인
**T-code: FB50 (Special Period)**

```
1. FB50 실행
2. Posting Date: 2024-12-31 (기간 12, 잠김)
3. Document Date: 2024-12-20
4. Period 필드: 13으로 수동 선택
5. 거래 입력:
   ✓ 예상: 성공 (특별기간은 잠금 제외)
6. 결과: 기간 13 계정으로 전기되어 추적 가능
```

## 주의사항

### 1. 회계연도변형과 기간제어변형 일관성
```
⚠️ 실수 사례:
   - OB29에서 V4(12기간) 정의
   - OBBO에서 V3(13기간) 할당
   결과: Period Overflow 에러

✅ 해결: 항상 동일한 변형 코드 사용
   - OB29: V4 (12기간 정의)
   - OBBO: V4 (동일 변형)
   - OX02: V4 (동일 변형)
```

### 2. 기간잠금 타이밍
```
🔄 권장 월말 마감 절차:

D+1 (월말 다음날):
   - 자동거래 전부 전기 확인
   - 특별기간(13~14) 활용하여 미완료 거래 입력

D+3:
   - 은행대사, 거래처 확인 완료
   - OB52에서 이전월 모든 기간 잠금

D+5:
   - 결산보고서 최종 확정
   - 기간 13~16도 잠금 (더 이상 수정 금지)

⚠️ 위험:
   - 기간 잠금 후 거래 발견 시 Unlock 필요
   - Unlock은 감사 추적 기록됨 (감사 대상)
```

### 3. 소급 거래(Retroactive) 관리
```
📋 소급기간 설정 (OB52 추가 필드):
   - Retroactive Period: 3개월 설정
   - 의미: 현재 기간으로부터 3개월 이전까지 전기 가능
   - 예: 2월 현재 → 11월(전년도)까지 소급 거래 가능

✅ 운영 효과:
   - 자동화 거래 지연으로 인한 소급 입력 허용
   - 감시 범위 내에서 유연성 제공
   - 통상 3~6개월 설정
```

### 4. 특별 기간(13~16) 활용 전략
```
🎯 추천 운영:
   - Period 13: 검수 대기(미도착 인보이스)
   - Period 14: 은행 대사 조정
   - Period 15: 거래처/고객 분쟁 조정
   - Period 16: CMS 최종 정산

⚠️ 오용 예방:
   - 특별기간을 "그냥 추가 기간"으로 사용 금지
   - 반드시 기념일과 용도 명시
   - 월마다 특별기간 사용 현황 리뷰
```

### 5. S/4HANA 변경사항
```
ECC 6.0:
   - Company Code별 동일 회계연도변형 강제
   - Period Lock은 Ledger Group 통일

S/4HANA:
   - Multiple Period Control Variants 지원
   - Company Code별 독립적 기간제어 가능
   - Ledger Group별 기간 제어 (New GL)
   
🚀 마이그레이션 시:
   - CUSTOMIZING_MIGRATION을 통해 기존 Lock 상태 자동 이관
   - 멀티-커런시 기간제어 설정 검토 필수
```

### 6. 한국(KOR) 특화 기간 설정
```
🇰🇷 표준 구성:
   - Fiscal Year Variant: V3 (Apr~Mar 회계연도)
   - Period Control: V3
   - 12기간 + 특별기간 4개

⚠️ 한국 회계 관습:
   - 법인세: 12월말 결산 (달력연도 또는 사업연도)
   - 부가세: 홀짝수 월 신고 (01월, 03월, ...)
   - 임금: 1월, 7월 정산
   
💡 권장:
   - Period 13 = 1월 초(부가세, 임금 조정)
   - Period 14 = 월중(이월 건 조정)
   - Period 15 = 월말(은행 대사)
```

## 관련 T-codes 요약

| T-code | 설명 |
|--------|------|
| **OB29** | Fiscal Year Variant 정의 |
| **OBBO** | Period Control Variant 정의 |
| **OB52** | Period Lock 설정/해제 |
| **OX02** | Company Code → Variant 할당 |
| **FB50** | General Journal Entry (기간 테스트) |
| **FBL5N** | GL 항목 (기간별 조회) |
| **FB11Z** | GL 항목 Standard 리포트 |
