<div align="center">

# 🏛 sapstack

### AI 코딩 어시스턴트를 위한 SAP 엔터프라이즈 운영 플랫폼

**20 플러그인 · 16 에이전트 · MCP 런타임 · VS Code 확장 · 6개 언어 · 컴플라이언스 준비**

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

---

## 핵심 기능

### 🎯 SAP 전 모듈 커버
FI · CO · TR · MM · SD · PP · HCM · PM · QM · WM · EWM · ABAP · BASIS · BTP · SFSF · S4Mig · GTS · BC · **Cloud PE** · Session

### 🤖 15명의 전문 에이전트 + 1명의 튜터
11개 모듈 컨설턴트 + ABAP developer + BASIS consultant + Integration advisor + S4 migration advisor + **SAP tutor** (신입사원 교육)

### 🔁 Evidence Loop (v1.5+)
라이브 SAP 접근 없이 진단 — **INTAKE → HYPOTHESIS → COLLECT → VERIFY** 4턴 구조, 반증 조건 필수, Rollback 페어 필수

### 🏗 IMG 구성 프레임워크 (v1.6+)
55+ SPRO 기반 구성 가이드 — 구성 단계, ECC vs S/4 차이, 검증 방법 포함

### 📋 3-Tier Best Practice
**Operational** (일상) · **Period-End** (기간마감) · **Governance** (거버넌스) — 11개 모듈에 체계 적용

### 🌐 6개 언어 지원 (v1.7+)
한국어 · English · 中文 · 日本語 · Deutsch · Tiếng Việt

### ☁️ S/4HANA Cloud PE 대응
Clean Core · Key User Extensibility · 3-Tier Extension · Fit-to-Standard · Cloud ALM

### 🚀 MCP Runtime (v2.0+)
`@boxlogodev/sapstack-mcp` — Claude Desktop에서 Evidence Loop 전체 실행. 읽기 5개 + 쓰기 3개 도구.

### 💻 VS Code Extension (v2.0+)
세션 관리 사이드바 · YAML 검증 · Webview 렌더링 · File Watcher

### 🛡 컴플라이언스 준비 (v2.0+)
K-SOX · SOC 2 · ISO 27001 · GDPR · 망분리 배포 · PII 자동 마스킹

---

## 빠른 시작

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
VS Code Marketplace에서 "sapstack" 검색 → Install

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

---

## 학습 경로

| 레벨 | 경로 |
|------|------|
| 🆕 **입문** | [튜토리얼 (15분)](docs/tutorial.md) → [FAQ](docs/faq.md) |
| 📘 **실전** | [시나리오 5개](docs/scenarios/) → [용어집](docs/glossary.md) |
| 🏗 **심화** | [아키텍처](docs/architecture.md) → [Multi-AI 가이드](docs/multi-ai-compatibility.md) |
| 🔒 **보안** | [SECURITY.md](SECURITY.md) → [컴플라이언스](docs/compliance/) |
| 🤝 **기여** | [CONTRIBUTING](CONTRIBUTING.md) → [로드맵](docs/roadmap.md) |

---

## 데이터 자산

| 자산 | 수량 | 파일 |
|------|------|------|
| 확정 T-code | 340+ | [`data/tcodes.yaml`](data/tcodes.yaml) |
| 자연어 증상 인덱스 | 62 (6개 언어) | [`data/symptom-index.yaml`](data/symptom-index.yaml) |
| 확정 SAP Note | 57+ | [`data/sap-notes.yaml`](data/sap-notes.yaml) |
| 다국어 Synonyms | 80+ terms × 6 langs | [`data/synonyms.yaml`](data/synonyms.yaml) |
| 기간마감 시퀀스 | 24단계 | [`data/period-end-sequence.yaml`](data/period-end-sequence.yaml) |
| 업종 매트릭스 | 3 industries | [`data/industry-matrix.yaml`](data/industry-matrix.yaml) |

---

## 플러그인 카탈로그

| 영역 | 플러그인 |
|------|----------|
| 💰 **재무** | [sap-fi](plugins/sap-fi/) · [sap-co](plugins/sap-co/) · [sap-tr](plugins/sap-tr/) |
| 📦 **물류** | [sap-mm](plugins/sap-mm/) · [sap-sd](plugins/sap-sd/) · [sap-pp](plugins/sap-pp/) · [sap-pm](plugins/sap-pm/) · [sap-qm](plugins/sap-qm/) · [sap-wm](plugins/sap-wm/) · [sap-ewm](plugins/sap-ewm/) |
| 👥 **인사** | [sap-hcm](plugins/sap-hcm/) · [sap-sfsf](plugins/sap-sfsf/) |
| 💻 **기술** | [sap-abap](plugins/sap-abap/) · [sap-s4-migration](plugins/sap-s4-migration/) · [sap-btp](plugins/sap-btp/) · [sap-basis](plugins/sap-basis/) · [sap-cloud](plugins/sap-cloud/) |
| 🇰🇷 **한국/글로벌** | [sap-bc](plugins/sap-bc/) · [sap-gts](plugins/sap-gts/) |
| 🔁 **메타** | [sap-session](plugins/sap-session/) (Evidence Loop) |

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
