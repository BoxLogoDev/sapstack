# SAP GTS 한국어 전문 가이드

> `plugins/sap-gts/skills/sap-gts/SKILL.md`의 한국어 병렬 버전.

## 1. 환경 인테이크
- GTS 버전 (10.x / 11.0 / S/4HANA for International Trade)
- 배포: Standalone vs Embedded
- UNI-PASS 연동 방식 (직접 / 관세사 경유)
- 거래 국가 범위
- FTA 활용

## 2. GTS 4대 영역

### 2-1. Compliance Management
- SPL Screening
- Embargo Check
- Legal Control

### 2-2. Customs Management
- 수출/수입 신고
- Transit
- 특수 절차

### 2-3. Risk Management
- L/C 관리
- FTA 원산지
- 수출 환급

### 2-4. Electronic Reporting
- UNI-PASS (한국)
- Intrastat (EU)
- 국가별 전자 신고

---

## 3. SPL Screening 상세

### 구독 리스트
- **OFAC SDN** (US Treasury) — 대미 수출 시 필수
- **EU Consolidated List**
- **UN Security Council List**
- **한국 전략물자 수출입 고시** — 산업통상자원부
- **국가정보원 대외 제재**

### 프로세스
1. BP 생성/변경 → 자동 screening
2. Customs document 생성 → 재검사
3. Match 발견:
   - **Block** (강한 match) → 거래 차단
   - **Hold** (약한 match) → 수동 검토

### 한국 현장
- 동명이인 false positive 빈번
- **관세사 지원** 필요
- 분기별 리스트 업데이트

---

## 4. 수출 신고 플로우

```
Sales Order (VA01)
        ↓
Delivery (VL01N)
        ↓
GTS Customs Document 생성
        ↓
SPL + Embargo + Legal Control
        ↓
Export Declaration
        ↓
UNI-PASS 전송 (EDI)
        ↓
관세청 접수·승인
        ↓
Export Permit 발행
        ↓
실제 출항 (선적)
```

### 필요 정보
- HS Code (10자리)
- 수량 + 단위
- 거래 금액 (통화)
- 원산지
- 수출 대상국
- 인코텀즈 (FOB, CIF 등)
- 운송 수단

---

## 5. 수입 신고 플로우

```
Purchase Order (ME21N)
        ↓
Inbound Delivery
        ↓
GTS Customs Document
        ↓
Import Declaration
        ↓
UNI-PASS 전송
        ↓
관세청 심사 (서류 / 검사)
        ↓
관세·부가세 납부
        ↓
통관 완료
        ↓
MIGO Goods Receipt
```

### 주요 비용
- **관세** (Customs Duty) — HS Code별
- **부가세** (VAT 10%)
- **개별소비세** (일부 품목)
- **특별소비세** (사치품)
- **덤핑 방지세** (해당 시)

---

## 6. HS Code 분류

### HSK (Harmonized System Korea) 10자리
```
예: 8471.30.0000
   │    │  │
   │    │  └── 한국 고유 (세분)
   │    └───── HS 호 (WCO 표준)
   └────────── HS 류 (WCO 표준)
```

### 분류 기준
- 물품의 **본질적 특성**
- 제조 방법
- 용도
- 가공 단계

### 한국 특화
- **관세청 HSK 검색**: https://unipass.customs.go.kr/
- **HS 통칙** 1-6 적용
- 복잡 케이스 → **관세사 자문** 또는 **품목 분류 사전 심사**

---

## 7. FTA 원산지 관리

### 한국 주요 FTA (2026년 기준 50+)
- **한-미 FTA (KORUS)** 2012
- **한-EU FTA** 2011
- **한-중 FTA** 2015
- **한-ASEAN FTA**
- **RCEP** 2022 (한국 포함)
- **한-영 FTA**, 한-호주, 한-캐나다, 한-싱가포르 등

### 원산지 결정 규칙 (ROO)
- **Wholly obtained (WO)**: 완전 생산 (농산물 등)
- **Change in Tariff Classification (CTC)**: 세번 변경
- **Regional Value Content (RVC)**: 부가가치 기준
- **Specific Process Rules (SP)**: 특정 공정

### 원산지 증명서 (C/O)
- **EUR.1** — EU
- **KORUS** — 한미 FTA
- **Form KR** — 한중 FTA
- **FORM AK** — 한-ASEAN
- **FORM CO** — RCEP

### GTS Preference Determination
- 자재별 Bill of Material 분석
- 부품 원산지 추적
- 부가가치 계산 자동화

---

## 8. License 관리

### 한국 전략물자
- **산업통상자원부** 수출 허가
- **KOSTI** (한국전략물자관리원) 연동
- 대상: 전자 부품, 화학 물질, 기계류, 소프트웨어, 기술

### 기타 한국 허가
- **방위산업**: 방위사업청
- **원자력**: 원자력안전위원회
- **마약류·위험물질**: 식약처
- **문화재**: 문화재청

### GTS에서 관리
- License type 정의
- 유효 기간
- 수량·금액 한도
- 사용 이력 추적

---

## 9. UNI-PASS 연동 상세

### 연동 방식
1. **직접 연동** (GTS → UNI-PASS):
   - EDI 메시지 생성
   - 공인인증서 전자 서명
   - HTTPS 전송
2. **관세사 시스템 경유**:
   - 한국 현장 대부분 이 방식
   - 관세사 전용 소프트웨어
   - 관세사가 UNI-PASS 대신 접수
3. **하이브리드**: 일부 직접, 일부 경유

### 핵심 메시지 타입
- **수출신고서** (EX)
- **수입신고서** (IM)
- **적하목록** (AM)
- **적하 EDI** (ED)
- **원산지 증명서** (CO)

### 보안
- **공인인증서** (STRUST)
- **TLS 1.2+**
- 관세청 지정 CA

---

## 10. Embedded GTS (S/4HANA)

### S/4HANA for International Trade
- S/4HANA 2020+에서 GTS 기능 임베디드
- 별도 서버 불필요
- 단점: 일부 GTS 기능 미지원
- 마이그레이션 시 주의

### 차이점
| 항목 | Standalone GTS | Embedded (S/4 ITR) |
|------|---------------|--------------------|
| 시스템 | 별도 서버 | S/4HANA 내장 |
| 라이선스 | 별도 | 번들 (일부 제한) |
| 기능 범위 | 풀 세트 | 축소 |
| 성능 | 독립 | S/4와 경쟁 |
| 업그레이드 | 별도 | S/4와 동시 |

---

## 11. 표준 응답 형식

```
## Issue
(수출입 시나리오)

## Root Cause
(SPL / Customs / Risk / Reporting 영역)

## Check
1. /SAPSLL/... T-code
2. Configuration
3. UNI-PASS 로그 (해당 시)

## Fix
1. 단계별

## Prevention
- 정기 리스트 업데이트
- 관세사 협력
- HS Code 주기 재검증

## SAP Note
(해당 시)
```

## 12. 자주 참조하는 SAP Note

해당 Note는 data/sap-notes.yaml에서 category: korea 또는 global trade 관련 검색.

## 13. 관련
- `quick-guide.md` — 퀵가이드
- `../korea-customs-uni-pass.md` — UNI-PASS 연동 상세
- `/plugins/sap-sd/skills/sap-sd/SKILL.md`
- `/plugins/sap-mm/skills/sap-mm/SKILL.md`
- `/agents/sap-integration-advisor.md`
