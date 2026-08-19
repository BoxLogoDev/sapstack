# SAC 진단 카드 (local)

## 우선 진단 경로

- Story 비어있음 → 권한 · 모델 sharing · Filter
- Live 연결 실패 → SICF InA/OData → SAML2 신뢰 → Cloud Connector
- Import 스케줄 실패 → DPA/연결 상태 (확인 필요)
- Planning 입력 잠김 → Version lock · Write 권한
- Smart Predict 부정확 → 학습기간·outlier (확인 필요)
- Story 느림 → 집계/필터 · RSRT 백엔드 쿼리
- S/4 숫자 불일치 → Live vs Import · 통화/FYV
- 망분리면 Private/온프렘 경로 질문

## 핵심 T-code

SICF: InA/OData 노드
SAML2: 신뢰/메타데이터
SLG1: CDS 인증 로그
RSRT: 쿼리 실행
STRUST: 인증서

## 규칙

- Live는 S/4 서비스 활성이 전제. Import는 스케줄/에이전트
- 금지: 회사코드 고정, 운영 SE16N, Note 추정
- 확신 없으면 "확인 필요"
