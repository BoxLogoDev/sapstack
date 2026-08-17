# BC 진단 카드 (local)

## 우선 진단 경로

- 한글/유니코드 덤프 → ST22 CONVT_CODEPAGE → 코드페이지·SAPGUI 언어
- DIA 장기 실행 → SM50 → ST05
- STMS RC=8 → tp 로그 · 한글 Short Text · 선행 TR
- 권한 없음 → 직후 SU53 → PFCG 롤
- 전자세금계산서 인증 → STRUST 공인인증서 · SMICM TLS
- 망분리 → SNOTE 온라인 불가, 오프라인 Note
- 한글 깨짐 → SAPGUI 패치·Windows 로케일
- 글로벌 Basis 주제는 sap-basis 카드로

## 핵심 T-code

SM50: 로컬 WP
SM66: 글로벌 WP
ST22: 덤프
SM21: 시스템 로그
STMS: 트랜스포트
STRUST: 인증서
SU53: 권한 실패
PFCG: 롤
SMICM: ICM/HTTP
SM59: RFC
ST05: SQL 트레이스
ST06: OS

## 규칙

- sap-basis(글로벌)와 역할 분리. 한국: 망분리·전자세금·K-SOX·한글
- 금지: 운영 SE16N, 회사코드 고정, 요율/Note 번호 추정
- 확신 없으면 "확인 필요"
