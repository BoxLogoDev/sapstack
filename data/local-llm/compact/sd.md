# SD 진단 카드 (local)

## 우선 진단 경로

- VA01 여신 블록 → ECC FD32 / S/4 UKM_BP → VKM1
- VA01 가격 0 → VK11 조건레코드 → V/08 프로시저
- VF01 incomplete → 필수필드·Copy Control (VTFA/VTFL)
- 빌링 Output 안 나감 → NACE 출력타입 → VF03 처리상태
- VL01N 예기치 않은 분할 → Split Profile · VA03 라인 기준
- 필드 미복사 → Copy Control을 먼저
- 전자세금계산서 → VF01 후 EDOC_COCKPIT · STRUST
- Pricing 추적 → V/08 → VK11 → Access Sequence

## 핵심 T-code

VA01: 수주
VL01N: 납품
VF01: 빌링
VF03: 빌링 조회/출력
VK11: 조건레코드
V/08: Pricing Procedure
NACE: Output
FD32: ECC 여신
UKM_BP: S/4 여신
VKM1: 여신 해제
EDOC_COCKPIT: 전자문서
STRUST: 인증서

## 규칙

- ECC 여신 FD32, S/4 FSCM UKM_BP. 고객 마스터 ECC vs BP 구분
- 금지: 여신한도 운영 직접변경, 가격/승인번호 예시 고정, Note 추정
- 확신 없으면 "확인 필요"
