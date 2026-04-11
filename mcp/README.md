# sapstack MCP Server

sapstack의 **Model Context Protocol 서버**입니다. Claude Desktop, Cursor, 기타
MCP-aware 클라이언트에서 sapstack 지식 베이스와 Evidence Loop 세션을 접근할 수
있게 해줍니다.

## 📋 현재 상태 (v1.5.0)

**Scaffolding** — 매니페스트(`sapstack-server.json`)와 TypeScript 엔트리
(`server.ts`)가 모두 정의되어 있고, **읽기 전용 툴은 이미 동작**합니다:

### ✅ v1.5.0에서 동작
- `resolve_sap_note` — SAP Note 키워드 검색
- `check_tcode` — T-code 유효성 검증
- `list_plugins` — 14개 sapstack 플러그인 나열
- `resolve_symptom` — symptom-index fuzzy 매칭 (ko/en/de/ja)
- `list_sessions` — `.sapstack/sessions/`의 세션 목록
- Resource 읽기: CLAUDE.md, tcodes.yaml, sap-notes.yaml, symptom-index.yaml, 각 세션 state.yaml, 스키마

### 🔜 v1.6.0 예정 (NotImplementedError 반환 중)
- `start_session` — 새 Evidence Loop 세션 시작
- `add_evidence` — 세션에 Bundle 추가 (해시·PII 스캔 포함)
- `next_turn` — Hypothesis/Verify 턴 실행 (Claude API 호출)
- `validate_session_file` — AJV 기반 스키마 검증

## 🏗 빌드 & 실행

```bash
cd mcp
npm install
npm run build      # tsc → dist/server.js
npm start          # node dist/server.js
```

개발 모드 (tsx):
```bash
npm run dev
```

## 🔗 Claude Desktop 설정

`~/Library/Application Support/Claude/claude_desktop_config.json` (macOS):

```json
{
  "mcpServers": {
    "sapstack": {
      "command": "node",
      "args": ["/absolute/path/to/sapstack/mcp/dist/server.js"],
      "env": {
        "SAPSTACK_ROOT": "/absolute/path/to/sapstack",
        "SAPSTACK_WORKSPACE": "/path/to/your/workspace/with/.sapstack"
      }
    }
  }
}
```

## 🛠 아키텍처 원칙

1. **No live SAP**: 이 서버는 어떤 SAP 시스템에도 연결하지 않습니다. 모든
   데이터는 로컬 파일시스템에서만 읽습니다.
2. **Workspace-relative**: 세션은 `$SAPSTACK_WORKSPACE/.sapstack/sessions/`에
   저장됩니다. 서버는 그 밖의 어떤 것도 접근하지 않아요.
3. **Minimal deps**: `@modelcontextprotocol/sdk`, `js-yaml`, `ajv`만.
4. **Schema-enforced**: 모든 읽기/쓰기는 `../schemas/*.schema.yaml`에 대해 검증.
5. **Append-only audit**: 쓰기 툴은 절대 과거 이벤트를 수정/삭제하지 않음.

## 🔒 보안

- 파일 접근은 `SAPSTACK_WORKSPACE`와 `SAPSTACK_ROOT` 경로 하위로만 제한
- 절대 경로 traversal 방지 (v1.6.0에서 path.resolve 검증 추가)
- 세션 파일 쓰기 시 `.sapstack/sessions/` 밖으로 벗어날 수 없음
- 네트워크 호출 없음 (symptom-index는 로컬 파일에서만 읽음)

## 📚 관련 파일

- `sapstack-server.json` — MCP 매니페스트 (capabilities/resources/tools/prompts)
- `server.ts` — TypeScript 엔트리 포인트
- `../schemas/` — 5개 JSON Schema (Bundle·Hypothesis·Follow-up·Verdict·Session State)
- `../plugins/sap-session/skills/sap-session/SKILL.md` — Evidence Loop 규약
- `../aidlc-docs/sapstack/f110-dog-food.md` — 실제 사용 시나리오
- `../extension/README.md` — VS Code Extension 명령 계약 (MCP 서버와 호환)
