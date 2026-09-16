# 변경 요청서(Change Requests) — Azure DevOps Boards 운영 런북

> 대상: LS ITC 개발팀·DevOps 조직 관리자, 해외 법인 IT. 앱 사용자 관점은 [docs/en/us-pilot-runbook.md](en/us-pilot-runbook.md) §11.
> 결정 배경: [decisions/active/2026-09-16-change-requests-document-only.md](../decisions/active/2026-09-16-change-requests-document-only.md). 로그인 전제: [entra-signin.md](entra-signin.md).

## 무엇을 하는가

- 현업이 CBO 설명(예 "What does ZFI0171 do?")을 읽고 수정이 필요하다고 판단하면 답 아래 **"Request a change to this program"** 을 누른다.
- 앱은 대화에서 **마지막 질문·최종 답·Z/Y 오브젝트·활성 스냅샷의 SID** 로 요청서 초안을 채우고, 사용자는 제목·기대 동작·우선순위(1~4)·대화 전문 첨부(기본 꺼짐)만 손본다. 미리보기가 곧 전송 본문이다.
- 전송은 **요청자 본인의 Entra 토큰**으로 LS ITC Azure DevOps 프로젝트에 작업 항목(`Issue`)을 만든다. `System.CreatedBy` 가 요청자라서 "내 요청" 은 `@Me` 쿼리로 나오고, 상태 변경 알림도 요청자에게 간다.
- **문서만** 만든다. AI diff 없음, SAP 쓰기 없음. 운송 필요 여부·리뷰어·롤백 계획은 LS ITC 개발자가 판단해 작업 항목에 적는다(설명 꼬리에 `transport_required · reviewer_required · rollback_plan` 자리).
- 네트워크 전에 `~/.sapstack/change-requests/{id}.json` 로컬 큐에 먼저 쓴다. 실패한 초안은 **설정 › 변경 요청** 에서 재시도/폐기. 폐쇄망(`air_gapped`)·미로그인·설정 없음이면 버튼이 뜨지 않는다.
- 관리자 대시보드·메일·Teams 알림은 **Azure DevOps 내장 기능**을 쓴다. 앱이 운영하는 서버는 없다.

## LS ITC IT 전제 (코드 아님)

| # | 항목 | 값 |
|---|---|---|
| 1 | ADO 조직 | 예 `https://dev.azure.com/lsitc`, LS ITC Entra 테넌트에 연결. Organization settings › Policies › **External guest access = On** |
| 2 | 프로젝트 | `SAP-Change-Requests`, 프로세스 **Basic**(`Issue`: To Do / Doing / Done). 운송형 상태(Waiting transport / In QAS / Released)를 원하면 상속 프로세스(Project Collection Administrator 권한). 앱은 `workItemType` 이름만 안다 |
| 3 | Area path | `SAP-Change-Requests\LSMtron-USA` — 법인마다 하나 추가 |
| 4 | 태그 사전 생성 | `sapstack`, `LSMtron-USA`, `SID-DS4`, `SID-QS4`, `SID-PS4`. **Stakeholder 는 새 태그를 만들 수 없다** → 앱은 이 집합만 쓴다(태그가 없으면 400) |
| 5 | 사용자 권한 | 해외 요청자: B2B 게스트([entra-signin.md](entra-signin.md) ⑤) → ADO 조직 **Stakeholder(무료)** + 프로젝트 **Contributors**. LS ITC 개발·관리자: Basic |
| 6 | 앱 등록 권한 | Entra 앱 등록에 **Azure DevOps › user_impersonation** 위임 권한 + 관리자 동의(리소스 `499b84ac-1321-427f-aa17-267ca6975798`). 사용자는 재로그인 없이 기존 리프레시 토큰으로 발급받는다 |
| 7 | 알림 | 프로젝트 구독 "Work item created"(Area under `LSMtron-USA` → 개발 DL 메일). 팀 구독 "Work item state changed" → 역할 **Created by**(요청자 메일). Teams: 개발 채널에 **Azure Boards 앱** 설치 후 `@Azure Boards subscriptions` 로 created / state-changed 구독 |
| 8 | 대시보드 | 프로젝트 대시보드 "SAP Change Requests": 쿼리 타일(area × state), Chart for work items(State), 쿼리 "14일 초과 미완료"(`[System.State] <> 'Done' AND [System.CreatedDate] < @Today - 14`) |

