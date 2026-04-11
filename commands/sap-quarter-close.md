---
description: SAP 분기 결산 체크리스트. K-IFRS 공시 + 한국 상장사 내부통제(K-SOX) 요구사항 포함. FI/CO/MM 통합 시퀀스로 진행.
argument-hint: [회사코드] [회계연도/분기 (예 2026/Q1)]
---

# SAP 분기 결산 파이프라인

입력: `$ARGUMENTS`

## 🎯 목표
분기 결산을 단계별로 실행하며, K-IFRS 공시와 K-SOX 내부통제 요구사항을 함께 만족시킵니다. 월결산(`/sap-fi-closing`)과 달리 **공시 준비**와 **3개월 누적 조정**이 포함됩니다.

## 🔒 안전 규칙
- 모든 단계는 **Test Run 먼저**
- 실제 포스팅 전 사용자 명시적 승인
- K-SOX — 실행자 ≠ 승인자 로그 필수

---

## Phase 1 — 환경 확인

질문:
1. SAP 릴리스
2. 회사코드 + Controlling Area
3. 분기 대상 (2026/Q1, 2026/Q2 ...)
4. K-IFRS 공시 대상 여부 (상장사)
5. 연결재무제표 통합 대상 여부

---

## Phase 2 — 월결산 선행 완료 검증

3개월 각각 월결산 완료 여부 확인:
- **OB52**: 해당 월 기간 닫힘 상태
- **S_ALR_87012301**: 미처리 전표 조회
- **FBL3N**: 주요 계정 잔액 안정성

미완료 발견 시 → `/sap-fi-closing`로 되돌아가기

---

## Phase 3 — 분기 특화 조정

### 3-1. 외화평가 — 분기 단위
- **FAGL_FC_VAL**: 분기말 환율로 재평가 (월결산 대비 큰 조정)
- Test Run → 결과 검토 → 실행
- 환율 유형: BOK 고시일자 (한국은행)

### 3-2. 자산 감가상각 — 분기 누적 검증
- **AFAB**: 월별 test run 완료된 상태여야 함
- **S_ALR_87011963**: 자산 잔액 분기 대비 검증

### 3-3. GR/IR — 분기 Aging
- **MB5S** (ECC) / GRIR Fiori (S/4)
- 3개월 이상 노후 항목은 수동 처리 판단
- **MR11** Test Run → 청산

### 3-4. Intercompany — 분기 조정
- **F.19**: IC Recon (ECC)
- **FBICR**: IC Recon Reports
- 다수 회사코드 간 불일치 분석

---

## Phase 4 — CO 분기 활동

### 4-1. 배부 사이클
- **KSU5** Assessment 실행 (3개월 모두)
- **KSV5** Distribution 실행
- **KO88** 내부주문 정산 (누적)

### 4-2. 원가 요소 차이 분석
- **KKS1**: Variance 계산
- 분기 대비 비정상 증감 탐지

### 4-3. CO-PA
- **KE30**: 분기 수익성 보고서
- Top-down 배부 (`KEU5` — Costing-based only)

---

## Phase 5 — K-IFRS 공시 준비

### 5-1. 재무상태표 & 손익계산서
- **F.01**: Balance Sheet
- **F.08**: P&L (or S_ALR_87012284)
- **Preview** 단계에서 분개 검증

### 5-2. 주석 공시 항목
- 리스(IFRS 16) — Right-of-use assets
- 금융상품(IFRS 9) — 평가·손상
- 수익(IFRS 15) — Performance obligation
- 법인세(IAS 12) — 이연법인세

### 5-3. 연결재무제표 (해당 시)
- **CX2X**: EC-CS (ECC)
- **S/4 Group Reporting**: 통합 reporting 환경
- 회사 간 내부거래 제거

---

## Phase 6 — K-SOX 내부통제 문서화

### 통제 체크리스트
- [ ] 분기 결산 담당자 서명 + 승인자 서명 (분리)
- [ ] 비정상 증감 분석 보고서
- [ ] 수동 조정 전표 사유서
- [ ] SU53 권한 실패 로그 검토
- [ ] SM21 시스템 로그 이상 여부

### 감사 흔적
- **S_ALR_87012276**: Audit Trail Report
- CHANGEDOCUMENT 테이블 조회
- 분개 승인 워크플로 이력

---

## Phase 7 — 보고 & 공시

1. 대표이사 보고
2. 감사위원회 보고 (상장사)
3. **DART 공시** (상장사) — 분기보고서
4. 연결보고 (그룹사)

---

## 📤 각 Phase 완료 시 출력

```
✅ Phase N 완료
- 수행: (T-code + 결과 요약)
- 이슈: (있다면)
- 승인자: (K-SOX 로그)
- 다음 단계 진행? (yes/no)
```

## 🤖 위임
- 복잡한 FI 이슈 → `sap-fi-consultant`
- CO 배부 문제 → `sap-co-consultant`
- 연결 / IC → `sap-integration-advisor`

## 참조
- `/commands/sap-fi-closing.md` — 월결산 기반
- `/commands/sap-year-end.md` — 연결산 (Q4와 연계)
- `plugins/sap-fi/skills/sap-fi/references/closing-checklist.md`
