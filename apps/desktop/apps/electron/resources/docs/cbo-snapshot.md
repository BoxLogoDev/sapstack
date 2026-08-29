# CBO 스냅샷 — 커스텀 코드에 대해 질문하기

CBO 스냅샷은 관리자가 내보낸 **커스텀 ABAP 소스(Z/Y 오브젝트)의 읽기 전용 오프라인 사본**입니다.
이 앱은 스냅샷 폴더를 로컬 소스로 등록해 "ZFI0171이 뭐 하는 프로그램이에요?",
"이 화면 저장할 때 왜 오류가 나요?" 같은 질문에 답합니다 — SAP 접속 없이,
항상 **스냅샷 기준일 기준**으로.

## 자동 인식 (기본)

앱이 켜질 때 다음 위치를 검사해 자동으로 소스를 등록합니다:

1. `~/.sapstack/cbo/{SID}/` — 관리자 PC 표준 위치
2. **포터블 exe 옆의 `cbo/{SID}/`** — 배포 ZIP에 동봉된 경우 (1로 자동 임포트)
3. **네트워크 공유폴더** — `~/.sapstack/config.yaml` 의 `cbo.share_roots` 에 등록된
   UNC 경로 (더 새 스냅샷이 있으면 로컬로 복사해 갱신 — 오프라인에서도 동작)

공유폴더 접근이 없는 사용자는 **설정 → CBO 스냅샷 → "ZIP에서 가져오기"** 버튼으로
관리자가 준 스냅샷 ZIP(`sapstack-CBO-snapshot-*.zip`)을 직접 임포트할 수 있습니다.

상태는 **설정 → CBO 스냅샷**에서 확인합니다 (기준일·객체 수·stale 경고·다시 검색).
등록된 소스 슬러그는 `cbo-snapshot-{sid}` 형식이며, 홈 화면 골든패스 입력창에
커스텀 오브젝트명(ZFI0171, SAPMZ...)이 들어오면 자동으로 이 소스를 물립니다.

## 수동 등록 (폴백 레시피 — 에이전트용)

자동 등록이 안 되는 환경에서 사용자가 "CBO 스냅샷 등록해줘"라고 요청하면:

1. `manifest.yaml` 존재 확인 (`~/.sapstack/cbo/*/manifest.yaml`) — 없으면 관리자에게
   `npm run cbo:export` 실행 안내(sapstack 저장소 docs/cbo-snapshot.md) 후 종료
2. manifest 에서 `sid`, `client`, `exported_at` 을 읽는다
3. 소스 생성 — `config.json`:
   ```json
   {
     "name": "CBO Snapshot {SID}",
     "provider": "cbo-snapshot",
     "type": "local",
     "local": { "path": "~/.sapstack/cbo/{SID}", "format": "filesystem" },
     "icon": "🗂️"
   }
   ```
   tagline: `커스텀 ABAP 스냅샷 ({SID}/{client}, {YYYY-MM-DD} 기준)`
4. guide.md — **스냅샷 폴더의 `guide.md` 를 그대로 복사**한다 (스냅샷이 자신의 사용 규칙을 동봉함)
5. `mcp__session__source_test` 로 연결 확인

> 슬러그·이름에 `sap`/`abap` 을 넣지 마세요 — SAP 커넥터 정책의 이름 매칭을 피하기 위한 규칙입니다.

## 답변 규칙 요약 (스냅샷 guide.md 가 원본)

- `catalog.md` 에서 오브젝트를 **먼저** 찾고, 없으면 "스냅샷에 없습니다" (추측 금지)
- 현업 형식: 한 줄 요약 → 어디서 쓰나(T-code) → 처리 흐름 → 주의할 점 → **기준일 고지**
- 표준 SAP 프로그램은 스냅샷 범위 밖임을 명시, 수정 제안은 "담당 개발자 확인 필요"

## 신선도 자동 점검 (선택 레시피)

자동화 → 예약됨에 주 1회 cron 으로 다음 프롬프트를 걸 수 있습니다:
"CBO 스냅샷 manifest.yaml 의 exported_at 을 확인하고 30일을 넘었으면 관리자에게 갱신을
요청하는 메시지 초안을 작성해줘."
