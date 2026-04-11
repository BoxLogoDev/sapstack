# sapstack MCP Server

> sapstack을 Model Context Protocol (MCP) 서버로 노출해 Claude Desktop, Cursor 등 MCP 클라이언트에서 사용.

## 🎯 MCP란?

**Model Context Protocol** (Anthropic, 2024+)은 LLM에 외부 도구·데이터를 연결하는 **표준 프로토콜**입니다. sapstack을 MCP server로 래핑하면:

- **Claude Desktop**에서 sapstack 지식 직접 사용
- **Cursor**, **Zed**, 기타 MCP 클라이언트 자동 호환
- **7번째·8번째 AI 도구 지원이 사실상 자동 해결**

## 📦 sapstack MCP Server 구성

`mcp/sapstack-server.json` — MCP manifest

### 제공 리소스 (Resources)
- `sapstack://rules/universal` — Universal Rules
- `sapstack://data/tcodes` — 확정 T-code 레지스트리
- `sapstack://data/sap-notes` — 확정 SAP Note 카탈로그
- `sapstack://skill/{module}` — 14개 모듈 SKILL.md

### 제공 프롬프트 (Prompts)
- `sap-fi-consultant` — FI 컨설턴트 에이전트
- `sap-abap-reviewer` — ABAP 리뷰어
- `sap-s4-migration-advisor` — S/4 마이그레이션 어드바이저
- `sap-basis-troubleshooter` — Basis 트러블슈터
- `sap-mm-consultant` — MM 컨설턴트

### 제공 도구 (Tools)
- `resolve_sap_note` — 키워드로 Note 검색
- `check_tcode` — T-code 유효성 검증
- `list_plugins` — 14개 플러그인 목록

## 🚀 설치 (Claude Desktop)

### 1. MCP server 구현 선택
sapstack v1.4.0은 **매니페스트만 제공**하고 실제 server 구현은 v1.5.0 예정입니다. 현재는 다음 두 옵션:

**Option A — Official MCP TypeScript SDK 기반 (권장, 직접 구현)**
```bash
npm install -g @modelcontextprotocol/sdk
# sapstack/mcp/ 디렉토리에서 서버 작성 (Node.js + bash script wrapper)
```

**Option B — Filesystem MCP server 활용 (즉시 사용 가능)**
```json
// ~/Library/Application Support/Claude/claude_desktop_config.json
{
  "mcpServers": {
    "sapstack-readonly": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/path/to/sapstack/plugins",
        "/path/to/sapstack/agents",
        "/path/to/sapstack/data"
      ]
    }
  }
}
```

이 방식은 파일 시스템 접근만 제공하지만, sapstack 지식 참조에는 충분합니다.

### 2. Claude Desktop 재시작

### 3. 사용
Claude Desktop 세션에서:
```
sapstack/plugins/sap-fi/skills/sap-fi/SKILL.md 규칙에 따라 
MIRO 세금코드 이슈를 진단해줘
```

Claude가 MCP server를 통해 SKILL.md를 자동 조회.

## 🔧 v1.5.0 — 네이티브 MCP Server 계획

현재 매니페스트만 있고, v1.5.0에서 다음을 구현 예정:

### 구현 기술
- **Language**: TypeScript (공식 SDK 지원)
- **Runtime**: Node.js 20+
- **Entry point**: `mcp/server.ts`

### 주요 기능
1. `resolve_sap_note` 도구 — `data/sap-notes.yaml` 검색 (Python `resolve-note.sh` 래퍼)
2. `check_tcode` 도구 — `data/tcodes.yaml` lookup
3. 동적 resource 서빙 — `sapstack://skill/sap-fi` 요청 시 `plugins/sap-fi/skills/sap-fi/SKILL.md` 반환
4. Prompt 파라미터 → `agents/*.md` 프롬프트 반환

### 배포
```bash
npx @boxlogodev/sapstack-mcp
```

## 🔗 MCP와 다른 호환 레이어의 관계

| 도구 | 기존 지원 | MCP로 추가 가능 |
|------|----------|----------------|
| Claude Code | ✅ 네이티브 | ✅ MCP도 가능 |
| Claude Desktop | ❌ 직접 지원 없음 | ✅ **MCP로 해결** |
| Cursor | ✅ .cursor/rules | ✅ MCP도 지원 |
| Zed | ❌ | ✅ **MCP로 해결** |
| Codex CLI | ✅ AGENTS.md | ⚠️ MCP 미지원 (2026 기준) |

MCP 지원은 **7개 이상 AI 도구로 확장**의 지름길입니다.

## 📖 MCP 공식 자료

- [MCP Specification](https://spec.modelcontextprotocol.io/)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Anthropic MCP Docs](https://docs.anthropic.com/en/docs/build-with-claude/mcp)

## ⚠️ 현재 제약 (v1.4.0)

- **매니페스트만** 제공, 실제 server 미구현
- Claude Desktop은 **filesystem MCP server**로 우회 가능
- v1.5.0에서 네이티브 구현 예정

## 📦 관련
- `mcp/sapstack-server.json` — MCP manifest
- `docs/multi-ai-compatibility.md` — 전체 호환 가이드
