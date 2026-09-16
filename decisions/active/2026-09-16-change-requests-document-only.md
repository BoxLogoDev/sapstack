# 변경 요청은 문서만 — Azure DevOps Boards 에 요청자 토큰으로 직접, 백엔드 없음

**날짜** 2026-09-16 · **범위** `apps/desktop/apps/electron/src/shared/change-requests-core.ts`, `main/change-requests*.ts`, `renderer/components/change-requests/`, `docs/change-requests.md`

## 배경

LS엠트론 미국 법인 현업이 데스크톱 앱에서 커스텀 ABAP 설명을 읽은 뒤 "이 프로그램을 고쳐 달라"고
LS ITC 에 요청할 통로가 필요했다. 사용자는 이것을 "PR" 이라 불렀지만 확인 결과 원하는 것은
**변경 요청서(문서)** 였다 — 코드 diff 도, SAP 쓰기도 아니다. LS ITC 개발팀은 요청을 이메일/Teams 로
받고 ABAP 변경은 운송(CTS)으로만 관리하며 깃 경험이 없다. 미국 사용자에게는 GitHub 계정이 없고,
Entra B2B 게스트로 LS ITC 테넌트에 들어온다(`docs/entra-signin.md`).

## 결정

1. **문서만 만든다.** 작업 항목에는 질문 원문·AI 설명·오브젝트·기대 동작·우선순위만 들어간다.
   AI 가 만든 diff 는 붙이지 않고, 운송 필요·리뷰어·롤백 계획은 개발자가 채우는 자리로 남긴다
   (`transport_required · reviewer_required · rollback_plan`). 로드맵의 비목표(ABAP 자동 수정 금지·운영 쓰기 금지)와 같다.
2. **추적 시스템은 Azure DevOps Boards**(LS ITC 테넌트 연결 조직). 미국 요청자는 무료 Stakeholder,
   개발팀은 메일·Teams 알림으로 지금 습관 그대로 받고, 관리자 대시보드는 ADO 내장 쿼리·차트로 만든다.
3. **요청자 본인 토큰으로 앱이 직접 REST 를 부른다.** 로그인 리프레시 토큰으로 DevOps 스코프
   토큰을 받아 작업 항목을 만들면 `System.CreatedBy` 가 요청자라서 "내 요청" 은 `@Me` 한 줄이고
   상태 변경 알림도 요청자에게 간다. 우리가 운영하는 서버는 없다.
4. 대화 전문 첨부는 **옵트인**(기본 꺼짐). 초안·전문은 앱의 마스킹 패턴(SSN/EIN/전화/주민번호)을 거친다.
5. 네트워크 전에 **로컬 큐**(`~/.sapstack/change-requests/`)에 먼저 쓰고, 실패는 설정에서 재시도한다.
6. 폐쇄망(`air_gapped`)·미로그인·설정 없음이면 기능이 **보이지 않는다.**

## 근거

- 백엔드가 없으면 운영 부담이 없다. 릴레이(폴백)가 필요해도 ~100줄 Function 하나다
- ADO Stakeholder 는 무료·무제한이라 미국 요청자 수에 비용이 붙지 않는다(개발자 Basic 5석 무료)
- 작업 항목 = 문서는 깃 도구를 모르는 LS ITC 에 맞다. 메일·Teams 알림은 ADO 구독으로 그대로 재현된다
- `System.CreatedBy` 네이티브 식별은 본문에 요청자를 합성하는 방식보다 검색·알림·감사가 단순하다

## 버린 대안

| 대안 | 왜 버렸나 |
|---|---|
| GitHub Issues + GitHub App | 미국 사용자에 GitHub 계정이 없어 릴레이 필수, 두 신원 체계, LS ITC 에 깃 도구 강요 |
| Microsoft List / SharePoint | 상태 워크플로·알림이 약해 Power Automate 를 따로 운영해야 함 |
| 자체 요청 서비스 | 트래커를 우리가 만들어 영구 운영 |
| AI diff 첨부 | 사용자 결정(문서만). 검토되지 않은 코드 제안이 개발자 판단을 흔든다 |
| 백그라운드 폴링으로 상태 갱신 | 마운트 + 새로 고침만으로 충분. 알림은 ADO 가 메일로 보낸다 |

## 뒤집는 조건

- LS ITC IT 가 B2B 게스트와 멀티테넌트 앱을 **모두** 거부하면 릴레이 폴백(`relayUrl`)을 구현하거나
  자체 요청 서비스를 다시 검토한다
- LS ITC 가 Jira/ServiceNow 를 도입하면 `change-requests-core.ts` 의 json-patch·WIQL 매핑만 바꾼다.
  초안·설명·큐·UI 는 그대로다
- Stakeholder 가 첨부를 올릴 수 없다고 확인되면 첨부 옵션을 숨기거나 요청자에게 Basic 을 준다
