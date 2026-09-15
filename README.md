<!-- sapstack-stats: version=2.5.0 plugins=24 agents=21 commands=23 tools=23 prompts=12 resources=9 -->
<div align="center">

# 🏛 sapstack

<img src="docs/assets/mascot/standard-ko.png" alt="표준씨 — sapstack 마스코트" width="280" />

_"SAP에서는 스탠다드라서 안됩니다." — 표준씨 ([브랜드 가이드](MASCOT.md))_

### SAP 운영을 위한 AI 데스크톱

**설치하고, 그냥 물어보세요 — 표준 프로세스부터 우리 회사 커스텀 프로그램(Z/Y)까지.**

[![npm](https://img.shields.io/npm/v/@boxlogodev/sapstack-mcp?label=npm&color=cb3837)](https://www.npmjs.com/package/@boxlogodev/sapstack-mcp)
[![release](https://img.shields.io/github/v/release/BoxLogoDev/sapstack?label=release&color=2ea043)](https://github.com/BoxLogoDev/sapstack/releases)
[![license](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![languages](https://img.shields.io/badge/languages-6-orange)](#)

**Windows 데스크톱 앱 v2.5.0 · 24 플러그인 · 21 에이전트 · 23 커맨드 · CBO 스냅샷 · 폐쇄망 지원 · 6개 언어 · 컴플라이언스**

🌐 [🇰🇷 한국어](README.md) · [🇬🇧 English](README.en.md) · [🇨🇳 中文](README.zh.md) · [🇯🇵 日本語](README.ja.md) · [🇩🇪 Deutsch](README.de.md) · [🇻🇳 Tiếng Việt](README.vi.md)

</div>

---

## sapstack이란?

**sapstack**은 SAP 현업과 컨설턴트를 위한 **SAP 전용 AI 데스크톱 앱**입니다.
ADT도, 개발 권한도, API 키도 없이 — 앱을 켜고 질문 하나를 입력하면 됩니다.

```
"F110 돌렸는데 오류가 나요"            → Evidence Loop 4턴 진단 (가설→증거→검증→롤백)
"월마감 순서 알려줘"                   → 기간마감 시퀀스 + T-code/메뉴 경로
"ZFI0171이 뭐 하는 프로그램이에요?"     → 회사 커스텀 코드(CBO 스냅샷)를 읽고 현업 언어로 설명
```

밑단에는 SAP 운영 전체 라이프사이클(**Configure → Implement → Operate → Diagnose → Optimize**)을
커버하는 24개 모듈 지식·IMG 가이드·Best Practice·컴플라이언스가 깔려 있고, 같은 지식을
Claude Code·MCP·VS Code에서도 쓸 수 있습니다(→ [개발자·파워유저용 통합](#-개발자파워유저용-통합)).

> 의사결정 원칙은 [**ETHOS.md**](ETHOS.md) — Ground-truth · 증거 우선 · 하드코딩 금지 · ECC≠S/4 · 현장 용어 · 운영자 결정.

---

## 👥 이런 분께

| 당신은… | sapstack 데스크톱은 이렇게 |
|---|---|
| **SAP 현업** (마감에 쫓기는, 개발 권한 없는) | 홈 화면에 질문만 입력 — 오류는 **Evidence Loop 4턴**으로, 사실 질문은 바로 답으로 자동 라우팅. **우리 회사 Z/Y 프로그램**도 스냅샷 기준으로 설명(추측 금지, 기준일 고지). |
| **관리자 / IT 담당** | `provision.yaml` 하나로 **무설정 배포** — 현업 PC에서 ZIP 풀고 exe 실행이 끝. CBO 스냅샷은 야간 자동 수집 → 공유폴더 게시 → 앱이 알아서 갱신. 폐쇄망은 동봉 로컬 LLM으로. |
| **SAP 컨설턴트 / 파트너** | 24개 모듈 지식 + IMG 구성 + 3-Tier Best Practice + 컴플라이언스를 데스크톱과 AI 도구 양쪽에서 — 클라이언트 환경별로 빠르게 적용. |

---

## 🖥 데스크톱이 하는 일

### 💬 질문 하나로 시작
홈 화면 입력창에 쓰면 끝 — 오류/장애는 **Evidence Loop**(INTAKE→HYPOTHESIS→COLLECT→VERIFY,
반증 조건·롤백 페어 필수)로, 사실 질문은 **Quick Advisory**로 자동 분기. 예시 질문 칩으로
첫 질문을 베껴 쓸 수 있습니다.

### 🗂 CBO 스냅샷 — 회사 커스텀 코드를 질문
관리자가 커스텀 ABAP(Z/Y) 소스를 스냅샷으로 내보내면, 앱이 **SAP 접속 없이** 그 사본을 읽고
"이 프로그램이 뭐 하는 거예요?"에 현업 언어로 답합니다. 전달 채널 3가지 — 배포 ZIP 동봉 ·
공유폴더 자동 갱신 · 설정에서 "ZIP에서 가져오기". 모든 답변에 **스냅샷 기준일**을 고지합니다.
→ [docs/cbo-snapshot.md](docs/cbo-snapshot.md)

### 📦 무설정 대량 배포 (관리자 프로비저닝)
`provision.yaml` 하나를 exe 옆에 동봉하면 첫 실행 때 LLM 연결(회사 키·게이트웨이·로컬 모델)·
SAP 환경·현업 모드가 자동 설정 — **현업은 어떤 설정 화면도 보지 않습니다.** 키 교체는
version 숫자만 올려 재배포. → [docs/provisioning.md](docs/provisioning.md)

### 🙋 현업 모드
질문 중심의 단순한 홈(카드 3장 + 예시 칩), 개발자용 메뉴 숨김, 도구 승인 프롬프트 없음
(read-only 기본). 설정 → 외관에서 전환.

### 🔒 폐쇄망(망분리) 지원
로컬 추론 엔진 `llama-server`(llama.cpp) 번들 — GGUF 모델팩을 USB로 반입하면 인터넷 없이
동작. `air_gapped: true`면 크래시 리포팅·업데이트 폴링까지 차단.
→ [docs/compliance/air-gapped-deployment.md](docs/compliance/air-gapped-deployment.md)

### 📚 밑단의 SAP 지식 (모든 답변의 근거)
- **24개 모듈**: FI · CO · TR · MM · SD · PP · HCM · PM · QM · WM · EWM · ABAP · BASIS · BTP · SFSF · S4Mig · GTS · BC · Cloud PE · Session 외
- **21개 에이전트**: 16개 모듈 컨설턴트 + ABAP developer + Integration/S4 migration advisor + SAP tutor(신입 교육) + **CBO explainer**(현업용 커스텀 코드 해설)
- **IMG 구성 프레임워크**: 76개 SPRO 기반 가이드 (ECC vs S/4 차이·검증 방법 포함)
- **3-Tier Best Practice**: Operational · Period-End · Governance
- **6개 언어**: 한국어 · English · 中文 · 日本語 · Deutsch · Tiếng Việt (24 모듈 × 5 언어 quick-guide)
- **컴플라이언스**: K-SOX · SOC 2 · ISO 27001 · GDPR · PII 자동 마스킹

---

## ✅ 실제 사용 예 (See it work)

**상황 1**: _"MIGO로 입고를 전기하려는데 자꾸 안 돼요."_ — Evidence Loop가 단정 대신 증거로 좁혀갑니다.

```
Turn 1 · INTAKE      환경부터: ECC(EhP?) / S/4(릴리스?), 이동유형(MvT),
                     에러 메시지 전문(M7 xxx)을 확인.
Turn 2 · HYPOTHESIS  가설 A: 전기기간 미오픈 — 확인: MMRV에서 현재기간이 전기일과
                     일치하는가? (반증: 일치하면 A 기각)
                     가설 B: 이동유형/계정결정(OBYC) 문제 — 확인: …
Turn 3 · COLLECT     (운영자가 MMRV 조회 → 결과를 알려줌)
Turn 4 · VERIFY      기간 불일치 확정 → Fix: MMPV로 기간 이월 (시뮬레이션 먼저,
                     Transport 경유). Rollback 계획 + 관련 SAP Note 포인터 동봉.
```

**상황 2**: _"ZFI0042가 뭐 하는 프로그램이에요?"_ — CBO 스냅샷(가상의 예시)을 읽고 이런 형식으로 답합니다.

```
한 줄 요약   (스냅샷의 소스 헤더·카탈로그에서 파생한 프로그램 목적 한 줄)
어디서 쓰나  실행 화면·버튼 기능 (T-code 매핑은 스냅샷 범위 밖이면 그렇게 고지)
처리 흐름   권한 확인 → 조회 → 목록/출력 등 소스에서 읽은 실제 흐름
주의할 점   현업이 마주칠 메시지와 대처 (추측 금지 — 스냅샷에 없으면 "없다"고 답함)
기준일      이 답변은 YYYY-MM-DD 스냅샷 기준입니다.
```

> 각 가설에는 **반증 기준**, 각 수정에는 **롤백 계획**. 프로덕션 직접 변경 없이 안내만 — 운영자가 결정합니다. (→ [ETHOS](ETHOS.md))

---

## 빠른 시작

### 🖥 데스크톱 (권장 — 현업·컨설턴트)

**받은 배포 ZIP이 있다면**: 압축을 풀고 `sapstack-Desktop-*-Portable-x64.exe` 실행 — 끝.
(관리자가 provision.yaml을 동봉했다면 설정 화면 없이 바로 질문할 수 있습니다.)

**직접 설치**: [GitHub Releases](https://github.com/BoxLogoDev/sapstack/releases)에서
`sapstack-Desktop-<버전>-Setup-x64.exe`(NSIS, per-user, 관리자 권한 불필요) 또는 Portable을
받습니다. Git for Windows(Git Bash) 필수, 크기 약 249MB (v2.4.1 실측).
→ 설치: [docs/desktop-install.md](docs/desktop-install.md) · 배포 패키징: [docs/provisioning.md](docs/provisioning.md)

**SAP 데이터 경로 3가지** — 어느 쪽도 SAP를 수정하지 않습니다:
① 복붙 기본 ② ADT 읽기 전용 브리지(설정 > SAP 접속, [docs/adt-bridge.md](docs/adt-bridge.md))
③ CBO 스냅샷(오프라인 사본, [docs/cbo-snapshot.md](docs/cbo-snapshot.md))

### ⚡ 5분 온보딩 (저장소 기반)
```bash
git clone https://github.com/BoxLogoDev/sapstack.git && cd sapstack
./setup.sh        # Windows: ./setup.ps1   ·   점검만: ./setup.sh --check
```
자세히: [docs/quickstart-5min.md](docs/quickstart-5min.md)

---

## 🔧 개발자·파워유저용 통합

같은 SAP 지식을 쓰는 다른 입구들입니다.

### Claude Code
```bash
/plugin marketplace add https://github.com/BoxLogoDev/sapstack
/plugin install sap-fi@sapstack sap-session@sapstack
```

### NPM (MCP 서버) — 23 도구 + 12 프롬프트 + 9 리소스
```bash
npm install -g @boxlogodev/sapstack-mcp
sapstack-mcp --sessions-dir ~/.sapstack/sessions
```

### VS Code Extension
VS Code Marketplace에서 "sapstack" 검색 → Install · (또는 [GitHub Release](https://github.com/BoxLogoDev/sapstack/releases)의 `.vsix` 직접 설치)

### Amazon Kiro IDE
```bash
git submodule add https://github.com/BoxLogoDev/sapstack sapstack
cp sapstack/.kiro/settings/mcp.json .kiro/settings/
cp sapstack/.kiro/steering/*.md .kiro/steering/
```

### 기타 (Codex / Copilot / Cursor / Continue.dev / Aider)
저장소 clone → 자동 인식. 상세: [docs/multi-ai-compatibility.md](docs/multi-ai-compatibility.md)

### 🧭 Golden Path — 어떤 상황에 무엇을 쓰나
전체 가이드: [docs/workflow.md](docs/workflow.md)

| 당신이 원하는 것 | 가는 길 |
|---|---|
| 빠른 사실 답 | **Quick Advisory** — 그냥 물어보기 |
| 장애 진단 | **Evidence Loop** (4턴) → 모듈 consultant / 증상 커맨드 |
| 커스텀(Z/Y) 프로그램이 궁금 | 데스크톱 홈에 그대로 질문 / `/sap-cbo-explain` |
| 모듈을 모름 | `sap-tutor` (분류 후 전문가 위임) |
| 설정(IMG) 문제 | `/sap-img-guide` |
| 기간 마감 | `/sap-fi-closing` → `/sap-quarter-close` → `/sap-year-end` |

---

## Universal Rules

1. **절대 하드코딩 금지** — 회사코드·GL 계정·조직 단위 고정값 사용 금지
2. **환경 인테이크 우선** — SAP 릴리스·배포 모델·회사코드 확인 먼저
3. **ECC vs S/4HANA 명시 구분** — 버전별 동작 차이 명확히
4. **Transport 필수** — 운영 환경 변경은 항상 Transport 경유
5. **시뮬레이션 선행** — AFAB, F.13, FAGL_FC_VAL, MR11, F110 등
6. **SE16N 편집 금지** — 운영 환경 데이터 직접 수정 권장 금지
7. **T-code + SPRO 경로** — 모든 조치에 둘 다 제공
8. **한국어는 현장체 우선** — "코스트 센터 (원가센터, KOSTL)" 이중 병기

> 이 규칙들의 *왜*는 [**ETHOS.md**](ETHOS.md), 전체 운영 규칙은 [CLAUDE.md](CLAUDE.md) 참고.

---

## 학습 경로

| 레벨 | 경로 |
|------|------|
| 🆕 **입문** | [튜토리얼 (15분)](docs/tutorial.md) → [FAQ](docs/faq.md) |
| 🖥 **데스크톱 운영** | [설치](docs/desktop-install.md) → [프로비저닝](docs/provisioning.md) → [CBO 스냅샷](docs/cbo-snapshot.md) → [Microsoft 로그인](docs/entra-signin.md) |
| 📘 **실전** | [시나리오 5개](docs/scenarios/) → [용어집](docs/glossary.md) |
| 🧭 **워크플로** | [Golden Path](docs/workflow.md) → [완성도 갭 분석](docs/gstack-gap-analysis.md) |
| 🏗 **심화** | [아키텍처](docs/architecture.md) → [Multi-AI 가이드](docs/multi-ai-compatibility.md) |
| 🔒 **보안** | [SECURITY.md](SECURITY.md) → [컴플라이언스](docs/compliance/) |
| 🤝 **기여** | [CONTRIBUTING](CONTRIBUTING.md) → [로드맵](docs/roadmap.md) |

---

## 데이터 자산

| 자산 | 수량 | 파일 |
|------|------|------|
| 확정 T-code | 472 | [`data/tcodes.yaml`](data/tcodes.yaml) |
| 자연어 증상 인덱스 | 90 (6개 언어) | [`data/symptom-index.yaml`](data/symptom-index.yaml) |
| 확정 SAP Note/KBA | 112 | [`data/sap-notes.yaml`](data/sap-notes.yaml) |
| 다국어 Synonyms | 80+ terms × 6 langs | [`data/synonyms.yaml`](data/synonyms.yaml) |
| 기간마감 시퀀스 | 24단계 | [`data/period-end-sequence.yaml`](data/period-end-sequence.yaml) |
| 업종 매트릭스 | 7 industries | [`data/industry-matrix.yaml`](data/industry-matrix.yaml) |

---

## 플러그인 카탈로그

| 영역 | 플러그인 |
|------|----------|
| 💰 **재무** | [sap-fi](plugins/sap-fi/) · [sap-co](plugins/sap-co/) · [sap-tr](plugins/sap-tr/) |
| 📦 **물류** | [sap-mm](plugins/sap-mm/) · [sap-sd](plugins/sap-sd/) · [sap-pp](plugins/sap-pp/) · [sap-pm](plugins/sap-pm/) · [sap-qm](plugins/sap-qm/) · [sap-wm](plugins/sap-wm/) · [sap-ewm](plugins/sap-ewm/) |
| 👥 **인사** | [sap-hcm](plugins/sap-hcm/) · [sap-sfsf](plugins/sap-sfsf/) |
| 💻 **기술** | [sap-abap](plugins/sap-abap/) · [sap-s4-migration](plugins/sap-s4-migration/) · [sap-btp](plugins/sap-btp/) · [sap-basis](plugins/sap-basis/) · [sap-cloud](plugins/sap-cloud/) |
| ☁️ **클라우드/통합** | [sap-ibp](plugins/sap-ibp/) · [sap-sac](plugins/sap-sac/) · [sap-ariba](plugins/sap-ariba/) · [sap-integration-cloud](plugins/sap-integration-cloud/) |
| 🇰🇷 **한국/글로벌** | [sap-bc](plugins/sap-bc/) · [sap-gts](plugins/sap-gts/) |
| 🔁 **메타** | [sap-session](plugins/sap-session/) (Evidence Loop) |

---

## 다국어 검수 기여

5개 언어(en/zh/ja/de/vi) quick-guide는 **Claude 작성 초안**입니다. 각 언어 native speaker + SAP 도메인 전문가의 검수를 환영합니다.

- 절차·평가 기준·PR 형식: **[docs/TRANSLATION-REVIEW.md](docs/TRANSLATION-REVIEW.md)**
- 피드백: [Translation Feedback 이슈](https://github.com/BoxLogoDev/sapstack/issues/new?template=translation-feedback.md)
- T-code/Note 번호는 번역 대상 아님 (원형 유지)

---

## 라이선스 & 기여

**MIT License** — 상업/비상업 사용 모두 자유. 저작권 표기 유지.

- 🐛 [버그 리포트](https://github.com/BoxLogoDev/sapstack/issues/new?template=bug_report.md)
- ✨ [기능 요청](https://github.com/BoxLogoDev/sapstack/issues/new?template=feature_request.md)
- 💬 [토론](https://github.com/BoxLogoDev/sapstack/discussions)
- 📖 [기여 가이드](CONTRIBUTING.md)

---

<div align="center">

**Made with 🇰🇷 by [@BoxLogoDev](https://github.com/BoxLogoDev)**
Built for Korean SAP consultants · Shared with the global community

</div>
