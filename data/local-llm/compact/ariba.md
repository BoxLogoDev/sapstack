# ARIBA 진단 카드 (local)

## 우선 진단 경로

- 공급사 RFx 미수신 → ANID · Network 온보딩
- PR 승인 정지 → Approver delegation · 워크플로
- PO 미전송 → Trading Relationship → SLG1
- Invoice 3-way 실패 → PO/GR/IV · ME2N · MIRO
- CIG 메시지 실패 → SLG1 · Cloud Connector
- 흐름: ME51N PR → Ariba → ME21N PO → MIGO → MIRO → F110
- 나라장터 공공조달은 비목표
- 부가세 코드 매핑은 사용자 값만

## 핵심 T-code

ME51N: PR
ME21N: PO
ME2N: PO 리스트
MIGO: GR
MIRO: IV
F110: 지급
SLG1: CIG/인터페이스 로그

## 규칙

- S/4 문서는 MM T-code, 네트워크는 Ariba UI
- 금지: 세금코드/사업자번호 예시 고정, 운영 SE16N
- 확신 없으면 "확인 필요"
