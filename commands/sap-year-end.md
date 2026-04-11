---
description: SAP 연결산(연말결산) 파이프라인. 잔액 이월, 자산 연말 마감, 법인세 충당, K-IFRS 공시, K-SOX 감사 대응까지 통합. Q4 분기 결산과 연결.
argument-hint: [회사코드] [회계연도]
---

# SAP 연결산 파이프라인

입력: `$ARGUMENTS`

## 🎯 목표
연말결산을 **7 Phase**로 진행하며, 재무제표 확정·법인세·K-IFRS 공시·외부 감사 대응을 포함합니다. 한국 12월 결산 법인 기준.

## 🔒 안전 규칙
- 모든 단계 **Test Run 우선**
- 연말 실행은 되돌리기 어려우니 백업·승인 필수
- K-SOX + 외부 감사 이중 검증

---

## Phase 1 — 선행 확인 (12월 초~중순)

### 질문
1. SAP 릴리스 + Controlling Area
2. 회사코드 + 회계기준 (K-IFRS / K-GAAP / 다중)
3. 상장사 여부 (DART 공시 대상)
4. 감사법인 (Big 4 또는 중견)
5. 연결재무제표 작성 대상 여부

### 사전 점검
- **OB52**: 12월 기간 정상 오픈
- 11월 분기 결산 완료 여부
- 누적 조정 전표 리스트
- Non-GAAP 조정 내역

---

## Phase 2 — Sub-Ledger 마감 (12월 말)

### 2-1. AP
- **F110** 12월 지급 완료
- **F-44** 수동 청산 필요 건
- **FBL1N**: Vendor Open Items 최종 점검

### 2-2. AR
- **F150** 최종 독촉
- **FBL5N**: Customer Open Items
- 의심채권 — 충당금 추산 준비

### 2-3. AA (자산)
- **AFAB** 12월 감가상각 — **Test Run 필수**
- 자본화 대기 AuC 전환
- **AJAB** 실행 전 감가상각 완료 확인
- 자산 실사 (연 1회 필수)

### 2-4. MM
- **MMPV**: 12월 기간 닫기
- **MI01~MI07**: 재고 실사 (연 1회 필수)
- **MR11**: GR/IR 청소
- **MB52**: 기말 재고 검증

### 2-5. CO
- **KSU5** / **KSV5** 연말 배부
- **KO88** 내부주문 정산 (누적)
- **CKMLCP** (S/4): Actual Costing Run
- **KKS1**: Variance 계산

---

## Phase 3 — GL 연말 조정

### 3-1. 외화평가 (연말 환율)
- **FAGL_FC_VAL**: 연말 환율로 재평가
- 연중 가장 큰 외화 조정 발생
- 한국은행 연말 환율 기준

### 3-2. 계정 재분류
- 장기 → 단기 부채 재분류
- Deferred/Prepaid 재분류
- 수동 조정 전표 (FB50)

### 3-3. Accrual 반영
- 연말 accrual — **FBS1**
- 차년도 첫 달 자동 역분개 — **F.81**
- 예시: 미지급 이자, 미지급 급여, 선수금

### 3-4. 이연법인세 (IFRS IAS 12)
- 임시차이 계산
- 이연법인세자산/부채 인식
- 사용가능성 평가

### 3-5. 법인세 충당 (한국)
- 법인세율 적용
- 과세표준 확정
- 추가납부/환급 구분

---

## Phase 4 — 자산회계 연말 마감

### 4-1. AJAB — 자산회계 연말 마감
- 닫힌 연도 추가 포스팅 차단
- **Test Run** 필수
- 오류 시 되돌리기 복잡

### 4-2. AJRW — 새 회계연도 열기
- 필수 — 차년도 포스팅 전
- Parallel ledger 별도 실행

---

## Phase 5 — 잔액 이월

### 5-1. Balance Carry Forward
- **ECC**: **F.16** (Retained Earnings)
- **S/4**: **FAGLGVTR** (Universal Journal)
- 이익잉여금 계정으로 P&L 이월

### 5-2. CO Carry Forward
- **KEYT**: CCA carry forward
- **2KET**: PCA carry forward
- Secondary Cost Element 잔액

---

## Phase 6 — 재무제표 확정 & 공시

### 6-1. Preview & 검증
- **F.01**: 재무상태표
- **F.08** or **S_ALR_87012284**: 손익계산서
- 전기 대비 분석
- Non-recurring items 분리

### 6-2. 감사 지원
- 감사법인 data provision (ISAE 3402)
- 조정 전표 사유서
- 시산표 (**F.08**) 주기별 비교
- Transaction sample pull

### 6-3. 공시 준비 (상장사)
- **DART 사업보고서** (3월 말 제출)
- 감사보고서 첨부
- 내부회계관리제도 평가 보고서 (K-SOX)
- 연결재무제표 (그룹사)

### 6-4. 연결 (Group Consolidation)
- **ECC**: EC-CS (CX2X)
- **S/4**: Group Reporting
- 회사 간 내부거래 제거
- 환산 조정 (외화 자회사)

---

## Phase 7 — K-SOX 감사 대응

### 내부통제 평가
- 주요 통제 설계·운영 효과성
- 감사위원회 보고서
- 경영진 확인서 (CEO·CFO)

### 외부 감사 (Big 4)
- PBC 리스트 제공
- Walkthrough 지원
- Control testing sample
- Management letter 대응

### 감사 흔적
- **S_ALR_87012276**: Audit Trail
- CHANGEDOCUMENT 분석
- SU53 권한 실패 로그

---

## 📤 각 Phase 완료 시 출력

```
✅ Phase N 완료
- 수행: 
- 이슈:
- 승인자 (K-SOX):
- 감사 대응 문서 업데이트 여부:
- 다음 단계 진행? (yes/no)
```

## 🤖 위임
- 복잡 FI 이슈 → `sap-fi-consultant`
- CO 원가 조정 → `sap-co-consultant`
- 자산 전문 → `sap-fi-consultant` (AA)
- 감사 대응 ABAP 추적 → `sap-abap-reviewer`

## 참조
- `/commands/sap-fi-closing.md` — 월결산
- `/commands/sap-quarter-close.md` — 분기 결산
- `plugins/sap-fi/skills/sap-fi/references/closing-checklist.md`
- `plugins/sap-fi/skills/sap-fi/references/ko/SKILL-ko.md`