## 킷 설정 (`provision.yaml`)

```yaml
changeRequests:
  provider: azure_devops
  orgUrl: https://dev.azure.com/lsitc
  project: SAP-Change-Requests
  # workItemType: Issue                     # 기본 Issue
  areaPath: SAP-Change-Requests\LSMtron-USA
  entityTag: LSMtron-USA                    # 4번 태그와 정확히 일치
```

`~/.sapstack/config.yaml` 의 `change_requests`(snake_case)로 시딩되며 환경 재설정에도 보존된다. `auth:` 블록 없이는 토큰이 없어 동작하지 않는다.

## 앱이 부르는 REST (참고)

| 순서 | 호출 | 비고 |
|---|---|---|
| ① 첨부(옵션) | `POST {org}/{project}/_apis/wit/attachments?fileName=conversation.md&api-version=7.1` | 대화 전문 Markdown. 사용자가 켠 경우만 |
| ② 생성 | `POST {org}/{project}/_apis/wit/workitems/$Issue?api-version=7.1` (json-patch) | Title `[SAP CR][DS4] …`(≤255), Description Markdown(`/multilineFieldsFormat/System.Description`), AreaPath, Tags, Priority, 첨부 relation. Markdown 이 400 이면 `<pre>` HTML 로 1회 재시도 |
| ③ 내 요청 | `POST …/_apis/wit/wiql?api-version=7.1&$top=50` → `GET …/_apis/wit/workitems?ids=…&fields=Id,Title,State,ChangedDate,AssignedTo` | WIQL 은 `@Me AND @project AND Tags CONTAINS 'sapstack'` 고정. 사용자 입력 비삽입 |

타임아웃 15초, 전역 `fetch`(앱 프록시 설정 적용). 401/403 → "LS ITC DevOps 프로젝트 멤버가 아님 — 관리자 문의" + 큐 유지. 400 `TF…` → 서버 메시지 그대로(태그·area·WIT 설정 오류).

## 스모크 (게스트 1명으로)

1. 게스트 계정으로 앱 로그인 → CBO 질문 → 답 아래 버튼 표시(설정·로그인·CBO 대화 셋 다 충족해야 뜬다)
2. 대화상자에서 기대 동작 입력 → 전송 → 토스트 "변경 요청 #N" → **Open in Azure Boards** 로 `System.CreatedBy` = 게스트 확인
3. 개발 DL 메일·Teams 게시 확인 → 설정 › 변경 요청 › 내 요청에 표시 → 상태 Doing 으로 바꾸면 요청자 메일 수신
4. 네트워크 끊고 전송 → "초안 저장" 토스트 → 설정에서 재시도 성공
5. 미확인 항목: Stakeholder 의 첨부 업로드 권한(막히면 첨부 옵션을 끄거나 Basic 부여), 게스트의 `@Me` 매칭, 조건부 접근이 게스트의 DevOps 토큰 무소음 발급을 허용하는지

## 폴백 — B2B 게스트가 거부될 때

LS ITC IT 가 해외 법인 게스트를 받지 않으면 앱은 그대로 두고 **릴레이**를 둔다: ~100줄 Azure Function 이 멀티테넌트 id_token(발급 테넌트·그룹)을 검증한 뒤 서비스 주체로 위 ①~③ 엔드포인트를 대행하고, `System.CreatedBy` 대신 `Custom.RequesterEmail` 필드로 `@Me` 를 대체한다. 클라이언트는 base URL 과 토큰 스코프만 바뀐다(설정 `relayUrl`, 미구현).

관련 파일: `apps/desktop/apps/electron/src/shared/change-requests-core.ts`(초안·설명·json-patch·WIQL), `main/change-requests-client.ts`(큐·REST), `main/change-requests.ts`(IPC·전제 판정), `renderer/components/change-requests/ChangeRequestDialog.tsx`, `renderer/pages/settings/ChangeRequestsSettingsPage.tsx`.
