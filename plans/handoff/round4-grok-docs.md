# Round 4 — Grok: T-code 백로그 101건 전수 검증 + 데스크톱 문서 완성 (goal mode)

> 3차 산출(컴팩트 카드 20종)과 2차 산출(다국어 100% + gold-set 90건)은 전부 수용·커밋됐다.
> 이번 라운드는 두 축이다 — **① 사실검증(가장 잘하는 것) ② 데스크톱 사용자 문서**.
> 소유권: `data/`, `docs/`, `README*`(루트 6종). 그 외 편집 금지. 커밋 금지(오케스트레이터 수용).
> 메인 체크아웃 경로: `C:/Users/chois/orca/projects/boxlogo/sapstack` (최신 브랜치
> `feat/desktop-release-and-knowledge` 를 pull 하고 시작할 것 — checker 픽스가 전제 조건이다).

## 작업 1 — T-code 백로그 101건 전수 검증 (최우선)

배경: `scripts/check-tcodes.sh` 의 frontmatter 판정 버그로 **SKILL 본문의 절반이 검사에서
누락**되고 있었다. 버그 픽스(`f20bc97`) 후 미등록 101건이 드러났고, 지금은
`scripts/check-tcodes.sh` 의 `v2.5.0 backfill` allowlist 섹션(127-227행 부근)에 격리돼 있다.

각 항목을 판별하라:

- **실존 T-code** → `data/tcodes.yaml` 에 등록 (정확한 표준 이름 + modules + release
  ecc/s4 구분) 하고 allowlist 에서 **제거**
- **오탐** (테이블-필드 `LFB1-AKONT`, 인포타입 `IT0009`, 프로그램명 `RAALTD01`,
  범위표기 `QA11-13`, 기술용어 `UTF-8`/`DB2`/`NLS_LANG`, 예시 ID `PUMP-001` 등)
  → allowlist 에 남기되 **한 줄 사유 주석** 추가
- **애매** (F2/F5/F8 은 빌링 문서유형이지 T-code 가 아니다 — 단 SKILL 문맥 확인 필요.
  KO8K, TM_HEDGE, PC00_M 류) → SKILL.md 원문 문맥을 읽고 판단. 확신 없으면
  "확인 필요" 로 분류해 보고 (창작 등록 금지)
- 추가 검증 2건: `IW65` 이름을 `Display Activities (PM Notification List)` 로 교정했다 —
  맞는지 재검증. `V/06`(Maintain Pricing Condition Types)·`CM01`(Capacity Planning —
  Work Center Load) 직권 등록도 재검증

완료 기준: backfill 섹션의 TODO 주석 제거, 남은 항목 전부에 사유 주석, 그리고

```bash
./scripts/check-tcodes.sh --strict     # 미등록 0 유지
./scripts/check-eval-goldset.sh --strict
```

## 작업 2 — README 6종에 데스크톱 표면 추가

`README.md` + `README.{en,zh,ja,de,vi}.md`. 현재 데스크톱(4번째 표면) 언급 0건.

- `## 핵심 기능` 아래 `### 🚀 MCP Runtime` / `### 💻 VS Code Extension` 옆에
  `### 🖥 Desktop` 소제목 추가
- `## 빠른 시작` 설치 경로 목록에 데스크톱 항목 추가
- 1행 stats 주석(`<!-- sapstack-stats: ... -->`)은 **건드리지 말 것** (자동 생성)

## 작업 3 — `docs/desktop-install.md` 신설 (한국어)

## 작업 4 — `docs/compliance/air-gapped-deployment.md` 에 데스크톱 섹션 추가

현재 이 문서는 MCP+npm 반입 전제로만 쓰여 있다. 데스크톱 설치·로컬 LLM·차단 플래그를 반영하라.

## 작업 2·3·4 공통 — 사실 목록 (이 밖의 동작 서술 금지)

아래는 코드에서 발췌한 **검증된 사실**이다. 문서의 모든 기술 서술은 이 목록 안에서만 하라.
목록에 없는 동작이 필요하면 쓰지 말고 "확인 필요" 로 보고하라. **수치·경로·플래그 창작 금지.**

