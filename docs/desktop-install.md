# sapstack Desktop 설치 (Windows x64)

Windows x64 전용 데스크톱 앱. SAP 데이터는 복붙 기반이며, 앱이 SAP 시스템에 직접 접속하지 않는다.

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

## SAP 데이터

운영자가 SAP 화면·다운로드 결과를 붙여넣는다. 앱은 SAP 시스템에 직접 접속하지 않는다.
