# 공공·국방 산업 SAP 운영 가이드

> 중앙정부·지자체·국방·공기업. 공공 조달법·예산 회계·감사 추적·망분리 환경 핵심.

## 1. 산업 특성

| 속성 | 공공/국방 |
|---|---|
| **회계** | 정부회계 (Cash + Accrual 혼합), 예산 회계 |
| **조달** | 공공조달법 — 입찰·계약·이행 평가 |
| **규제** | 감사원·국정감사·내부통제 평가 |
| **데이터** | 국가 기밀 등급 (1급~3급), 망분리 |
| **시간** | 회계연도 고정 (한국: 1~12월), 예산 집행 시한 |

## 2. 핵심 SAP 모듈

| 모듈 | 활용 |
|---|---|
| **IS-PS** | Industry Solution Public Sector |
| **PSCD** | Public Sector Collection & Disbursement |
| **FM** | Funds Management — 예산 |
| **GM** | Grants Management |
| **MM** | 공공 조달 (입찰·계약) |
| **PM** | 시설·인프라 유지보수 |
| **HCM** | 공무원 관리 |

## 3. 예산 회계 (FM - Funds Management)

### 3.1 핵심 개념
- **Fund**: 예산 출처 (일반회계·특별회계·기금)
- **Funds Center**: 부서 (조직)
- **Commitment Item**: 비목 (예산 코드)
- **Budget Period**: 회계연도 + 분기

### 3.2 핵심 T-code
- **FMBB**: Budget Entry
- **FMEDD**: Budget Document Display
- **FMRP_F4**: Funds Center 마스터
- **F8B4**: Earmarked Funds (예산 약정)
- **FMAVCC**: Active Availability Control

### 3.3 흐름
```
1. 예산 편성 (FMBB)
   ↓
2. 예산 배정 (Distribution)
   ↓
3. 약정 (Earmarked Funds, FMZ1)
   ↓
4. 발의 (구매·계약)
   ↓
5. 집행 (PR/PO/Invoice)
   ↓
6. 정산·이월 (Year-End)
```

## 4. 공공 조달

### 4.1 한국 공공조달
- **나라장터** (KONEPS / g2b): 메인 조달 시스템
- **G2B → SAP 연동**: 계약 정보 흡수
- **공공조달법**:
  - 입찰 (전자입찰 의무화)
  - 적격심사·낙찰자 결정
  - 계약·이행 평가

### 4.2 입찰 과정
1. 사양 작성 (Request for Quotation)
2. 공고 (KONEPS)
3. 입찰 접수
4. 적격심사
5. 낙찰자 결정
6. 계약 체결
7. 이행·평가

### 4.3 SAP 지원
- **PR (Purchase Requisition)** 발의
- **RFQ (ME41)**: 견적 요청
- **PO (ME21N)**: 낙찰 후 발주
- **Contract (ME31K)**: 장기 계약

## 5. 국방 (Defense)

### 5.1 특수 요구사항
- **보안 등급**: 1급·2급·3급 데이터 분류
- **물자 추적**: 무기·탄약 단위별 추적
- **유지보수**: 군 장비 PM·CS 통합
- **인사**: 군인·군무원·민간 통합

### 5.2 한국 국방
- **국방통합재정정보시스템(DAFA)** — 자체 시스템
- SAP는 공기업·민간 방산 협력사에서 사용
- 망분리 환경 — 외부 통신 강력 통제

## 6. PSCD (Tax & Revenue)

지방세·재산세·과태료 등 정부 수입 관리.

- **FPL9**: Account Display
- **FPVA**: Receivables Posting
- **FPVD**: Document Posting
- **FPE1**: Reconciliation Keys

## 7. 한국 공공 환경

### 망분리 환경
- 외부 인터넷 분리 (DMZ 통제)
- SAP 클라우드 사용 제한 (Private Cloud 검토)
- 외부 RFC: 보안 게이트웨이 경유

### 감사·통제
- **감사원 감사**: 연 1회 + 임시
- **국정감사**: 국회 (10월~)
- **내부통제평가**: 분기·연
- **K-SOX**: 공기업도 적용

### 회계 특성
- **현금주의 + 발생주의 혼합**: 정부회계기준
- **예산 우선**: 모든 지출은 예산 통제 우선
- **연말 이월**: 미집행 예산 — 다음해 이월·소멸

