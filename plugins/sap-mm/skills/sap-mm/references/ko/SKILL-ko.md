# SAP MM 한국어 전문 가이드

> `plugins/sap-mm/skills/sap-mm/SKILL.md`의 한국어 병렬 버전.

## 1. 환경 인테이크
- SAP 릴리스 (ECC / S/4HANA — MATDOC 신테이블)
- 플랜트 + 저장위치
- MM 기간 상태 (**OMSY**)
- 이동 유형 + 에러 메시지

## 2. Procurement (구매)

### Purchase Requisition
- **ME51N/ME52N/ME53N**: PR 생성/변경/조회
- **ME58**: PR 일괄 발주
- **CL02 + CT04**: Release Strategy (승인 전략)
- 한국 대기업: 본부장·부서장 단계별 승인 표준

### Purchase Order
- **ME21N/ME22N/ME23N**: PO 생성/변경/조회
- **ME2L/ME2M/ME2N**: PO 조회 (벤더별/자재별/문서번호별)
- Account Assignment Category (계정배정):
  - K = 원가센터
  - F = 주문
  - A = 자산
  - Q = 프로젝트
  - 공란 = Stock PO

### Info Record
- **ME11/ME12/ME13**: Info Record 생성/변경/조회
- **ME14**: 변경 로그
- Source List (ME01/ME03)

### Outline Agreement
- **ME31K**: Contract 생성
- **ME31L**: Scheduling Agreement 생성
- **ME32K/ME32L**: 변경

## 3. Inventory Management

### Goods Movement (MIGO)
| 이동유형 | 설명 |
|---------|------|
| 101 | Goods Receipt (PO) |
| 102 | Reversal of 101 |
| 103 | GR Blocked Stock |
| 105 | Release from Blocked |
| 201 | Consumption to Cost Center |
| 301 | Transfer between Plants |
| 311 | Transfer between Storage Locations |
| 551 | Scrapping |
| 561 | Initial Stock Upload |

### Stock Reports
- **MMBE**: Stock Overview (전체)
- **MB52**: Warehouse Stock
- **MB5B**: Stock on Posting Date (전기간)
- **MB51**: Material Document List
- **MB5S**: GR/IR Balance (ECC) / S/4는 GRIR Fiori

### 재고 실사 (Physical Inventory)
1. **MI01**: Document 생성
2. **MI04**: Count 입력
3. **MI07**: Posting (차이 조정)
- **MI09**: Without Document
- **MI20**: Differences

### 특수 재고 (Special Stock)
- E = Sales Order Stock (판매오더)
- K = Consignment (위탁, 벤더 소유)
- Q = Project Stock
- O = Subcontracting Stock

## 4. Invoice Verification (MIRO)

### 차단 사유
- **Amount tolerance** (OMR6)
- **Quantity tolerance**
- **Price tolerance**
- **Date variance**
- **Manual block** (Payment block)

### 트랜잭션
- **MIRO**: 송장 입력 (Enjoy)
- **MIR4**: 송장 조회
- **MIR6**: 송장 개요
- **MR8M**: 송장 취소
- **MRBR**: 차단 송장 해제

### GR/IR 정리
- **MR11**: 자동 정리 (**Test Run 필수**)
- **MR11SHOW**: MR11 결과 조회
- **FBL3N**: GR/IR 계정 라인 아이템 직접 조회

## 5. Account Determination (OBYC)

### 주요 Transaction Key
| Key | 용도 | 계정 유형 |
|-----|------|----------|
| **BSX** | Inventory Posting | 자산 |
| **WRX** | GR/IR Clearing | 부채/자산 |
| **GBB** | Offsetting Entry | 비용/원가 |
| **PRD** | Price Difference | 손익 |
| **KBS** | Account Assignment | 비용/원가 |
| **FR1~FR4** | Delivery Cost | 비용 |
| **VST** | Input Tax | 세금 |

### Valuation Class (MBEW.BKLAS)
- 자재 유형 → 평가 클래스 → G/L 계정
- 한국 현장: 제품군별 평가 클래스 분리

## 6. 외주 / 하도급 (Subcontracting)

### 프로세스
1. PO with Item Category **L** (Subcontracting)
2. **ME2O**: 외주 구성요소 재고 모니터
3. **MIGO 541**: 구성요소 벤더에게 지급 (stock transfer)
4. 외주 업체 가공
5. **MIGO 101** + movement type 543: 완제품 입고 + 구성품 소모 동시 처리

### 한국 특화
- 수탁/위탁 구분 (세법)
- 가공임 정산 (FI 전표)

## 7. 한국 특화 주제

### 전자세금계산서 매입
- **MIRO** 입력 시 승인번호 연계 필드 (J_1BNFE 구조)
- 승인번호 불일치 → 포스팅 차단 가능
- **CVI KR** 설정

### 부가세 자동 분리
- Tax Code (MWSKZ) 설정
- 매입세액 공제 대상 vs 불공제 구분
- 한국 부가세 별도 신고 준비

### 월마감
- **OMSY**: MM 기간 관리 (현+전 2개월만 허용)
- **MMPV**: 기간 닫기
- FI 기간(OB52)과 **동기화 필수**

## 8. 표준 응답 형식

```
## Issue
## Root Cause
## Check (T-code + Table.Field)
## Fix
## Prevention
## SAP Note (verified only)
```

## 9. 자주 참조하는 SAP Note
- **2265093** — BP Migration (벤더 마스터 → BP)
- **2214213** — FI/CO Conversion

## 관련
- `quick-guide.md`
- `/plugins/sap-fi/skills/sap-fi/references/ko/SKILL-ko.md` — 계정 결정 연계
- `/agents/sap-mm-consultant.md` — MM 컨설턴트 에이전트
- `/commands/sap-migo-debug.md` — MIGO 디버그 커맨드
