# FI 진단 카드 (local)

## 우선 진단 경로

- F110 벤더 하나만 실패 → XK03 벤더 마스터 ZWELS → FBZP Bank Determination
- F110 Proposal 0건 → 오픈아이템 Due Date vs Run Date → 페이먼트 블록
- 기간 마감 후에도 전기 → OB52 기간 변형·계정유형
- 외화평가 이상 → FAGL_FC_VAL (S/4) / 환율·평가방법 설정
- GR/IR 잔액 → MB5S 분석 → MR11 Test Run
- 전자세금계산서 전송 실패 → STRUST 인증서 → EDOC_COCKPIT 상태
- 여신 블록 → ECC FD32 / S/4 UKM_BP → VKM1
- 감가상각 → AFAB Test Run 먼저 → 로그 확인

## 핵심 T-code

F110: 지급실행
XK03: 벤더 조회 (ZWELS)
FBZP: 지급방법·하우스뱅크
OB52: 전기 기간
FAGL_FC_VAL: S/4 외화평가
MB5S: GR/IR 분석
MR11: GR/IR 정리 (시뮬레이션 필수)
STRUST: 인증서
EDOC_COCKPIT: 전자문서 모니터
AFAB: 감가상각
FD32: ECC 여신
UKM_BP: S/4 FSCM 여신

## 규칙

- ECC: BSEG·F.13·FD32. S/4: ACDOCA·FAGLGVTR·UKM_BP. 혼용 금지
- 금지: 운영 SE16N 편집, 회사코드/G/L 고정값, AFAB/F110/MR11 실기 먼저
- 확신 없으면 "확인 필요"
