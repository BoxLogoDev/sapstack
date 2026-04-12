# 시나리오 3 — AFAB 감가상각 실행 중 ABAP 덤프

## 🎬 상황
월결산 중 AFAB 실행 → `DBIF_RSQL_SQL_ERROR` 덤프 발생. S/4HANA 2023, HANA DB. 재실행해도 같은 에러.

## 💬 사용자 질문
```
AFAB test run에서 DBIF_RSQL_SQL_ERROR 덤프가 납니다.
회사코드 전체 자산 감가상각인데 특정 자산만 문제인 것 같아요.
```

## 🤖 추천 위임
**2개 에이전트 병렬**:
- `sap-basis-consultant` — 덤프 분석 레이어
- `sap-fi-consultant` — AFAB 설정 레이어

또는 명시적:
```
ST22로 덤프를 읽고 원인을 식별해줘. sap-basis-consultant 플로우 사용.
```

### 체계적 진단

```markdown
## 🔍 Issue
AFAB Test Run 중 DBIF_RSQL_SQL_ERROR — 대상 자산 접근 실패

## 🧠 Root Cause
1. **HANA plan cache 오염** (자주 발생) — 동일 SQL이 갑자기 실패
2. **특정 자산 데이터 불일치** — ANLA/ANLB 참조 끊김
3. **Index 문제** — 자산 테이블 index 재구성 필요
4. **Parallel ledger** (S/4) — ACDOCA 불일치

## ✅ Check
1. **ST22 → 덤프 선택**
   - Source position (ABAP 라인)
   - SQL 문
   - 어떤 자산 번호에서 실패?
2. **ST05** — AFAB 재실행 중 SQL trace (Test Run만)
3. **SE16 → ANLA**: 문제 자산의 마스터
4. **SE16 → ANLB**: Depreciation area 존재 여부
5. **FAA_CMP_LEDGER**: Ledger 일관성 (S/4)

## 🛠 Fix
### Case A: HANA plan cache
```
ALTER SYSTEM CLEAR SQL PLAN CACHE
```
→ Basis팀 지원 필요 (DB 권한)

### Case B: 문제 자산 격리
1. AFAB → "Restrict" → 문제 자산만 제외
2. 나머지 자산 먼저 감가상각
3. 문제 자산은 **AW01N**로 개별 조사
4. Data 불일치면 **AFBN** (Depreciation area 추가) 또는 수동 조정

### Case C: Parallel Ledger 불일치
1. FAA_CMP_LEDGER 리포트 실행
2. 불일치 항목 확인
3. 조정 가이드: SAP Note 2165213

## 🛡 Prevention
- 월결산 전 **sandbox test run** (PRD 영향 전에 조기 탐지)
- Asset 자동 검증 배치 job
- HANA statistics refresh 스케줄

## 📖 SAP Note
- **1785535** — ST22 Dump Analysis Best Practices
- **1835730** — DBIF_RSQL_SQL_ERROR HANA Specific
- **2165213** — Asset Accounting S/4 New Implementation
- **2327584** — DBIF_RSQL_SQL_ERROR Root Cause Analysis
```

## 📚 배운 것
- **덤프는 Basis가 아닌 Application 문제일 수 있음** — 계층 넘어 진단
- **Test Run의 가치** — 운영 데이터 영향 없이 진단 반복 가능
- **SAP Note 데이터셋** 여러 Note가 매칭 — `./scripts/resolve-note.sh` 활용
- **병렬 에이전트 위임** — 한 이슈에 여러 관점 동시 분석

## 🔗 관련
- `/agents/sap-basis-consultant.md` — 덤프 분석 플로우
- `/agents/sap-fi-consultant.md` — AFAB 전용
- `data/sap-notes.yaml` — dump 카테고리