## 8. 자주 마주치는 이슈

### 예산 초과 지출 차단
- 원인: AVC (Availability Control) 활성화 안 됨
- 해결: FMAVCC → AVC 활성 + 임계 설정

### KONEPS 연동 fail
- 원인: 정부 시스템 점검·인증서 만료·포맷 변경
- 해결: 인증서 갱신 + KONEPS 채널 점검

### 예산 이월 불일치
- 원인: Year-End cutoff 잘못
- 해결: FMJ2 (Year-End Closing) + 결산 절차 재실행

### 감사 대비 trail 누락
- 원인: CDPOS 보존 정책 미흡
- 해결: 7년 보존 강제 + 백업

## 9. 관련 SAP Note

- 2701156 — IS-PS Implementation Best Practices
- 2401118 — Public Sector Configuration in S/4
- 3010312 — Korean Government Integration

## 10. 연관 sapstack 모듈

- `sap-fi` — 정부회계·예산
- `sap-mm` — 공공 조달
- `sap-hcm` — 공무원 관리
- `sap-pm` — 시설 유지보수
- `sap-bc` — K-SOX·망분리·전자세금계산서

## 11. Out of Scope

- 군 운영 시스템 (별도 군 자체 시스템)
- 세무 직접 처리 (PSCD 영역 별도)
- 공공기관 인사평가 (외부 시스템 일반적)
- 외교·국방 기밀 (외부 SAP 사용 불가)

---

## 12. 모듈 활성화 매트릭스 (`data/industry-matrix.yaml` 과 동일)

| 모듈 | importance | 라우팅 | 노트 |
|------|------------|--------|------|
| FI | critical | sap-fi-consultant | FM 예산, PSCD |
| MM | critical | sap-mm-consultant | 나라장터/KONEPS |
| HCM | critical | sap-hcm-consultant | 공무원 |
| BASIS | critical | sap-basis-consultant | 망분리, K-SOX, 감사 trail |
| PM | high | sap-pm-consultant | 시설 |
| ABAP | high | sap-abap-developer | G2B 연동 |
| SD / PP / QM / WM / EWM / GTS | **none** | (없음) | 매트릭스와 동일 |
| BTP | low | sap-integration-advisor | 클라우드 제한 |
| CO / TR | medium / low | 해당 컨설턴트 | |

## 13. ECC vs S/4

| 주제 | ECC | S/4 |
|------|-----|-----|
| 예산(FM) | FMBB, AVC | 동일 개념. Fiori 앱은 릴리스 확인 필요 |
| 조달 | ME21N / ME31K | 동일 + 공공 입찰은 외부 G2B |
| 망분리 | 온프렘 전제 | RISE/Public Cloud 는 공공 보안성 검토. 단정 금지 |

본문의 FMBB, FMAVCC, FMJ2, FPL9 등은 공공 FM/PSCD 표준으로 본문에만 둔다. `tcodes.yaml` 미등록이면 새 gold-set 에 넣지 않음.

## 14. 체크리스트

### 구축
- [ ] AVC (FMAVCC) 임계 — 예산 초과 지출 차단이 목적인지 확인
- [ ] 나라장터 인증서 갱신 런북 (망분리 USB 반입)
- [ ] CDPOS 보존 연한. 본문 "7년"은 기존 서술 — **현행 기록물법 확인 필요**
- [ ] sapstack audit-trail 권한 600/640. 777 금지

### 운영
- [ ] 연말 FMJ2 이전에 약정(earmarked) 미결 목록
- [ ] KONEPS 점검 창 — 발주 중단 공지
- [ ] 국정감사 시즌(통상 10월) 전 trail 추출 리허설

### 거버넌스
- [ ] 감사원 / 내부통제평가 일정은 기관마다 다름
- [ ] 본문 Note 2701156 / 2401118 / 3010312 — **인용 전 확인 필요**
- [ ] 기밀 등급 데이터는 sapstack 세션에 붙여넣지 말 것

## 15. 망분리와 sapstack

- sapstack 은 SAP 에 붙지 않는다. 예산 조회 결과를 운영자가 붙여넣는다.
- 온디바이스 LLM 은 v2.5 예정 (`docs/compliance/air-gapped-deployment.md`).

---

**Last Updated**: 2026-08-16  
**Matrix**: `data/industry-matrix.yaml` public_sector
