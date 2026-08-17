# CO 진단 카드 (local)

## 우선 진단 경로

- KSU5 배부 실패 → 사이클 Sender/Receiver vs 실제 코스트 센터(KS01)
- KO88 정산 실패 → 오더 상태·정산규칙 존재 여부
- 전기 시 cost element 없음 → ECC KA01 / S/4 FS00 계정유형 → OKB9
- CO-PA vs FI 금액 차이 → KE30 → KEI1 가치필드 매핑 → KEPM 평가
- 표준원가 이슈 → CK11N 추정 → CK24 Price Update 타이밍
- 기간 잠금 후 전기 불가 → 해당 연도·기간·CO 모듈 잠금 확인
- 배부 전 → KSU5/KSV5 Test Run 필수
- PCA 조회 → ECC KE51+별도원장 / S/4 Universal Journal 필수

## 핵심 T-code

KSU5: Assessment
KSV5: Distribution
KS01: 코스트 센터
KO88: 내부오더 정산
KA01: ECC 원가요소
FS00: S/4 G/L=원가요소
OKB9: 자동 계정배정
CK11N: Cost Estimate
CK24: Price Update
KE30: CO-PA 보고서
KEI1: 원가요소→가치필드
KEPM: CO-PA 계획·평가

## 규칙

- ECC: KA01·COEP·Costing-based CO-PA. S/4: FS00·ACDOCA·Account-based·ML 필수
- 금지: 원가요소/G/L 고정값, KSU5 Test Run 생략, CK24 즉시 운영 반영
- 확신 없으면 "확인 필요"
