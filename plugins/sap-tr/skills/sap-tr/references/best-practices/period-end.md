# TR 기간마감 (Tier 2) Best Practice

## 적용 범위
- **ECC**: ✓  
- **S/4 HANA**: ✓  
- **한국 특화**: ✓ (KRW/USD/JPY 외화, 은행 대사)

---

## TR 기간마감 절차 (Treasury Period-End Close)

### 📋 Pre-Close 체크 (T-3 ~ T-1일)

#### 은행명세서 최종 수신 및 매칭
- [ ] **T-code FF_5 — Bank Statement Final Processing**
  - 목표: 월말 공식 명세서 수신 및 완전 매칭
  - 담당: 은행/현금담당자
  - 절차:
    1. 월말(T-1일) 오후 또는 T일 오전에 은행 최종 명세서 수신
    2. T-code FF_5로 로드 및 자동 매칭
    3. 미매칭 항목 조사:
       - 부도수표 (미수취 항목)
       - 은행 수수료 (미계산 항목)
       - 시차 거래 (계정에 기록되었으나 은행 미도착)
    4. 100% 매칭 또는 명확한 설명 기록

#### 미지급 지급 확인
- [ ] **T-code F110 또는 FTVD — Outstanding Payment Check**
  - 미지급 상태 지급(예: 수표 미발행, 계좌이체 미실행) 확인
  - 담당: 지급담당자
  - 액션: 월말 T일 폐장 전 모든 지급 완료 또는 예약 설정

#### 미처리 반품 확인
- [ ] **T-code SD 또는 TR 관련 — Return/Reversal 확인**
  - 월내 발생 환불 항목(고객 환원, 공급업체 반품) 처리 완료 여부
  - 담당: 판매/구매 담당자

#### 차입금/예치금 잔액 확인
- [ ] **T-code FF_8 — Loan & Investment Position**
  - 차입금 월말 잔액 및 이자 누적액
  - 정기예금/CP 만기 또는 연장 여부 확인
  - 담당: 재정담당자
  - 문서: 차입/예치 월말 현황표

#### 외화 포지션 및 환율 확인
- [ ] **T-code FCM5 — Foreign Currency Position**
  - 월말 환율(기준: 한국은행 기준율)로 외화자산/채무 최종 평가
  - 미사결 거래별 순 포지션 확인 (예: USD +100만, EUR -50만)
  - 담당: 재정담당자
  - 주의: 환율 입력(T-code OB08)은 FI에서 처리하나, TR도 동기화 필수

### 🔄 Close 실행 단계 (T일)

#### Step 1: 은행 Reconciliation 최종
- [ ] **T-code FF_5 — Bank Reconciliation Final**
  - 모든 항목 매칭 완료 또는 설명 완료 상태
  - Reconciliation Report 출력/저장
  - 담당: 은행/현금담당자

#### Step 2: 유동성 현황 최종 검증
- [ ] **T-code FF7A — Cash Position Final Verification**
  - 월말 현금 잔액 확정
  - 통화별 잔액 정리
  - 담당: 자금담당자

#### Step 3: 월말 이자 계산
- [ ] **T-code FF_8 또는 수동 — Monthly Interest Accrual**
  - 차입금 이자 계산(일당 계산):
    - 공식: 잔액 × 연이율 ÷ 365 × 일수
  - 정기예금 이자 계산 및 입금 확인
  - 담당: 재정담당자
  - 결과: 이자 전표 생성(자동 또는 수동 FB50/FB60)

#### Step 4: 환차손익 계산 및 적립
- [ ] **T-code FAGL_FC_VAL 또는 TR 환평가 — Foreign Exchange Revaluation**
  - 미사결 외화채권/채무를 월말 환율로 재평가
  - 환차이익/손실 계산 및 전표 생성
  - 담당: 재정담당자
  - 주의: FI의 FAGL_FC_VAL과 동기화하여 이중 계산 방지

#### Step 5: 기간 마감
- [ ] **T-code OKP1 또는 TR 기간 설정 — Close Period**
  - TR 자금 관리 기간 상태를 "폐기" 또는 "잠금"
  - FI 기간마감(OB52)과 동기화
  - 담당: 마스터데이터 관리자 또는 재정담당자

