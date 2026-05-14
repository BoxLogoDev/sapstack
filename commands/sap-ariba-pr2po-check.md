---
name: sap-ariba-pr2po-check
description: Ariba PR-to-PO 흐름 점검 — Approval workflow + CIG 통합 + S/4 PO 변환
allowed-tools: Read, Grep, Glob
---

# /sap-ariba-pr2po-check — Ariba PR-to-PO 흐름 진단

## 사용 시점
- PR 승인이 stuck (며칠 대기)
- PR → PO 자동 변환 실패
- 공급사 PO 받지 못함
- Approval workflow 변경 후 검증

## 체크 단계

### Stage 1: PR (Ariba Buying)
- [ ] PR 생성 권한 (Requester role)
- [ ] Cost Center / Project / WBS 마스터 매핑
- [ ] Catalog 또는 Free-text 선택
- [ ] PR Header에 commodity code

### Stage 2: Approval Workflow
- [ ] Approver assignment (rule + delegation)
- [ ] SoD 위반 없는지 (자기 PR 자기 승인 금지)
- [ ] 부서 변경/휴가/퇴사 대응
- [ ] Notification 정상 전송

### Stage 3: PR → PO 변환
- [ ] Auto-Convert 활성?
- [ ] Sourcing event 연계 (전략 카테고리)
- [ ] Contract 확정 (있을 경우)
- [ ] Vendor selection (catalog/preferred/sourcing)

### Stage 4: CIG → S/4 PO 생성
- [ ] CIG Worker 상태 (Cloud Connector)
- [ ] S/4 ME21N 호출 정상
- [ ] PO Type / Document Type 매핑
- [ ] Account Assignment 정상
- [ ] 부가세 코드 매핑

### Stage 5: PO 전송 (Network)
- [ ] 공급사 Trading Relationship 활성
- [ ] 전송 방법 (Network / cXML / Email)
- [ ] 공급사 Network 로그인 확인
- [ ] PO 확인 응답 받음 (PO Confirmation)

## 흔한 원인

| 단계 | 원인 |
|---|---|
| Approval stuck | Delegate 미설정·휴가 |
| Conversion fail | Catalog 비활성 / 단가 불일치 |
| CIG 실패 | 마스터 매핑 / Cloud Connector |
| 공급사 미수신 | Trading Relationship / Network 미등록 |

## Output (Evidence Loop 패턴)

PR ID + 의심 단계 명시 → /sap-session-start로 본격 진단.

## 참조
- `plugins/sap-ariba/skills/sap-ariba/SKILL.md`
- `agents/sap-ariba-consultant.md`
