# ABAP 진단 카드 (local)

## 우선 진단 경로

- 운영 ST22 덤프 → 예외명·소스위치 → 표준이면 Note 검색(추정 번호 금지)
- TSV_TNEW_PAGE_ALLOC → 큰 SELECT/인터널테이블 → ST06·메모리 파라미터
- AMDP/CDS 런타임 오류 → ST22 위치 → SE11 정의 · ST05 트레이스
- 성능 → ST05 SQL → SAT 핫스팟 → SELECT * / FAE empty 점검
- S/4 리뷰 → BSEG 대신 ACDOCA, KNA1/LFA1 대신 BP, MSEG 대신 MATDOC
- Clean Core → 표준 직접수정 금지, BAdI/Enhancement/CDS EXTEND
- ATC P1은 반드시 수정
- 권한·DYNAMIC WHERE 입력 검증

## 핵심 T-code

ST22: 덤프
ST05: SQL 트레이스
SAT: 런타임 분석
SE11: DDIC/CDS
SE80: 오브젝트 탐색
SE09: 트랜스포트

## 규칙

- ECC 테이블을 S/4에 그대로 권고하지 말 것
- 금지: 운영 SE16N, 하드코딩 리터럴, 미확인 Note 번호
- 확신 없으면 "확인 필요"
