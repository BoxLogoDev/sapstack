# 재무회계(FI) IMG 구성 가이드 — 개요

## SPRO 경로
```
SPRO → Financial Accounting (FI)
```

## FI IMG 주요 영역

### 1. 기본 설정 (Basic Settings)
- **회사코드 정의** (T-code: OX02)
- **회계연도 변형** (T-code: OB29)
- **통화 정의** (T-code: OB07)

### 2. 총계정원장(GL) 설정
- **GL 계정 차트** (T-code: OB13)
- **계정 결정** (T-code: OBYC, VKOA, OAY2)
- **필드상태그룹** (T-code: OBC4)
- **전기키** (T-code: OB41)

### 3. 채권/채무 회계
- **거래처마스터** (T-code: OB45)
- **채권계정 정의** (T-code: OB12)
- **자동 대사 프로필** (T-code: F.14)

### 4. 자산회계(AA)
- **자산클래스** (T-code: OAYZ)
- **감가상각 영역** (T-code: OADB)
- **자산 계정결정** (T-code: AO90)

### 5. 세금 구성
- **세금코드 정의** (T-code: FTXP)
- **세금 절차** (T-code: OBCL)
- **세금 계정결정** (T-code: OB40)

### 6. 기간 제어
- **기간 열기/닫기** (T-code: OB52)
- **특별기간 정의** (T-code: OB29)

### 7. 환율 관리
- **환율 유형** (T-code: OB61)
- **환율 정의** (T-code: OB08)
- **실현 손익** (T-code: OBA1, OBA2)

### 8. 송금 관리(Treasury)
- **하우스뱅크** (T-code: FI12)
- **은행명세서** (T-code: FF_5)
- **지급 프로그램** (T-code: FBZP)

## 구성 순서 (권장)

```
1단계 기본설정
  ├─ OB29: 회계연도 변형
  ├─ OB07: 통화
  └─ OX02: 회사코드

2단계 GL 및 계정
  ├─ OB13: GL 계정 차트
  ├─ OBC4: 필드상태그룹
  ├─ OBYC: 계정결정 (MM)
  ├─ VKOA: 계정결정 (SD)
  └─ OAY2: 계정결정 (기타)

3단계 세금
  ├─ FTXP: 세금코드
  ├─ OBCL: 세금절차
  └─ OB40: 세금계정결정

4단계 자산회계
  ├─ OAYZ: 자산클래스
  ├─ OADB: 감가상각영역
  └─ AO90: 자산계정결정

5단계 기간 제어
  └─ OB52: 기간 열기/닫기

6단계 환율 관리
  ├─ OB61: 환율유형
  └─ OB08: 환율정의

7단계 송금 관리
  ├─ FI12: 하우스뱅크
  └─ FBZP: 지급프로그램
```

## 공통 용어

| 용어 | 설명 |
|------|------|
| **Chart of Accounts (CoA)** | GL 계정 차트 |
| **Account Determination** | 거래 유형에 따른 자동 계정 결정 규칙 |
| **Field Status Group** | 거래처/GL 계정별 필드 표시 설정 |
| **Posting Key** | 거래 방향 제어(차변/대변) |
| **Controlling Area** | 원가 관리 영역 (FI와 독립) |
| **Cost Center** | 원가센터 |
| **Internal Order** | 내부오더 |

## ECC vs S/4HANA 주요 변경

| 항목 | ECC | S/4 |
|------|-----|-----|
| **GL 구조** | 3단계 (차트-회사-실제) | 단일 계정원장 (ACDOCA) |
| **자산회계** | AA (독립) | 자산 GL 계정으로 통합 |
| **환율 조정** | OBA1/OBA2 | S_BCE_68001658 |
| **신총계정원장** | 선택 사항 | 필수 활성화 |
| **채무계정** | AP 독립 | GL 통합 |

## 체크리스트

- [ ] OB29: 회계연도 변형 정의
- [ ] OB13: GL 차트 생성
- [ ] OBC4: 필드상태그룹 설정
- [ ] FTXP: 세금코드 정의
- [ ] OADB: 감가상각 영역 설정
- [ ] OB52: 기간 열기/닫기
- [ ] FI12: 하우스뱅크 설정
- [ ] 접근권한: 사용자별 IMG 권한 부여 (SUIM)
