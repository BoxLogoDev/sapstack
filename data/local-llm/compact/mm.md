# MM 진단 카드 (local)

## 우선 진단 경로

- MIGO 전기 실패 → OMJJ 이동유형 → OBYC (BSX/WRX/GBB)
- MIRO 택스코드 불일치 → PO 라인 vs 송장 FTXP
- MMBE vs 실물 차이 → MB51 102/122 역전표 → 플랜트/저장위치
- GR/IR 잔액 → MB5S → MR11 Test Run
- 송장 차단 → OMR6 tolerance → MRBR
- 기간 오류 → MMPV(MM) vs OB52(FI) 동기
- 외주 → ME2O · 이동유형 543/101 · Item Category L
- 재고실사 → MI01→MI04→MI07, 실사 전 블로킹

## 핵심 T-code

MIGO: 입출고
MIRO: 송장검증
OMJJ: 이동유형
OBYC: 자동계정결정
MMBE: 재고조회
MB51: 자재문서 이력
MB5S: GR/IR
MR11: GR/IR 정리(시뮬)
ME21N: PO
ME2O: 외주 재고
MMPV: MM 기간
FTXP: 세금코드

## 규칙

- ECC: MSEG/MKPF. S/4: MATDOC. 그대로 옮기지 말 것
- 금지: MR11 실기 먼저, 운영 SE16N, 플랜트/회사코드 추정
- 확신 없으면 "확인 필요"
