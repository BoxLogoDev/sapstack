# sapstack Desktop 설치 (Windows x64)

Windows x64 전용 데스크톱 앱. SAP 데이터는 기본 복붙 기반이며, 선택적으로 ADT 읽기 전용 브리지(`docs/adt-bridge.md`)·CBO 스냅샷(`docs/cbo-snapshot.md`, 오프라인 사본)을 쓸 수 있다.

## 설치 파일

GitHub Releases에서 받는다.

| 변형 | 파일명 |
|------|--------|
| NSIS 설치본 | `sapstack-Desktop-<버전>-Setup-x64.exe` |
| Portable | Portable 변형 (같은 릴리스) |

- per-user 설치: `%LOCALAPPDATA%\Programs\`
- 관리자 권한 불필요
- 크기 약 219MB (v2.4.0 실측) — Claude 네이티브 바이너리·Bun 런타임 포함

## 필수 전제: Git for Windows

Windows에서는 **Git for Windows(Git Bash)가 필수**다. 미설치면 온보딩이 진행되지 않는다.

폐쇄망에서는 Git for Windows 오프라인 설치본을 USB로 함께 반입한다.

## 설치 후 온보딩

온보딩에서 **Local Model**을 선택하면 클라우드 API 키 없이 완주할 수 있다.

**현업 대량 배포**: 관리자가 `provision.yaml` 을 exe 옆에 동봉하면 온보딩·SAP 환경 폼이
아예 뜨지 않고 바로 질문할 수 있다 — [provisioning.md](provisioning.md). 현업 모드
(`features.uiMode: simple`)까지 함께 시딩하면 개발자용 메뉴도 숨겨진다.

## 로컬 추론

- 엔진 `llama-server`(llama.cpp, CPU 빌드)가 설치파일에 번들된다. 별도 다운로드는 필요 없다.
- 모델 가중치는 번들되지 않는다. 운영자가 GGUF 파일을 `~/.sapstack/models/`에 넣으면 (USB 반입) 앱이 자동 감지·기동한다.
- 디렉토리에 GGUF가 여러 개면 **파일명 알파벳순 첫 번째**를 로드한다.
- 엔진은 루프백 `127.0.0.1:11435` 전용이다 (외부 노출 없음). 포트 변경은 `SAPSTACK_LOCAL_LLM_PORT`.
- 모델 id는 파일명과 무관하게 `sapstack-local`로 고정된다.

### 모델 선택

- 권장 모델팩: Qwen3 4B Q4_K_M (약 2.4GB)
- 8B Q4_K_M (약 4.7GB)은 장비 성능에 따라 선택한다.

## 자동 업데이트와 폐쇄망

자동 업데이트는 GitHub Releases를 폴링한다. **폐쇄망에서는 무의미하며 차단할 수 있다.**

폐쇄망 모드 — 아래 중 하나면 Sentry 크래시 리포팅과 업데이트 폴링이 **시작 자체가 차단**된다.

- 환경변수 `SAPSTACK_AIRGAPPED=1`
- `~/.sapstack/config.yaml`에 `air_gapped: true`

폐쇄망 반입·운영의 나머지 절차는 [compliance/air-gapped-deployment.md](compliance/air-gapped-deployment.md)를 본다.

주의 두 가지: ① 저장소가 private 인 동안은 GH_TOKEN 미설정 상태의 클라이언트에서
업데이트 폴링이 404 로 실패한다 — 사내 배포는 포터블 exe 재배포(또는 electron-builder
`generic` provider 로 사내 웹서버/공유에 `latest.yml`+exe 를 미러링)로 운영한다.
② 폐쇄망 모드에서는 업데이트 경로가 없으므로 갱신은 항상 수동 반입이다.

## SAP 데이터

기본은 운영자가 SAP 화면·다운로드 결과를 붙여넣는 방식이다. 선택 기능 두 가지가 있다:
① ADT 읽기 전용 브리지(설정 > SAP 접속, `docs/adt-bridge.md`) — 조회 전용 실시간 연동
② CBO 스냅샷(`docs/cbo-snapshot.md`) — 커스텀 소스의 오프라인 사본. 어느 쪽도 SAP 를 수정하지 않는다.
