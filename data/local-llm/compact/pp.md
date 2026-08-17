# PP 진단 카드 (local)

## 우선 진단 경로

- MRP 계획 안 생김 → MD04 → 자재마스터 MRP Type
- COGI backflush 적체 → 확인수량 vs 재고 → OMJJ
- CO11N 확인 실패 → 작업 상태 이미 Confirmed → CO09 ATP
- CS13 BOM 폭발 실패 → CS02 구성요소 존재·유효일
- 능력 초과 → CM25 과부하 구간 → CR01 가용능력
- MRP 이상 → MD04 흐름 → BOM 유효 → Source of Supply
- ECC MRP → MD01 (운영시간 금지). S/4 → MD01N
- PIR 조회 → MD63

## 핵심 T-code

MD04: 재고/소요 리스트
MD01: ECC 전사 MRP
MD01N: S/4 MRP Live
MD63: PIR 조회
CS13: BOM 폭발
CS01: BOM
CO01: 생산오더
CO11N: 확인
CO09: ATP
COGI: 자동 자재이동 오류
CM25: 능력평준화
CR01: 작업장

## 규칙

- ECC MD01 야간. S/4 MD01N HANA. BOM 변경 후 Low-Level Code 재계산
- 금지: 운영시간 MD01, 오더 DB 강제종결, 미확인 Note
- 확신 없으면 "확인 필요"
