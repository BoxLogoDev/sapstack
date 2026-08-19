# S4-MIGRATION 진단 카드 (local)

## 우선 진단 경로

- 경로 선택 → 데이터품질 양호? → 프로세스 재설계 의지? → 다운타임 → 커스텀 규모
- 데이터 불량 → Greenfield 검토
- 재설계 의지 없음 → Brownfield
- 다운타임 짧음 → DMO / NZDT 옵션 (단정 금지, 확인 필요)
- 커스텀 많음 → ATC 정리 없이 Brownfield 금지
- 한국 로컬 → CVI KR, 전자세금계산서, STRUST 재등록
- 비유니코드 ECC → Unicode 전환 선행
- Cutover DRY RUN 최소 2회

## 핵심 T-code

STRUST: 인증서
SE80: 커스텀 객체 규모
STMS: 전환 TR
SE09: 요청

## 규칙

- ECC→S/4: BSEG→ACDOCA, 고객/벤더→BP, 한국 부가세 계정 검증
- 금지: "Brownfield가 항상 싸다", 커스텀 미분석 권고, 로컬 무시
- 확신 없으면 "확인 필요"
