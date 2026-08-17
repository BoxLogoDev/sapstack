# EWM 진단 카드 (local)

## 우선 진단 경로

- Wave 릴리스 실패 → /SCWM/MON 가용재고 · template/cutoff
- 적치 빈이 이상함 → putaway 전략 /SCWM/MON
- RF 스캔 불일치 → 바코드 vs 자재
- EWM vs ERP 재고 차이 → 실사 후 동기화
- ECC WM TO confirm 실패 → LS24 원본 빈 quant → LT06
- 배포가 ECC WM인지 S/4 EWM인지 먼저
- WM→EWM 전환 후 레거시 TO와 창고오더 혼용 금지
- PI 불일치 즉시 조사

## 핵심 T-code

/SCWM/MON: EWM 모니터
/SCWM/WAVE: Wave
LT01: ECC WM TO 생성
LT06: 자재문서 TO
LS24: 빈/quant 재고

## 규칙

- EWM은 ECC에 없음. WM은 S/4에서 deprecated
- 금지: 운영 SE16N, 창고/플랜트 코드 추정
- 확신 없으면 "확인 필요"
