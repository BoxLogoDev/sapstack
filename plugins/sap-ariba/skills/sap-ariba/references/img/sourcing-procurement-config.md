# Ariba Sourcing & Procurement 구성 가이드

## SPRO 경로

Ariba 클라우드 SaaS — SPRO 미해당. 구성 위치:

```
Ariba Administration → Sourcing / Contracts / Procurement
Ariba → Templates (Sourcing Project / Contract Workspace)
Ariba → Approvable / Approval Rules
S/4 연동 부분만: SPRO → Integration with SAP Ariba
```

## 필수 선행 구성

- [ ] CIG 연동 완료 (`cig-integration.md`)
- [ ] Realm 권한 그룹 / 사용자 정의
- [ ] 카테고리 체계 (UNSPSC 또는 커스텀)

## 구성 단계 (Configuration Steps)

### 1. Sourcing Template
1. Administration → Templates → Sourcing Project template
2. RFI/RFP/RFQ/Auction phase 정의
3. Team roles / approval task
4. Scoring & award scenario

### 2. Contract Workspace Template
1. Contract template + clause library
2. Redline / version / e-signature
3. 갱신(renewal) 알림 + 만료 워크플로

### 3. Procurement (Guided Buying / Catalog)
1. Catalog (punchout / CIF / hosted) 등록
2. Guided Buying landing page / policy
3. PR → approval → PO 흐름

### 4. Approval Rules
1. Approvable별 approval rule (금액 임계 / 카테고리 / 조직)
2. Approver delegation (부재 시 위임)
3. 조직 변경 시 approver 자동 갱신 규칙

## 구성 검증 (Verification)

- [ ] Sourcing 이벤트 생성 → 공급사 초대 → 응찰 → 낙찰 end-to-end
- [ ] Contract 생성 → redline → 승인 → catalog 등록
- [ ] PR 생성 → approval rule 정상 라우팅 → PO 생성
- [ ] Delegation: 부재 approver 위임 동작
- [ ] S/4 연동: 낙찰/계약 결과가 S/4 PO로 전달

## 한국 현장 체크

- 한국 결재선(전결규정)이 approval rule에 정확히 매핑됐는지
- 공공 입찰(나라장터)은 Ariba 범위 밖 — 민간 조달만
- 글로벌 그룹 공통 카탈로그/계약 + 한국 자회사 활용 구조

## 자주 마주치는 이슈

| 증상 | 1차 확인 |
|---|---|
| PR 승인 멈춤 | delegation / 조직변경 approver / rule 조건 |
| 공급사 RFx 미수신 | ANID / onboarding / Trading Relationship |
