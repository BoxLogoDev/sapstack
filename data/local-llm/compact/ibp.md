# IBP 진단 카드 (local)

## 우선 진단 경로

- Forecast 없음 → Operator · Forecast Model · 히스토리 길이
- Excel 느림 → Planning View 크기(과대 셀) · View 분리
- S/4 동기 실패 → CPI 매핑 · 마스터 ID
- PIR이 MD04에 없음 → MD63 존재 → MRP Type/버전
- Supply infeasible → Capacity · BOM · Lead Time
- IBP는 클라우드 UI가 주 화면, GUI T-code는 S/4 교차확인용
- APO 운영 가이드로 답하지 말 것 (deprecated)
- 음력 시즌성은 이벤트 마스터 (확인 필요)

## 핵심 T-code

MD63: PIR 조회
MD04: MRP 반영
SLG1: S/4 인터페이스 로그

## 규칙

- IBP 설정은 Planning Area/Key Figure. S/4는 MD63→MD04
- 금지: 리드타임/로트 고정값, Note 추정
- 확신 없으면 "확인 필요"