### ✅ Post-Close 검증 (T+1 ~ T+3일)

#### 은행 Reconciliation Report 검증
- [ ] **T-code FF_5 — Reconciliation Report Review**
  - 미매칭 항목 없는지 최종 확인
  - 모든 미수취 항목(부도수표 등) 명확히 표시
  - 담당: 재정담당자 (은행담당자가 아닌 독립적 검증)

#### 유동성 보고서 발행
- [ ] **T-code FF7A + 경영 리포트 — Liquidity Report**
  - 월말 현금 유지 수준 리포트
  - 당월 평균 vs 목표 대비율
  - 당월 환차손익 결과
  - 담당: 재정담당자 / CFO
  - 배포: 경영진

#### 은행 Statement 대사
- [ ] **수동 또는 T-code FF_5 — Statement Verification**
  - SAP 현금잔액 vs 은행 잔액 최종 대사
  - 불일치 원인 설명(예: 미수취 수표, 미입금 계좌이체)
  - 담당: 은행담당자
  - 문서: 은행 대사 보고서

#### 미지급액 정리
- [ ] **T-code F110 — Outstanding Payment Finalization**
  - 월말 이후 발생 지급 건 처리 여부 확인
  - 예약된 지급이 실제 실행되었는지 검증
  - 담당: 지급담당자

---

## TR 기간마감 체크리스트 (타임라인)

| 일정 | Task | T-code | Owner | 완료 |
|------|------|--------|-------|------|
| T-3 | 미처리 반품 확인 | SD/TR | 판매/구매 | ☐ |
| T-2 | 차입금/예치금 확인 | FF_8 | 재정담당 | ☐ |
| T-1 | 은행명세서 최종 수신 + 매칭 | FF_5 | 은행담당 | ☐ |
| T-1 | 외화 포지션 확인 | FCM5 | 재정담당 | ☐ |
| **T** | **은행 대사 → 현금포지션 → 이자계산 → 환평가 → 기간마감** | **FF_5→FF7A→FF_8→FAGL_FC_VAL→OKP1** | **팀장** | **☐** |
| T+1 | 은행 Reconciliation Report 검증 | FF_5 | 재정담당 | ☐ |
| T+2 | 유동성 보고서 발행 | FF7A | CFO | ☐ |
| T+3 | 미지급액 정리 최종확인 | F110 | 지급담당 | ☐ |

---

## 주요 위험 시나리오

| 시나리오 | 원인 | 대응 액션 | 심각도 |
|---------|------|---------|--------|
| 은행 잔액과 SAP 불일치 | 미매칭 항목 미처리 | FF_5 재검증 + 설명 기록 | 🔴 Critical |
| 미지급 지급 월 이월 | 월말 폐장 전 미실행 | 익월 우선 지급 또는 연체료 관리 | 🔴 Critical |
| 이자 미계산 반영 안됨 | FF_8 오류 또는 수동 누락 | 익월 조정전표(조정 FI) | 🟠 High |
| 환차손익 중복 계산 | FI/TR 동기화 오류 | FAGL_FC_VAL 확인 + 중복 제거 | 🔴 Critical |
| 기간 잠금 후 필수 거래 발견 | 기간 설정 조기 실행 | 특별기간(00) 활성화 또는 기간 재개방 | 🔴 Critical |

---

## S/4 HANA 특수 고려사항

- **Treasury & Risk Management (TRM)**: 
  - 새로운 TR 통합 모듈, 자금 포지션 실시간 업데이트
  - 환율 변동 자동 감지 및 헤징 제안

- **Cash Position Integration**:
  - FI GL ↔ TR Cash Position 자동 동기화
  - 대사 작업량 대폭 감소

---

## 참고 및 관련 규정

- **은행 대사 정책**: 월말 T+3일 이내 완료
- **감사**: 월별 Reconciliation Report 보관(7년)
- **외감**: 분기별 차입금/예치금 내역서 제출

---

**Last Updated**: 2026-04-12  
**Version**: 1.0.0  
**Owner**: Treasury Closing Team
