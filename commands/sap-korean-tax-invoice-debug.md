---
description: 한국 전자세금계산서(e-Tax Invoice) 연동 오류 체계적 진단. SAP DRC / 이카운트 / 비즈플레이 / SmartBill / 더존 통합 시나리오. STRUST 공인인증서, 국세청 API, 승인번호 연계 등.
argument-hint: [오류 유형: issuing|receiving|reversal]
---

# 전자세금계산서 디버그 파이프라인

입력: `$ARGUMENTS`

## 🎯 목표
한국 전자세금계산서 발행·수취·역발행 오류를 체계적으로 진단합니다. **한국 부가가치세법** 및 **국세청 국세청 홈택스 연계** 맥락을 포함합니다.

## 🔒 안전 규칙
- **실제 사업자등록번호 추정 금지** — 사용자가 제공
- **공인인증서 경로·비밀번호** 절대 예시로 제시 금지
- 운영 환경 STRUST 변경은 Transport 경유

---

## Step 1. 증상 분류

질문:
1. **오류 단계**:
   - 발행 (Issuing) — VF01 → Provider 전송
   - 수취 (Receiving) — MIRO → 매입 승인번호 연계
   - 역발행 (Reversal) — 반품·수정 전자세금계산서
2. **Provider**: SAP DRC / 이카운트 / 비즈플레이 / SmartBill / 더존 / 커스텀
3. **SAP 릴리스**: ECC / S/4HANA
4. **CVI KR (Country Version Korea)** 활성화 여부

---

## Step 2. 발행 (Issuing) 이슈

### 2-1. VF01 빌링 포스팅 실패
- **SE16N → J_1BNFE**: Brazil-based Korean e-Tax 구조
- **VFBS**: 빌링 포스팅 오류 로그
- 승인번호 필드 누락 → 환경 설정 확인

### 2-2. Provider 전송 실패
- **SMICM → HTTP Log**: 외부 호출 상태
- **SMQ1 / SMQ2**: qRFC 큐 점검
- **SXMB_MONI** (PI/PO 경유 시): 메시지 상태
- **CPI Dashboard** (BTP 경유 시): iFlow 상태

### 2-3. 인증서 (STRUST) 문제
- **STRUST**: SSL Client (Standard) 또는 SSL Client (Anonymous)
- **한국 공인인증서**:
  - 루트 CA: 한국정보인증 / 코스콤 / NICE평가정보
  - 유효기간 확인 (연 1회 갱신)
- **TLS 1.2+** 필수 (KISA 가이드)
- `ssl/ciphersuites` 파라미터 확인

### 2-4. 국세청 API 응답 오류
- 승인번호 반환 없음 → 접수 실패
- 사업자등록번호 불일치
- 품목 코드 규격 오류
- 금액 소수점 오류 (KRW는 0)

---

## Step 3. 수취 (Receiving) 이슈

### 3-1. MIRO 입력 시 승인번호 불일치
- PO 기반 → Info record 세금 설정
- **J_1BNFE** 구조 필수 필드
- 매입 승인번호 = 매출측 발행번호
- 국세청 홈택스 실시간 조회 (on-demand)

### 3-2. 부가세 매입 공제 vs 불공제
- **FTXP**: Tax Code 설정
- 매입세액 공제 대상 여부 (차량·접대비 등 불공제)
- Account Determination (OBYC → VST)

### 3-3. 송장 차단
- MRBR 조회 → 차단 사유
- Amount/Quantity/Price tolerance
- **OMR6**: Tolerance 조정

---

## Step 4. 역발행 (Reversal) 이슈

### 4-1. 수정세금계산서 발행
- 반품 프로세스 (VA01 Return Order + VF01 Credit Memo)
- **원본 승인번호 참조** 필수
- 역발행 사유 코드 (1~6)

### 4-2. 매입자 발행 (한국 특수)
- 매입 기업이 매출 세금계산서를 대신 발행하는 케이스
- 농어민·영세사업자 대상
- 별도 커스텀 구현 필요 (SAP 표준 미지원)

---

## Step 5. 통합 시나리오별 가이드

### 5-1. SAP DRC (Document and Reporting Compliance)
- **S/4HANA 2022+** 네이티브 기능
- **트랜잭션**: DRC_EDOC_COCKPIT
- Configuration: Cockpit → Setup for Korea
- 정부 인증 연결 내장

### 5-2. 3rd-party Provider (이카운트·비즈플레이·SmartBill)
- RFC 또는 REST API 연동
- **SM59**: RFC Destination 확인
- **WE02**: IDoc 기반인 경우 IDoc 상태
- Provider dashboard에서 국세청 전송 상태 확인

### 5-3. 더존 / 커스텀 XI 기반
- **PI/PO iFlow** 또는 **CPI iFlow**
- Message monitoring (SXMB_MONI)
- XML 매핑 오류 추적

---

## Step 6. 법적/규정 체크리스트

### 한국 부가가치세법
- [ ] 발행 기한: **공급 시기 + 다음 달 10일**
- [ ] 의무 대상 확인 (법인 의무, 개인사업자 일정 매출 이상)
- [ ] 가산세 리스크 (미발행·지연발행)

### 국세청 신고
- [ ] **부가세 신고** 분기/반기 — 매출세액·매입세액
- [ ] 홈택스 연계 자동화

### 개인정보보호
- [ ] 사업자등록번호 로그 마스킹 (KISA)
- [ ] 대표자 성명 노출 주의

---

## 📤 출력 형식

```
## 🔍 Issue
- 단계: (발행/수취/역발행)
- Provider:
- 오류 메시지:

## 🧠 Root Cause
1. 
2.

## ✅ Check
1. [T-code] — 
2. [파일/로그] —
3. [외부 시스템] —

## 🛠 Fix
1. 단계별

## 🛡 Prevention
- (SAP 설정 / 프로세스)
- (법적 대응)

## 📖 SAP Note
- 3092819 (Korea CVI KR Roadmap)
- 2844534 (Korea eTax Invoice DRC)
- 2645815 (Korea Withholding Tax)
```

## 🤖 위임
- STRUST 인증서 → `sap-basis-consultant` or `sap-bc`
- FI 계정 결정 → `sap-fi-consultant`
- MIRO 송장 → `sap-mm-consultant`
- RFC/IDoc/CPI → `sap-integration-advisor`

## 참조
- `plugins/sap-bc/skills/sap-bc/SKILL.md` — 한국 특화 Basis
- `plugins/sap-fi/skills/sap-fi/references/ko/SKILL-ko.md` — FI 한국어
- `plugins/sap-mm/skills/sap-mm/references/ko/SKILL-ko.md` — MM 한국어
- `data/sap-notes.yaml` — 한국 특화 Note
