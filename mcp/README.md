# sapstack MCP Server v1.6.0

Production-ready **Model Context Protocol** server implementing the complete **Evidence Loop** session management for SAP diagnostics.

## Status: Production (v1.6.0)

All write-path tools fully implemented and tested:

### ✅ Fully Working
- **Read-only tools** (v1.5.0+): `resolve_symptom`, `check_tcode`, `resolve_sap_note`, `list_plugins`, `list_sessions`
- **Write-path tools** (v1.6.0): `start_session`, `add_evidence`, `next_turn`, `validate_session_file`
- **Resources**: All data sources (T-codes, SAP Notes, symptom index, sessions, schemas)
- **Validation**: Ajv-based schema validation on all write operations
- **State machine**: intake → hypothesizing → awaiting_evidence → verifying → resolved

## Installation & Build

```bash
cd mcp
npm install
npm run build      # tsc → dist/server.js + dist/cli.js
npm start          # node dist/server.js (stdio transport)
npm test           # npm run test (validate write-path)
```

## Usage

### Via Claude Desktop

macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "sapstack": {
      "command": "node",
      "args": ["/absolute/path/to/sapstack/mcp/dist/server.js"],
      "env": {
        "SAPSTACK_ROOT": "/absolute/path/to/sapstack",
        "SAPSTACK_WORKSPACE": "/path/to/workspace"
      }
    }
  }
}
```

### Via CLI

```bash
npx sapstack-mcp              # Start server
npx sapstack-mcp --offline    # Offline mode
npx sapstack-mcp --version    # Show version
npm run test                  # Run tests
```

## API Reference

### start_session

Create a new Evidence Loop session.

```typescript
const result = await callTool("start_session", {
  symptom: "F110 Proposal failed — No valid payment method",
  reporter_role: "operator",
  country_iso: "kr",
  language: "ko",
});
// → { session_id: "sess-20260411-abc123", state_path: "..." }
```

**State transition**: Creates session in `intake` status with Turn 1 active.

### add_evidence

Add evidence bundle to session (turn 1 or 3).

```typescript
const bundle_yaml = `
bundle_id: evb-20260411-def456
session_id: sess-20260411-abc123
turn_number: 1
collected_at: 2026-04-11T09:22:15Z
collected_by:
  role: operator
  handle: ops-kim
items:
  - item_id: evi-001
    kind: transaction_log
    source: { type: tcode, tcode: F110 }
    inline_content: "Run 2026-04-11: Proposal failed"
    tags: [f110, proposal-failed]
`;

const result = await callTool("add_evidence", {
  session_id: "sess-20260411-abc123",
  bundle_yaml,
});
// → { bundle_id: "evb-20260411-def456", session_status: "hypothesizing" }
```

**Validation**: Full Ajv schema validation. Atomic write (rename) prevents corruption.

**State transition**: If `status=intake`, transitions to `hypothesizing`.

### next_turn

Advance session through state machine.

```typescript
const result = await callTool("next_turn", {
  session_id: "sess-20260411-abc123",
  force_hypothesize: true,
});
// → { status: "awaiting_evidence", signal: "waiting_for_evidence" }
```

**Logic**:
- `intake` + evidence → `hypothesizing` (signal: generate_hypotheses)
- `hypothesizing` + force → `awaiting_evidence` (signal: waiting_for_evidence)
- `awaiting_evidence` + new evidence → `verifying` (signal: verify_hypotheses)
- `verifying` + verdict → `resolved` (signal: session_complete)

### validate_session_file

Validate YAML against schema.

```typescript
const result = await callTool("validate_session_file", {
  path: "sess-20260411-abc123/evidence-0.yaml",
  schema: "evidence-bundle",
});
// → { valid: true } or { valid: false, errors: [...] }
```

## Data Storage

Sessions stored under `.sapstack/sessions/{session-id}/`:

```
.sapstack/sessions/sess-20260411-abc123/
├── state.yaml              # Session metadata, turns, audit trail
├── evidence-0.yaml         # Turn 1 bundle
├── evidence-1.yaml         # Turn 3 bundle (if exists)
├── files/
│   ├── vendor-export.csv
│   └── f110-screenshot.png
```

### Schema Files (../schemas/)

All write operations validate against:

- `evidence-bundle.schema.yaml` — Evidence item structure
- `session-state.schema.yaml` — Session metadata, turns, audit
- `hypothesis.schema.yaml` — AI hypothesis with falsification criteria
- `followup-request.schema.yaml` — Evidence checklist for operators
- `verdict.schema.yaml` — Final diagnosis, fix/rollback plans

## Architecture Principles

1. **No live SAP**: File-only. No network calls or SAP connections.
2. **Workspace-relative**: Sessions under `.sapstack/sessions/` only.
3. **Minimal dependencies**: @modelcontextprotocol/sdk + ajv + js-yaml.
4. **Schema-enforced**: Ajv validates all inputs before write.
5. **Append-only audit**: Never modify past events.
6. **Atomic writes**: Write `.tmp`, then rename to prevent corruption.
7. **Path isolation**: No directory traversal; session paths validated.

## Security

- File access restricted to `SAPSTACK_WORKSPACE` and `SAPSTACK_ROOT`
- Path traversal prevented; all paths validated against `.sapstack/sessions/`
- No unmasking of PII (redacted_fields honored)
- Immutable audit trail for compliance
- Strict Ajv validation (no additional properties)

## Type Definitions

See `types.ts` for TypeScript interfaces:

```typescript
import type {
  SessionState,
  EvidenceBundle,
  Hypothesis,
  Verdict,
  FollowupRequest,
  StartSessionArgs,
  AddEvidenceArgs,
  NextTurnArgs,
} from "@boxlogodev/sapstack-mcp";
```

## Development

### Project Structure

```
mcp/
├── server.ts           # Main MCP server + tool implementations
├── cli.ts              # CLI wrapper
├── types.ts            # TypeScript type definitions
├── package.json        # Dependencies & scripts
├── sapstack-server.json # MCP manifest
├── tests/
│   └── write-path.test.ts # Test suite
└── README.md           # This file
```

### Testing

```bash
npm run test
# ✓ start_session creates session directory
# ✓ add_evidence writes and validates bundle
# ✓ next_turn transitions states correctly
# ✓ Atomic write (rename) prevents corruption
```

### Continuous Development

```bash
npm run dev    # Watch + reload via tsx
npm run build  # Compile to dist/
npm start      # Run compiled server
```

## Environment Variables

- `SAPSTACK_WORKSPACE` — Workspace root (default: cwd)
- `SAPSTACK_ROOT` — sapstack repo root (default: `{workspace}/sapstack`)

## Troubleshooting

### "Schema not loaded" error
Ensure `../schemas/` exists with all 5 schema files.

### Session not found
Check `.sapstack/sessions/{id}/state.yaml` exists in workspace.

### Validation fails
Use `validate_session_file` to get detailed error messages:
```
errors:
  - "root.items[0].source.type must be one of: tcode, table, ..."
```

## Compatibility

| Platform | Node | Status |
|----------|------|--------|
| macOS    | 20+  | ✅     |
| Linux    | 20+  | ✅     |
| Windows  | 20+  | ✅     |

## License

MIT — See LICENSE file

## Support

- GitHub: https://github.com/BoxLogoDev/sapstack
- Issues: https://github.com/BoxLogoDev/sapstack/issues
- Docs: See `../CLAUDE.md` and `../aidlc-docs/`
