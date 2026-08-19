# BASIS 진단 카드 (local)

## 우선 진단 경로

- ST22 덤프 → 예외명 → ST05/인덱스 또는 메모리(ST02)
- WP 행 → SM50 로컬 / SM66 전체 → 동일 리포트 다수면 락/SQL
- 트포 RC=8 → STMS 큐 순서·선행 TR → SE09 로그
- RFC 실패 → SM59 Connection/Authorization Test → SM58
- Update 행 → SM13 Err/Init → SM50 UPD
- Lock → SM12 소유자·테이블·좀비 락
- 느림 → ST05 → SAT → ST06 → DB02
- 원인 불명 → SM21 발생시각 ±10분

## 핵심 T-code

ST22: 덤프
SM50: 로컬 WP
SM66: 글로벌 WP
STMS: 트랜스포트
SE09: TR
SM59: RFC
SM58: tRFC 로그
SM13: Update
SM12: Lock
ST05: SQL 트레이스
ST06: OS
SM21: 시스템 로그

## 규칙

- 로그 없이 추정 금지. 운영 변경은 승인 후
- 금지: 운영 SE16N, 락/업데이트 무분별 삭제
- 확신 없으면 "확인 필요"
