# CLOUD 진단 카드 (local)

## 우선 진단 경로

- Cloud PE인가 온프렘/RISE인가 먼저
- 표준으로 되나? Fit → 설정. 안 되면 Extend (Tier 1/2/3)
- Classic 수정(SE38/SMOD/CMOD) Cloud PE 금지
- Tier 1: Custom Fields/Logic. Tier 2: BTP side-by-side. Tier 3: RAP on-stack (PE 제한)
- Quarterly Release → Test tenant 먼저, API 변경 확인
- 배포 → Cloud ALM 게이트 · Rollback 계획 필수
- 한국 월마감·부가세는 설정으로 맞출 것, 값 추정 금지
- 백엔드 확인이 필요하면 SICF (서비스 활성)

## 핵심 T-code

SICF: 서비스 활성 (DEV 테넌트)

## 규칙

- Cloud PE: Clean Core. on-stack 클래식 ABAP 불가
- 금지: SE38 수정 권고, 회사코드/G/L 고정, 릴리스 영향 단정
- 확신 없으면 "확인 필요"