| 사실                                                                                                                                                                   | 근거                                                  |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| 설치파일: `sapstack-Desktop-<버전>-Setup-x64.exe` (NSIS) + Portable 변형, Windows x64 전용                                                                             | electron-builder.yml win 타깃                         |
| per-user 설치 (`%LOCALAPPDATA%\Programs\`), 관리자 권한 불필요                                                                                                         | nsis `perMachine: false`                              |
| 크기 약 219MB (v2.4.0 실측) — Claude 네이티브 바이너리·Bun 런타임 포함                                                                                                 | 실빌드 산출물                                         |
| 자동 업데이트: GitHub Releases 폴링 — **폐쇄망에서는 무의미하며 차단 가능**                                                                                            | main/auto-update.ts                                   |
| 폐쇄망 모드: `SAPSTACK_AIRGAPPED=1` 환경변수 **또는** `~/.sapstack/config.yaml` 에 `air_gapped: true` → Sentry 크래시 리포팅·업데이트 폴링이 시작 자체가 차단됨        | main/airgap.ts                                        |
| 로컬 추론 엔진 `llama-server`(llama.cpp, CPU 빌드)가 설치파일에 **번들됨** — 별도 다운로드 불필요                                                                      | electron-builder.yml extraResources `resources/llama` |
| 모델 가중치는 번들되지 않음 — 운영자가 GGUF 파일을 `~/.sapstack/models/` 에 넣으면 (USB 반입) 앱이 자동 감지·기동                                                      | main/local-llm.ts modelsDir()                         |
| 디렉토리에 GGUF 여러 개면 **파일명 알파벳순 첫 번째**를 로드                                                                                                           | local-llm.ts findModelFile()                          |
| 엔진은 루프백 `127.0.0.1:11435` 전용 (외부 노출 없음), 포트 변경은 `SAPSTACK_LOCAL_LLM_PORT`                                                                           | local-llm.ts                                          |
| 모델 id 는 파일명과 무관하게 `sapstack-local` 고정                                                                                                                     | local-llm.ts MODEL_ALIAS                              |
| 권장 모델팩: Qwen3 4B Q4_K_M(약 2.4GB). 8B Q4_K_M(약 4.7GB)은 타깃 사양(16GB RAM 사무용 노트북) 실측 전이므로 **"권장" 단정 금지** — "장비 성능에 따라 선택" 으로 서술 | 개발 머신 실측 0.75 tok/s 로 판정 보류 상태           |
| **Windows 는 Git for Windows(Git Bash) 필수** — 미설치 시 온보딩이 진행 불가. 폐쇄망에서는 오프라인 설치본을 USB 로 함께 반입해야 함                                   | 온보딩 git-bash 게이트                                |
| 온보딩에서 Local Model 선택 시 클라우드 API 키 없이 완주 가능                                                                                                          | ProviderSelectStep local 카드                         |
| SAP 데이터는 복붙 기반 — 앱이 SAP 시스템에 직접 접속하지 않음                                                                                                          | 제품 원칙                                             |

## 루프 (각 작업 단위)

초안 → **사실 목록과 문장 단위 대조** (목록 밖 서술 제거) → 게이트 실행 → 다음.
README 번역판은 각 언어 완성 후 `./scripts/check-translation-parity.sh --strict` 확인
(README 가 parity 대상이 아니면 그 사실만 보고하고 넘어갈 것).

## 금지

- `data/eval/gold-set.yaml` 열람 (시험지)
- 위 사실 목록 밖의 데스크톱 동작·수치·SAP Note 창작
- `scripts/` 편집 (allowlist 주석 정리는 예외 — check-tcodes.sh 의 backfill 섹션만)
- 커밋

## 완료 보고 = EVIDENCE

- 작업 1: 판별 결과표 (등록 N / 오탐 M / 확인 필요 K + 각 근거 한 줄) + strict 게이트 로그
- 작업 2~4: 변경 파일 목록 + 사실 대조에서 제거한 문장 수
