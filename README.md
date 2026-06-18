<div align="center">

# 🏛 sapstack

<img src="docs/assets/mascot/standard-ko.png" alt="표준씨 — sapstack 마스코트" width="280" />

_"SAP에서는 스탠다드라서 안됩니다." — 표준씨 ([브랜드 가이드](MASCOT.md))_

### AI 코딩 어시스턴트를 위한 SAP 엔터프라이즈 운영 플랫폼

[![npm](https://img.shields.io/npm/v/@boxlogodev/sapstack-mcp?label=npm&color=cb3837)](https://www.npmjs.com/package/@boxlogodev/sapstack-mcp)
[![release](https://img.shields.io/github/v/release/BoxLogoDev/sapstack?label=release&color=2ea043)](https://github.com/BoxLogoDev/sapstack/releases)
[![license](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![languages](https://img.shields.io/badge/languages-6-orange)](#)

**24 플러그인 · 20 에이전트 · 22 커맨드 · MCP 23 도구 (npm) · VS Code 확장 v2.4.0 · 8개 AI 도구 호환 · 6개 국가 · 6개 언어 · 컴플라이언스**

🌐 [🇰🇷 한국어](README.md) · [🇬🇧 English](README.en.md) · [🇨🇳 中文](README.zh.md) · [🇯🇵 日本語](README.ja.md) · [🇩🇪 Deutsch](README.de.md) · [🇻🇳 Tiếng Việt](README.vi.md)

</div>

---

## sapstack이란?

**sapstack**은 Claude, Copilot, Cursor 같은 AI 도구에 **SAP 전문 지식을 주입**하는 오픈소스 플랫폼입니다. SAP 운영 전체 라이프사이클 — **Configure → Implement → Operate → Diagnose → Optimize** — 를 커버합니다.

```
┌──────────────────────────────────────────────────────────────┐
│ SAP 운영자 ──┐                                                │
│             ├─→ [AI Tool] ←── sapstack ──→ SAP 지식         │
│ 신입 교육자 ─┤      ↓                      + IMG 가이드      │
│             ├── Evidence Loop              + Best Practice   │
│ 컨설턴트 ────┘    (4턴 진단)                + Compliance      │
└──────────────────────────────────────────────────────────────┘
```

> 의사결정 원칙은 [**ETHOS.md**](ETHOS.md) — Ground-truth · 증거 우선 · 하드코딩 금지 · ECC≠S/4 · 현장 용어 · 운영자 결정.

---

## 👥 이런 분께

| 당신은… | sapstack은 이렇게 |
|---|---|
| **SAP 운영자** (현업, 마감에 쫓기는) | 장애를 **Evidence Loop 4턴**으로 진단 — 라이브 접근 없이 가설→증거→검증→롤백. 증상 커맨드(`/sap-migo-debug`, `/sap-payment-run-debug` …)로 바로 시작. |
| **신입 교육자 / 신규 입사자** | `sap-tutor`가 질문을 분류해 모듈 전문가에게 위임하고, 답을 초보자 언어로 번역. T-code + 메뉴 경로 항상 병기. |
| **SAP 컨설턴트 / 파트너** | 24개 모듈 지식 + IMG 구성 + 3-Tier Best Practice + 컴플라이언스를 AI 도구에 주입해 클라이언트 환경별로 빠르게 적용. |

---

## 🧭 Golden Path — 어떤 상황에 무엇을 쓰나

흩어진 도구가 아니라 **하나의 길**입니다. 전체 가이드: **[docs/workflow.md](docs/workflow.md)** · 완성도 갭 분석: [docs/gstack-gap-analysis.md](docs/gstack-gap-analysis.md)

| 당신이 원하는 것 | 가는 길 |
|---|---|
| 빠른 사실 답 | **Quick Advisory** — 그냥 물어보기 |
| 장애 진단 | **Evidence Loop** (4턴) → 모듈 consultant / 증상 커맨드 |
| 모듈을 모름 | `sap-tutor` (분류 후 전문가 위임) |
| 설정(IMG) 문제 | `/sap-img-guide` |
| 기간 마감 | `/sap-fi-closing` → `/sap-quarter-close` → `/sap-year-end` |
| 프로젝트 기여 | 메인테이너 Golden Path |

> 막히면 한 단계 위(Evidence Loop)로, 모르면 `sap-tutor` 로.

---

## ✅ 실제 사용 예 (See it work)

**상황**: _"MIGO로 입고를 전기하려는데 자꾸 안 돼요."_ — Evidence Loop가 단정 대신 증거로 좁혀갑니다.

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

> 각 가설에는 **반증 기준**, 각 수정에는 **롤백 계획**. 프로덕션 직접 변경 없이 안내만 — 운영자가 결정합니다. (→ [ETHOS](ETHOS.md))

---

## 핵심 기능

### 🎯 SAP 전 모듈 커버
FI · CO · TR · MM · SD · PP · HCM · PM · QM · WM · EWM · ABAP · BASIS · BTP · SFSF · S4Mig · GTS · BC · **Cloud PE** · Session

### 🤖 19개 전문 에이전트 + 1 SAP 튜터
16개 모듈 컨설턴트 (FI·CO·TR·MM·SD·PP·PM·QM·EWM·HCM·IBP·SAC·Ariba·Integration-Cloud·Cloud·BASIS) + ABAP developer + Integration advisor + S4 migration advisor + **SAP tutor** (신입사원 교육)

### 🔁 Evidence Loop (v1.5+)
라이브 SAP 접근 없이 진단 — **INTAKE → HYPOTHESIS → COLLECT → VERIFY** 4턴 구조, 반증 조건 필수, Rollback 페어 필수

### 🏗 IMG 구성 프레임워크 (v1.6+)
76개 SPRO 기반 구성 가이드 — 구성 단계, ECC vs S/4 차이, 검증 방법 포함

### 📋 3-Tier Best Practice
**Operational** (일상) · **Period-End** (기간마감) · **Governance** (거버넌스) — 23개 모듈에 체계 적용

### 🌐 6개 언어 지원 (v1.7+)
한국어 · English · 中文 · 日本語 · Deutsch · Tiếng Việt — 24 모듈 × 5 언어 = 120 quick-guide

### ☁️ S/4HANA Cloud PE 대응
Clean Core · Key User Extensibility · 3-Tier Extension · Fit-to-Standard · Cloud ALM

### 🚀 MCP Runtime (v2.0+)
`@boxlogodev/sapstack-mcp` — Claude Desktop에서 Evidence Loop 전체 실행. **23개 도구 + 12 프롬프트 + 9 리소스**.

### 💻 VS Code Extension (v2.4.0)
세션 관리 사이드바 · YAML 검증 · Webview 렌더링 · File Watcher

### 🛡 컴플라이언스 준비 (v2.0+)
K-SOX · SOC 2 · ISO 27001 · GDPR · 망분리 배포 · PII 자동 마스킹

---

## 빠른 시작

### ⚡ 5분 온보딩 (추천 시작점)
비개발자도 설치 → 첫 진단까지 한 명령으로. 자세히: [docs/quickstart-5min.md](docs/quickstart-5min.md)
```bash
git clone https://github.com/BoxLogoDev/sapstack.git && cd sapstack
./setup.sh        # Windows: ./setup.ps1   ·   점검만: ./setup.sh --check
```

### Claude Code
```bash
/plugin marketplace add https://github.com/BoxLogoDev/sapstack
/plugin install sap-fi@sapstack sap-session@sapstack
```

### NPM (MCP 서버)
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
| 📘 **실전** | [시나리오 5개](docs/scenarios/) → [용어집](docs/glossary.md) |
| 🧭 **워크플로** | [Golden Path](docs/workflow.md) → [완성도 갭 분석](docs/gstack-gap-analysis.md) |
| 🏗 **심화** | [아키텍처](docs/architecture.md) → [Multi-AI 가이드](docs/multi-ai-compatibility.md) |
| 🔒 **보안** | [SECURITY.md](SECURITY.md) → [컴플라이언스](docs/compliance/) |
| 🤝 **기여** | [CONTRIBUTING](CONTRIBUTING.md) → [로드맵](docs/roadmap.md) |

---

## 데이터 자산

| 자산 | 수량 | 파일 |
|------|------|------|
| 확정 T-code | 361 | [`data/tcodes.yaml`](data/tcodes.yaml) |
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
